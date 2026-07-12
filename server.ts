import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_APPS, INITIAL_COURSES } from './src/data/initialData';
import { AIApp, AICourse } from './src/types';

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

// Cache for monthly resources (apps and courses)
const monthlyResourcesPath = path.join(process.cwd(), 'src', 'data', 'monthlyResources.json');
let monthlyCache: { [key: string]: { updatedMonth: string; apps: AIApp[]; courses: AICourse[] } } = {};

// Helper to get current month string as YYYY-MM
function getCurrentMonthString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

// Helper to get the most recent Saturday date (including today if today is Saturday)
function getMostRecentSaturday(): string {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // Sunday (0) -> subtract 1 day to get yesterday (Saturday)
  // Monday (1) -> subtract 2 days
  // ...
  // Friday (5) -> subtract 6 days
  // Saturday (6) -> subtract 0 days (today is Saturday)
  const daysToSubtract = (day + 1) % 7;
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
      if (data && data.updatedDate === satDate) {
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
    const errorMsg = error?.message || String(error);
    const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaError) {
      console.log(`[Weekly Trends] Gemini API Quota Limit (429) reached. Gracefully serving high-fidelity curated fallback trends for ${satDate}.`);
    } else {
      console.log(`[Weekly Trends] Gemini API unavailable (${errorMsg}). Serving high-fidelity curated fallback trends for ${satDate}.`);
    }
    
    // Graceful fallback
    const fallback = getFallbackWeeklyTrends(satDate);
    return res.json(fallback);
  }
});

// API Endpoint for monthly refreshed apps and courses
app.get('/api/resources', async (req, res) => {
  const currentMonth = getCurrentMonthString();

  // 1. Check Memory Cache
  if (monthlyCache[currentMonth]) {
    return res.json(monthlyCache[currentMonth]);
  }

  // 2. Check File Cache
  if (fs.existsSync(monthlyResourcesPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(monthlyResourcesPath, 'utf-8'));
      if (data && data.updatedMonth === currentMonth && Array.isArray(data.apps) && Array.isArray(data.courses)) {
        console.log(`[Cache Load] Loaded monthly resources from monthlyResources.json`);
        monthlyCache[currentMonth] = data;
        return res.json(data);
      }
    } catch (err) {
      console.error(`[Cache Error] Failed to read static monthlyResources.json:`, err);
    }
  }

  // 3. Generate New Additions using Gemini (with live search grounding) if API key is present
  if (ai) {
    try {
      console.log(`[Monthly Resources] Generating new monthly additions for ${currentMonth}...`);
      
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const dateParts = currentMonth.split('-');
      const year = dateParts[0];
      const monthIndex = parseInt(dateParts[1], 10) - 1;
      const monthName = monthNames[monthIndex] || "this month";

      const prompt = `Research and identify newly released, updated, or trending AI applications/platforms and free AI educational courses/tutorials during ${monthName} ${year}.
      
We already have an extensive baseline database of standard tools (e.g. ChatGPT, Claude, Gemini, Midjourney, Perplexity, Cursor, v0, ElevenLabs, etc.) and courses (Google, DeepLearning.AI, IBM).
Your task is to use Google Search Grounding to find:
1. Exactly 2 brand-new, modern, or trending AI software applications/platforms launched or extremely popular in ${monthName} ${year}. They must be highly useful and legitimate.
2. Exactly 2 brand-new or updated FREE professional AI courses, tutorials, or guides released or popular in ${monthName} ${year}.

For each identified item, construct an object with appropriate metadata matching the schema.
Ensure colors are high-quality visual gradients (e.g. 'linear-gradient(135deg,#0ea5e9,#4f46e5)') and logos are 2-letter uppercase abbreviations representing the app or provider.
The new apps must have catKey matching one of: 'chat-assistants', 'search-research', 'coding-dev', 'image-design', 'video-avatar', 'audio-voice', 'productivity-automation' (and catLabel must match the corresponding label, e.g. 'Coding & Dev' for 'coding-dev').`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert AI industry analyst, software engineer, and technology curator. Your goal is to identify genuine, new, and high-quality AI tools and free training materials released or highly trending in the specified month. Return valid JSON matching the exact schema provided. Do not make up fake URLs or products. Ground your responses in real search discoveries.",
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              newApps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    logo: { type: Type.STRING },
                    color: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    link: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    catKey: { type: Type.STRING },
                    catLabel: { type: Type.STRING }
                  },
                  required: ["name", "logo", "color", "desc", "link", "tags", "catKey", "catLabel"]
                }
              },
              newCourses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    provider: { type: Type.STRING },
                    category: { type: Type.STRING },
                    badge: { type: Type.STRING },
                    logo: { type: Type.STRING },
                    color: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    link: { type: Type.STRING }
                  },
                  required: ["title", "provider", "category", "badge", "logo", "color", "desc", "link"]
                }
              }
            },
            required: ["newApps", "newCourses"]
          }
        }
      });

      if (response.text) {
        const generatedData = JSON.parse(response.text);
        
        // Merge with existing INITIAL lists to preserve elite curated baseline
        const newApps: AIApp[] = Array.isArray(generatedData.newApps) ? generatedData.newApps : [];
        const newCourses: AICourse[] = Array.isArray(generatedData.newCourses) ? generatedData.newCourses : [];

        // Ensure unique items by link
        const existingLinks = new Set(INITIAL_APPS.map(a => a.link.toLowerCase().replace(/\/$/, '')));
        const uniqueNewApps = newApps.filter(app => {
          const l = app.link.toLowerCase().replace(/\/$/, '');
          return l && !existingLinks.has(l);
        });

        const existingCourseLinks = new Set(INITIAL_COURSES.map(c => c.link.toLowerCase().replace(/\/$/, '')));
        const uniqueNewCourses = newCourses.filter(course => {
          const l = course.link.toLowerCase().replace(/\/$/, '');
          return l && !existingCourseLinks.has(l);
        });

        // Prepend new items to display first
        const combinedApps = [...uniqueNewApps, ...INITIAL_APPS];
        const combinedCourses = [...uniqueNewCourses, ...INITIAL_COURSES];

        const finalResult = {
          updatedMonth: currentMonth,
          apps: combinedApps,
          courses: combinedCourses
        };

        // Cache and save
        monthlyCache[currentMonth] = finalResult;
        fs.writeFileSync(monthlyResourcesPath, JSON.stringify(finalResult, null, 2), 'utf-8');
        console.log(`[Success] Successfully generated and cached monthly resources for ${currentMonth}`);
        return res.json(finalResult);
      } else {
        throw new Error("Empty response from Gemini for monthly resources");
      }
    } catch (error: any) {
      console.warn(`[Warning] Could not fetch monthly resources from Gemini:`, error?.message || error);
    }
  }

  // 4. Default / Fallback: serve the curated static INITIAL lists
  const defaultResult = {
    updatedMonth: currentMonth,
    apps: INITIAL_APPS,
    courses: INITIAL_COURSES
  };
  monthlyCache[currentMonth] = defaultResult;
  return res.json(defaultResult);
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
