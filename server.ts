import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Memory cache for weekly trends
interface CacheEntry {
  timestamp: number;
  data: any;
}
let trendsCache: { [key: string]: CacheEntry } = {};

// Helper to get the most recent Saturday date (previous week's Saturday)
function getMostRecentSaturday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // To get the previous week's Saturday:
  // If today is Sat (6), we want to subtract 7 days to get last week's Sat.
  // Otherwise, we subtract day + 1 to get last Saturday.
  const daysToSubtract = day === 6 ? 7 : (day + 1);
  d.setDate(d.getDate() - daysToSubtract);
  
  // Format as YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Static high-fidelity fallback data in case Gemini is offline or API key is missing
const getFallbackWeeklyTrends = (satDate: string) => {
  return {
    updatedDate: satDate,
    trendingNews: [
      {
        title: "Gemini 3.5 Suite Launches with Deep Multi-Agent Workflows",
        summary: "Google introduces Gemini 3.5 Flash and Pro Preview, establishing new benchmarks in speed, reasoning, and multi-agent interactions with built-in grounding.",
        impact: "Enables developers to orchestrate multiple sub-agents synchronously with near-zero latency, accelerating the transition from simple assistants to full-stack agents.",
        sourceUrl: "https://ai.google/discover/gemini",
        category: "Breakthrough"
      },
      {
        title: "Claude Code Released as a Powerful CLI Agent for Complex Refactoring",
        summary: "Anthropic launches Claude Code, an agentic terminal command-line interface that allows engineers to complete multi-file edits, write tests, and debug errors.",
        impact: "Shifts software development from auto-completion prompts to high-agency engineering companions executing entire pipelines safely.",
        sourceUrl: "https://www.anthropic.com/claude",
        category: "Developer Tools"
      },
      {
        title: "Apple Intelligence Seamlessly Integrates Deeper On-Device Context Models",
        summary: "Apple ships fully on-device instruction-tuned models with private cloud compute, bringing low-latency context reasoning to everyday mobile notifications and actions.",
        impact: "Prioritizes user privacy for personal telemetry and daily workflows, demonstrating a hybrid local-plus-cloud orchestration model.",
        sourceUrl: "https://www.apple.com/newsroom",
        category: "Consumer Tech"
      }
    ],
    innovations: [
      {
        title: "Unified Multimodal Audio-Visual Streams with Live API",
        description: "Standardized real-time 16-bit PCM streaming allows applications to read and write audio-visual elements dynamically with under 400ms roundtrip latency.",
        category: "Real-time AI",
        highlights: [
          "Direct audio-in and audio-out stream mapping without pipeline text conversion",
          "Low-latency speech translation supporting over 40 languages",
          "Synchronized image analysis at 1 frame-per-second intervals"
        ]
      },
      {
        title: "Self-Repairing Code Compilers and Sandbox Environments",
        description: "New execution-first agents compile software inside secure browser-based sandboxes, automatically reading compiler trace logs to resolve dependencies.",
        category: "Software Engineering",
        highlights: [
          "Eliminates dependency mismatches by automatically checking package.json",
          "Pre-emptively corrects type errors during the build phase",
          "Bypasses classic syntax errors through continuous code refactoring loops"
        ]
      }
    ],
    ideas: [
      {
        title: "Real-time Meeting Coach & Active Agenda Copilot",
        concept: "A live microphone agent that connects to a virtual meeting, tracks key spoken topics, and cross-references them with the meeting agenda to surface pacing tips.",
        howToBuild: "Build an Express web server that processes live audio streams, uses Gemini 3.1 Live API to transcribe and analyze the discussion, and sends pacing recommendations via Server-Sent Events.",
        difficulty: "Intermediate",
        estimatedTime: "2-3 days"
      },
      {
        title: "AI-Powered SEO Landing Page Generator & Enhancer",
        concept: "An automated compiler that reads a product description, automatically researches high-ranking competitor terms, and writes optimized React components.",
        howToBuild: "Create a Vite React interface connected to a backend using Gemini 3.5 with Search Grounding. The backend generates structured copy, selects appropriate layouts, and outputs standard Tailwind code.",
        difficulty: "Beginner",
        estimatedTime: "1 day"
      }
    ]
  };
};

// API Endpoint for trending weekly news
app.get('/api/trending', async (req, res) => {
  const satDate = getMostRecentSaturday();
  
  // Check if we have pre-generated weekly trends JSON from GitHub Action
  const staticJsonPath = path.join(process.cwd(), 'src', 'data', 'weeklyTrends.json');
  if (!trendsCache[satDate] && fs.existsSync(staticJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(staticJsonPath, 'utf-8'));
      if (data && (data.updatedDate === satDate || data.updatedDate)) {
        console.log(`[Cache Load] Loaded Saturday trends from weeklyTrends.json`);
        trendsCache[satDate] = { timestamp: Date.now(), data };
      }
    } catch (err) {
      console.error(`[Cache Error] Failed to read static weeklyTrends.json:`, err);
    }
  }

  // Check memory cache
  if (trendsCache[satDate]) {
    console.log(`[Cache Hit] Serving cached trends for ${satDate}`);
    return res.json(trendsCache[satDate].data);
  }

  // If Gemini is not set up, serve fallback data
  if (!ai) {
    console.log(`[Warning] No GEMINI_API_KEY env variable found. Serving fallback data.`);
    const fallback = getFallbackWeeklyTrends(satDate);
    trendsCache[satDate] = { timestamp: Date.now(), data: fallback };
    return res.json(fallback);
  }

  try {
    console.log(`[Gemini Request] Generating trending AI news for week ending ${satDate}`);
    
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
      // Cache the result
      trendsCache[satDate] = { timestamp: Date.now(), data: generatedData };
      console.log(`[Success] Successfully generated and cached trends for ${satDate}`);
      return res.json(generatedData);
    } else {
      throw new Error("Empty response from Gemini API");
    }

  } catch (error: any) {
    console.warn(`[Warning] Could not fetch weekly trends from Gemini (e.g., quota limits). Gracefully falling back to static curated data. Details:`, error?.message || error);
    // Graceful fallback
    const fallback = getFallbackWeeklyTrends(satDate);
    return res.json(fallback);
  }
});

// Configure Vite or Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

setupServer();
