import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Cpu, 
  BookOpen, 
  Search, 
  ArrowUpRight, 
  Moon, 
  Sun, 
  Layers, 
  Grid, 
  List, 
  Menu, 
  X, 
  Calendar, 
  RefreshCw, 
  AlertCircle, 
  Bookmark, 
  Share2, 
  Terminal, 
  Code, 
  BookOpenCheck,
  TrendingUp,
  Award,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_APPS, INITIAL_COURSES } from './data/initialData';
import { AIApp, AICourse, WeeklyTrendsResponse } from './types';

export default function App() {
  // Navigation & filtering state
  const [activeTab, setActiveTab] = useState<'trends' | 'apps' | 'courses'>('trends');
  const [selectedAppCat, setSelectedAppCat] = useState<string>('all');
  const [selectedCourseProvider, setSelectedCourseProvider] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    }
    return false;
  });

  // Dynamic news / trends state
  const [trends, setTrends] = useState<WeeklyTrendsResponse | null>(null);
  const [loadingTrends, setLoadingTrends] = useState<boolean>(true);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  // Apply dark mode theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch weekly Saturday trends from backend API
  const fetchTrends = async () => {
    setLoadingTrends(true);
    setTrendsError(null);
    try {
      const res = await fetch('/api/trending');
      if (!res.ok) throw new Error('Failed to retrieve the latest weekly trends.');
      const data = await res.json();
      setTrends(data);
    } catch (err: any) {
      setTrendsError(err?.message || 'Server connection timed out. Showing pre-seeded trends.');
    } finally {
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  // Filter apps
  const filteredApps = INITIAL_APPS.filter(app => {
    const matchesCat = selectedAppCat === 'all' || app.catKey === selectedAppCat;
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Filter courses
  const filteredCourses = INITIAL_COURSES.filter(course => {
    const matchesProvider = selectedCourseProvider === 'all' || course.provider === selectedCourseProvider;
    const matchesSearch = searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  // Unique course providers list for quick filters
  const providers = ['all', ...Array.from(new Set(INITIAL_COURSES.map(c => c.provider)))];

  // Unique app categories list
  const appCategories = [
    { key: 'all', label: 'All Categories' },
    { key: 'chat-assistants', label: 'Chat & Assistants' },
    { key: 'search-research', label: 'Search & Research' },
    { key: 'coding-dev', label: 'Coding & Dev' },
    { key: 'image-design', label: 'Image & Design' },
    { key: 'video-avatar', label: 'Video & Avatars' },
    { key: 'audio-voice', label: 'Audio & Voice' },
    { key: 'productivity-automation', label: 'Productivity & Automation' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 flex flex-col">

      {/* Primary Header */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setActiveTab('trends'); setSearchQuery(''); }}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
              <div>
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">AI Hub</span>
                <span className="text-[10px] block font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase leading-none mt-0.5">Resources Pulse</span>
              </div>
            </div>
          </div>

          {/* Center Tabs Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-[#131a26] p-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            <button 
              onClick={() => { setActiveTab('trends'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'trends' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Weekly Insights</span>
              <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">New</span>
            </button>
            <button 
              onClick={() => { setActiveTab('apps'); setSelectedAppCat('all'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'apps' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <Cpu className="w-4 h-4" />
              <span>Applications</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{INITIAL_APPS.length}</span>
            </button>
            <button 
              onClick={() => { setActiveTab('courses'); setSelectedCourseProvider('all'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'courses' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Free Courses</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{INITIAL_COURSES.length}</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Search (Expanded in header) */}
            <div className="relative max-w-xs hidden sm:block">
              <input 
                type="search" 
                placeholder={`Search ${activeTab === 'trends' ? 'news, innovations...' : activeTab === 'apps' ? 'chatbots, editors...' : 'providers, titles...'}`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 md:w-64 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131a26]/40 text-slate-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:w-72"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dark Mode Switcher */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#131a26]/40 hover:bg-slate-100 dark:hover:bg-[#172130] transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters (Desktop) */}
        <aside className="w-full md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-24 space-y-6">
            
            {/* Dynamic filter panel based on Active Tab */}
            {activeTab === 'apps' && (
              <div className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-teal-500" />
                    <span>App Categories</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {appCategories.map(cat => {
                      const count = cat.key === 'all' ? INITIAL_APPS.length : INITIAL_APPS.filter(a => a.catKey === cat.key).length;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => { setSelectedAppCat(cat.key); setSearchQuery(''); }}
                          className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${selectedAppCat === cat.key ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16202f]'}`}
                        >
                          <span className="truncate mr-2">{cat.label}</span>
                          <span className="text-[10px] font-bold opacity-80">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-500" />
                    <span>Providers</span>
                  </h3>
                  <div className="flex flex-col gap-1">
                    {providers.map(provider => {
                      const count = provider === 'all' ? INITIAL_COURSES.length : INITIAL_COURSES.filter(c => c.provider === provider).length;
                      return (
                        <button
                          key={provider}
                          onClick={() => { setSelectedCourseProvider(provider); setSearchQuery(''); }}
                          className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${selectedCourseProvider === provider ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#16202f]'}`}
                        >
                          <span className="capitalize">{provider === 'all' ? 'All Providers' : provider}</span>
                          <span className="text-[10px] font-bold opacity-80">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Elegant Information Card */}
            <div className="bg-gradient-to-br from-teal-500/5 to-indigo-500/5 dark:from-[#111e30] dark:to-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
                <span>About AI Resources Hub</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                A carefully curated directory of elite artificial intelligence platforms, verified free educational courses, and trending weekly research summaries updated automatically every weekend.
              </p>
            </div>

          </div>
        </aside>

        {/* Primary Page Feed */}
        <main className="flex-1 min-w-0">
          
          {/* Mobile view search block */}
          <div className="block sm:hidden mb-5">
            <div className="relative">
              <input 
                type="search" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131a26]/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* WEEKLY INSIGHTS HOME TAB */}
            {activeTab === 'trends' && (
              <motion.div
                key="trends-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Home Header */}
                <div className="bg-white dark:bg-[#0e1422] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Saturday Curated</span>
                      </span>
                      {trends?.updatedDate && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Last Refreshed: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">{trends.updatedDate}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">Trending AI Pulse & Innovations</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time breakthrough news, key technical innovations, and novel project concepts automatically generated using Google Search Grounding.
                    </p>
                  </div>
                </div>

                {loadingTrends ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">Gathering Saturday reports and querying search grounding...</p>
                  </div>
                ) : trendsError ? (
                  <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-6 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{trendsError}</p>
                    <button onClick={fetchTrends} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-bold">Retry connection</button>
                  </div>
                ) : trends ? (
                  <div className="space-y-8">
                    
                    {/* news category */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-teal-500" />
                        <h3 className="font-display font-bold text-lg tracking-tight">Trending News & Breakthroughs</h3>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {trends.trendingNews.map((news, index) => (
                          <article key={index} className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{news.category}</span>
                                <Bookmark className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 cursor-pointer hover:text-teal-500" />
                              </div>
                              <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">{news.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{news.summary}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Technical Impact</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-2">"{news.impact}"</p>
                              {news.sourceUrl && (
                                <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold mt-3 hover:underline">
                                  <span>Source Link</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    {/* spacing block */}
                    <div className="h-2"></div>

                    {/* innovations category */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-display font-bold text-lg tracking-tight">Key Architectural Innovations</h3>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        {trends.innovations.map((inn, index) => (
                          <article key={index} className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{inn.category}</span>
                              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">{inn.title}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{inn.description}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Key Highlights</p>
                              <ul className="space-y-1">
                                {inn.highlights.map((h, hidx) => (
                                  <li key={hidx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                                    <span>{h}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>

                    {/* ideas category */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-display font-bold text-lg tracking-tight">AI Project Ideas for Builders</h3>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        {trends.ideas.map((idea, index) => {
                          const diffColors = {
                            Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            Advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          };
                          return (
                            <article key={index} className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">{idea.title}</h4>
                                <div className="flex gap-1.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors[idea.difficulty] || diffColors.Intermediate}`}>{idea.difficulty}</span>
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{idea.estimatedTime}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed"><strong className="text-slate-700 dark:text-slate-300">Concept: </strong>{idea.concept}</p>
                              <div className="bg-slate-50 dark:bg-[#131a26]/80 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800/40">
                                <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1.5">Step-by-Step Build Plan</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{idea.howToBuild}</p>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ) : null}
              </motion.div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'apps' && (
              <motion.div
                key="apps-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Search / Filter summary header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display font-bold text-xl tracking-tight">AI Applications</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Showing {filteredApps.length} tool{filteredApps.length === 1 ? '' : 's'} across the catalog.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'}`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Cat Filters carousel */}
                <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {appCategories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedAppCat(cat.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${selectedAppCat === cat.key ? 'bg-teal-500 text-white' : 'bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {filteredApps.length === 0 ? (
                  <div className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center space-y-2">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications found</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Try broad search or pick another category.</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredApps.map((app, index) => (
                      <article 
                        key={index} 
                        className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow" style={{ background: app.color }}>
                              {app.logo}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{app.catLabel}</p>
                              <h3 className="font-display font-bold text-sm truncate text-slate-900 dark:text-white mt-0.5">{app.name}</h3>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{app.desc}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex gap-1 flex-wrap">
                            {app.tags.slice(0, 2).map((tag, tIdx) => (
                              <span key={tIdx} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{tag}</span>
                            ))}
                          </div>
                          <a href={app.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline">
                            <span>Open</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredApps.map((app, index) => (
                      <article 
                        key={index} 
                        className="bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shrink-0" style={{ background: app.color }}>
                            {app.logo}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">{app.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{app.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline-block bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{app.catLabel}</span>
                          <a href={app.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* FREE COURSES TAB */}
            {activeTab === 'courses' && (
              <motion.div
                key="courses-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Search / Filter summary header */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display font-bold text-xl tracking-tight">Free Professional AI Courses</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Showing {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} across major institutions.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'}`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#1a2333] text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Provider Filters carousel */}
                <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {providers.map(provider => (
                    <button
                      key={provider}
                      onClick={() => setSelectedCourseProvider(provider)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all capitalize ${selectedCourseProvider === provider ? 'bg-teal-500 text-white' : 'bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                    >
                      {provider === 'all' ? 'All Providers' : provider}
                    </button>
                  ))}
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center space-y-2">
                    <Search className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No courses found</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your provider filters.</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredCourses.map((course, index) => (
                      <article 
                        key={index} 
                        className="bg-white dark:bg-[#0e1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs" style={{ background: course.color }}>
                                {course.logo}
                              </div>
                              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">{course.provider}</span>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{course.badge}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{course.category}</span>
                            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-0.5 leading-snug">{course.title}</h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{course.desc}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-semibold italic">Open curriculum</span>
                          <a href={course.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline">
                            <span>Start Learning</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCourses.map((course, index) => (
                      <article 
                        key={index} 
                        className="bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shrink-0" style={{ background: course.color }}>
                            {course.logo}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">{course.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{course.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded">{course.provider}</span>
                          <a href={course.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Premium Clean Footer */}
      <footer className="bg-white dark:bg-[#0e1422] border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 transition-colors duration-300 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              AI Resources Hub
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AI Resources Hub. Elevating learning, tools, and insights for builders worldwide.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <button className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors" onClick={() => setActiveTab('trends')}>Weekly Trends</button>
            <button className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors" onClick={() => setActiveTab('apps')}>Applications</button>
            <button className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors" onClick={() => setActiveTab('courses')}>Courses</button>
          </div>
        </div>
      </footer>

      {/* Overlay Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-[#0b0f19] z-50 p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 md:hidden"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-500" />
                    <span className="font-display font-extrabold text-base">AI Resources Hub</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Tabs</p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => { setActiveTab('trends'); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left ${activeTab === 'trends' ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Weekly Trends</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('apps'); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left ${activeTab === 'apps' ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Applications</span>
                    </button>
                    <button 
                      onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-left ${activeTab === 'courses' ? 'bg-teal-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Free Courses</span>
                    </button>
                  </div>
                </div>

                {activeTab === 'apps' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Categories</p>
                    <div className="flex flex-col gap-1">
                      {appCategories.map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => { setSelectedAppCat(cat.key); setMobileMenuOpen(false); }}
                          className={`text-xs text-left px-4 py-2 rounded-lg ${selectedAppCat === cat.key ? 'bg-teal-500/10 text-teal-600 font-bold' : 'text-slate-600'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Providers</p>
                    <div className="flex flex-col gap-1">
                      {providers.map(prov => (
                        <button
                          key={prov}
                          onClick={() => { setSelectedCourseProvider(prov); setMobileMenuOpen(false); }}
                          className={`text-xs text-left px-4 py-2 rounded-lg capitalize ${selectedCourseProvider === prov ? 'bg-teal-500/10 text-teal-600 font-bold' : 'text-slate-600'}`}
                        >
                          {prov === 'all' ? 'All Providers' : prov}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                <span className="text-[10px] text-slate-400 block">Weekly Updates: Saturdays</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
