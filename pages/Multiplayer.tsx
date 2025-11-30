import React, { useState, useEffect, useRef } from 'react';
import { GameMode, GameResult, Difficulty, Opponent, Rank } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Users, Trophy, Home, Share2, Copy, Check, Zap, Medal, Flag } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BOT_NAMES = ['Speedster_99', 'CodeNinja', 'TypeMaster_X', 'KeyboardWarrior', 'FingerSlippage'];
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

const Multiplayer: React.FC = () => {
  const { addMatch, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<'SEARCHING' | 'COUNTDOWN' | 'RACING' | 'FINISHED'>('SEARCHING');
  const [text, setText] = useState('');
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [result, setResult] = useState<GameResult | null>(null);
  const [playerWon, setPlayerWon] = useState(false);
  const [placement, setPlacement] = useState(0);
  const [loadingText, setLoadingText] = useState("Finding opponents...");
  
  // Lobby / Sharing State
  const [lobbyId, setLobbyId] = useState<string>('');
  const [copied, setCopied] = useState(false);

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
    if (lobbyParam) {
        setLobbyId(lobbyParam);
        setLoadingText("Joining Lobby...");
    } else {
        setLobbyId(Math.random().toString(36).substring(7).toUpperCase());
    }

    startMatchmaking();
    return () => {
        if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMatchmaking = async () => {
    setStatus('SEARCHING');
    setResult(null);
    setPlayerWon(false);
    setPlacement(0);
    
    const difficulty = getDifficultyByRank(user?.rank);

    const [generatedText] = await Promise.all([
        generatePracticeText(difficulty), 
        new Promise(resolve => setTimeout(resolve, 2000))
    ]);

    setLoadingText("Found match!");
    setText(generatedText);
    
    // Create Bots 
    const numBots = Math.floor(Math.random() * 2) + 1; 
    const newOpponents: Opponent[] = [];

    // Bot difficulty logic
    const r = user?.rank || Rank.BRONZE_I;
    let minWpm = 20;
    let maxVar = 20;

    if (r.includes('Bronze')) { 
        minWpm = 15; maxVar = 15;
    } else if (r.includes('Silver')) { 
        minWpm = 30; maxVar = 20;
    } else if (r.includes('Gold')) { 
        minWpm = 50; maxVar = 25;
    } else if (r.includes('Platinum')) { 
        minWpm = 70; maxVar = 30;
    } else if (r.includes('Diamond')) { 
        minWpm = 90; maxVar = 30;
    } else { 
        minWpm = 110; maxVar = 40;
    }

    for (let i = 0; i < numBots; i++) {
        const botWpm = Math.floor(Math.random() * maxVar) + minWpm; 
        
        newOpponents.push({
            id: `bot-${i}`,
            name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
            progress: 0,
            wpm: botWpm,
            accuracy: Math.floor(Math.random() * (100 - 92) + 92), // Random 92-100% accuracy
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
      
      const finishedBotsCount = opponents.filter(b => b.isFinished).length;
      const rank = finishedBotsCount + 1;
      
      setPlacement(rank);
      setPlayerWon(rank === 1);
      setStatus('FINISHED');
      setResult(res);

      // XP Rewards: 1st=200, 2nd=150, 3rd+=100
      let xpReward = 100;
      if (rank === 1) xpReward = 200;
      if (rank === 2) xpReward = 150;

      addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.MULTIPLAYER,
        difficulty: getDifficultyByRank(user?.rank),
        errors: res.errors
      }, xpReward); 
  };

  const copyInviteLink = () => {
      // Ensure we construct the link with the hash
      const baseUrl = window.location.href.split('#')[0];
      const url = `${baseUrl}#/multiplayer?lobby=${lobbyId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'SEARCHING') {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-fade-in relative">
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
                     Calibrating opponents for <span className="text-neon-purple font-bold border-b border-neon-purple/50">{user?.rank}</span> league.
                  </p>
              </div>

              {/* Invite Friend Section */}
              <div className="p-1 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-xl w-full max-w-sm shadow-xl">
                  <div className="bg-white dark:bg-abyss p-4 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                        <Share2 size={14} /> Lobby Access
                    </p>
                    <button 
                        onClick={copyInviteLink}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-lg transition-colors active:scale-95 border border-slate-200 dark:border-white/10 font-mono text-sm group"
                    >
                        {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white" />}
                        {copied ? 'LINK_COPIED' : 'COPY_INVITE_LINK'}
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="mb-8 flex justify-between items-end border-b border-slate-200 dark:border-white/5 pb-6">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Zap className="text-neon-cyan fill-neon-cyan" /> MULTIPLAYER // RACE
                </h2>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-wider">
                            LOBBY: <span className="text-slate-800 dark:text-white font-bold">{lobbyId}</span>
                        </span>
                    </div>
                    <button 
                        onClick={copyInviteLink}
                        className="flex items-center gap-2 px-3 py-1 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple rounded-full text-xs font-bold transition-colors active:scale-95 border border-neon-purple/20"
                    >
                        {copied ? <Check size={12} /> : <Share2 size={12} />}
                        {copied ? 'COPIED!' : 'INVITE'}
                    </button>
                </div>
            </div>
            {status === 'COUNTDOWN' && (
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-400 dark:from-white dark:to-slate-500 animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
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
                <div className={`
                    bg-white dark:bg-abyss border p-10 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden transition-all duration-500
                    ${playerWon 
                        ? 'border-yellow-400/50 shadow-[0_0_50px_rgba(251,191,36,0.3)]' 
                        : 'border-slate-200 dark:border-white/10'
                    }
                `}>
                    {/* Background effects */}
                    {playerWon ? (
                         <>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/20 blur-[100px] rounded-full animate-pulse"></div>
                            {/* Confetti-like dots */}
                            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-20 right-20 w-3 h-3 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                         </>
                    ) : (
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-400/10 blur-[100px] rounded-full"></div>
                    )}
                    
                    <div className="relative z-10 text-center">
                        <div className="flex justify-center mb-6">
                            {playerWon ? (
                                <div className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.5)] transform hover:scale-110 transition-transform duration-300">
                                    <Trophy size={48} className="text-white animate-pulse" />
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-200 dark:bg-slate-800 rounded-full">
                                    {placement === 2 ? <Medal size={48} className="text-slate-400" /> : <Flag size={48} className="text-slate-500" />}
                                </div>
                            )}
                        </div>
                        
                        <div className="mb-2">
                             {playerWon ? (
                                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-600 drop-shadow-sm">
                                    CHAMPION
                                </h2>
                             ) : (
                                <h2 className="text-4xl font-black text-slate-700 dark:text-slate-300">
                                    FINISH LINE
                                </h2>
                             )}
                        </div>

                        <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mb-8 flex items-center justify-center gap-2">
                            {playerWon ? (
                                <span className="text-yellow-500">Rank: 1st Place</span>
                            ) : (
                                <span>Rank: {placement === 2 ? '2nd' : placement === 3 ? '3rd' : `${placement}th`} Place</span>
                            )}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Speed</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-white">{result.wpm} <span className="text-sm font-normal text-slate-500">WPM</span></p>
                            </div>
                            <div className={`bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border ${playerWon ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-slate-200 dark:border-white/5'}`}>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">XP Gained</p>
                                <p className={`text-3xl font-bold ${playerWon ? 'text-yellow-500' : 'text-slate-800 dark:text-white'}`}>
                                    +{placement === 1 ? 200 : placement === 2 ? 150 : 100}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5"
                            >
                                <Home size={20} /> EXIT
                            </button>
                            <button 
                                onClick={startMatchmaking}
                                className={`flex-1 py-4 font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg
                                    ${playerWon 
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:brightness-110 shadow-orange-500/30' 
                                        : 'bg-neon-cyan hover:bg-cyan-300 text-black shadow-cyan-500/30'
                                    }
                                `}
                            >
                                <Users size={20} /> {playerWon ? 'DEFEND TITLE' : 'REMATCH'}
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