import { Rank } from './types';

export const RANKS_ORDERED = [
  Rank.BRONZE_I, Rank.BRONZE_II, Rank.BRONZE_III,
  Rank.SILVER_I, Rank.SILVER_II, Rank.SILVER_III,
  Rank.GOLD_I, Rank.GOLD_II, Rank.GOLD_III,
  Rank.PLATINUM_I, Rank.PLATINUM_II, Rank.PLATINUM_III,
  Rank.DIAMOND_I, Rank.DIAMOND_II, Rank.DIAMOND_III,
  Rank.HEROIC_I, Rank.HEROIC_II, Rank.HEROIC_III, Rank.HEROIC_IV,
  Rank.MASTER_I, Rank.MASTER_II, Rank.MASTER_III, Rank.MASTER_IV,
  Rank.GRANDMASTER_I, Rank.GRANDMASTER_II, Rank.GRANDMASTER_III, Rank.GRANDMASTER_IV, Rank.GRANDMASTER_V
];

export const XP_PER_RANK = 1000;

export const getRankFromXP = (xp: number): Rank => {
  const level = Math.floor(xp / XP_PER_RANK);
  if (level >= RANKS_ORDERED.length) return RANKS_ORDERED[RANKS_ORDERED.length - 1];
  return RANKS_ORDERED[level];
};

export const getNextRankXP = (xp: number): number => {
  const level = Math.floor(xp / XP_PER_RANK);
  return (level + 1) * XP_PER_RANK;
};

// Fallback texts if Gemini is unavailable
export const FALLBACK_TEXTS = {
  Easy: "The sun is shining bright today. Birds are singing in the trees. It is a good day to go for a walk in the park.",
  Medium: "However, the weather can change quickly; clouds might gather, and rain could fall, creating a cozy atmosphere indoors.",
  Hard: "Philosophy is the study of general and fundamental questions; it involves critical discussion, rational argument, and systematic presentation.",
  Coding: "const calculateSum = (a, b) => { return a + b; }; console.log(calculateSum(5, 10));"
};