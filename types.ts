
export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  CODING = 'Coding'
}

export enum GameMode {
  SINGLE_PLAYER = 'Single Player',
  MULTIPLAYER = 'Multiplayer'
}

export enum Rank {
  BRONZE_I = 'Bronze I', BRONZE_II = 'Bronze II', BRONZE_III = 'Bronze III',
  SILVER_I = 'Silver I', SILVER_II = 'Silver II', SILVER_III = 'Silver III',
  GOLD_I = 'Gold I', GOLD_II = 'Gold II', GOLD_III = 'Gold III',
  PLATINUM_I = 'Platinum I', PLATINUM_II = 'Platinum II', PLATINUM_III = 'Platinum III',
  DIAMOND_I = 'Diamond I', DIAMOND_II = 'Diamond II', DIAMOND_III = 'Diamond III',
  HEROIC_I = 'Heroic I', HEROIC_II = 'Heroic II', HEROIC_III = 'Heroic III', HEROIC_IV = 'Heroic IV',
  MASTER_I = 'Master I', MASTER_II = 'Master II', MASTER_III = 'Master III', MASTER_IV = 'Master IV',
  GRANDMASTER_I = 'Grandmaster I', GRANDMASTER_II = 'Grandmaster II', GRANDMASTER_III = 'Grandmaster III', GRANDMASTER_IV = 'Grandmaster IV', GRANDMASTER_V = 'Grandmaster V'
}

export interface MatchStats {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  mode: GameMode;
  difficulty: Difficulty;
  errors: number;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  isGuest: boolean;
  xp: number;
  rank: Rank;
  matches: MatchStats[];
  bestWpm: number;
  avgWpm: number;
  winStreak: number;
}

export interface GameResult {
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
  totalChars: number;
  backspaces: number;
  rawWpm: number;
  wpmHistory: { time: number; wpm: number }[];
  confusionMap: Record<string, number>; // "e->r": 5
  characterStats: Record<string, number>; // Missed count per char
}

export interface Opponent {
  id: string;
  name: string;
  progress: number; // 0 to 100
  wpm: number;
  accuracy: number;
  color: string;
  isFinished: boolean;
}

export interface LevelProgress {
  currentRankXP: number; // XP accumulated in current rank
  rankTotalXP: number;   // XP needed to finish current rank
  percentage: number;    // 0-100
}
