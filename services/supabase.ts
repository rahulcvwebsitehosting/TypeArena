
import { createClient } from '@supabase/supabase-js';

// Using provided credentials
const supabaseUrl = 'https://xpiwanmfbtqtqjugswuq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaXdhbm1mYnRxdHFqdWdzd3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDI1NjMsImV4cCI6MjA4NDIxODU2M30.eCGBlAyXdffW0KzkKF1LAidhokGshxvg-JWVuyUIkAM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbUser {
  id: string;
  username: string;
  created_at: string;
  updated_at: string;
  xp: number;
  rank: string;
  level: number;
  best_wpm: number;
  average_wpm: number; // Corrected from avg_wpm
  total_matches: number;
  wins: number;
  losses: number;
  win_streak: number;
  character_stats: Record<string, any>;
  last_login?: string;
}

export interface DbMatch {
  id: string;
  user_id: string;
  created_at: string;
  mode: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  errors: number;
  xp_earned?: number;
  result?: string;
  text_used?: string;
  time_taken?: number;
  mistakes?: number;
}
