import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  imageUrl: string;
  content?: string;
}

export interface BoxingSchedule {
  id: string;
  fighterA: string;
  fighterB: string;
  date: string;
  time: string;
  venue: string;
  title?: string;
}

export interface BoxingResult {
  id: string;
  fighterA: string;
  fighterB: string;
  winner: string;
  method: string;
  date: string;
  details: string;
}

export interface VideoHighlight {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: string;
}

export interface Athlete {
  id: string;
  name: string;
  sport: string;
  imageUrl: string;
  bio: string;
  achievements: string[];
  stats: Record<string, string>;
  // Boxing specific
  record?: string;
  weightClass?: string;
  signatureMove?: string;
}

export async function fetchSportsNews(category: string = "general"): Promise<NewsArticle[]> {
  try {
    const prompt = `Generate 6 realistic and current sports news articles for the category: ${category}. 
    IMPORTANT: Focus on Zambian sports (Chipolopolo, Zambian Super League, etc.) and Zambian Boxing (KK Boxing, Catherine Phiri, etc.).
    Include boxing news if the category is general or boxing.
    Return the data in a JSON array format with the following structure:
    {
      "id": "unique-id-1",
      "title": "Headline",
      "summary": "Short summary",
      "category": "Sport name",
      "timestamp": "e.g., 2 hours ago",
      "imageUrl": "https://picsum.photos/seed/{keyword}/800/450"
    }
    Make the headlines sound professional like BBC Sports but with Zambian context.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function fetchBoxingSchedule(): Promise<BoxingSchedule[]> {
  try {
    const prompt = `Generate 4 upcoming Zambian boxing matches (KK Boxing promotions).
    Return a JSON array:
    {
      "id": "match-1",
      "fighterA": "Name",
      "fighterB": "Name",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "venue": "Venue in Zambia",
      "title": "Optional Title Fight"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchBoxingResults(): Promise<BoxingResult[]> {
  try {
    const prompt = `Generate 4 recent Zambian boxing match results.
    Return a JSON array:
    {
      "id": "result-1",
      "fighterA": "Name",
      "fighterB": "Name",
      "winner": "Name",
      "method": "KO/TKO/UD",
      "date": "YYYY-MM-DD",
      "details": "Brief fight summary"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchVideoHighlights(): Promise<VideoHighlight[]> {
  try {
    const prompt = `Generate 4 realistic Zambian sports video highlights (Boxing, Football, etc.).
    Return a JSON array:
    {
      "id": "video-1",
      "title": "Highlight Title",
      "thumbnailUrl": "https://picsum.photos/seed/{keyword}/640/360",
      "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "duration": "MM:SS",
      "category": "Sport"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchAthletes(): Promise<Athlete[]> {
  try {
    const prompt = `Generate 6 comprehensive athlete profiles for Zambian sports. 
    Include at least 3 boxers (like Catherine Phiri, Esther Phiri, or fictional ones for KK Boxing).
    Return a JSON array:
    {
      "id": "athlete-1",
      "name": "Athlete Name",
      "sport": "Sport",
      "imageUrl": "https://picsum.photos/seed/{name}/600/600",
      "bio": "Brief biography",
      "achievements": ["Achievement 1", "Achievement 2"],
      "stats": { "Stat Name": "Value" },
      "record": "W-L-D (for boxers)",
      "weightClass": "Weight Class (for boxers)",
      "signatureMove": "Move Name (for boxers)"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchAthleteNews(athleteName: string): Promise<NewsArticle[]> {
  try {
    const prompt = `Generate 3 recent news headlines and summaries for the athlete: ${athleteName}.
    Return a JSON array of NewsArticle objects:
    {
      "id": "athlete-news-1",
      "title": "Headline",
      "summary": "Summary",
      "category": "Sport",
      "timestamp": "e.g., 1 day ago",
      "imageUrl": "https://picsum.photos/seed/{keyword}/800/450"
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchArticleContent(title: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a detailed sports news article based on this headline: "${title}". 
      Format it in Markdown. Make it sound like a professional sports journalist.`,
    });
    return response.text || "Content unavailable.";
  } catch (error) {
    console.error("Error fetching article content:", error);
    return "Failed to load article content.";
  }
}
