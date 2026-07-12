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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
    ],
    podcasts: [
      {
        title: "The Future of AI Coding Agents & CLI Companions",
        channel: "Latent Space Podcast",
        duration: "24 mins",
        publishedDate: "6 days ago",
        link: "https://www.latent.space/",
        summary: "A deep-dive investigation into Claude Code, command-line coding agents, and why autonomous CLI environments are outpacing visual browser setups in speed and accuracy.",
        popularity: "45k+ views • Highly Recommended"
      },
      {
        title: "Why Multi-Agent Networks Win Over Monolithic AI",
        channel: "AI Horizon Daily",
        duration: "18 mins",
        publishedDate: "3 days ago",
        link: "https://www.youtube.com/",
        summary: "An exploration of specialized agent orchestration, detailing how narrow models performing sequential micro-tasks achieve higher reliability than single prompts.",
        popularity: "28k+ views • Trending"
      },
      {
        title: "Optimizing On-Device local LLMs for Extreme Latency",
        channel: "Tech Innovation Daily",
        duration: "15 mins",
        publishedDate: "5 days ago",
        link: "https://www.apple.com/apple-intelligence/",
        summary: "How Apple and other mobile leaders utilize INT4 quantization to squeeze robust local context models into daily hardware layers for complete user privacy.",
        popularity: "60k+ views • Highly Recommended"
      },
      {
        title: "Gemini Live API and the Native Audio Stream Wave",
        channel: "Voices of AI",
        duration: "22 mins",
        publishedDate: "2 days ago",
        link: "https://ai.google/discover/gemini",
        summary: "A breakdown of native multi-modal model mechanics that enable under-400ms speech loops, eliminating the latency of traditional audio-to-text pipeline chains.",
        popularity: "12k+ plays • New Release"
      },
      {
        title: "Free Micro-Credentials and Global Tech Upskilling",
        channel: "LearnFast Technology",
        duration: "29 mins",
        publishedDate: "4 days ago",
        link: "https://www.deeplearning.ai/",
        summary: "A roundtable discussing how modular, highly specialized free professional AI guides from elite universities are bridging tech skills gaps globally.",
        popularity: "35k+ views • Popular"
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
        if (!data.podcasts || !Array.isArray(data.podcasts)) {
          data.podcasts = getFallbackWeeklyTrends(satDate).podcasts;
        }
        trendsCache[satDate] = { timestamp: Date.now(), data };
      }
    } catch (err) {
      console.error(`[Cache Error] Failed to read static weeklyTrends.json:`, err);
    }
  }

  // Check memory cache
  if (trendsCache[satDate]) {
    console.log(`[Cache Hit] Serving cached trends for ${satDate}`);
    const data = trendsCache[satDate].data;
    if (!data.podcasts || !Array.isArray(data.podcasts)) {
      data.podcasts = getFallbackWeeklyTrends(satDate).podcasts;
    }
    return res.json(data);
  }

  // If Gemini is not set up, serve fallback data
  if (!ai) {
    console.log(`[Warning] No GEMINI_API_KEY env variable found. Serving fallback data.`);
    const fallback = getFallbackWeeklyTrends(satDate);
    trendsCache[satDate] = { timestamp: Date.now(), data: fallback };
    return res.json(fallback);
  }

  try {
    console.log(`[Gemini Request] Generating trending AI news and podcasts for week ending ${satDate}`);
    
    const prompt = `Research and retrieve:
1. Top 3 AI trending news articles.
2. 2 major AI breakthrough innovations.
3. 2 creative AI builder project ideas.
4. Exactly 5 recently uploaded, highly viewed, and recommended PODCAST episodes on AI and Innovations with durations between 15 and 30 minutes. Make sure these are real podcast episodes (from shows like Latent Space, Lex Fridman, Hard Fork, AI Horizon, Tech Innovation Daily, Voices of AI, Huberman Lab, etc.) uploaded recently.

For the week ending Saturday, ${satDate}.
Make sure to use googleSearch grounding to pull real news, events, and podcasts from the web.
Be precise, elegant, and modern. Deliver exactly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AI industry analyst, tech reporter, and audio media curator. Your goal is to curate highly technical, accurate, and inspiring weekly trending news, innovations, development ideas, and recommended podcasts. Return valid JSON adhering strictly to the responseSchema provided. Do not invent fake news or podcasts; use the search grounding tool to locate actual articles, announcements, and podcast episodes.",
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
            },
            podcasts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the podcast episode" },
                  channel: { type: Type.STRING, description: "Name of the show, host, or channel" },
                  duration: { type: Type.STRING, description: "Strictly 15 to 30 mins duration (e.g. '24 mins')" },
                  publishedDate: { type: Type.STRING, description: "Approximate publish date or relative time (e.g. '3 days ago')" },
                  link: { type: Type.STRING, description: "Real source or platform URL" },
                  summary: { type: Type.STRING, description: "A concise summary of what was discussed" },
                  popularity: { type: Type.STRING, description: "A metric or badge indicating views/popularity (e.g. '42k+ views')" }
                },
                required: ["title", "channel", "duration", "publishedDate", "link", "summary", "popularity"]
              }
            }
          },
          required: ["updatedDate", "trendingNews", "innovations", "ideas", "podcasts"]
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

// Dynamic HTML Injection helper for SEO & AdSense
function getInjectedHtml(html: string, req: express.Request): string {
  const pubId = process.env.ADSENSE_PUBLISHER_ID;
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  
  // Determine dynamic title and description based on page tab/state
  const tab = req.query.tab as string;
  let title = "AI Resources Hub - Free AI Applications, Courses, and Weekly Insights";
  let description = "A premium, zero-maintenance directory of top artificial intelligence tools, free professional learning paths, and weekly curated trending innovations refreshed automatically every Saturday.";
  let currentUrl = `${appUrl}/`;
  
  if (tab === 'apps') {
    title = "Top AI Applications & Tools Directory - AI Resources Hub";
    description = "Explore our dynamically updated, expert-curated directory of the absolute best artificial intelligence applications across coding, design, search, productivity, and audio/video.";
    currentUrl = `${appUrl}/?tab=apps`;
  } else if (tab === 'courses') {
    title = "Free Professional AI Courses & Training - AI Resources Hub";
    description = "Access high-quality, free artificial intelligence and machine learning courses from elite global providers like Google, DeepLearning.AI, IBM, and more, updated monthly.";
    currentUrl = `${appUrl}/?tab=courses`;
  } else if (tab === 'trends') {
    title = "Weekly AI Trends & Innovative Insights - AI Resources Hub";
    description = "Discover the latest major AI trends, breakthroughs, and industry shifts curated weekly and powered by Gemini. Stay ahead of the artificial intelligence curve.";
    currentUrl = `${appUrl}/?tab=trends`;
  }

  // Build scripts & meta tag injections
  let headInjections = '\n';
  
  // Canonical Link
  headInjections += `    <link rel="canonical" href="${currentUrl}" />\n`;
  
  // Open Graph / Facebook Meta Tags
  headInjections += `    <meta property="og:title" content="${title}" />\n`;
  headInjections += `    <meta property="og:description" content="${description}" />\n`;
  headInjections += `    <meta property="og:url" content="${currentUrl}" />\n`;
  headInjections += `    <meta property="og:type" content="website" />\n`;
  headInjections += `    <meta property="og:image" content="${appUrl}/assets/og-image.png" />\n`;
  
  // Twitter Cards Meta Tags
  headInjections += `    <meta name="twitter:card" content="summary_large_image" />\n`;
  headInjections += `    <meta name="twitter:title" content="${title}" />\n`;
  headInjections += `    <meta name="twitter:description" content="${description}" />\n`;
  headInjections += `    <meta name="twitter:image" content="${appUrl}/assets/og-image.png" />\n`;

  // JSON-LD Structured Data Schema Markup (Google Search Rich Results)
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Resources Hub",
    "url": appUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${appUrl}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
  headInjections += `    <script type="application/ld+json">\n    ${JSON.stringify(schemaJson, null, 2)}\n    </script>\n`;

  // Google AdSense Script
  if (pubId && pubId.trim() !== '' && pubId !== 'pub-1234567890123456') {
    if (!html.includes('adsbygoogle.js')) {
      headInjections += `    <!-- Google AdSense -->\n`;
      headInjections += `    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}" crossorigin="anonymous"></script>\n`;
    }
  }

  // Replace default title and description in index.html
  let modifiedHtml = html;
  
  // Replace Google Site Verification if present
  const verificationCode = process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION || 'la3aWrlQmZwc9Uzi5z7UdgpgQlqcn7mfYpVQHiItmsE';
  modifiedHtml = modifiedHtml.replace(/%GOOGLE_SITE_VERIFICATION%/g, verificationCode);
  
  // Replace <title>
  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );
  
  // Replace description meta tag
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${description}" />`
  );

  // Append new injections to head
  modifiedHtml = modifiedHtml.replace('</head>', `${headInjections}  </head>`);

  return modifiedHtml;
}

