
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameResult, Difficulty, Opponent, Rank } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Users, Check, Copy, Zap, Flag, Flame, ArrowLeft, ArrowRight, RefreshCw, Lock, Globe, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Confetti from '../components/Confetti';

const BOT_NAMES = ['Speedster_99', 'CodeNinja', 'TypeMaster_X', 'KeyboardWarrior', 'FingerSlippage', 'Glitch_Runner', 'Neon_Viper', 'Cyber_Wraith'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  wpm: number;
  accuracy: number;
  isUser: boolean;
}

type LobbyMode = 'SELECT' | 'HOSTING' | 'JOINED' | 'SEARCHING';

const Multiplayer: React.FC = () => {
  const { addMatch, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>('SELECT');
  const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'COUNTDOWN' | 'RACING' | 'FINISHED'>('IDLE');
  const [text, setText] = useState('');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<GameResult | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const [placement, setPlacement] = useState(0);
  const [loadingText, setLoadingText] = useState("Finding opponents...");
  const [streakBonus, setStreakBonus] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  // Lobby / Sharing State
  const [lobbyId, setLobbyId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostWpm, setHostWpm] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isPrivateMatch, setIsPrivateMatch] = useState(false);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDifficultyByRank = (rank: Rank | undefined): Difficulty => {
    if (!rank) return Difficulty.EASY;
    const r = rank.toString();
    if (r.includes('Bronze') || r.includes('Silver') || r.includes('Gold')) return Difficulty.EASY;
    if (r.includes('Platinum') || r.includes('Diamond')) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  };

  useEffect(() => {
    const lobbyParam = searchParams.get('lobby');
    const hostParam = searchParams.get('host');
    const wpmParam = searchParams.get('wpm');
    const modeParam = searchParams.get('mode');

    if (lobbyParam) {
        // Joining a friend's lobby
        setLobbyId(lobbyParam);
        setIsPrivateMatch(true);
        
        if (hostParam) {
            setLobbyMode('JOINED'); // Differentiate guest state
            setHostName(decodeURIComponent(hostParam));
            setHostWpm(wpmParam ? parseInt(wpmParam) : 40);
            setLoadingText(`Syncing with ${decodeURIComponent(hostParam)}...`);
        } else {
            setLobbyMode('HOSTING'); // Fallback if no host info
            setLoadingText("Joined Party");
        }
    } else if (modeParam === 'host') {
        // Creating a new lobby directly
        handleCreateLobby();
    }
    
    return () => {
        if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateLobby = () => {
      const newId = Math.random().toString(36).substring(7).toUpperCase();
      setLobbyId(newId);
      setIsPrivateMatch(true);
      setLobbyMode('HOSTING');
  };

  const handleStartRanked = () => {
      setIsPrivateMatch(false);
      setLobbyMode('SEARCHING');
      setLobbyId(Math.random().toString(36).substring(7).toUpperCase()); // Fake ID for ranked
      startMatchmaking(false);
  };

  const startPrivateMatch = () => {
      setLobbyMode('SEARCHING');
      startMatchmaking(true);
  };

  const startMatchmaking = async (isPrivate: boolean) => {
    setStatus('SEARCHING');
    setResult(null);
    setPlayerWon(false);
    setPlacement(0);
    setStreakBonus(0);
    setLeaderboard([]);
    
    // Customize loading text based on mode
    if (isPrivate) {
        setLoadingText(hostName ? `Connecting to ${hostName}...` : "Initializing Duel...");
    } else {
        setLoadingText("Finding opponents...");
    }
    
    const difficulty = getDifficultyByRank(user?.rank);

    const [generatedText] = await Promise.all([
        generatePracticeText(difficulty), 
        new Promise(resolve => setTimeout(resolve, 2000))
    ]);

    setLoadingText(isPrivate ? "Ready!" : "Found match!");
    setText(generatedText);
    
    // Create Bots 
    const newOpponents: Opponent[] = [];

    // Bot difficulty logic
    const r = user?.rank || Rank.BRONZE_I;
    let minWpm = 15;
    let maxVar = 15;
    let minAcc = 85;
    let maxAcc = 95;

    if (r.includes('Bronze')) { 
        minWpm = 15; maxVar = 15;
        minAcc = 85; maxAcc = 94;
    } else if (r.includes('Silver')) { 
        minWpm = 30; maxVar = 25;
        minAcc = 88; maxAcc = 96;
    } else if (r.includes('Gold')) { 
        minWpm = 55; maxVar = 25;
        minAcc = 92; maxAcc = 98;
    } else if (r.includes('Platinum')) { 
        minWpm = 80; maxVar = 30;
        minAcc = 94; maxAcc = 99;
    } else if (r.includes('Diamond')) { 
        minWpm = 100; maxVar = 30;
        minAcc = 96; maxAcc = 100;
    } else if (r.includes('Heroic')) {
         minWpm = 110; maxVar = 40;
         minAcc = 97; maxAcc = 100;
    } else { 
        minWpm = 130; maxVar = 50;
        minAcc = 98; maxAcc = 100;
    }

    // In private match, we spawn ONE opponent.
    const numBots = isPrivate ? 1 : Math.floor(Math.random() * 2) + 1; 

    for (let i = 0; i < numBots; i++) {
        let botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        let botWpm = Math.max(10, Math.floor(Math.random() * maxVar) + minWpm);
        let botAcc = Math.floor(Math.random() * (maxAcc - minAcc + 1)) + minAcc;

        if (isPrivate) {
            // STRICT MODE: NO RANDOMNESS IN PRIVATE MATCHES
            if (hostName) {
                // We are GUEST: Race against HOST (Ghost)
                botName = hostName;
                // STRICTLY use Host's WPM, no randomization
                botWpm = hostWpm > 0 ? hostWpm : 40;
                botAcc = 96; // High accuracy for ghost
            } else {
                // We are HOST: Race against CHALLENGER
                botName = "Challenger";
                // STRICTLY match User's Avg WPM
                botWpm = user?.avgWpm && user.avgWpm > 0 ? user.avgWpm : 40;
                botAcc = 94;
            }
        }
        
        newOpponents.push({
            id: `bot-${i}`,
            name: botName,
            progress: 0,
            wpm: botWpm,
            accuracy: botAcc,
            color: COLORS[i % COLORS.length],
            isFinished: false
        });
    }
    setOpponents(newOpponents);
    setStatus('COUNTDOWN');
  };

  useEffect(() => {
    if (status === 'COUNTDOWN') {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setStatus('RACING');
            startBotRace();
        }
    } else if (status === 'SEARCHING') {
        setCountdown(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, countdown]);

  const startBotRace = () => {
      const startTime = Date.now();
      const textLength = text.length;

      // Update frequency set to 50ms for smooth 20fps animation
      raceIntervalRef.current = setInterval(() => {
          setOpponents(prev => {
              const now = Date.now();
              const elapsedMin = (now - startTime) / 60000;
              
              const updated = prev.map(bot => {
                  if (bot.isFinished) return bot;
                  // Use strict WPM for calculations
                  const expectedChars = bot.wpm * 5 * elapsedMin;
                  const progress = Math.min(100, (expectedChars / textLength) * 100);
                  
                  return {
                      ...bot,
                      progress,
                      isFinished: progress >= 100
                  };
              });

              return updated;
          });
      }, 50);
  };

  const handleFinish = (res: GameResult) => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
      
      // Construct Leaderboard
      const allParticipants = [
          { id: 'user', name: user?.username || 'You', wpm: res.wpm, accuracy: res.accuracy, isUser: true },
          ...opponents.map(bot => ({ id: bot.id, name: bot.name, wpm: bot.wpm, accuracy: bot.accuracy, isUser: false }))
      ];

      // Sort by WPM Descending
      allParticipants.sort((a, b) => b.wpm - a.wpm);

      // Assign Ranks
      const rankedResults: LeaderboardEntry[] = allParticipants.map((p, index) => ({
          ...p,
          rank: index + 1
      }));

      setLeaderboard(rankedResults);

      // Determine User Rank
      const userRank = rankedResults.find(p => p.isUser)?.rank || rankedResults.length;
      const isWin = userRank === 1;

      setPlacement(userRank);
      setPlayerWon(isWin);
      setStatus('FINISHED');
      setResult(res);

      // XP Rewards
      let baseXp = 100;
      if (userRank === 1) baseXp = 200;
      if (userRank === 2) baseXp = 150;

      // Calculate streak bonus for display only
      if (isWin) {
          const nextStreak = (user?.winStreak || 0) + 1;
          if (nextStreak > 1) {
            const bonus = Math.min(nextStreak * 10, 100);
            setStreakBonus(bonus);
          } else {
            setStreakBonus(0);
          }
      } else {
          setStreakBonus(0);
      }

      addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.MULTIPLAYER,
        difficulty: getDifficultyByRank(user?.rank),
        errors: res.errors
      }, baseXp, isWin); 
  };

  const copyInviteLink = () => {
      // Ensure we get the full base URL including protocol and domain
      const baseUrl = window.location.origin + window.location.pathname;
      const userName = encodeURIComponent(user?.username || 'Player');
      const wpm = user?.avgWpm || 40;
      // Construct hash-router friendly URL
      const url = `${baseUrl}#/multiplayer?lobby=${lobbyId}&host=${userName}&wpm=${wpm}`;
      
      navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
          // Fallback for some mobile browsers
          console.error('Failed to copy: ', err);
          prompt("Copy this link:", url);
      });
  };

  const handlePlayAgain = () => {
      if (isPrivateMatch) {
          // If guest, go back to joined state, if host go back to hosting
          setLobbyMode(hostName ? 'JOINED' : 'HOSTING');
          setStatus('IDLE');
      } else {
          handleStartRanked();
      }
  };

  // MODE SELECTION SCREEN
  if (lobbyMode === 'SELECT' && status === 'IDLE') {
      return (
          <div className="max-w-4xl mx-auto py-12 animate-fade-in">
              <h2 className="text-4xl font-black text-center text-slate-800 dark:text-white mb-12">SELECT GAME MODE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ranked */}
                  <div 
                    onClick={handleStartRanked}
                    className="group cursor-pointer relative p-8 glass-panel rounded-3xl hover:-translate-y-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-slate-200 dark:border-white/10 hover:border-neon-cyan/50"
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="flex items-center justify-center w-16 h-16 bg-neon-cyan/10 rounded-2xl mb-6 text-neon-cyan group-hover:scale-110 transition-transform">
                          <Globe size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">RANKED MATCH</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">Compete against global players. Climb the leaderboard and earn Rank XP.</p>
                      <span className="inline-flex items-center gap-2 text-neon-cyan font-bold text-sm tracking-wider uppercase group-hover:gap-3 transition-all">
                          Find Match <ArrowRight size={16} />
                      </span>
                  </div>

                  {/* Private Lobby */}
                  <div 
                    onClick={handleCreateLobby}
                    className="group cursor-pointer relative p-8 glass-panel rounded-3xl hover:-translate-y-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 border border-slate-200 dark:border-white/10 hover:border-neon-purple/50"
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                      <div className="flex items-center justify-center w-16 h-16 bg-neon-purple/10 rounded-2xl mb-6 text-neon-purple group-hover:scale-110 transition-transform">
                          <Lock size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">RACE A FRIEND</h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">Create a private lobby. Share the link and duel your friends directly.</p>
                      <span className="inline-flex items-center gap-2 text-neon-purple font-bold text-sm tracking-wider uppercase group-hover:gap-3 transition-all">
                          Create Lobby <ArrowRight size={16} />
                      </span>
                  </div>
              </div>
          </div>
      );
  }

  // GUEST JOINED SCREEN
  if (lobbyMode === 'JOINED' && status === 'IDLE') {
    return (
        <div className="max-w-2xl mx-auto py-12 animate-fade-in text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-neon-green/10 rounded-full mb-6 relative">
                 <div className="absolute inset-0 border-4 border-neon-green/30 rounded-full animate-ping opacity-50"></div>
                 <Check size={32} className="text-neon-green" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">LOBBY JOINED</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">
                You are challenging <span className="text-neon-purple font-bold">{hostName}</span>!
            </p>

            <div className="glass-panel p-6 rounded-2xl max-w-sm mx-auto mb-8 border border-neon-purple/20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                        <User className="text-slate-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-slate-800 dark:text-white">{hostName}</p>
                        <p className="text-xs text-slate-500 font-mono">HOST // AVG {hostWpm} WPM</p>
                    </div>
                </div>
                <div className="h-px bg-slate-200 dark:bg-white/10 my-4"></div>
                <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30">
                        <User className="text-neon-cyan" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-slate-800 dark:text-white">{user?.username || 'You'}</p>
                        <p className="text-xs text-neon-cyan font-mono">CHALLENGER</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={startPrivateMatch}
                  className="w-full py-4 bg-neon-green hover:bg-neon-green/90 text-white font-black rounded-xl shadow-lg shadow-neon-green/20 transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                    <Zap size={20} className="fill-white" /> START DUEL
                </button>
                <button 
                  onClick={() => {
                      setLobbyMode('SELECT');
                      setIsPrivateMatch(false);
                      setHostName('');
                  }}
                  className="w-full py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold transition-colors"
                >
                    Leave Lobby
                </button>
            </div>
        </div>
    );
}

  // HOST WAITING SCREEN
  if (lobbyMode === 'HOSTING' && status === 'IDLE') {
      const inviteUrl = `${window.location.origin}${window.location.pathname}#/multiplayer?lobby=${lobbyId}&host=${encodeURIComponent(user?.username || 'Player')}&wpm=${user?.avgWpm || 40}`;
      
      return (
          <div className="max-w-2xl mx-auto py-12 animate-fade-in text-center px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-neon-purple/10 rounded-full mb-6 relative">
                   <div className="absolute inset-0 border-4 border-neon-purple/30 rounded-full animate-ping opacity-50"></div>
                   <Users size={32} className="text-neon-purple" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2">LOBBY CREATED</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Share this link. The match will start when <strong>YOU</strong> press start.
              </p>

              <div className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl flex items-center gap-2 mb-8 border border-slate-200 dark:border-white/10 max-w-lg mx-auto">
                  <div className="flex-1 px-4 font-mono text-xs md:text-sm text-slate-600 dark:text-slate-300 break-all text-left">
                      {inviteUrl}
                  </div>
                  <button 
                    onClick={copyInviteLink}
                    className="p-3 bg-white dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-black/40 rounded-lg text-neon-purple font-bold transition-colors shrink-0"
                  >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
              </div>

              {/* Waiting Animation */}
              <div className="mb-8 flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                      <span className="w-2 h-2 bg-neon-purple rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-neon-purple rounded-full animate-bounce delay-200"></span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Waiting for challenger...</p>
              </div>

              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  <button 
                    onClick={startPrivateMatch}
                    className="w-full py-4 bg-neon-purple hover:bg-neon-purple/90 text-white font-black rounded-xl shadow-lg shadow-neon-purple/20 transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                  >
                      START DUEL NOW
                  </button>
                  <p className="text-[10px] text-slate-400">Click start when your friend has joined</p>
                  <button 
                    onClick={() => {
                        setLobbyMode('SELECT');
                        setIsPrivateMatch(false);
                    }}
                    className="w-full py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold transition-colors"
                  >
                      Cancel
                  </button>
              </div>
          </div>
      );
  }

  // SEARCHING SCREEN
  if (status === 'SEARCHING') {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-fade-in relative px-4">
              {/* Spinning Ring */}
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full"></div>
                <div className="w-24 h-24 border-4 border-slate-200 dark:border-white/5 border-t-neon-cyan rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-800 dark:text-white" size={32} />
                </div>
              </div>
              
              <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{loadingText}</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                     {isPrivateMatch ? 'Syncing lobby settings...' : <span>Calibrating opponents for <span className="text-neon-purple font-bold border-b border-neon-purple/50">{user?.rank}</span> league.</span>}
                  </p>
              </div>
          </div>
      );
  }

  // RACING & RESULTS
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 dark:border-white/5 pb-6 gap-4">
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Zap className="text-neon-cyan fill-neon-cyan" /> {isPrivateMatch ? 'PRIVATE // DUEL' : 'MULTIPLAYER // RANKED'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                            ID: <span className="text-slate-800 dark:text-white font-bold">{lobbyId}</span>
                        </span>
                    </div>
                     <button 
                        onClick={copyInviteLink}
                        className="flex items-center gap-2 px-3 py-1 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple rounded-full text-xs font-bold transition-colors uppercase"
                    >
                         {copied ? <Check size={12} /> : <Copy size={12} />} INVITE
                    </button>
                </div>
            </div>
            {status === 'COUNTDOWN' && (
                <div className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-400 dark:from-white dark:to-slate-500 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                    {countdown > 0 ? countdown : 'GO'}
                </div>
            )}
        </div>

        <TypingEngine 
            text={text}
            isGameActive={status === 'RACING'}
            onGameFinish={handleFinish}
            opponents={opponents}
        />

        {status === 'FINISHED' && result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 animate-fade-in">
                {playerWon && <Confetti />}
                
                <div className={`
                    bg-white dark:bg-abyss border p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden transition-all duration-500 flex flex-col md:flex-row gap-6 transform scale-100 opacity-100 animate-pop-in
                    ${playerWon 
                        ? 'border-yellow-400/50 shadow-[0_0_50px_rgba(251,191,36,0.2)]' 
                        : 'border-slate-200 dark:border-white/10'
                    }
                `}>
                    {/* Background effects */}
                    {playerWon ? (
                         <>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[80px] rounded-full animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-purple/10 blur-[80px] rounded-full"></div>
                         </>
                    ) : (
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-slate-400/5 blur-[100px] rounded-full"></div>
                    )}
                    
                    {/* Left Column: Leaderboard */}
                    <div className="flex-1 relative z-10 flex flex-col">
                        <div className="mb-6 text-center">
                            {playerWon ? (
                                <h2 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-text-shine bg-[length:200%_auto] drop-shadow-sm mb-2">
                                    VICTORY!
                                </h2>
                            ) : (
                                <h2 className="text-4xl font-black italic text-slate-700 dark:text-slate-300 tracking-tighter mb-2">
                                    {placement === 2 ? '2ND PLACE' : placement === 3 ? '3RD PLACE' : 'RACE COMPLETE'}
                                </h2>
                            )}
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                <Flag size={14} className={playerWon ? "text-yellow-500" : "text-slate-400"} />
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                                    Final Standings
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-4 flex-1">
                             {leaderboard.map((entry, idx) => (
                                 <div 
                                    key={entry.id} 
                                    className={`flex items-center justify-between p-3 rounded-xl border opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] ${
                                        entry.isUser 
                                        ? 'bg-neon-cyan/10 border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                        : 'bg-slate-50 dark:bg-white/5 border-transparent'
                                    }`}
                                    style={{ animationDelay: `${idx * 0.15}s` }}
                                 >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shadow-sm
                                            ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black' : 
                                              entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' : 
                                              entry.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}
                                        `}>
                                            {entry.rank}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold leading-none ${entry.isUser ? 'text-neon-cyan' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {entry.name} {entry.isUser && '(You)'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-slate-800 dark:text-white text-lg leading-none">{entry.wpm}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WPM</div>
                                    </div>
                                 </div>
                             ))}
                        </div>
                    </div>

                    {/* Right Column: Rewards & Actions */}
                    <div className="w-full md:w-64 flex flex-col relative z-10 border-l border-slate-200 dark:border-white/5 md:pl-6">
                        <div className="mb-auto">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Match Rewards</h3>
                            <div className={`p-5 rounded-2xl border mb-3 text-center transition-transform duration-500 hover:scale-105 group ${playerWon ? 'bg-yellow-400/10 border-yellow-400/30' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'}`}>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1 group-hover:text-yellow-500 transition-colors">XP Earned</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Zap size={24} className={`${playerWon ? 'text-yellow-500 fill-yellow-500 animate-pulse' : 'text-slate-400'}`} />
                                    <p className={`text-5xl font-black ${playerWon ? 'text-yellow-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                        +{placement === 1 ? 200 : placement === 2 ? 150 : 100}
                                    </p>
                                </div>
                            </div>

                            {playerWon && streakBonus > 0 && (
                                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center gap-2 text-orange-500 font-bold text-sm animate-[pulse_2s_infinite]">
                                    <Flame size={16} className="fill-orange-500" />
                                    +{streakBonus} Streak Bonus
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mt-6">
                            <button 
                                onClick={handlePlayAgain}
                                className={`w-full py-4 font-black rounded-xl transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg tracking-wide uppercase
                                    ${playerWon 
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:brightness-110 shadow-orange-500/30' 
                                        : 'bg-neon-cyan hover:bg-cyan-300 text-black shadow-cyan-500/30'
                                    }
                                `}
                            >
                                <RefreshCw size={20} className={playerWon ? "animate-spin-slow" : ""} /> Play Again
                            </button>
                            
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                            >
                                <ArrowLeft size={18} /> Back to Lobby
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Multiplayer;
