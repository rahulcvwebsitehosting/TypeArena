
import { GameMode, GameResult, Difficulty, Opponent, Rank } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Users, Check, Copy, Zap, Flag, Flame, ArrowLeft, ArrowRight, RefreshCw, Lock, Globe, User } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  
  const [lobbyId, setLobbyId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostWpm, setHostWpm] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isPrivateMatch, setIsPrivateMatch] = useState(false);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getDifficultyByRank = (rank: Rank | undefined): Difficulty => {
    if (!rank) return Difficulty.EASY;
    const r = rank.toString();
    if (r.includes('Bronze') || r.includes('Silver')) return Difficulty.EASY;
    if (r.includes('Gold') || r.includes('Platinum')) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  };

  useEffect(() => {
    const lobbyParam = searchParams.get('lobby');
    const hostParam = searchParams.get('host');
    const wpmParam = searchParams.get('wpm');
    const modeParam = searchParams.get('mode');

    if (lobbyParam) {
        setLobbyId(lobbyParam);
        setIsPrivateMatch(true);
        if (hostParam) {
            setLobbyMode('JOINED'); 
            setHostName(decodeURIComponent(hostParam));
            setHostWpm(wpmParam ? parseInt(wpmParam) : 40);
            setLoadingText(`Syncing...`);
        } else {
            setLobbyMode('HOSTING'); 
            setLoadingText("Joined Party");
        }
    } else if (modeParam === 'host') {
        handleCreateLobby();
    }
    return () => {
        if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
  }, [searchParams]);

  const handleCreateLobby = () => {
      const newId = Math.random().toString(36).substring(7).toUpperCase();
      setLobbyId(newId);
      setIsPrivateMatch(true);
      setLobbyMode('HOSTING');
  };

  const handleStartRanked = () => {
      setIsPrivateMatch(false);
      setLobbyMode('SEARCHING');
      setLobbyId(Math.random().toString(36).substring(7).toUpperCase());
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
    
    setLoadingText(isPrivate ? "Connecting..." : "Searching...");
    
    const difficulty = getDifficultyByRank(user?.rank);
    const generatedText = await generatePracticeText(difficulty);

    setText(generatedText);
    
    const newOpponents: Opponent[] = [];
    const r = user?.rank || Rank.BRONZE_I;
    let minWpm = 15;
    let maxVar = 15;
    let minAcc = 85;
    let maxAcc = 95;

    // Calibrate bots to user rank but also difficulty of text
    if (r.includes('Bronze')) { minWpm = 15; maxVar = 15; }
    else if (r.includes('Silver')) { minWpm = 30; maxVar = 20; }
    else if (r.includes('Gold')) { minWpm = 45; maxVar = 20; }
    else if (r.includes('Platinum')) { minWpm = 60; maxVar = 25; }
    else { minWpm = 85; maxVar = 40; }

    const numBots = isPrivate ? 1 : Math.floor(Math.random() * 2) + 1; 

    for (let i = 0; i < numBots; i++) {
        let botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        let botWpm = Math.max(12, Math.floor(Math.random() * maxVar) + minWpm);
        let botAcc = Math.floor(Math.random() * (maxAcc - minAcc + 1)) + minAcc;

        if (isPrivate) {
            if (hostName) {
                botName = hostName;
                botWpm = hostWpm > 0 ? hostWpm : 40;
                botAcc = 96; 
            } else {
                botName = "Challenger";
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
  }, [status, countdown]);

  const startBotRace = () => {
      const startTime = Date.now();
      const textLength = text.length;
      raceIntervalRef.current = setInterval(() => {
          setOpponents(prev => {
              const now = Date.now();
              const elapsedMin = (now - startTime) / 60000;
              return prev.map(bot => {
                  if (bot.isFinished) return bot;
                  const expectedChars = bot.wpm * 5 * elapsedMin;
                  const progress = Math.min(100, (expectedChars / textLength) * 100);
                  return { ...bot, progress, isFinished: progress >= 100 };
              });
          });
      }, 50);
  };

  const handleFinish = (res: GameResult) => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
      const allParticipants = [
          { id: 'user', name: user?.username || 'You', wpm: res.wpm, accuracy: res.accuracy, isUser: true },
          ...opponents.map(bot => ({ id: bot.id, name: bot.name, wpm: bot.wpm, accuracy: bot.accuracy, isUser: false }))
      ];
      allParticipants.sort((a, b) => b.wpm - a.wpm);
      const rankedResults: LeaderboardEntry[] = allParticipants.map((p, index) => ({ ...p, rank: index + 1 }));
      setLeaderboard(rankedResults);

      const userRank = rankedResults.find(p => p.isUser)?.rank || rankedResults.length;
      const isWin = userRank === 1;

      setPlacement(userRank);
      setPlayerWon(isWin);
      setStatus('FINISHED');
      setResult(res);

      let baseXp = 100;
      if (userRank === 1) baseXp = 200;
      if (userRank === 2) baseXp = 150;

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
      const baseUrl = window.location.origin + window.location.pathname;
      const userName = encodeURIComponent(user?.username || 'Player');
      const wpm = user?.avgWpm || 40;
      const url = `${baseUrl}#/multiplayer?lobby=${lobbyId}&host=${userName}&wpm=${wpm}`;
      navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      });
  };

  const handlePlayAgain = () => {
      if (isPrivateMatch) {
          setLobbyMode(hostName ? 'JOINED' : 'HOSTING');
          setStatus('IDLE');
      } else {
          handleStartRanked();
      }
  };

  if (lobbyMode === 'SELECT' && status === 'IDLE') {
      return (
          <div className="max-w-4xl mx-auto py-8">
              <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">Select Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={handleStartRanked}
                    className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-cyan cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-cyan/10 transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] text-center"
                  >
                      <Globe size={40} className="mx-auto mb-4 text-neon-cyan group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ranked Match</h3>
                      <p className="text-slate-500 mb-4">Compete globally.</p>
                      <span className="text-neon-cyan font-bold text-sm uppercase group-hover:underline">Find Match</span>
                  </div>

                  <div 
                    onClick={handleCreateLobby}
                    className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-purple cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-purple/10 transform transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] text-center"
                  >
                      <Lock size={40} className="mx-auto mb-4 text-neon-purple group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Race a Friend</h3>
                      <p className="text-slate-500 mb-4">Private duel.</p>
                      <span className="text-neon-purple font-bold text-sm uppercase group-hover:underline">Create Lobby</span>
                  </div>
              </div>
          </div>
      );
  }

  if (lobbyMode === 'JOINED' && status === 'IDLE') {
    return (
        <div className="max-w-md mx-auto py-12 text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Lobby Joined</h2>
            <p className="text-slate-500 mb-8">Vs: {hostName}</p>
            <button 
                  onClick={startPrivateMatch}
                  className="w-full py-3 bg-neon-green text-white font-bold rounded-lg mb-4 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neon-green/20"
            >
                Start Duel
            </button>
            <button 
                  onClick={() => { setLobbyMode('SELECT'); setIsPrivateMatch(false); }}
                  className="w-full py-3 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
                Leave
            </button>
        </div>
    );
  }

  if (lobbyMode === 'HOSTING' && status === 'IDLE') {
      const inviteUrl = `${window.location.origin}${window.location.pathname}#/multiplayer?lobby=${lobbyId}&host=${encodeURIComponent(user?.username || 'Player')}&wpm=${user?.avgWpm || 40}`;
      return (
          <div className="max-w-lg mx-auto py-12 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Lobby Created</h2>
              
              <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg flex items-center gap-2 mb-8 border border-slate-200 dark:border-white/10">
                  <div className="flex-1 text-sm text-slate-600 dark:text-slate-300 truncate text-left font-mono break-all">{inviteUrl}</div>
                  <button 
                    onClick={copyInviteLink} 
                    className="p-2 bg-white dark:bg-black/20 rounded text-neon-purple font-bold hover:scale-110 active:scale-95 transition-transform"
                  >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
              </div>

              <div className="mb-8">
                  <p className="text-sm font-mono text-slate-500 uppercase animate-pulse">Waiting for opponent...</p>
              </div>

              <button 
                onClick={startPrivateMatch}
                className="w-full py-3 bg-neon-purple text-white font-bold rounded-lg mb-4 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-neon-purple/20"
              >
                  Start Duel
              </button>
              <button 
                onClick={() => { setLobbyMode('SELECT'); setIsPrivateMatch(false); }}
                className="w-full py-3 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                  Cancel
              </button>
          </div>
      );
  }

  if (status === 'SEARCHING') {
      return (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-neon-cyan mb-4" size={40} />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{loadingText}</h2>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap className="text-neon-cyan" size={20} /> Multiplayer
            </h2>
            {status === 'COUNTDOWN' && (
                <div className="text-4xl font-black text-slate-800 dark:text-white animate-bounce">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-abyss p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-white/10 animate-pop-in">
                    <h2 className="text-3xl font-black text-center mb-6 text-slate-800 dark:text-white">
                        {playerWon ? 'VICTORY!' : `${placement}TH PLACE`}
                    </h2>
                    
                    <div className="space-y-2 mb-6">
                        {leaderboard.map((entry) => (
                            <div key={entry.id} className={`flex justify-between p-3 rounded-lg ${entry.isUser ? 'bg-neon-cyan/10 border border-neon-cyan/20' : 'bg-slate-50 dark:bg-white/5'}`}>
                                <div className="flex gap-3">
                                    <span className="font-bold w-6">{entry.rank}</span>
                                    <span className={entry.isUser ? 'text-neon-cyan font-bold' : 'text-slate-700 dark:text-slate-300'}>{entry.name}</span>
                                </div>
                                <span className="font-mono font-bold">{entry.wpm} WPM</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handlePlayAgain} className="flex-1 py-3 bg-neon-cyan text-black font-bold rounded-lg hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-neon-cyan/20">Play Again</button>
                        <button onClick={() => navigate('/')} className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Lobby</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Multiplayer;
