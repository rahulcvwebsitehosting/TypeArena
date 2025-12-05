
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Rank, MatchStats, GameMode } from '../types';
import { getRankFromXP, RANKS_ORDERED } from '../constants';
import { auth, isMockMode } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';

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
  addMatch: (stats: MatchStats, baseXp: number, isMultiplayerWin?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATS = {
  xp: 0,
  rank: Rank.BRONZE_I,
  matches: [],
  bestWpm: 0,
  avgWpm: 0,
  winStreak: 0
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Sync with Firebase Auth State
  useEffect(() => {
    if (isMockMode) {
        // MOCK MODE: Skip Firebase Listener entirely
        console.log("Running in Auth Simulation Mode (Offline)");
        
        // Check for persisted mock session
        const storedUid = localStorage.getItem('typearena_current_user_id');
        const isGuest = localStorage.getItem('typearena_is_guest') === 'true';

        if (storedUid) {
            // Retrieve full user object
            const storageKey = `typearena_data_${storedUid}`;
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                setUser(JSON.parse(storedData));
            }
        } else if (isGuest) {
            // Guest session
            guestLogin();
        }
        
        setLoading(false);
        return;
    }

    // REAL MODE: Use Firebase Listener
    const unsubscribe = onAuthStateChanged(
        auth, 
        (firebaseUser) => {
            if (firebaseUser) {
                initializeUser(
                    firebaseUser.uid, 
                    firebaseUser.email || '', 
                    firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
                    false
                );
            } else {
                const stored = localStorage.getItem('typearena_current_user_id');
                if (!stored) setUser(null);
            }
            setLoading(false);
        },
        (error) => {
            console.warn("Firebase Auth Init Error:", error);
            setLoading(false);
        }
    );
    return unsubscribe;
  }, []);

  // Universal User Loader
  const initializeUser = (uid: string, email: string, username: string, isGuest: boolean) => {
    const storageKey = `typearena_data_${uid}`;
    const storedData = localStorage.getItem(storageKey);
    
    let activeUser: User;
    if (storedData) {
      activeUser = JSON.parse(storedData);
    } else {
      activeUser = {
        id: uid,
        email: email,
        username: username,
        isGuest: isGuest,
        ...INITIAL_STATS
      };
      // Explicitly save the new user stats immediately
      localStorage.setItem(`typearena_data_${uid}`, JSON.stringify(activeUser));
    }
    
    setUser(activeUser);
    
    if (!isGuest) {
        localStorage.setItem('typearena_current_user_id', uid);
    } else {
        localStorage.setItem('typearena_is_guest', 'true');
    }
  };

  const saveUserToStorage = (u: User) => {
    setUser(u);
    localStorage.setItem(`typearena_data_${u.id}`, JSON.stringify(u));
  };

  const login = async (email: string, pass: string) => {
    // Immediate handler for Mock Mode
    if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Fake network delay
        const mockId = 'mock_' + btoa(email).replace(/=/g, '');
        // Simulate finding existing user or creating new for demo
        initializeUser(mockId, email, email.split('@')[0], false);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
        console.warn("Firebase Login Error:", error.code);
        // Robust Fallback: If network/api error, degrade to mock mode seamlessly
        if (
          error.code === 'auth/api-key-not-valid' || 
          error.code === 'auth/operation-not-allowed' || 
          error.code === 'auth/internal-error' ||
          error.code === 'auth/network-request-failed'
        ) {
            console.warn("Falling back to local session due to configuration error.");
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockId = 'offline_' + btoa(email).replace(/=/g, '');
            initializeUser(mockId, email, email.split('@')[0], false);
            return;
        }
        throw error;
    }
  };

  const signup = async (email: string, pass: string, username: string) => {
    if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockId = 'mock_' + btoa(email).replace(/=/g, '');
        initializeUser(mockId, email, username, false);
        return;
    }

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        initializeUser(res.user.uid, email, username, false);
    } catch (error: any) {
        console.warn("Firebase Signup Error:", error.code);
        if (
          error.code === 'auth/api-key-not-valid' || 
          error.code === 'auth/operation-not-allowed' || 
          error.code === 'auth/internal-error' ||
          error.code === 'auth/network-request-failed'
        ) {
            console.warn("Falling back to local session due to configuration error.");
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockId = 'offline_' + btoa(email).replace(/=/g, '');
            initializeUser(mockId, email, username, false);
            return;
        }
        throw error;
    }
  };

  const guestLogin = () => {
    const guestId = 'guest_' + Date.now();
    initializeUser(guestId, '', 'Guest', true);
  };

  const logout = async () => {
    if (!isMockMode) {
        try { await signOut(auth); } catch (e) { console.warn(e); }
    }
    setUser(null);
    localStorage.removeItem('typearena_is_guest');
    localStorage.removeItem('typearena_current_user_id');
  };

  const addMatch = (stats: MatchStats, baseXp: number, isMultiplayerWin?: boolean) => {
    if (!user) return;

    let newStreak = user.winStreak || 0;
    let finalXp = baseXp;

    if (stats.mode === GameMode.MULTIPLAYER && typeof isMultiplayerWin !== 'undefined') {
        if (isMultiplayerWin) {
            newStreak += 1;
            // Only award bonus if streak is greater than 1
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

    const updatedUser = {
      ...user,
      xp: newXp,
      rank: newRank,
      matches: newMatches,
      bestWpm: newBest,
      avgWpm: avg,
      winStreak: newStreak
    };

    saveUserToStorage(updatedUser);
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