// 1. Google AdSense Authorized Sellers File (ads.txt)
app.get('/ads.txt', (req, res) => {
  const pubId = process.env.ADSENSE_PUBLISHER_ID || 'pub-1234567890123456';
  res.type('text/plain');
  res.send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// 2. Robots Crawl Guidelines (robots.txt)
app.get('/robots.txt', (req, res) => {
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml
`);
});

// 3. Dynamic XML Sitemap (sitemap.xml)
app.get('/sitemap.xml', (req, res) => {
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=trends</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=apps</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/?tab=courses</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// Configure Vite or Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // In Dev: Support dynamically-injected SEO preview pages for testing
    app.use(async (req, res, next) => {
      const isHtmlRoute = req.path === '/' || req.path === '/index.html' || (!req.path.includes('.') && !req.path.startsWith('/api/'));
      if (req.method === 'GET' && isHtmlRoute && req.accepts('html')) {
        try {
          const rawHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          // Let Vite process index.html (HMR scripts etc)
          const transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
          const finalHtml = getInjectedHtml(transformedHtml, req);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
        } catch (e) {
          next(e);
        }
      } else {
        vite.middlewares(req, res, next);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files but skip index.html default serving so we can dynamically inject meta-tags/AdSense
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      try {
        const htmlPath = path.join(distPath, 'index.html');
        if (fs.existsSync(htmlPath)) {
          const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
          const finalHtml = getInjectedHtml(rawHtml, req);
          res.send(finalHtml);
        } else {
          res.sendFile(htmlPath);
        }
      } catch (err) {
        console.error("Error serving injected HTML in production:", err);
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

setupServer();
