
import { GoogleGenAI } from "@google/genai";
import { Difficulty, GameResult } from "../types";
import { FALLBACK_TEXTS } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const TOPIC_POOLS: Record<string, string[]> = {
  [Difficulty.EASY]: [
    "daily activities", "food and cooking", "weather", "pets and animals",
    "family and friends", "hobbies", "travel destinations", "sports",
    "seasons", "colors and shapes", "basic emotions", "home and furniture"
  ],
  [Difficulty.MEDIUM]: [
    "technology trends", "environmental sustainability", "workplace productivity",
    "education systems", "health and wellness", "urban development",
    "cultural traditions", "economic principles", "scientific discoveries",
    "social media impact", "modern art movements", "global cuisine"
  ],
  [Difficulty.HARD]: [
    "quantum computing", "geopolitical tensions", "cryptocurrency regulation",
    "artificial intelligence ethics", "climate change mitigation strategies",
    "neuroscience research", "macroeconomic policy", "cybersecurity threats",
    "gene editing technologies", "space exploration initiatives",
    "philosophical epistemology", "advanced materials science"
  ],
  [Difficulty.CODING]: [
    "user authentication", "data fetching", "array manipulation",
    "async operations", "error handling", "API integration",
    "state management", "form validation", "sorting algorithms",
    "event listeners", "promise chains", "object destructuring"
  ]
};

// Simple in-memory cache to prevent immediate repetition
const textCache: Set<string> = new Set();
const MAX_CACHE_SIZE = 10;

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
      return stats.wordCount >= 20 && stats.wordCount <= 40 && !stats.hasSpecialChars;
    case Difficulty.MEDIUM:
      return stats.wordCount >= 35 && stats.wordCount <= 60;
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
  if (!ai) return FALLBACK_TEXTS[difficulty];

  const pool = TOPIC_POOLS[difficulty] || TOPIC_POOLS[Difficulty.EASY];
  const topic = pool[Math.floor(Math.random() * pool.length)];
  const seed = Math.floor(Math.random() * 10000);

  let prompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      prompt = `Generate typing practice text for BEGINNERS about ${topic}.
        - 30-40 words total.
        - Simple, common words (3-6 letters).
        - No complex punctuation, no numbers.
        - Just the raw text. Seed: ${seed}.`;
      break;
    case Difficulty.MEDIUM:
      prompt = `Generate typing practice text for INTERMEDIATE typists about ${topic}.
        - 45-60 words total.
        - Mix of common and moderately complex words.
        - Include commas, periods, and 1 semicolon or question mark.
        - Just the raw text. Seed: ${seed}.`;
      break;
    case Difficulty.HARD:
      prompt = `Generate typing practice text for ADVANCED typists about ${topic}.
        - 65-90 words total.
        - Complex vocabulary, sophisticated sentence structures.
        - Full punctuation variety (;, :, -, (), "").
        - Include some numbers or percentages.
        - Just the raw text. Seed: ${seed}.`;
      break;
    case Difficulty.CODING:
      prompt = `Generate a realistic JavaScript code snippet for typing practice related to ${topic}.
        - 5-10 lines of functional code.
        - Use modern syntax (const, let, async/await, arrow functions).
        - Include braces, brackets, and standard indentation.
        - No markdown backticks. Just raw code. Seed: ${seed}.`;
      break;
  }

  try {
    let attempts = 0;
    let finalResult = FALLBACK_TEXTS[difficulty];

    while (attempts < 2) {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const rawText = response.text;
      const generatedText = typeof rawText === 'string' ? rawText : "";
      const text = generatedText.trim().replace(/^"|"$/g, '');
      
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
    return FALLBACK_TEXTS[difficulty];
  }
};

export const analyzePerformance = async (stats: GameResult): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Focus on accuracy first.|You're a machine in the making!";

  const prompt = `
    Role: High-energy Cyberpunk Typing Coach.
    Stats: WPM: ${stats.wpm}, Accuracy: ${stats.accuracy}%, Errors: ${stats.errors}.
    Task: Provide 1 short tactical tip (max 10 words) and 1 hype compliment (max 8 words).
    Format: "TIP | HYPE" (separated by a pipe symbol).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const rawText = response.text;
    const text = typeof rawText === 'string' ? rawText : "";
    return (text || "Maintain rhythm.|Ready for next level.").trim();
  } catch (error) {
    return "Maintain a consistent rhythm.|Reflexes valid, Player!";
  }
};
