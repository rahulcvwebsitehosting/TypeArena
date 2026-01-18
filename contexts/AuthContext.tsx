
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Rank, MatchStats, GameMode } from '../types';
import { getRankFromXP } from '../constants';
import { supabase, DbUser } from '../services/supabase';
import { getMatchHistory, saveMatchHistory } from '../services/matchService';

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
    let mounted = true;

    // We only need the listener, as it provides the initial session on subscribe
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // Only trigger loading if we don't have the user profile yet
        // or if it's a new sign in
        if (!user || user.id !== session.user.id) {
          setLoading(true);
          await loadUserProfile(session.user.id);
        }
      } else {
        // If no session, check for guest mode, otherwise stop loading
        const isGuest = localStorage.getItem('typearena_is_guest') === 'true';
        if (isGuest && !user) {
          guestLogin();
        } else if (!isGuest) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user?.id]);

  async function loadUserProfile(userId: string, retries = 3) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        if (retries > 0) {
          console.log(`Profile not found for ${userId}, retrying... (${retries} left)`);
          await new Promise(res => setTimeout(res, 1500));
          return loadUserProfile(userId, retries - 1);
        }
        console.warn("Profile not found after retries:", userId, error);
        setUser(null);
        setLoading(false);
        return;
      }

      const matches = await getMatchHistory(userId);
      const dbUser = data as DbUser;
      
      setUser({
        id: dbUser.id,
        username: dbUser.username || "Player",
        isGuest: false,
        xp: Number(dbUser.xp) || 0,
        rank: (dbUser.rank as Rank) || Rank.BRONZE_I,
        bestWpm: Number(dbUser.best_wpm) || 0,
        avgWpm: Number(dbUser.average_wpm) || 0,
        winStreak: Number(dbUser.win_streak) || 0,
        matches: matches
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setUser(null);
      setLoading(false);
    }
  }

  const login = async (email: string, pass: string) => {
    // We don't set global loading true here, we use local state in Login.tsx
    // The listener will pick up the session change and trigger the global loader
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      throw error;
    }
  };

  const signup = async (email: string, pass: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { username } }
    });

    if (error) {
      throw error;
    }
    if (!data.user) {
      throw new Error("Registration failed.");
    }
  };

  const guestLogin = () => {
    localStorage.setItem('typearena_is_guest', 'true');
    setUser({
      id: 'guest_' + Date.now(),
      username: 'Ghost_Typist',
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
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem('typearena_is_guest');
    setUser(null);
    setLoading(false);
  };

  const addMatch = async (stats: MatchStats, baseXp: number, isMultiplayerWin?: boolean) => {
    if (!user) return;

    let newStreak = user.winStreak || 0;
    let finalXp = baseXp;

    if (stats.mode === GameMode.MULTIPLAYER && typeof isMultiplayerWin !== 'undefined') {
        if (isMultiplayerWin) {
            newStreak += 1;
            if (newStreak > 1) {
                finalXp += Math.min(newStreak * 10, 100);
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
        await supabase.from('users').update({
          xp: newXp,
          rank: newRank,
          best_wpm: newBest,
          average_wpm: avg,
          win_streak: newStreak,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (err) {
        console.error("Supabase Update Error:", err);
      }
    }
  };

  const dismissLevelUp = () => setLevelUpEvent(null);

  return (
    <AuthContext.Provider value={{ user, loading, levelUpEvent, dismissLevelUp, login, signup, guestLogin, logout, addMatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
