/**
 * Auto-Update Script for AI Resources Hub
 * Runs on Github Actions every Saturday.
 * Asks Gemini to synthesize a fresh weekly spotlight of AI trends, innovations,
 * and builder ideas from its own knowledge (no Search grounding — keeps this
 * script on the free Gemini API tier), then saves it back into the codebase.
 *
 * Note: without Search grounding, this is NOT live news — the model can only
 * draw on what it already knows, not what happened this actual week. To keep
 * it feeling fresh across runs, we feed in last week's picks and ask for a
 * different angle / different items each time.
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

function loadPreviousTitles() {
  try {
    const targetPath = path.join(process.cwd(), 'src', 'data', 'weeklyTrends.json');
    const prev = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    const titles = [
      ...(prev.trendingNews || []).map(x => x.title),
      ...(prev.innovations || []).map(x => x.title),
      ...(prev.ideas || []).map(x => x.title)
    ].filter(Boolean);
    return titles;
  } catch {
    return [];
  }
}

async function run() {
  const satDate = getMostRecentSaturday();
  console.log(`[GitHub Action] Commencing Saturday update for week ending: ${satDate}`);

  const previousTitles = loadPreviousTitles();

  try {
    const prompt = `Compile a spotlight of 3 notable AI trends/topics worth knowing about, 2 AI breakthrough concepts or techniques, and 2 creative AI builder project ideas.
    This is based on your own knowledge, not live search — do not claim these are "this week's news" or attach specific recent dates/events you cannot verify. Frame trends and breakthroughs as genuinely useful, currently-relevant knowledge rather than breaking news.
    Do not include a sourceUrl unless it is a stable, well-known official homepage you are confident is correct (e.g. a product's own site) — never fabricate a link to a specific article.
    ${previousTitles.length ? `Avoid repeating or closely resembling these previously-featured items — pick a different angle or different items this time: ${previousTitles.join('; ')}.` : ''}
    Be precise, elegant, and modern. Deliver exactly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI industry analyst, tech reporter, and software architect. Your goal is to curate a genuinely useful, technically accurate, and inspiring rotating spotlight of AI trends, breakthrough concepts, and development ideas, drawn from your own knowledge. Never claim something is live/breaking news you cannot verify, and never invent a specific source URL. Return valid JSON adhering strictly to the responseSchema provided.",
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
                  sourceUrl: { type: Type.STRING, description: "Only include if a stable, well-known official homepage; omit otherwise." },
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
      generatedData.updatedDate = satDate;
      generatedData.liveSearchGrounded = false; // flag so the UI can label this honestly if desired
      console.log(`[Success] Retrieved weekly spotlight data (knowledge-based, not live search).`);

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
