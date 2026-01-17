
import { GameMode, GameResult, Difficulty, Opponent, Rank } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Loader2, Zap, Check, Copy, Lock, Globe, Users, User as UserIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const [result, setResult] = useState<GameResult | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const [placement, setPlacement] = useState(0);
  const [loadingText, setLoadingText] = useState("Finding opponents...");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [lobbyId, setLobbyId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [hostWpm, setHostWpm] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isPrivateMatch, setIsPrivateMatch] = useState(false);
  const [peerCount, setPeerCount] = useState(0);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);

  const getDifficultyByRank = (rank: Rank | undefined): Difficulty => {
    if (!rank) return Difficulty.EASY;
    const r = rank.toString();
    if (r.includes('Bronze') || r.includes('Silver')) return Difficulty.EASY;
    if (r.includes('Gold') || r.includes('Platinum')) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  };

  // Realtime Channel Management
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
    if (peerCount < 2) return; // Guard clause for host

    setStatus('SEARCHING');
    setLoadingText("Synchronizing players...");
    
    const difficulty = getDifficultyByRank(user?.rank);
    const generatedText = await generatePracticeText(difficulty);
    setText(generatedText);
    
    // Broadcast to joined peer
    if (channelRef.current) {
        channelRef.current.send({
            type: 'broadcast',
            event: 'START_RACE',
            payload: { 
                text: generatedText,
                hostData: { name: user?.username, wpm: user?.avgWpm || 40 }
            }
        });
    }

    // Set up host's view of the opponent
    // We try to find the other user's info from presence
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
    setPlacement(0);
    setLeaderboard([]);
    
    setLoadingText(isPrivate ? "Connecting..." : "Searching...");
    
    const difficulty = getDifficultyByRank(user?.rank);
    const generatedText = await generatePracticeText(difficulty);
    setText(generatedText);
    
    const newOpponents: Opponent[] = [];
    const r = user?.rank || Rank.BRONZE_I;
    let minWpm = 15;
    let maxVar = 15;

    if (r.includes('Bronze')) { minWpm = 15; maxVar = 15; }
    else if (r.includes('Silver')) { minWpm = 30; maxVar = 20; }
    else if (r.includes('Gold')) { minWpm = 45; maxVar = 20; }
    else { minWpm = 70; maxVar = 30; }

    const numBots = Math.floor(Math.random() * 2) + 1; 

    for (let i = 0; i < numBots; i++) {
        newOpponents.push({
            id: `bot-${i}`,
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
            progress: 0,
            wpm: Math.max(12, Math.floor(Math.random() * maxVar) + minWpm),
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

      addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.MULTIPLAYER,
        difficulty: getDifficultyByRank(user?.rank),
        errors: res.errors
      }, isWin ? 200 : 100, isWin); 
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
              <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8 italic">READY FOR WAR?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={handleStartRanked} className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-cyan cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-cyan/10 transform transition-all duration-300 hover:-translate-y-2 text-center">
                      <Globe size={40} className="mx-auto mb-4 text-neon-cyan" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Ranked Arena</h3>
                      <p className="text-slate-500 mb-4">Fastest match-up against bots & players.</p>
                      <span className="text-neon-cyan font-bold text-sm uppercase">Quick Start</span>
                  </div>

                  <div onClick={handleCreateLobby} className="group p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-purple cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-purple/10 transform transition-all duration-300 hover:-translate-y-2 text-center">
                      <Lock size={40} className="mx-auto mb-4 text-neon-purple" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">Private Duel</h3>
                      <p className="text-slate-500 mb-4">Requires a real opponent to join link.</p>
                      <span className="text-neon-purple font-bold text-sm uppercase">Create Room</span>
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
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Lobby Joined</h2>
                <p className="text-slate-500">Challenging: <span className="text-neon-cyan font-bold">{hostName}</span></p>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-neon-cyan" size={24} />
                <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">Waiting for host to start...</p>
            </div>
            <button onClick={() => { setLobbyMode('SELECT'); setIsPrivateMatch(false); }} className="text-slate-500 hover:text-red-500 text-sm font-bold">CANCEL MISSION</button>
        </div>
    );
  }

  if (lobbyMode === 'HOSTING' && status === 'IDLE') {
      return (
          <div className="max-w-lg mx-auto py-12 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Awaiting Challenger</h2>
              
              <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3 mb-8 border border-slate-200 dark:border-white/10">
                  <div className="flex-1 text-xs text-slate-500 truncate text-left font-mono">Invite your opponent...</div>
                  <button onClick={copyInviteLink} className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-white rounded-lg font-bold hover:scale-105 active:scale-95 transition-transform text-xs">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'COPIED' : 'COPY LINK'}
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
                      {peerCount >= 2 ? 'Opponent Connected' : 'Waiting for connection...'}
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
                  {peerCount >= 2 ? 'COMMENCE DUEL' : 'LOCKED (NO OPPONENT)'}
              </button>
              <button onClick={() => { setLobbyMode('SELECT'); setIsPrivateMatch(false); }} className="text-slate-500 hover:text-red-500 text-sm font-bold">ABORT SESSION</button>
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
        <div className="mb-6 flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap className="text-neon-cyan" size={20} /> Arena Duel
            </h2>
            {status === 'COUNTDOWN' && (
                <div className="text-4xl font-black text-neon-cyan animate-bounce italic">
                    {countdown > 0 ? countdown : 'GO!'}
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-abyss p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-white/10 animate-pop-in">
                    <h2 className={`text-5xl font-black text-center mb-8 italic tracking-tighter ${playerWon ? 'text-neon-cyan' : 'text-red-500'}`}>
                        {playerWon ? 'VICTORY' : 'DEFEATED'}
                    </h2>
                    
                    <div className="space-y-3 mb-8">
                        {leaderboard.map((entry) => (
                            <div key={entry.id} className={`flex justify-between items-center p-4 rounded-xl border-2 ${entry.isUser ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-transparent bg-slate-50 dark:bg-white/5'}`}>
                                <div className="flex gap-4 items-center">
                                    <span className={`text-2xl font-black italic ${entry.rank === 1 ? 'text-yellow-400' : 'text-slate-400'}`}>#{entry.rank}</span>
                                    <span className={`font-bold ${entry.isUser ? 'text-neon-cyan' : 'text-slate-800 dark:text-white'}`}>{entry.name}</span>
                                </div>
                                <span className="font-mono font-black text-xl">{entry.wpm} <span className="text-[10px] text-slate-500">WPM</span></span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-neon-cyan text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-neon-cyan/20 uppercase tracking-widest">Rematch</button>
                        <button onClick={() => navigate('/')} className="flex-1 py-4 bg-slate-100 dark:bg-white/10 text-slate-500 font-black rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest">Exit</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Multiplayer;
