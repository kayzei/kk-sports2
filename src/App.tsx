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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  fetchSportsNews, 
  fetchArticleContent, 
  fetchBoxingSchedule, 
  fetchBoxingResults,
  NewsArticle, 
  BoxingSchedule, 
  BoxingResult 
} from './services/newsService';
import { cn } from './utils';

const CATEGORIES = ['All', 'Football', 'Boxing', 'Cricket', 'Basketball', 'Netball'];

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
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadNews();
    loadBoxingData();
    setupWebSocket();
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
    const [sched, res] = await Promise.all([
      fetchBoxingSchedule(),
      fetchBoxingResults()
    ]);
    setSchedule(sched);
    setResults(res);
  };

  const handleArticleClick = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setArticleContent(null);
    const content = await fetchArticleContent(article.title);
    setArticleContent(content);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <header className="bg-kk-black text-white sticky top-0 z-50 border-b-4 border-kk-yellow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedArticle(null); setSelectedCategory('All'); }}>
                <div className="bg-kk-yellow text-kk-black p-1 font-black text-2xl px-3 rounded-sm">KK</div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-xl tracking-tight">SPORTS</span>
                  <span className="text-[10px] font-bold text-kk-yellow tracking-widest">ZAMBIA</span>
                </div>
              </div>
              
              <nav className="hidden lg:flex items-center gap-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "text-sm font-semibold hover:text-kk-yellow transition-colors relative py-5",
                      selectedCategory === cat && "text-kk-yellow after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-kk-yellow"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE SCORES
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full">
                <Search size={20} />
              </button>
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
          {liveScores.map(score => (
            <div key={score.id} className="flex items-center gap-3 font-bold text-sm">
              <span className="bg-kk-black text-kk-yellow px-1.5 py-0.5 rounded text-[10px]">{score.type}</span>
              <span>{score.match}</span>
              <span className="text-red-700">{score.score}</span>
              <span className="opacity-60">{score.time}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {liveScores.map(score => (
            <div key={`${score.id}-dup`} className="flex items-center gap-3 font-bold text-sm">
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
            className="max-w-4xl mx-auto"
          >
            <button 
              onClick={() => setSelectedArticle(null)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-kk-black font-semibold"
            >
              <ChevronRight className="rotate-180" size={20} />
              Back to News
            </button>
            
            <img 
              src={selectedArticle.imageUrl} 
              alt={selectedArticle.title}
              className="w-full aspect-video object-cover rounded-lg mb-8 shadow-lg"
              referrerPolicy="no-referrer"
            />
            
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-kk-yellow text-kk-black px-3 py-1 text-xs font-bold uppercase">
                {selectedArticle.category}
              </span>
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Clock size={14} />
                {selectedArticle.timestamp}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              {selectedArticle.title}
            </h1>

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
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Main News */}
            <div className="lg:col-span-8">
              {/* Hero Section */}
              {!loading && news.length > 0 && selectedCategory === 'All' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group cursor-pointer overflow-hidden rounded-lg mb-12"
                  onClick={() => handleArticleClick(news[0])}
                >
                  <img 
                    src={news[0].imageUrl} 
                    alt={news[0].title}
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8">
                    <span className="bg-kk-yellow text-kk-black px-3 py-1 text-xs font-bold uppercase w-fit mb-4">
                      TOP STORY
                    </span>
                    <h2 className="text-white text-3xl md:text-5xl font-black mb-2 group-hover:underline leading-tight">
                      {news[0].title}
                    </h2>
                    <p className="text-gray-200 line-clamp-2 max-w-2xl text-lg">
                      {news[0].summary}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* News Grid */}
              <div className="flex items-center justify-between mb-6 border-b-2 border-kk-black pb-2">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  <Newspaper className="text-kk-yellow" />
                  {selectedCategory === 'All' ? 'LATEST NEWS' : `${selectedCategory.toUpperCase()} NEWS`}
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
                  {news.slice(selectedCategory === 'All' ? 1 : 0).map((item, index) => (
                    <motion.div
                      key={item.id}
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
                          <span className="bg-kk-black/80 text-white px-2 py-1 text-[10px] font-bold uppercase backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black mb-2 group-hover:text-kk-yellow transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} />
                        {item.timestamp}
                      </div>
                    </motion.div>
                  ))}
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
                  {liveScores.map(score => (
                    <div key={score.id} className="group">
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

              {/* KK Boxing Schedule */}
              <div className="bg-white p-6 rounded-lg bbc-shadow border-t-4 border-kk-yellow">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Calendar className="text-kk-black" size={20} />
                  KK BOXING SCHEDULE
                </h3>
                <div className="space-y-4">
                  {schedule.map(item => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded border-l-2 border-kk-yellow">
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
                  {results.map(res => (
                    <div key={res.id} className="group">
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
