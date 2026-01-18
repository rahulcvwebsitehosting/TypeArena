
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const initialized = useRef(false);

  // Profile loader with retry logic for database trigger consistency
  const loadUserProfile = async (userId: string, retries = 2) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        if (retries > 0) {
          console.warn(`Profile for ${userId} not found yet. Retrying... (${retries} left)`);
          await new Promise(res => setTimeout(res, 800)); // Faster retries
          return loadUserProfile(userId, retries - 1);
        }
        // If profile is genuinely missing after retries, don't hang.
        // This can happen if triggers fail or project is in a weird state.
        console.error("Profile not found in database. Please contact support or try re-registering.");
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
  };

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes (Login, Logout, Initial Session, Token Refresh)
    // Supabase fires this immediately with the current state on subscription.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // If we have a user, fetch their database profile
        await loadUserProfile(session.user.id);
      } else {
        // No session found, check for Guest Mode or just stop loading
        const isGuest = localStorage.getItem('typearena_is_guest') === 'true';
        if (isGuest) {
          guestLogin();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    // High-priority safety timeout: If app is stuck loading for more than 6 seconds, force show UI
    // Reduced from 10s to 6s for better UX on slow connections.
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth took too long. Forcing load completion.");
        setLoading(false);
      }
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signup = async (email: string, pass: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: { data: { username } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Registration failed.");
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
