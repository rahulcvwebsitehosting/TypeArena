
import { GameMode, GameResult, Difficulty, Opponent, Rank } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Loader2, Zap, Check, Copy, Lock, Globe, Users, User as UserIcon, Timer, Trophy, ShieldAlert } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Confetti from '../components/Confetti';

const BOT_NAMES = ['Speedster_99', 'CodeNinja', 'TypeMaster_X', 'KeyboardWarrior', 'FingerSlippage', 'Glitch_Runner'];
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
  const [raceTimer, setRaceTimer] = useState(60);
  const [result, setResult] = useState<GameResult | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [loadingText, setLoadingText] = useState('Initializing Arena...');
  const [lobbyId, setLobbyId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostWpm, setHostWpm] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isPrivateMatch, setIsPrivateMatch] = useState(false);
  const [peerCount, setPeerCount] = useState(0);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);
  const currentStatsRef = useRef<GameResult | null>(null);

  const getDifficultyByRank = (rank: Rank | undefined): Difficulty => {
    if (!rank) return Difficulty.EASY;
    const r = rank.toString();
    if (r.includes('Bronze') || r.includes('Silver')) return Difficulty.EASY;
    if (r.includes('Gold') || r.includes('Platinum')) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  };

  useEffect(() => {
    if (!lobbyId || !user) return;

    const channel = supabase.channel(`lobby:${lobbyId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPeerCount(Object.keys(state).length);
      })
      .on('broadcast', { event: 'START_RACE' }, (payload) => {
        if (lobbyMode === 'JOINED') {
            setText(payload.payload.text);
            setupOpponent(payload.payload.hostData);
            setStatus('COUNTDOWN');
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            username: user.username,
            avgWpm: user.avgWpm || 40,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [lobbyId, user?.id, lobbyMode]);

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
        } else {
            setLobbyMode('HOSTING'); 
        }
    } else if (modeParam === 'host') {
        handleCreateLobby();
    }
    return () => {
        if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
        if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
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
      setLobbyId('GLOBAL_' + Math.random().toString(36).substring(7).toUpperCase());
      startMatchmaking(false);
  };

  const setupOpponent = (opponentData: { name: string, wpm: number }) => {
      const newOpponent: Opponent = {
          id: 'opponent-1',
          name: opponentData.name,
          progress: 0,
          wpm: opponentData.wpm,
          accuracy: 96,
          color: COLORS[0],
          isFinished: false
      };
      setOpponents([newOpponent]);
  };

  const startPrivateMatch = async () => {
    if (peerCount < 2) return; 

    setStatus('SEARCHING');
    setLoadingText("Generating Arena Text...");
    
    const difficulty = getDifficultyByRank(user?.rank);
    const generatedText = await generatePracticeText(difficulty);
    const marathonText = (generatedText + " ").repeat(5); 
    setText(marathonText);
    
    if (channelRef.current) {
        channelRef.current.send({
            type: 'broadcast',
            event: 'START_RACE',
            payload: { 
                text: marathonText,
                hostData: { name: user?.username, wpm: user?.avgWpm || 40 }
            }
        });
    }

    const presence = channelRef.current.presenceState();
    const otherUserId = Object.keys(presence).find(id => id !== user?.id);
    const otherUser = otherUserId ? presence[otherUserId][0] : null;

    setupOpponent({ 
        name: otherUser?.username || hostName || "Challenger", 
        wpm: otherUser?.avgWpm || hostWpm || 40 
    });

    setStatus('COUNTDOWN');
  };

  const startMatchmaking = async (isPrivate: boolean) => {
    setStatus('SEARCHING');
    setResult(null);
    setPlayerWon(false);
    setLeaderboard([]);
    setRaceTimer(60);
    
    setLoadingText("Initializing Server...");
    
    const difficulty = getDifficultyByRank(user?.rank);
    const generatedText = await generatePracticeText(difficulty);
    const marathonText = (generatedText + " ").repeat(5);
    setText(marathonText);
    
    const newOpponents: Opponent[] = [];
    const r = user?.rank || Rank.BRONZE_I;
    let minWpm = 20;
    let maxVar = 15;

    if (r.includes('Bronze')) { minWpm = 25; maxVar = 15; }
    else if (r.includes('Silver')) { minWpm = 40; maxVar = 20; }
    else if (r.includes('Gold')) { minWpm = 55; maxVar = 20; }
    else { minWpm = 80; maxVar = 30; }

    const numBots = Math.floor(Math.random() * 2) + 1; 

    for (let i = 0; i < numBots; i++) {
        newOpponents.push({
            id: `bot-${i}`,
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
            progress: 0,
            wpm: Math.max(15, Math.floor(Math.random() * maxVar) + minWpm),
            accuracy: 94,
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
            setRaceTimer(60);
            startBotRace();
            startRaceClock();
        }
    }
  }, [status, countdown]);

  const startRaceClock = () => {
      clockIntervalRef.current = setInterval(() => {
          setRaceTimer(prev => {
              if (prev <= 1) {
                  clearInterval(clockIntervalRef.current!);
                  handleRaceTimeout();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };

  const handleRaceTimeout = () => {
      if (currentStatsRef.current) {
          handleFinish(currentStatsRef.current);
      } else {
          handleFinish({ wpm: 0, accuracy: 100, errors: 0, timeTaken: 60, characterStats: {} });
      }
  };

  const startBotRace = () => {
      const startTime = Date.now();
      const textLength = text.length;
      raceIntervalRef.current = setInterval(() => {
          setOpponents(prev => {
              const now = Date.now();
              const elapsedMin = (now - startTime) / 60000;
              return prev.map(bot => {
                  const expectedChars = bot.wpm * 5 * elapsedMin;
                  const progress = Math.min(100, (expectedChars / textLength) * 100);
                  return { ...bot, progress };
              });
          });
      }, 100);
  };

  const handleStatsUpdate = (stats: GameResult) => {
      currentStatsRef.current = stats;
  };

  const handleFinish = (res: GameResult) => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      
      const allParticipants = [
          { id: 'user', name: user?.username || 'You', wpm: res.wpm, accuracy: res.accuracy, isUser: true },
          ...opponents.map(bot => ({ id: bot.id, name: bot.name, wpm: bot.wpm, accuracy: bot.accuracy, isUser: false }))
      ];
      
      allParticipants.sort((a, b) => b.wpm - a.wpm);
      const rankedResults: LeaderboardEntry[] = allParticipants.map((p, index) => ({ ...p, rank: index + 1 }));
      setLeaderboard(rankedResults);

      const userRank = rankedResults.find(p => p.isUser)?.rank || rankedResults.length;
      const isWin = userRank === 1;

      setPlayerWon(isWin);
      setStatus('FINISHED');
      setResult(res);

      addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.MULTIPLAYER,
        difficulty: getDifficultyByRank(user?.rank),
        errors: res.errors
      }, isWin ? 300 : 150, isWin); 
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

  if (lobbyMode === 'SELECT' && status === 'IDLE') {
      return (
          <div className="max-w-4xl mx-auto py-8">
              <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8 italic">MARATHON ARENA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={handleStartRanked} className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-cyan cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-cyan/10 transform transition-all duration-300 hover:-translate-y-2 text-center">
                      <Globe size={40} className="mx-auto mb-4 text-neon-cyan" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ranked Marathon</h3>
                      <p className="text-slate-500 mb-4">60-second endurance challenge.</p>
                      <span className="text-neon-cyan font-bold text-sm uppercase tracking-widest">Deploy Now</span>
                  </div>

                  <div onClick={handleCreateLobby} className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-purple cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-purple/10 transform transition-all duration-300 hover:-translate-y-2 text-center">
                      <Lock size={40} className="mx-auto mb-4 text-neon-purple" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Timed Duel</h3>
                      <p className="text-slate-500 mb-4">Challenge a real player to 1 minute.</p>
                      <span className="text-neon-purple font-bold text-sm uppercase tracking-widest">Establish Room</span>
                  </div>
              </div>
          </div>
      );
  }

  if (lobbyMode === 'JOINED' && status === 'IDLE') {
    return (
        <div className="max-w-md mx-auto py-12 text-center space-y-6">
            <div className="p-6 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl">
                <Users size={32} className="mx-auto text-neon-cyan mb-3" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Arena Joined</h2>
                <p className="text-slate-500">Host: <span className="text-neon-cyan font-bold">{hostName}</span></p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-neon-cyan" size={24} />
                <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">Syncing clocks with host...</p>
            </div>
        </div>
    );
  }

  if (lobbyMode === 'HOSTING' && status === 'IDLE') {
      return (
          <div className="max-w-lg mx-auto py-12 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Awaiting Challenger</h2>
              
              <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3 mb-8 border border-slate-200 dark:border-white/10">
                  <div className="flex-1 text-xs text-slate-500 truncate text-left font-mono">Invite link for 1-minute duel...</div>
                  <button onClick={copyInviteLink} className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-white rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform text-xs">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'COPIED' : 'COPY'}
                  </button>
              </div>

              <div className={`p-6 rounded-2xl border-2 mb-8 transition-colors ${peerCount >= 2 ? 'border-neon-green/30 bg-neon-green/5' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5'}`}>
                  <div className="flex justify-center -space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-neon-purple border-4 border-white dark:border-abyss flex items-center justify-center text-white"><UserIcon size={20}/></div>
                      <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-abyss flex items-center justify-center transition-colors ${peerCount >= 2 ? 'bg-neon-cyan text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                        {peerCount >= 2 ? <UserIcon size={20}/> : <span className="text-xs">?</span>}
                      </div>
                  </div>
                  <p className={`text-sm font-bold uppercase tracking-widest ${peerCount >= 2 ? 'text-neon-green' : 'text-slate-400'}`}>
                      {peerCount >= 2 ? 'Challenger Ready' : 'Awaiting Peer...'}
                  </p>
              </div>

              <button 
                disabled={peerCount < 2}
                onClick={startPrivateMatch}
                className={`w-full py-4 font-black rounded-xl mb-4 transition-all shadow-xl ${
                    peerCount >= 2 
                    ? 'bg-neon-green text-white hover:scale-[1.02] shadow-neon-green/20' 
                    : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
              >
                  {peerCount >= 2 ? 'START 60s RACE' : 'PEER REQUIRED'}
              </button>
          </div>
      );
  }

  if (status === 'SEARCHING') {
      return (
          <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-neon-cyan mb-4" size={40} />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-widest">{loadingText}</h2>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap className="text-neon-cyan" size={20} /> Marathon Duel
            </h2>
            
            <div className={`flex items-center gap-3 px-6 py-2 rounded-full border-2 transition-all ${raceTimer <= 10 ? 'border-red-500 bg-red-500/10 animate-pulse' : 'border-neon-cyan bg-neon-cyan/5'}`}>
                <Timer size={20} className={raceTimer <= 10 ? 'text-red-500' : 'text-neon-cyan'} />
                <span className={`font-mono text-2xl font-black ${raceTimer <= 10 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                    00:{raceTimer.toString().padStart(2, '0')}
                </span>
            </div>

            {status === 'COUNTDOWN' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="text-[12rem] font-black text-white italic animate-pop-in drop-shadow-[0_0_50px_rgba(6,182,212,0.8)]">
                        {countdown > 0 ? countdown : 'GO!'}
                    </div>
                </div>
            )}
        </div>

        <TypingEngine 
            text={text}
            isGameActive={status === 'RACING'}
            onGameFinish={handleFinish}
            onStatsUpdate={handleStatsUpdate}
            opponents={opponents}
            isTimedMode={true}
        />

        {status === 'FINISHED' && result && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-hidden">
                {playerWon && <Confetti />}
                
                <div className="relative bg-white dark:bg-abyss p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-white/10 animate-pop-in z-10 overflow-hidden">
                    {/* Celebration Background Glow */}
                    {playerWon && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-neon-cyan/10 blur-[100px] pointer-events-none"></div>
                    )}
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 ${playerWon ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'} transform animate-bounce`}>
                             {playerWon ? <Trophy size={40} /> : <ShieldAlert size={40} />}
                        </div>
                        <h2 className={`text-5xl font-black text-center italic tracking-tighter uppercase ${playerWon ? 'text-neon-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-red-500'}`}>
                            {playerWon ? 'ARENA MASTER' : 'RANK DOWN'}
                        </h2>
                        {playerWon && <p className="text-neon-cyan font-black text-[10px] tracking-[0.3em] mt-2 animate-pulse uppercase">Maximum Velocity Detected</p>}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                        {leaderboard.map((entry) => (
                            <div key={entry.id} className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all ${entry.isUser ? 'border-neon-cyan bg-neon-cyan/10 scale-105 shadow-xl shadow-neon-cyan/20 ring-2 ring-neon-cyan/20' : 'border-transparent bg-slate-50 dark:bg-white/5'}`}>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic text-lg ${entry.rank === 1 ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        #{entry.rank}
                                    </div>
                                    <span className={`font-bold ${entry.isUser ? 'text-neon-cyan' : 'text-slate-800 dark:text-white'}`}>{entry.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-mono font-black text-xl">{entry.wpm} <span className="text-[10px] text-slate-500">WPM</span></span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.accuracy}% ACC</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-neon-cyan text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-neon-cyan/20 uppercase tracking-widest text-sm">Re-Queue</button>
                        <button onClick={() => navigate('/')} className="flex-1 py-4 bg-slate-100 dark:bg-white/10 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm">Dismiss</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Multiplayer;
