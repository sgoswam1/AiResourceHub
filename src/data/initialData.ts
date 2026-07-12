import { AIApp, AICourse } from '../types';

export const INITIAL_APPS: AIApp[] = [
  {
    name: 'ChatGPT',
    logo: 'CG',
    color: 'linear-gradient(135deg,#10b981,#047857)',
    desc: 'General-purpose assistant for writing, analysis, coding, brainstorming, and multimodal tasks.',
    link: 'https://chatgpt.com',
    tags: ['chat', 'assistant', 'writing', 'openai'],
    catKey: 'chat-assistants',
    catLabel: 'Chat & Assistants'
  },
  {
    name: 'Claude',
    logo: 'CL',
    color: 'linear-gradient(135deg,#f59e0b,#b45309)',
    desc: 'Strong for long-context reasoning, document work, and careful writing.',
    link: 'https://claude.ai',
    tags: ['analysis', 'documents', 'reasoning', 'anthropic'],
    catKey: 'chat-assistants',
    catLabel: 'Chat & Assistants'
  },
  {
    name: 'Gemini',
    logo: 'GM',
    color: 'linear-gradient(135deg,#2563eb,#7c3aed)',
    desc: 'Google AI assistant that connects well with search, workspace, and multimodal tasks.',
    link: 'https://gemini.google.com',
    tags: ['workspace', 'google', 'multimodal', 'assistant'],
    catKey: 'chat-assistants',
    catLabel: 'Chat & Assistants'
  },
  {
    name: 'Microsoft Copilot',
    logo: 'CP',
    color: 'linear-gradient(135deg,#0ea5e9,#4f46e5)',
    desc: 'AI assistant integrated with Microsoft 365, web search, and enterprise workflows.',
    link: 'https://copilot.microsoft.com',
    tags: ['office', 'enterprise', 'productivity', 'microsoft'],
    catKey: 'chat-assistants',
    catLabel: 'Chat & Assistants'
  },
  {
    name: 'Perplexity',
    logo: 'PX',
    color: 'linear-gradient(135deg,#0f766e,#14b8a6)',
    desc: 'Answer engine focused on cited research, web exploration, and fast topic synthesis.',
    link: 'https://www.perplexity.ai',
    tags: ['research', 'search', 'citations', 'engine'],
    catKey: 'search-research',
    catLabel: 'Search & Research'
  },
  {
    name: 'Elicit',
    logo: 'EL',
    color: 'linear-gradient(135deg,#7c3aed,#4c1d95)',
    desc: 'Research workflow tool for literature discovery, summarization, and evidence extraction.',
    link: 'https://elicit.com',
    tags: ['papers', 'research', 'evidence', 'science'],
    catKey: 'search-research',
    catLabel: 'Search & Research'
  },
  {
    name: 'Consensus',
    logo: 'CS',
    color: 'linear-gradient(135deg,#1d4ed8,#0891b2)',
    desc: 'Search engine designed to surface scientific findings and paper-backed answers.',
    link: 'https://consensus.app',
    tags: ['science', 'papers', 'search', 'academic'],
    catKey: 'search-research',
    catLabel: 'Search & Research'
  },
  {
    name: 'GitHub Copilot',
    logo: 'GH',
    color: 'linear-gradient(135deg,#111827,#4b5563)',
    desc: 'AI pair programmer for code completion, chat, refactoring, and repo-aware help.',
    link: 'https://github.com/features/copilot',
    tags: ['coding', 'developer', 'github', 'ide'],
    catKey: 'coding-dev',
    catLabel: 'Coding & Dev'
  },
  {
    name: 'Cursor',
    logo: 'CU',
    color: 'linear-gradient(135deg,#111827,#0f766e)',
    desc: 'AI-native code editor popular for code generation, edits, and repository context.',
    link: 'https://www.cursor.com',
    tags: ['editor', 'coding', 'ide', 'development'],
    catKey: 'coding-dev',
    catLabel: 'Coding & Dev'
  },
  {
    name: 'Replit',
    logo: 'RP',
    color: 'linear-gradient(135deg,#f97316,#ea580c)',
    desc: 'Browser-based development platform with AI assistance for prototyping and deployment.',
    link: 'https://replit.com',
    tags: ['build', 'deploy', 'browser', 'sandbox'],
    catKey: 'coding-dev',
    catLabel: 'Coding & Dev'
  },
  {
    name: 'Bolt.new',
    logo: 'BT',
    color: 'linear-gradient(135deg,#0f172a,#2563eb)',
    desc: 'Prompt-driven web app builder for rapid UI and app prototyping in the browser.',
    link: 'https://bolt.new',
    tags: ['webapp', 'prototype', 'builder', 'vite'],
    catKey: 'coding-dev',
    catLabel: 'Coding & Dev'
  },
  {
    name: 'Midjourney',
    logo: 'MJ',
    color: 'linear-gradient(135deg,#312e81,#7c3aed)',
    desc: 'Widely used text-to-image platform for stylized and high-quality visual generation.',
    link: 'https://www.midjourney.com',
    tags: ['image', 'art', 'design', 'diffusion'],
    catKey: 'image-design',
    catLabel: 'Image & Design'
  },
  {
    name: 'Adobe Firefly',
    logo: 'AF',
    color: 'linear-gradient(135deg,#dc2626,#f97316)',
    desc: 'Creative AI suite for image generation and edits within Adobe workflows.',
    link: 'https://firefly.adobe.com',
    tags: ['creative', 'adobe', 'image', 'generation'],
    catKey: 'image-design',
    catLabel: 'Image & Design'
  },
  {
    name: 'Canva AI',
    logo: 'CV',
    color: 'linear-gradient(135deg,#06b6d4,#2563eb)',
    desc: 'Design platform with AI generation, presentations, social content, and templates.',
    link: 'https://www.canva.com/ai-image-generator/',
    tags: ['canva', 'design', 'presentation', 'graphics'],
    catKey: 'image-design',
    catLabel: 'Image & Design'
  },
  {
    name: 'Leonardo AI',
    logo: 'LD',
    color: 'linear-gradient(135deg,#16a34a,#14532d)',
    desc: 'Image generation and asset creation platform for marketing, gaming, and concept art.',
    link: 'https://leonardo.ai',
    tags: ['assets', 'image', 'creative', 'design'],
    catKey: 'image-design',
    catLabel: 'Image & Design'
  },
  {
    name: 'Runway',
    logo: 'RW',
    color: 'linear-gradient(135deg,#111827,#db2777)',
    desc: 'AI video generation and editing platform used for creative and marketing production.',
    link: 'https://runwayml.com',
    tags: ['video', 'editing', 'creative', 'generation'],
    catKey: 'video-avatar',
    catLabel: 'Video & Avatars'
  },
  {
    name: 'Pika',
    logo: 'PK',
    color: 'linear-gradient(135deg,#7c3aed,#ec4899)',
    desc: 'Generative video creation tool for clips, effects, and animation-heavy outputs.',
    link: 'https://pika.art',
    tags: ['video', 'clips', 'animation', 'generation'],
    catKey: 'video-avatar',
    catLabel: 'Video & Avatars'
  },
  {
    name: 'Synthesia',
    logo: 'SY',
    color: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)',
    desc: 'Avatar video platform for training, explainers, onboarding, and enterprise content.',
    link: 'https://www.synthesia.io',
    tags: ['avatar', 'training', 'video', 'corporate'],
    catKey: 'video-avatar',
    catLabel: 'Video & Avatars'
  },
  {
    name: 'HeyGen',
    logo: 'HG',
    color: 'linear-gradient(135deg,#f43f5e,#be123c)',
    desc: 'Avatar and talking-video platform for sales, marketing, and localization workflows.',
    link: 'https://www.heygen.com',
    tags: ['avatar', 'marketing', 'localization', 'video'],
    catKey: 'video-avatar',
    catLabel: 'Video & Avatars'
  },
  {
    name: 'ElevenLabs',
    logo: '11',
    color: 'linear-gradient(135deg,#111827,#6b7280)',
    desc: 'AI voice generation, dubbing, and speech synthesis tool for natural-sounding audio.',
    link: 'https://elevenlabs.io',
    tags: ['voice', 'audio', 'speech', 'synthesis'],
    catKey: 'audio-voice',
    catLabel: 'Audio & Voice'
  },
  {
    name: 'Descript',
    logo: 'DS',
    color: 'linear-gradient(135deg,#0891b2,#155e75)',
    desc: 'Audio and video editor with transcription, overdub, and content repurposing tools.',
    link: 'https://www.descript.com',
    tags: ['transcription', 'podcast', 'editing', 'voice'],
    catKey: 'audio-voice',
    catLabel: 'Audio & Voice'
  },
  {
    name: 'Murf',
    logo: 'MF',
    color: 'linear-gradient(135deg,#f59e0b,#d97706)',
    desc: 'Voiceover platform for presentations, e-learning, and business communication.',
    link: 'https://murf.ai',
    tags: ['voiceover', 'presentation', 'audio', 'business'],
    catKey: 'audio-voice',
    catLabel: 'Audio & Voice'
  },
  {
    name: 'Notion AI',
    logo: 'NT',
    color: 'linear-gradient(135deg,#111827,#374151)',
    desc: 'AI writing, summarization, and knowledge workflow assistance inside Notion.',
    link: 'https://www.notion.so/product/ai',
    tags: ['notes', 'knowledge', 'productivity', 'workspace'],
    catKey: 'productivity-automation',
    catLabel: 'Productivity & Automation'
  },
  {
    name: 'Zapier AI',
    logo: 'ZP',
    color: 'linear-gradient(135deg,#f97316,#c2410c)',
    desc: 'Workflow automation platform with AI-powered logic and app integrations.',
    link: 'https://zapier.com/ai',
    tags: ['automation', 'workflows', 'integrations', 'no-code'],
    catKey: 'productivity-automation',
    catLabel: 'Productivity & Automation'
  },
  {
    name: 'Make',
    logo: 'MK',
    color: 'linear-gradient(135deg,#4f46e5,#312e81)',
    desc: 'Visual automation builder for integrating apps, agents, and operational processes.',
    link: 'https://www.make.com',
    tags: ['automation', 'ops', 'integrations', 'visual'],
    catKey: 'productivity-automation',
    catLabel: 'Productivity & Automation'
  },
  {
    name: 'Otter',
    logo: 'OT',
    color: 'linear-gradient(135deg,#06b6d4,#0f766e)',
    desc: 'Meeting assistant for transcription, summaries, and action items.',
    link: 'https://otter.ai',
    tags: ['meetings', 'transcription', 'productivity', 'notes'],
    catKey: 'productivity-automation',
    catLabel: 'Productivity & Automation'
  }
];

