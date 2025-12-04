import { Rank, LevelProgress } from './types';

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

// Helper to determine XP needed for a specific rank tier
const getXPForRankIndex = (index: number): number => {
  // Bronze: 600 per level
  if (index < 3) return 600;
  // Silver: 800 per level
  if (index < 6) return 800;
  // Gold: 1000 per level
  if (index < 9) return 1000;
  // Platinum: 1200 per level
  if (index < 12) return 1200;
  // Diamond: 1500 per level
  if (index < 15) return 1500;
  // Heroic: 2000 per level
  if (index < 19) return 2000;
  // Master: 3000 per level
  if (index < 23) return 3000;
  // Grandmaster: 5000 per level
  return 5000;
};

// Calculate cumulative XP required to REACH a specific rank index
const getCumulativeXP = (targetIndex: number): number => {
  let total = 0;
  for (let i = 0; i < targetIndex; i++) {
    total += getXPForRankIndex(i);
  }
  return total;
};

// Finds the current rank based on total XP
export const getRankFromXP = (xp: number): Rank => {
  let currentXP = 0;
  for (let i = 0; i < RANKS_ORDERED.length; i++) {
    const xpNeeded = getXPForRankIndex(i);
    if (xp < currentXP + xpNeeded) {
      return RANKS_ORDERED[i];
    }
    currentXP += xpNeeded;
  }
  return RANKS_ORDERED[RANKS_ORDERED.length - 1];
};

// Returns total XP required to reach the NEXT rank
export const getNextRankXP = (xp: number): number => {
  let currentXP = 0;
  for (let i = 0; i < RANKS_ORDERED.length; i++) {
    const xpNeeded = getXPForRankIndex(i);
    if (xp < currentXP + xpNeeded) {
      return currentXP + xpNeeded;
    }
    currentXP += xpNeeded;
  }
  return currentXP; // Maxed out
};

// Returns detailed progress for UI bars
export const getLevelProgress = (xp: number): LevelProgress => {
  let accumulatedXP = 0;
  
  for (let i = 0; i < RANKS_ORDERED.length; i++) {
    const xpForThisLevel = getXPForRankIndex(i);
    
    // If current total XP is within this level's range
    if (xp < accumulatedXP + xpForThisLevel) {
      const currentRankXP = xp - accumulatedXP;
      return {
        currentRankXP,
        rankTotalXP: xpForThisLevel,
        percentage: (currentRankXP / xpForThisLevel) * 100
      };
    }
    
    accumulatedXP += xpForThisLevel;
  }
  
  // Max level
  return {
    currentRankXP: 1,
    rankTotalXP: 1,
    percentage: 100
  };
};

// Fallback texts
export const FALLBACK_TEXTS = {
  Easy: "The sun is shining bright today. Birds are singing in the trees. It is a good day to go for a walk in the park.",
  Medium: "However, the weather can change quickly; clouds might gather, and rain could fall, creating a cozy atmosphere indoors.",
  Hard: "Philosophy is the study of general and fundamental questions; it involves critical discussion, rational argument, and systematic presentation.",
  Coding: "const calculateSum = (a, b) => { return a + b; }; console.log(calculateSum(5, 10));"
};