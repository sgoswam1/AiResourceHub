/**
 * Auto-Update Script for AI Resources Hub
 * Runs on Github Actions every Saturday.
 * Queries Gemini 3.5 with Search Grounding to compile top weekly news, innovations, and ideas,
 * then saves them directly back into the codebase to update static deployments.
 */

import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not defined in environment variables.');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function getMostRecentSaturday() {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // To get the previous week's Saturday:
  // If today is Sat (6), we want to subtract 7 days to get last week's Sat.
  // Otherwise, we subtract day + 1 to get last Saturday.
  const daysToSubtract = day === 6 ? 7 : (day + 1);
  d.setDate(d.getDate() - daysToSubtract);
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function run() {
  const satDate = getMostRecentSaturday();
  console.log(`[GitHub Action] Commencing Saturday update for week ending: ${satDate}`);

  try {
    const prompt = `Research and retrieve top 3 AI trending news articles, 2 major AI breakthrough innovations, and 2 creative AI builder project ideas for the week ending Saturday, ${satDate}. 
    Make sure to use googleSearch grounding to pull real news from the web.
    Be precise, elegant, and modern. Deliver exactly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI industry analyst, tech reporter, and software architect. Your goal is to curate highly technical, accurate, and inspiring weekly trending news, innovations, and development ideas. Return valid JSON adhering strictly to the responseSchema provided. Do not invent fake news; use the search grounding tool to locate actual articles and announcements.",
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updatedDate: { type: Type.STRING },
            trendingNews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["title", "summary", "impact", "category"]
              }
            },
            innovations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  highlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  link: { type: Type.STRING }
                },
                required: ["title", "description", "category", "highlights"]
              }
            },
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  howToBuild: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" },
                  estimatedTime: { type: Type.STRING }
                },
                required: ["title", "concept", "howToBuild", "difficulty", "estimatedTime"]
              }
            }
          },
          required: ["updatedDate", "trendingNews", "innovations", "ideas"]
        }
      }
    });

    if (response.text) {
      const generatedData = JSON.parse(response.text);
      console.log(`[Success] Retrieved dynamic weekly trends data.`);

      // Write as static initial data configuration back into src/data/initialData.ts or update a JSON file
      // Wait, let's create a dedicated trends data file so we don't overwrite user's apps/courses
      const targetPath = path.join(process.cwd(), 'src', 'data', 'weeklyTrends.json');
      fs.writeFileSync(targetPath, JSON.stringify(generatedData, null, 2), 'utf-8');
      console.log(`[Success] Saved weekly trends data to ${targetPath}`);
    } else {
      throw new Error('Gemini API returned an empty response.');
    }
  } catch (error) {
    console.warn(`[Warning] Failed to execute Saturday data update:`, error?.message || error);
    process.exit(1);
  }
}

run();
