import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Rank, MatchStats } from '../types';
import { getRankFromXP, RANKS_ORDERED } from '../constants';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
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
  addMatch: (stats: MatchStats, xpGained: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATS = {
  xp: 0,
  rank: Rank.BRONZE_I,
  matches: [],
  bestWpm: 0,
  avgWpm: 0
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

  // Sync with Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in via Firebase
        initializeUser(
            firebaseUser.uid, 
            firebaseUser.email || '', 
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
            false
        );
      } else {
        // User is signed out from Firebase. 
        // We only clear state if we aren't using a local mock session
        
        // Check if we have a persisted mock user in session
        const stored = localStorage.getItem('typearena_current_user_id');
        if (!stored) {
             setUser(null);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Universal User Loader (Works for Real Firebase, Mock, and Guest)
  const initializeUser = (uid: string, email: string, username: string, isGuest: boolean) => {
    const storageKey = `typearena_data_${uid}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      setUser(JSON.parse(storedData));
    } else {
      // Create new user entry
      const newUser: User = {
        id: uid,
        email: email,
        username: username,
        isGuest: isGuest,
        ...INITIAL_STATS
      };
      saveUserToStorage(newUser);
    }
    
    if (!isGuest) {
        localStorage.setItem('typearena_current_user_id', uid);
    } else {
        localStorage.setItem('typearena_is_guest', 'true');
    }
  };

  const saveUserToStorage = (u: User) => {
    setUser(u);
    // Persist data for both guests and real users locally for this demo
    localStorage.setItem(`typearena_data_${u.id}`, JSON.stringify(u));
  };

  const executeAuthAction = async (
      action: () => Promise<any>, 
      fallbackAction: () => void
  ) => {
    try {
        await action();
    } catch (error: any) {
        // Detect Invalid API Key or Config problems
        if (
            error.code === 'auth/api-key-not-valid' || 
            error.code === 'auth/configuration-not-found' ||
            error.code === 'auth/project-not-found' ||
            error.code === 'auth/internal-error'
        ) {
            console.warn(`Firebase Config Error (${error.code}). Switching to Local Mock Mode.`);
            fallbackAction();
        } else {
            // Real auth error
            throw error;
        }
    }
  };

  const login = async (email: string, pass: string) => {
    await executeAuthAction(
        () => signInWithEmailAndPassword(auth, email, pass),
        () => {
            // Mock Login: Deterministic ID based on email
            const mockId = 'mock_' + btoa(email).replace(/=/g, '');
            initializeUser(mockId, email, email.split('@')[0], false);
        }
    );
  };

  const signup = async (email: string, pass: string, username: string) => {
    await executeAuthAction(
        async () => {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            initializeUser(res.user.uid, email, username, false);
        },
        () => {
            // Mock Signup
            const mockId = 'mock_' + btoa(email).replace(/=/g, '');
            initializeUser(mockId, email, username, false);
        }
    );
  };

  const guestLogin = () => {
    const guestId = 'guest_' + Date.now();
    initializeUser(guestId, '', 'Guest', true);
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        console.warn("Firebase signout failed (expected if in mock mode)");
    }
    setUser(null);
    localStorage.removeItem('typearena_is_guest');
    localStorage.removeItem('typearena_current_user_id');
  };

  const addMatch = (stats: MatchStats, xpGained: number) => {
    if (!user) return;

    const currentRank = user.rank;
    const newXp = user.xp + xpGained;
    const newRank = getRankFromXP(newXp);
    
    // Check for Rank Up
    if (newRank !== currentRank) {
        setLevelUpEvent({ oldRank: currentRank, newRank: newRank });
    }

    const newMatches = [stats, ...user.matches].slice(0, 50); // Keep last 50
    const newBest = Math.max(user.bestWpm, stats.wpm);
    const totalWpm = newMatches.reduce((acc, m) => acc + m.wpm, 0);
    const avg = newMatches.length > 0 ? Math.round(totalWpm / newMatches.length) : 0;

    const updatedUser = {
      ...user,
      xp: newXp,
      rank: newRank,
      matches: newMatches,
      bestWpm: newBest,
      avgWpm: avg
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
