
import { GoogleGenAI } from "@google/genai";
import { Difficulty, GameResult } from "../types";
import { FALLBACK_TEXTS } from "../constants";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const TOPIC_POOLS: Record<string, string[]> = {
  [Difficulty.EASY]: [
    "daily activities", "food and cooking", "weather", "pets and animals",
    "family and friends", "hobbies", "travel destinations", "sports",
    "seasons", "colors and shapes", "basic emotions", "home and furniture",
    "morning routines", "garden plants", "school supplies", "city parks",
    "weekend trips", "favourite books", "ocean life", "space stars"
  ],
  [Difficulty.MEDIUM]: [
    "technology trends", "environmental sustainability", "workplace productivity",
    "education systems", "health and wellness", "urban development",
    "cultural traditions", "economic principles", "scientific discoveries",
    "social media impact", "modern art movements", "global cuisine",
    "renewable energy", "smart home devices", "remote work benefits",
    "marine biology", "archaeological finds", "jazz music history",
    "organic farming", "electric vehicles", "cinema techniques"
  ],
  [Difficulty.HARD]: [
    "quantum computing", "geopolitical tensions", "cryptocurrency regulation",
    "artificial intelligence ethics", "climate change mitigation strategies",
    "neuroscience research", "macroeconomic policy", "cybersecurity threats",
    "gene editing technologies", "space exploration initiatives",
    "philosophical epistemology", "advanced materials science",
    "algorithmic game theory", "string theory basics", "metaphysical reality",
    "stochastic processes", "behavioral economics", "linguistic evolution",
    "bioinformatics", "nanotechnology applications", "existentialism"
  ],
  [Difficulty.CODING]: [
    "user authentication", "data fetching", "array manipulation",
    "async operations", "error handling", "API integration",
    "state management", "form validation", "sorting algorithms",
    "event listeners", "promise chains", "object destructuring",
    "recursive functions", "binary trees", "hash maps", "middleware setup",
    "unit testing", "git workflows", "component lifecycle", "css modules"
  ]
};

const textCache: Set<string> = new Set();
const MAX_CACHE_SIZE = 50; 

const analyzeText = (text: string) => {
  const words = text.trim().split(/\s+/);
  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return {
    wordCount: words.length,
    avgWordLength: totalLength / words.length,
    hasComplexPunctuation: /[;:()"']/.test(text),
    hasSpecialChars: /[@#$%&*]/.test(text),
    hasNumbers: /\d/.test(text)
  };
};

const validateText = (text: string, difficulty: Difficulty): boolean => {
  const stats = analyzeText(text);
  if (textCache.has(text)) return false;

  switch (difficulty) {
    case Difficulty.EASY:
      return stats.wordCount >= 20 && stats.wordCount <= 45 && !stats.hasSpecialChars;
    case Difficulty.MEDIUM:
      return stats.wordCount >= 35 && stats.wordCount <= 65;
    case Difficulty.HARD:
      return stats.wordCount >= 50 && stats.hasComplexPunctuation;
    case Difficulty.CODING:
      return text.length > 50 && (text.includes('{') || text.includes('=>'));
    default:
      return true;
  }
};

export const generatePracticeText = async (difficulty: Difficulty): Promise<string> => {
  const ai = getClient();
  const fallbackArray = FALLBACK_TEXTS[difficulty] || FALLBACK_TEXTS[Difficulty.EASY];
  const randomFallback = () => fallbackArray[Math.floor(Math.random() * fallbackArray.length)];

  if (!ai) return randomFallback();

  const pool = TOPIC_POOLS[difficulty] || TOPIC_POOLS[Difficulty.EASY];
  const topic = pool[Math.floor(Math.random() * pool.length)];
  const seed = Math.floor(Math.random() * 100000);

  let prompt = "";
  const constraints = `Ensure the text is UNIQUE, interesting, and uses fresh sentence structures. Avoid common phrases or repetitive opening words. Just provide raw text, no intro or quotes.`;

  switch (difficulty) {
    case Difficulty.EASY:
      prompt = `Generate 35 words of BEGINNER typing text about ${topic}. Use only common English words, simple sentences, and no numbers. ${constraints} Seed: ${seed}.`;
      break;
    case Difficulty.MEDIUM:
      prompt = `Generate 55 words of INTERMEDIATE typing text about ${topic}. Include natural dialogue or complex observations, commas, and periods. ${constraints} Seed: ${seed}.`;
      break;
    case Difficulty.HARD:
      prompt = `Generate 80 words of ADVANCED typing text about ${topic}. Use academic vocabulary, varied punctuation (including semicolons and dashes), and technical nuances. ${constraints} Seed: ${seed}.`;
      break;
    case Difficulty.CODING:
      prompt = `Generate a 10-line functional JavaScript snippet for ${topic}. Use modern ES6+ features. No markdown. Seed: ${seed}.`;
      break;
  }

  try {
    let attempts = 0;
    let finalResult = randomFallback();

    while (attempts < 2) {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const rawText = response.text;
      const text = typeof rawText === 'string' ? rawText.trim().replace(/^"|"$/g, '') : "";
      
      if (text && validateText(text, difficulty)) {
        finalResult = text;
        textCache.add(text);
        if (textCache.size > MAX_CACHE_SIZE) {
          const first = textCache.values().next().value;
          if (first) textCache.delete(first);
        }
        break;
      }
      attempts++;
    }
    
    return finalResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return randomFallback();
  }
};

/**
 * Bulk generation for Marathon mode to prevent multiple API calls.
 */
export const generateMarathonText = async (difficulty: Difficulty): Promise<string> => {
  const ai = getClient();
  const fallbackArray = FALLBACK_TEXTS[difficulty] || FALLBACK_TEXTS[Difficulty.EASY];
  const randomFallback = () => fallbackArray[Math.floor(Math.random() * fallbackArray.length)];

  if (!ai) return randomFallback() + " " + randomFallback() + " " + randomFallback();

  const pool = TOPIC_POOLS[difficulty] || TOPIC_POOLS[Difficulty.EASY];
  // Select 3 random topics for the marathon
  const topics = Array(3).fill(null).map(() => pool[Math.floor(Math.random() * pool.length)]).join(", ");
  
  const prompt = `Generate a 250-word typing challenge consisting of 4 distinct paragraphs about these topics: ${topics}. 
  The difficulty level is ${difficulty}. Ensure highly unique vocabulary and standard typing punctuation. 
  Just provide the raw text, no titles or paragraph breaks.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return (response.text || (randomFallback() + " " + randomFallback() + " " + randomFallback())).trim();
  } catch (error) {
    console.error("Marathon Gen Error:", error);
    return randomFallback() + " " + randomFallback() + " " + randomFallback();
  }
};

export const analyzePerformance = async (stats: GameResult): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Keep focusing on rhythm.|You're evolving quickly.";

  const prompt = `
    Role: Cyberpunk Typing Instructor.
    Stats: WPM: ${stats.wpm}, Accuracy: ${stats.accuracy}%, Errors: ${stats.errors}.
    Goal: Provide 1 short technical tip (max 8 words) and 1 hyper-hype compliment (max 6 words).
    Format: "TIP | HYPE" (separated by a pipe symbol).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return (response.text || "Maintain speed.|Reflexes optimized.").trim();
  } catch (error) {
    return "Fix those confusion pairs.|Apex precision detected.";
  }
};