export const INITIAL_COURSES: AICourse[] = [
  {
    title: 'AI Skills Navigator',
    provider: 'Microsoft',
    category: 'Beginner & Productivity',
    badge: 'Free',
    logo: 'MS',
    color: 'linear-gradient(135deg,#16a34a,#166534)',
    desc: 'Personalized entry point into Microsoft Learn AI tracks, including Copilot and Azure AI paths.',
    link: 'https://aiskillsnavigator.microsoft.com/'
  },
  {
    title: 'Generative AI for Beginners',
    provider: 'Microsoft',
    category: 'Developer & Build',
    badge: 'Free',
    logo: 'MS',
    color: 'linear-gradient(135deg,#0284c7,#1d4ed8)',
    desc: 'Open curriculum for building generative AI skills with practical examples and code.',
    link: 'https://github.com/microsoft/generative-ai-for-beginners'
  },
  {
    title: 'Azure AI Fundamentals',
    provider: 'Microsoft',
    category: 'Cloud & Certification',
    badge: 'Free to learn',
    logo: 'AZ',
    color: 'linear-gradient(135deg,#2563eb,#1e3a8a)',
    desc: 'Foundational Azure AI learning route aligned with Microsoft certification prep.',
    link: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/'
  },
  {
    title: 'Google AI Essentials',
    provider: 'Google',
    category: 'Beginner & Productivity',
    badge: 'Free to start',
    logo: 'GG',
    color: 'linear-gradient(135deg,#ea4335,#4285f4)',
    desc: 'Introductory AI course designed for practical workplace use and foundational fluency.',
    link: 'https://grow.google/ai-essentials/'
  },
  {
    title: 'Intro to Generative AI',
    provider: 'Google',
    category: 'Generative AI',
    badge: 'Free',
    logo: 'GG',
    color: 'linear-gradient(135deg,#fbbc05,#34a853)',
    desc: 'Short Google course covering what generative AI is and where it fits.',
    link: 'https://www.skills.google/course_templates/536'
  },
  {
    title: 'Generative AI Learning Path',
    provider: 'Google',
    category: 'Generative AI',
    badge: 'Free',
    logo: 'GG',
    color: 'linear-gradient(135deg,#4285f4,#7c3aed)',
    desc: 'Google Cloud learning path that covers LLMs, transformers, image generation, and Vertex AI.',
    link: 'https://www.skills.google/paths/118'
  },
  {
    title: 'AI Foundations',
    provider: 'IBM SkillsBuild',
    category: 'Beginner & Credential',
    badge: 'Free',
    logo: 'IB',
    color: 'linear-gradient(135deg,#1d4ed8,#111827)',
    desc: 'Beginner-focused AI foundation track with IBM digital badges.',
    link: 'https://www.ibm.com/training/badge/ai-foundations'
  },
  {
    title: 'Generative AI: Intro and Applications',
    provider: 'IBM',
    category: 'Generative AI',
    badge: 'Free to audit',
    logo: 'IB',
    color: 'linear-gradient(135deg,#06b6d4,#0f172a)',
    desc: 'Introductory course on generative AI use cases and business applications.',
    link: 'https://www.coursera.org/learn/generative-ai-introduction-and-applications'
  },
  {
    title: 'AI Fluency Track',
    provider: 'OpenAI Academy',
    category: 'Beginner & Productivity',
    badge: 'Free',
    logo: 'OA',
    color: 'linear-gradient(135deg,#111827,#374151)',
    desc: 'Foundation track focused on AI concepts and practical use of AI systems.',
    link: 'https://academy.openai.com/public/courses/ai-foundations-juzjs'
  },
  {
    title: 'AI for Developers Track',
    provider: 'OpenAI Academy',
    category: 'Developer & Build',
    badge: 'Free',
    logo: 'OA',
    color: 'linear-gradient(135deg,#0f766e,#111827)',
    desc: 'Developer-oriented learning path for agents, workflows, and applied AI building.',
    link: 'https://academy.openai.com/public/courses/agents-and-workflows-bieml'
  },
  {
    title: 'Claude 101',
    provider: 'Anthropic',
    category: 'Beginner & Productivity',
    badge: 'Free',
    logo: 'AN',
    color: 'linear-gradient(135deg,#f59e0b,#92400e)',
    desc: 'Getting-started course for using Claude effectively in everyday work.',
    link: 'https://anthropic.skilljar.com/claude-101'
  },
  {
    title: 'Claude Code in Action',
    provider: 'Anthropic',
    category: 'Developer & Build',
    badge: 'Free',
    logo: 'AN',
    color: 'linear-gradient(135deg,#fb923c,#7c2d12)',
    desc: 'Applied course aimed at using Claude for coding workflows and developer tasks.',
    link: 'https://anthropic.skilljar.com/claude-code-in-action'
  },
  {
    title: 'Free Courses',
    provider: 'NVIDIA',
    category: 'Developer & Build',
    badge: 'Free',
    logo: 'NV',
    color: 'linear-gradient(135deg,#84cc16,#365314)',
    desc: 'NVIDIA training catalog with AI, deep learning, and accelerated computing topics.',
    link: 'https://resources.nvidia.com/en-us-nvidia-training/free-courses'
  },
  {
    title: 'Generative AI Explained',
    provider: 'NVIDIA',
    category: 'Generative AI',
    badge: 'Free',
    logo: 'NV',
    color: 'linear-gradient(135deg,#a3e635,#4d7c0f)',
    desc: 'Compact explanation of generative AI concepts and terminology.',
    link: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-07+V1'
  },
  {
    title: 'Fundamentals of Deep Learning',
    provider: 'NVIDIA',
    category: 'Advanced & Technical',
    badge: 'Free',
    logo: 'NV',
    color: 'linear-gradient(135deg,#65a30d,#1a2e05)',
    desc: 'Technical training route for learners who want deeper model-building understanding.',
    link: 'https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+C-FX-01+V3'
  },
  {
    title: '6.S191 Introduction to Deep Learning',
    provider: 'MIT OpenCourseWare',
    category: 'Advanced & Technical',
    badge: 'Free',
    logo: 'MI',
    color: 'linear-gradient(135deg,#991b1b,#450a0a)',
    desc: 'MIT course covering deep learning, computer vision, LLMs, and labs in Colab.',
    link: 'https://introtodeeplearning.com/'
  },
  {
    title: 'CS50’s Introduction to AI with Python',
    provider: 'Harvard',
    category: 'Advanced & Technical',
    badge: 'Free',
    logo: 'HV',
    color: 'linear-gradient(135deg,#7f1d1d,#1f2937)',
    desc: 'Rigorous introduction to AI fundamentals with Python projects across search, logic, ML, and NLP.',
    link: 'https://cs50.harvard.edu/ai/'
  },
  {
    title: 'Practical Deep Learning for Coders',
    provider: 'fast.ai',
    category: 'Advanced & Technical',
    badge: 'Free',
    logo: 'FA',
    color: 'linear-gradient(135deg,#2563eb,#0f172a)',
    desc: 'Project-first deep learning course for coders who want to build quickly and learn the theory after.',
    link: 'https://course.fast.ai/'
  },
  {
    title: 'CS229 Machine Learning',
    provider: 'Stanford Online',
    category: 'Advanced & Technical',
    badge: 'Free',
    logo: 'ST',
    color: 'linear-gradient(135deg,#b91c1c,#7f1d1d)',
    desc: 'Graduate-level machine learning content for mathematically serious learners.',
    link: 'https://online.stanford.edu/courses/cs229-machine-learning'
  },
  {
    title: 'AI for Everyone',
    provider: 'DeepLearning.AI',
    category: 'Beginner & Productivity',
    badge: 'Free to audit',
    logo: 'DL',
    color: 'linear-gradient(135deg,#0ea5e9,#4338ca)',
    desc: 'Non-technical AI overview focused on strategy, opportunity spotting, and business understanding.',
    link: 'https://www.deeplearning.ai/courses/ai-for-everyone/'
  }
];
