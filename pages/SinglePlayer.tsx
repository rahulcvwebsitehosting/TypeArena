import React, { useState, useEffect } from 'react';
import { Difficulty, GameMode, GameResult } from '../types';
import { generatePracticeText, analyzePerformance } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, RefreshCw, Bot, Terminal, Zap } from 'lucide-react';

const SinglePlayer: React.FC = () => {
  const { addMatch } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [result, setResult] = useState<GameResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const loadGame = async () => {
    setLoading(true);
    setGameState('IDLE');
    setResult(null);
    setAnalysis('');
    const newText = await generatePracticeText(difficulty);
    setText(newText);
    setLoading(false);
    setGameState('PLAYING');
  };

  // Initial load
  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const handleFinish = async (res: GameResult) => {
    setGameState('FINISHED');
    setResult(res);
    
    // Save stats
    addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.SINGLE_PLAYER,
        difficulty: difficulty,
        errors: res.errors
    }, 50); // 50 XP for practice

    // Get AI Analysis
    setAnalyzing(true);
    const feedback = await analyzePerformance(res);
    setAnalysis(feedback);
    setAnalyzing(false);
  };

  // Parse analysis string (Tip | Hype)
  const [tip, hype] = analysis && analysis.includes('|') ? analysis.split('|') : [analysis, null];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-neon-purple/20 rounded-xl">
                <Terminal className="text-neon-purple" size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Practice Zone</h2>
        </div>
        
        {/* Difficulty Selector */}
        <div className="flex flex-wrap justify-center gap-2 bg-slate-100 dark:bg-black/40 p-1.5 rounded-xl border border-slate-200 dark:border-white/10">
            {Object.values(Difficulty).map((d) => (
                <button
                    key={d}
                    onClick={() => {
                        if (!loading && difficulty !== d) {
                            setDifficulty(d);
                        }
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 ${
                        difficulty === d 
                        ? 'bg-neon-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                    } disabled:opacity-50 cursor-pointer`}
                >
                    {d}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center glass-panel rounded-3xl border border-neon-purple/20">
            <Loader2 className="animate-spin text-neon-purple mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400 font-mono animate-pulse">GENERATING_CHALLENGE_SEQUENCE...</p>
        </div>
      ) : (
        <TypingEngine 
            text={text}
            isGameActive={gameState === 'PLAYING'}
            onGameFinish={handleFinish}
        />
      )}

      {/* Results Modal / Panel */}
      {gameState === 'FINISHED' && result && (
          <div className="mt-8 p-8 glass-panel rounded-3xl border border-neon-purple/30 animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-[80px] rounded-full"></div>
              
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-neon-green">MISSION COMPLETE</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
                  <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center group hover:border-neon-cyan/50 transition-colors">
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Speed</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:text-neon-cyan transition-colors">{result.wpm} <span className="text-sm font-medium text-slate-500">WPM</span></p>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center group hover:border-neon-green/50 transition-colors">
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Accuracy</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white group-hover:text-neon-green transition-colors">{result.accuracy}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center">
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Time</p>
                      <p className="text-3xl font-black text-slate-800 dark:text-white">{result.timeTaken.toFixed(1)}s</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 text-center group hover:border-yellow-500/50 transition-colors">
                      <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">XP Earned</p>
                      <p className="text-3xl font-black text-yellow-500 dark:text-yellow-400 group-hover:scale-110 transition-transform">+50</p>
                  </div>
              </div>

              {/* AI Coach - Cyberpunk HUD Style */}
              <div className="relative group overflow-hidden rounded-2xl border border-neon-purple/30 bg-slate-100 dark:bg-black/40 p-6 transition-all hover:border-neon-purple/50 mb-8 shadow-lg">
                  {/* Animated Background Mesh */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                      {/* Hologram Avatar */}
                      <div className="shrink-0 relative">
                          <div className="h-16 w-16 rounded-xl border-2 border-neon-purple bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                              <Bot size={32} className="text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-neon-green"></span>
                          </div>
                      </div>

                      {/* Data Stream */}
                      <div className="flex-1 w-full space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-300 dark:border-white/10 pb-2">
                              <span className="text-neon-purple font-mono text-xs tracking-[0.2em] font-bold flex items-center gap-2">
                                  <span className="w-2 h-2 bg-neon-purple rounded-sm"></span>
                                  AI_COACH_UPLINK
                              </span>
                              {analyzing && <span className="text-xs font-mono text-slate-500 animate-pulse">DECRYPTING...</span>}
                          </div>
                          
                          {analyzing ? (
                              <div className="py-2 flex items-center justify-center text-slate-400 font-mono text-sm gap-2">
                                  <Loader2 className="animate-spin text-neon-purple" size={16} /> 
                                  <span>Processing Biometric Data...</span>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border-l-4 border-neon-cyan shadow-sm">
                                      <span className="flex items-center gap-2 text-[10px] text-neon-cyan uppercase font-bold mb-1">
                                          <Terminal size={10} /> Tactical Tip
                                      </span>
                                      <p className="text-slate-800 dark:text-white font-medium text-sm leading-tight">"{tip?.trim()}"</p>
                                  </div>
                                  {hype && (
                                      <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 border-l-4 border-neon-pink shadow-sm">
                                          <span className="flex items-center gap-2 text-[10px] text-neon-pink uppercase font-bold mb-1">
                                              <Zap size={10} /> Hype Rating
                                          </span>
                                          <p className="text-slate-800 dark:text-white font-black italic tracking-wide text-sm">"{hype?.trim()}"</p>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              <button 
                onClick={loadGame}
                className="w-full py-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-3 text-lg group"
              >
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> REBOOT_SESSION
              </button>
          </div>
      )}
    </div>
  );
};

export default SinglePlayer;