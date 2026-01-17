
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Rank, MatchStats, GameMode } from '../types';
import { getRankFromXP } from '../constants';
import { supabase, DbUser } from '../services/supabase';
import { saveMatchHistory, getMatchHistory } from '../services/matchService';

interface LevelUpEvent {
  oldRank: Rank;
  newRank: Rank;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  levelUpEvent: LevelUpEvent | null;
  dismissLevelUp: () => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, username: string) => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;
  addMatch: (stats: MatchStats, baseXp: number, isMultiplayerWin?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        const isGuest = localStorage.getItem('typearena_is_guest') === 'true';
        if (isGuest) {
            guestLogin();
        } else {
            setLoading(false);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        if (localStorage.getItem('typearena_is_guest') !== 'true') {
            setUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
          console.warn("Profile not found for authenticated user:", userId, error);
          return;
      }

      const matches = await getMatchHistory(userId);
      const dbUser = data as DbUser;
      
      const safeUsername = typeof dbUser.username === 'string' ? dbUser.username : "Player";
      const safeRank = typeof dbUser.rank === 'string' ? dbUser.rank as Rank : Rank.BRONZE_I;

      setUser({
        id: dbUser.id,
        username: safeUsername,
        isGuest: false,
        xp: Number(dbUser.xp) || 0,
        rank: safeRank,
        bestWpm: Number(dbUser.best_wpm) || 0,
        avgWpm: Number(dbUser.average_wpm) || 0,
        winStreak: Number(dbUser.win_streak) || 0,
        matches: matches
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signup = async (email: string, pass: string, username: string) => {
    // 1. Create the Auth User with metadata.
    // The DB trigger uses raw_user_meta_data->>'username' to populate public.users.
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Registration failed: No user returned.");

    // 2. Loading Grace Period
    // Give the database trigger time to create the public.users record.
    await new Promise(res => setTimeout(res, 1000));
    
    // Refresh user state immediately if session was auto-started (standard for Supabase without email confirm)
    if (data.session || data.user) {
        await loadUserProfile(data.user.id);
    }
  };

  const guestLogin = () => {
    localStorage.setItem('typearena_is_guest', 'true');
    setUser({
      id: 'guest_' + Date.now(),
      username: 'Guest',
      isGuest: true,
      xp: 0,
      rank: Rank.BRONZE_I,
      matches: [],
      bestWpm: 0,
      avgWpm: 0,
      winStreak: 0
    });
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('typearena_is_guest');
    setUser(null);
  };

  const addMatch = async (stats: MatchStats, baseXp: number, isMultiplayerWin?: boolean) => {
    if (!user) return;

    let newStreak = user.winStreak || 0;
    let finalXp = baseXp;

    if (stats.mode === GameMode.MULTIPLAYER && typeof isMultiplayerWin !== 'undefined') {
        if (isMultiplayerWin) {
            newStreak += 1;
            if (newStreak > 1) {
                const streakBonus = Math.min(newStreak * 10, 100);
                finalXp += streakBonus;
            }
        } else {
            newStreak = 0;
        }
    }

    const currentRank = user.rank;
    const newXp = user.xp + finalXp;
    const newRank = getRankFromXP(newXp);
    
    if (newRank !== currentRank) {
        setLevelUpEvent({ oldRank: currentRank, newRank: newRank });
    }

    const newMatches = [stats, ...user.matches].slice(0, 50);
    const newBest = Math.max(user.bestWpm, stats.wpm);
    const totalWpm = newMatches.reduce((acc, m) => acc + m.wpm, 0);
    const avg = newMatches.length > 0 ? Math.round(totalWpm / newMatches.length) : 0;

    const updatedUser: User = {
      ...user,
      xp: newXp,
      rank: newRank,
      matches: newMatches,
      bestWpm: newBest,
      avgWpm: avg,
      winStreak: newStreak
    };

    setUser(updatedUser);

    if (!user.isGuest) {
        try {
            await saveMatchHistory(user.id, stats);
            // Column names updated to match public.users table (average_wpm)
            await supabase.from('users').update({
                xp: newXp,
                rank: newRank,
                best_wpm: newBest,
                average_wpm: avg,
                win_streak: newStreak,
                updated_at: new Date().toISOString()
            }).eq('id', user.id);
        } catch (err) {
            console.error("Supabase Sync Error:", err);
        }
    }
  };

  const dismissLevelUp = () => {
      setLevelUpEvent(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, levelUpEvent, dismissLevelUp, login, signup, guestLogin, logout, addMatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
