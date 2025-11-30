import { GoogleGenAI } from "@google/genai";
import { Difficulty, GameResult } from "../types";
import { FALLBACK_TEXTS } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generatePracticeText = async (difficulty: Difficulty): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    console.warn("No API Key found, using fallback text.");
    return FALLBACK_TEXTS[difficulty];
  }

  let prompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      prompt = "Generate a simple paragraph of exactly 30 words for a typing test. Use only simple words, no complex punctuation. Just the text.";
      break;
    case Difficulty.MEDIUM:
      prompt = "Generate a paragraph of exactly 40 words for a typing test. Include commas and periods. Just the text.";
      break;
    case Difficulty.HARD:
      prompt = "Generate a complex paragraph of exactly 50 words for a typing test. Include semicolons, hyphens, and advanced vocabulary. Just the text.";
      break;
    case Difficulty.CODING:
      prompt = "Generate a valid JavaScript code snippet of about 8 lines for a typing test. Include function definitions, loops, or conditionals. Do not use markdown backticks. Just the raw code.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_TEXTS[difficulty];
  }
};

export const analyzePerformance = async (stats: GameResult): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Great job! Keep practicing to improve speed and accuracy.";

  const prompt = `
    Analyze these typing stats:
    WPM: ${stats.wpm}
    Accuracy: ${stats.accuracy}%
    Errors: ${stats.errors}
    Missed Characters: ${JSON.stringify(stats.characterStats)}

    Provide 2 brief, specific actionable tips for improvement in one or two sentences. Add a motivating short phrase at the end.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    return "Focus on accuracy before speed. You're doing great!";
  }
};