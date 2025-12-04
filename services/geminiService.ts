import { GoogleGenAI } from "@google/genai";
import { Difficulty, GameResult } from "../types";
import { FALLBACK_TEXTS } from "../constants";

const getClient = () => {
  let apiKey = undefined;
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // process not defined, ignore
  }

  // Fallback for Vite environment
  if (!apiKey) {
      try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
            // @ts-ignore
            apiKey = import.meta.env.VITE_API_KEY;
        }
      } catch(e) {}
  }

  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generatePracticeText = async (difficulty: Difficulty): Promise<string> => {
  const ai = getClient();
  // Generate a random seed to prevent caching and repetitive responses
  const seed = Math.floor(Math.random() * 10000); 

  if (!ai) {
    console.warn("No API Key found, using fallback text.");
    return FALLBACK_TEXTS[difficulty];
  }

  let prompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      prompt = `Generate a completely unique and random simple paragraph of exactly 30 words for a typing test. Seed: ${seed}. Use simple words, no complex punctuation. Just the text.`;
      break;
    case Difficulty.MEDIUM:
      prompt = `Generate a completely unique and random paragraph of exactly 40 words for a typing test. Seed: ${seed}. You MUST include at least 2 commas and 1 period. Make the topic random (nature, tech, history, food). Just the text.`;
      break;
    case Difficulty.HARD:
      prompt = `Generate a complex and unique paragraph of exactly 50 words for a typing test. Seed: ${seed}. You MUST include varied punctuation: semicolons (;), commas (,), and maybe a hyphen (-). Make the sentence structure sophisticated. Just the text.`;
      break;
    case Difficulty.CODING:
      prompt = `Generate a unique valid JavaScript code snippet of about 8 lines for a typing test. Seed: ${seed}. Include function definitions, loops, or conditionals. Do not use markdown backticks. Just the raw code.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text.trim();
    // Basic validation to ensure we didn't get a "Here is the text" prefix
    if (text.includes(":")) {
        return text.split(":").pop()?.trim() || text;
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_TEXTS[difficulty];
  }
};

export const analyzePerformance = async (stats: GameResult): Promise<string> => {
  const ai = getClient();
  // Fallback text must match the new split format
  if (!ai) return "Focus on accuracy first.|You're a machine in the making!";

  const prompt = `
    Role: High-energy Cyberpunk Typing Coach.
    Stats: WPM: ${stats.wpm}, Accuracy: ${stats.accuracy}%, Errors: ${stats.errors}.
    Task: Provide 1 short tactical tip (max 10 words) and 1 hype compliment (max 8 words).
    Format: "TIP | HYPE" (separated by a pipe symbol).
    Example: Keep your rhythm steady.|Absolute godlike speed!
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    return "Maintain a consistent rhythm.|Reflexes valid, Player!";
  }
};
