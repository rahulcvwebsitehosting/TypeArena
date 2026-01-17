
import { supabase, DbMatch } from './supabase';
import { MatchStats } from '../types';

export async function saveMatchHistory(userId: string, stats: MatchStats) {
  try {
    const { data, error } = await supabase
      .from('match_history')
      .insert({
        user_id: userId,
        mode: stats.mode,
        difficulty: stats.difficulty,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        created_at: stats.date
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving match history:', error);
    throw error;
  }
}

export async function getMatchHistory(userId: string, limit = 50): Promise<MatchStats[]> {
  try {
    const { data, error } = await supabase
      .from('match_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(m => ({
      id: m.id,
      date: m.created_at,
      wpm: m.wpm,
      accuracy: m.accuracy,
      mode: m.mode as any,
      difficulty: m.difficulty as any,
      errors: m.errors
    }));
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
}
