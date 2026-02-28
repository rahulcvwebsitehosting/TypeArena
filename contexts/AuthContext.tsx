
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
  const lastSyncId = useRef<string | null>(null);

  // Helper to extract the best possible username from session metadata
  const getBestUsername = (session: any) => {
    const meta = session?.user?.user_metadata;
    const email = session?.user?.email;
    
    return meta?.username || 
           meta?.display_name || 
           meta?.full_name || 
           email?.split('@')[0] || 
           "Player";
  };

  // Unified user synchronization logic
  const syncUser = async (session: any) => {
    if (!session?.user) {
      const isGuest = localStorage.getItem('typearena_is_guest') === 'true';
      if (isGuest) {
        // Only set guest if not already set or if id changed
        if (!user || !user.isGuest) {
          guestLogin();
        }
      } else {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    const userId = session.user.id;
    
    // Prevent redundant syncs for the same user session
    if (lastSyncId.current === userId && user && !user.isGuest) {
      setLoading(false);
      return;
    }
    
    lastSyncId.current = userId;
    if (!user) setLoading(true);

    try {
      const metadataUsername = getBestUsername(session);
      console.log(`[Auth] Syncing user: ${userId}, Metadata Name: ${metadataUsername}`);
      
      // 1. Immediate Fallback: Set basic user info from Auth metadata first
      const initialUser: User = {
        id: userId,
        username: metadataUsername,
        isGuest: false,
        xp: 0,
        rank: Rank.BRONZE_I,
        bestWpm: 0,
        avgWpm: 0,
        winStreak: 0,
        matches: []
      };

      // 2. Fetch DB Profile & Matches
      const [profileRes, matches] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        getMatchHistory(userId).catch(() => [])
      ]);

      let profileData = profileRes.data;

      // 3. Legacy Fallback
      if (!profileData) {
        const legacyRes = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
        if (legacyRes.data) profileData = legacyRes.data;
      }

      // 4. Final State Update
      if (profileData) {
        // Use DB name if it's not 'Player', otherwise use metadata
        const dbUsername = (profileData.username && profileData.username !== 'Player') 
          ? profileData.username 
          : metadataUsername;

        console.log(`[Auth] DB Profile found. Name: ${profileData.username}, Using: ${dbUsername}`);

        setUser({
          id: profileData.id,
          username: dbUsername,
          isGuest: false,
          xp: Number(profileData.xp) || 0,
          rank: (profileData.rank as Rank) || Rank.BRONZE_I,
          bestWpm: Number(profileData.best_wpm) || 0,
          avgWpm: Number(profileData.average_wpm) || 0,
          winStreak: Number(profileData.win_streak) || 0,
          matches: matches || []
        });

        // If DB has 'Player' but metadata has a real name, update DB in background
        if ((!profileData.username || profileData.username === 'Player') && metadataUsername !== 'Player') {
          console.log(`[Auth] Updating DB username to: ${metadataUsername}`);
          supabase.from('profiles').update({ username: metadataUsername }).eq('id', userId).then();
        }
      } else {
        console.log(`[Auth] No DB profile found. Using metadata name: ${metadataUsername}`);
        setUser(initialUser);
        
        // Create the profile record in background
        supabase.from('profiles').upsert({
          id: userId,
          username: metadataUsername,
          xp: 0,
          rank: Rank.BRONZE_I,
          updated_at: new Date().toISOString()
        }).then(({ error }) => {
          if (error) console.error("[Auth] Background profile creation failed:", error);
        });
      }
    } catch (err) {
      console.error('[Auth] Sync error:', err);
      const fallbackName = getBestUsername(session);
      setUser({
        id: userId,
        username: fallbackName,
        isGuest: false,
        xp: 0,
        rank: Rank.BRONZE_I,
        bestWpm: 0,
        avgWpm: 0,
        winStreak: 0,
        matches: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) syncUser(session);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log(`[Auth] Event: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        syncUser(session);
      } else if (event === 'SIGNED_OUT') {
        lastSyncId.current = null;
        setUser(null);
        setLoading(false);
        localStorage.removeItem('typearena_is_guest');
      }
    });

    // 3. Safety Timeout
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
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

    // Create the user record in the 'profiles' table immediately to avoid retries in loadUserProfile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username: username,
        xp: 0,
        rank: Rank.BRONZE_I,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error("Error creating profile record:", profileError);
      // We don't throw here because the auth account was created successfully.
      // loadUserProfile will retry and eventually find it if a trigger exists, 
      // or the fallback creation will handle it.
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
        await supabase.from('profiles').update({
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
