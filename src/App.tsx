/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Newspaper, 
  Tv, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Clock,
  Dumbbell,
  Flame,
  Calendar,
  Award,
  Zap,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  fetchSportsNews, 
  fetchArticleContent, 
  fetchBoxingSchedule, 
  fetchBoxingResults,
  fetchVideoHighlights,
  fetchAthletes,
  fetchAthleteNews,
  NewsArticle, 
  BoxingSchedule, 
  BoxingResult,
  VideoHighlight,
  Athlete
} from './services/newsService';
import { cn } from './utils';

const CATEGORIES = ['All', 'Football', 'Boxing', 'Cricket', 'Basketball', 'Athletes'];

interface LiveScore {
  id: string;
  type: string;
  match: string;
  score: string;
  status: string;
  time: string;
  isZambian: boolean;
  details?: string;
}

export default function App() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [schedule, setSchedule] = useState<BoxingSchedule[]>([]);
  const [results, setResults] = useState<BoxingResult[]>([]);
  const [highlights, setHighlights] = useState<VideoHighlight[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [athleteNews, setAthleteNews] = useState<NewsArticle[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [breakingNews, setBreakingNews] = useState<string>('');

  useEffect(() => {
    loadNews();
    loadBoxingData();
    loadAthletes();
    setupWebSocket();
    setBreakingNews("BREAKING: Catherine Phiri announces comeback fight scheduled for June in Lusaka! • Chipolopolo squad for World Cup qualifiers to be named tomorrow.");
  }, [selectedCategory]);

  const setupWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'SCORE_UPDATE') {
        setLiveScores(message.data);
      }
    };

    return () => socket.close();
  };

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchSportsNews(selectedCategory.toLowerCase());
    setNews(data);
    setLoading(false);
  };

  const loadBoxingData = async () => {
    const [sched, res, high] = await Promise.all([
      fetchBoxingSchedule(),
      fetchBoxingResults(),
      fetchVideoHighlights()
    ]);
    setSchedule(sched);
    setResults(res);
    setHighlights(high);
  };

  const loadAthletes = async () => {
    const data = await fetchAthletes();
    setAthletes(data);
  };

  const handleAthleteClick = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setAthleteNews([]);
    const news = await fetchAthleteNews(athlete.name);
    setAthleteNews(news);
    window.scrollTo(0, 0);
  };

  const handleArticleClick = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setArticleContent(null);
    const content = await fetchArticleContent(article.title);
    setArticleContent(content);
    window.scrollTo(0, 0);
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAthletes = athletes.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Breaking News Bar */}
      <div className="bg-red-700 text-white py-1 text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap">
        <div className="flex animate-marquee gap-12 px-4">
          <span>{breakingNews}</span>
          <span>{breakingNews}</span>
        </div>
      </div>

      {/* Top Header */}
      <header className="bg-kk-black text-white sticky top-0 z-50 border-b-4 border-kk-yellow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedArticle(null); setSelectedAthlete(null); setSelectedCategory('All'); setSearchQuery(''); }}>
                <div className="bg-kk-yellow text-kk-black p-1 font-black text-2xl px-3 rounded-sm">KK</div>
                <div className="flex flex-col leading-none">
                  <span className="font-display font-black text-xl tracking-tight">SPORTS</span>
                  <span className="text-[10px] font-bold text-kk-yellow tracking-widest">ZAMBIA</span>
                </div>
              </div>
              
              <nav className="hidden lg:flex items-center gap-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedArticle(null);
                      setSelectedAthlete(null);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "text-sm font-bold hover:text-kk-yellow transition-colors relative py-5 uppercase tracking-wider",
                      selectedCategory === cat && "text-kk-yellow after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-kk-yellow"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE UPDATES
              </div>
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      type="text"
                      placeholder="Search sports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border-b border-kk-yellow text-white text-sm px-3 py-1 outline-none focus:bg-white/20 rounded-l-sm"
                    />
                  )}
                </AnimatePresence>
                <button 
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search size={20} className={isSearchOpen ? "text-kk-yellow" : ""} />
                </button>
              </div>
              <button 
                className="lg:hidden p-2 hover:bg-white/10 rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-kk-black text-white border-t border-white/10"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedArticle(null);
                  setSelectedAthlete(null);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-6 py-4 border-b border-white/5 hover:bg-white/5"
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Scores Ticker */}
      <div className="bg-kk-yellow text-kk-black py-2 overflow-hidden whitespace-nowrap border-b border-kk-black/10">
        <div className="flex animate-marquee gap-12 px-4">
          {liveScores.map((score, idx) => (
            <div key={`${score.id}-${idx}`} className="flex items-center gap-3 font-bold text-sm">
              <span className="bg-kk-black text-kk-yellow px-1.5 py-0.5 rounded text-[10px]">{score.type}</span>
              <span>{score.match}</span>
              <span className="text-red-700">{score.score}</span>
              <span className="opacity-60">{score.time}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {liveScores.map((score, idx) => (
            <div key={`${score.id}-dup-${idx}`} className="flex items-center gap-3 font-bold text-sm">
              <span className="bg-kk-black text-kk-yellow px-1.5 py-0.5 rounded text-[10px]">{score.type}</span>
              <span>{score.match}</span>
              <span className="text-red-700">{score.score}</span>
              <span className="opacity-60">{score.time}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {selectedArticle ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            <button 
              onClick={() => setSelectedArticle(null)}
              className="mb-8 flex items-center gap-2 text-gray-600 hover:text-kk-black font-semibold"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back to News
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title}
                  className="w-full aspect-video lg:aspect-square object-cover rounded-lg shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-kk-yellow text-kk-black px-3 py-1 text-xs font-bold uppercase">
                    {selectedArticle.category}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock size={14} />
                    {selectedArticle.timestamp}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight uppercase italic">
                  {selectedArticle.title}
                </h1>

                <div className="flex items-center gap-4 mb-8 border-y border-gray-100 py-4">
                  <button 
                    onClick={() => alert('Article shared to Facebook!')}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-kk-yellow transition-colors"
                  >
                    <Zap size={16} /> Share
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-kk-yellow transition-colors"
                  >
                    <Newspaper size={16} /> Print
                  </button>
                </div>

                <div className="prose prose-lg max-w-none markdown-body">
                  {articleContent ? (
                    <Markdown>{articleContent}</Markdown>
                  ) : (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : selectedAthlete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            <button 
              onClick={() => setSelectedAthlete(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-kk-black font-semibold"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back to Athletes
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-1">
                <img 
                  src={selectedAthlete.imageUrl} 
                  alt={selectedAthlete.name}
                  className="w-full aspect-square object-cover rounded-lg shadow-xl mb-6"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-kk-black text-white p-6 rounded-lg">
                  <h3 className="font-black text-xl mb-4 border-b border-white/10 pb-2">QUICK STATS</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedAthlete.stats).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{key}</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    ))}
                    {selectedAthlete.record && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Record</span>
                        <span className="font-bold text-kk-yellow">{selectedAthlete.record}</span>
                      </div>
                    )}
                    {selectedAthlete.weightClass && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Weight Class</span>
                        <span className="font-bold">{selectedAthlete.weightClass}</span>
                      </div>
                    )}
                    {selectedAthlete.signatureMove && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Signature Move</span>
                        <span className="font-bold italic">{selectedAthlete.signatureMove}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h1 className="text-5xl font-black mb-2">{selectedAthlete.name}</h1>
                <p className="text-kk-yellow font-bold text-xl mb-6 uppercase tracking-widest">{selectedAthlete.sport}</p>
                
                <div className="bg-white p-8 rounded-lg bbc-shadow mb-8">
                  <h3 className="font-black text-2xl mb-4">BIOGRAPHY</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {selectedAthlete.bio}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg bbc-shadow mb-8">
                  <h3 className="font-black text-2xl mb-4">NOTABLE ACHIEVEMENTS</h3>
                  <ul className="space-y-3">
                    {selectedAthlete.achievements.map((ach, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700">
                        <Trophy className="text-kk-yellow shrink-0" size={20} />
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t-2 border-kk-black pt-8">
                  <h3 className="font-black text-2xl mb-6 flex items-center gap-2">
                    <Newspaper className="text-kk-yellow" />
                    RECENT NEWS
                  </h3>
                  <div className="space-y-6">
                    {athleteNews.length > 0 ? athleteNews.map((item, idx) => (
                      <div 
                        key={`${item.id}-${idx}`} 
                        className="group cursor-pointer bg-white p-4 rounded-lg bbc-shadow hover:border-l-4 border-kk-yellow transition-all"
                        onClick={() => handleArticleClick(item)}
                      >
                        <h4 className="font-black text-lg group-hover:text-kk-yellow transition-colors">{item.title}</h4>
                        <p className="text-gray-500 text-sm line-clamp-1 mt-1">{item.summary}</p>
                        <span className="text-[10px] text-gray-400 mt-2 block uppercase font-bold">{item.timestamp}</span>
                      </div>
                    )) : (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : selectedCategory === 'Athletes' ? (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black mb-8 border-b-4 border-kk-yellow pb-2 inline-block uppercase tracking-tighter italic">ZAMBIAN SPORTS ICONS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAthletes.map((athlete, index) => (
                <motion.div
                  key={`${athlete.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden bbc-shadow hover:shadow-2xl transition-all"
                  onClick={() => handleAthleteClick(athlete)}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img 
                      src={athlete.imageUrl} 
                      alt={athlete.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-kk-yellow text-kk-black px-3 py-1 text-xs font-bold uppercase shadow-lg">
                        {athlete.sport}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black mb-2 group-hover:text-kk-yellow transition-colors">{athlete.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{athlete.bio}</p>
                    <div className="flex items-center justify-between text-xs font-bold border-t pt-4">
                      <span className="text-gray-400">VIEW PROFILE</span>
                      <ChevronRight className="text-kk-yellow" size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Main News */}
            <div className="lg:col-span-8">
              {/* Hero Section */}
              {!loading && filteredNews.length > 0 && selectedCategory === 'All' && searchQuery === '' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group cursor-pointer overflow-hidden rounded-lg mb-12"
                  onClick={() => handleArticleClick(filteredNews[0])}
                >
                  <img 
                    src={filteredNews[0].imageUrl} 
                    alt={filteredNews[0].title}
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8">
                    <span className="bg-kk-yellow text-kk-black px-3 py-1 text-xs font-black uppercase w-fit mb-4 tracking-widest">
                      TOP STORY
                    </span>
                    <h2 className="text-white text-3xl md:text-5xl font-black mb-2 group-hover:underline leading-tight uppercase italic">
                      {filteredNews[0].title}
                    </h2>
                    <p className="text-gray-200 line-clamp-2 max-w-2xl text-lg font-medium">
                      {filteredNews[0].summary}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* News Grid */}
              <div className="flex items-center justify-between mb-6 border-b-2 border-kk-black pb-2">
                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2 italic">
                  <Newspaper className="text-kk-yellow" />
                  {searchQuery ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"` : (selectedCategory === 'All' ? 'LATEST NEWS' : `${selectedCategory.toUpperCase()} NEWS`)}
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredNews.slice(selectedCategory === 'All' && searchQuery === '' ? 1 : 0).map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => handleArticleClick(item)}
                    >
                      <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-kk-black/80 text-white px-2 py-1 text-[10px] font-black uppercase backdrop-blur-sm tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black mb-2 group-hover:text-kk-yellow transition-colors leading-tight uppercase italic">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3 font-medium">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Clock size={12} />
                        {item.timestamp}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {filteredNews.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-lg bbc-shadow">
                  <Search size={48} className="mx-auto text-gray-200 mb-4" />
                  <h3 className="text-xl font-black text-gray-400 uppercase">No articles found matching your search</h3>
                </div>
              )}

              {/* Video Highlights Section */}
              {selectedCategory === 'All' && highlights.length > 0 && (
                <div className="mt-16 mb-12">
                  <div className="flex items-center justify-between mb-6 border-b-2 border-kk-black pb-2">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <Play className="text-kk-yellow fill-kk-yellow" size={24} />
                      VIDEO HIGHLIGHTS
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {highlights.map((video, index) => (
                      <motion.a
                        key={`${video.id}-${index}`}
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative block overflow-hidden rounded-lg shadow-lg aspect-video"
                      >
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="bg-kk-yellow text-kk-black p-4 rounded-full shadow-xl transform transition-transform group-hover:scale-110">
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <span className="bg-kk-yellow text-kk-black px-2 py-0.5 text-[10px] font-bold uppercase mb-2 inline-block">
                            {video.category}
                          </span>
                          <h4 className="text-white font-bold text-lg leading-tight group-hover:underline">
                            {video.title}
                          </h4>
                          <span className="text-gray-300 text-xs mt-1 block">{video.duration}</span>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Live Scores Widget */}
              <div className="bg-kk-black text-white p-6 rounded-lg shadow-xl">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-white/10 pb-3">
                  <Zap className="text-kk-yellow" size={20} />
                  LIVE UPDATES
                </h3>
                <div className="space-y-6">
                  {liveScores.map((score, idx) => (
                    <div key={`${score.id}-${idx}`} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          score.type === 'Boxing' ? 'bg-kk-yellow text-kk-black' : 'bg-white/10 text-white'
                        )}>
                          {score.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          {score.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{score.match}</span>
                        <span className="font-black text-kk-yellow">{score.score}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                        <span>{score.time}</span>
                        {score.details && <span className="italic">{score.details}</span>}
                      </div>
                      <hr className="mt-4 border-white/5" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fan Poll Widget */}
              <div className="bg-kk-yellow text-kk-black p-6 rounded-lg shadow-xl">
                <h3 className="font-black text-xl mb-4 flex items-center gap-2 border-b border-kk-black/10 pb-3 uppercase italic">
                  <Flame size={20} />
                  FAN VOTE
                </h3>
                <p className="font-bold text-sm mb-4">Who is the Zambian Athlete of the Month?</p>
                <div className="space-y-3">
                  {['Catherine Phiri', 'Patson Daka', 'Barbra Banda'].map((name) => (
                    <button 
                      key={name} 
                      onClick={() => alert(`Thank you for voting for ${name}!`)}
                      className="w-full text-left p-3 bg-white/50 hover:bg-white rounded font-black text-xs transition-colors border border-kk-black/5 uppercase tracking-wider"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Widget */}
              <div className="bg-white p-6 rounded-lg bbc-shadow border-t-4 border-kk-black">
                <h3 className="font-black text-xl mb-4 uppercase italic">NEWSLETTER</h3>
                <p className="text-xs text-gray-500 mb-4 font-medium">Get the latest Zambian sports news delivered to your inbox.</p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="flex flex-col gap-2">
                  <input type="email" required placeholder="Your email address" className="bg-gray-50 border border-gray-200 px-3 py-2 text-xs outline-none focus:border-kk-yellow rounded" />
                  <button type="submit" className="bg-kk-black text-white py-2 text-xs font-black uppercase tracking-widest hover:bg-kk-yellow hover:text-kk-black transition-colors rounded">
                    SUBSCRIBE
                  </button>
                </form>
              </div>

              {/* KK Boxing Schedule */}
              <div className="bg-white p-6 rounded-lg bbc-shadow border-t-4 border-kk-yellow">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="text-kk-black" size={20} />
                  KK BOXING SCHEDULE
                </h3>
                <div className="space-y-4">
                  {schedule.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="p-3 bg-gray-50 rounded border-l-2 border-kk-yellow">
                      <div className="text-[10px] font-bold text-gray-500 mb-1">{item.date} @ {item.time}</div>
                      <div className="font-bold text-sm leading-tight mb-1">
                        {item.fighterA} <span className="text-kk-yellow">vs</span> {item.fighterB}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Trophy size={10} />
                        {item.venue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Results */}
              <div className="bg-white p-6 rounded-lg bbc-shadow border-t-4 border-kk-black">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="text-kk-black" size={20} />
                  RECENT RESULTS
                </h3>
                <div className="space-y-4">
                  {results.map((res, idx) => (
                    <div key={`${res.id}-${idx}`} className="group">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">
                          {res.fighterA} vs {res.fighterB}
                        </div>
                        <span className="bg-kk-black text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          {res.method}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Winner: <span className="font-bold text-kk-black">{res.winner}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{res.date}</div>
                      <hr className="mt-3 border-gray-50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-kk-black text-white py-12 mt-12 border-t-8 border-kk-yellow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-kk-yellow text-kk-black p-1 font-black text-xl px-2 rounded-sm">KK</div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-lg tracking-tight">SPORTS</span>
                  <span className="text-[8px] font-bold text-kk-yellow tracking-widest">ZAMBIA</span>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Zambia's premier sports network. Bringing you the heart of Zambian sports, 
                from the Chipolopolo's journey to the world-class bouts of KK Boxing.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-kk-yellow">ZAMBIAN SPORTS</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Chipolopolo</li>
                <li className="hover:text-white cursor-pointer">Zambian Super League</li>
                <li className="hover:text-white cursor-pointer">KK Boxing</li>
                <li className="hover:text-white cursor-pointer">Copper Queens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-kk-yellow">NETWORK</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">KK News</li>
                <li className="hover:text-white cursor-pointer">KK Radio</li>
                <li className="hover:text-white cursor-pointer">KK TV</li>
                <li className="hover:text-white cursor-pointer">KK Events</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 KK Sports Zambia. All rights reserved.</p>
            <div className="flex gap-6">
              <span>Lusaka</span>
              <span>Kitwe</span>
              <span>Ndola</span>
              <span>Livingstone</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
