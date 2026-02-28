
import React, { useState, useEffect } from 'react';
/* Fix: Removed non-existent LeaderboardEntry from imports */
import { GameResult } from '../types';
import { 
  Trophy, Medal, ShieldAlert, Activity, 
  Target, Zap, Clock, TrendingUp, AlertCircle, 
  Bot, RefreshCw, Layout, Share2, Download,
  /* Fix: Added Keyboard icon to lucide-react imports */
  ArrowRight, Key, Keyboard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzePerformance } from '../services/geminiService';
import Confetti from './Confetti';

interface ResultDashboardProps {
  result: GameResult;
  userRankPos: number;
  leaderboard: any[];
  onAction: (action: 'REPLAY' | 'DISMISS') => void;
  playerName: string;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ 
  result, 
  userRankPos, 
  leaderboard, 
  onAction,
  playerName 
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const getAnalysis = async () => {
      setIsAnalyzing(true);
      const feedback = await analyzePerformance(result);
      setAnalysis(feedback);
      setIsAnalyzing(false);
    };
    getAnalysis();
  }, [result]);

  /* Fix: Simplified split logic to avoid potential "arithmetic operation" misinterpretations by the compiler and ensure string types */
  const parts = analysis.includes('|') ? analysis.split('|') : [analysis, "Ready for the next heat?"];
  const tip = parts[0]?.trim() || "Focus on your rhythm.";
  const hype = parts[1]?.trim() || "Ready for the next heat?";

  const topMistakes = Object.entries(result.confusionMap || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const stats = [
    { label: 'Total Chars', value: result.totalChars, icon: Keyboard },
    /* Fix: Ensured arithmetic operations use explicit number types from result */
    { label: 'Mistake Rate', value: `${((Number(result.errors) / Math.max(1, Number(result.totalChars))) * 100).toFixed(1)}%`, icon: AlertCircle },
    { label: 'Backspace Use', value: result.backspaces, icon: RefreshCw },
    { label: 'Adjusted WPM', value: result.wpm, icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl overflow-y-auto p-4 md:p-8">
      {userRankPos === 1 && <Confetti />}
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink"></div>
            
            <div className="flex flex-col items-center relative z-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 ${userRankPos === 1 ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_40px_rgba(6,182,212,0.4)]' : userRankPos === 2 ? 'border-neon-green bg-neon-green/10 text-neon-green' : 'border-neon-pink bg-neon-pink/10 text-neon-pink'} transform animate-bounce`}>
                     {userRankPos === 1 ? <Trophy size={48} /> : userRankPos === 2 ? <Medal size={48} /> : <ShieldAlert size={48} />}
                </div>
                
                <h1 className={`text-6xl md:text-8xl font-black italic tracking-tighter uppercase ${userRankPos === 1 ? 'text-neon-cyan drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]' : userRankPos === 2 ? 'text-neon-green' : 'text-neon-pink'}`}>
                    {userRankPos === 1 ? 'ARENA MASTER' : userRankPos === 2 ? 'SECURED' : 'DEFEAT'}
                </h1>
                
                <p className="mt-4 text-slate-400 font-mono tracking-[0.4em] uppercase text-xs">
                    {userRankPos === 1 ? 'RANK UP +300 XP' : userRankPos === 2 ? 'POSITION SECURED +150 XP' : 'RANK DOWN -50 XP'}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Leaderboard & Stats */}
            <div className="lg:col-span-4 space-y-6">
                {/* Leaderboard */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={16} /> Final Standings
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div key={entry.id} className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${entry.isUser ? 'border-neon-cyan bg-neon-cyan/10 scale-105' : 'border-transparent bg-white/5'}`}>
                                <div className="flex gap-4 items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black italic ${entry.rank === 1 ? 'bg-neon-cyan text-black' : 'bg-white/10 text-slate-400'}`}>
                                        #{entry.rank}
                                    </div>
                                    <span className={`font-bold ${entry.isUser ? 'text-neon-cyan' : 'text-white'}`}>{entry.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-mono font-black text-lg">{entry.wpm}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.accuracy}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((s, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl group hover:border-white/20 transition-all">
                            <s.icon size={18} className="text-slate-500 mb-3 group-hover:text-neon-cyan" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-2xl font-mono font-black text-white">{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Col: Telemetry & Analysis */}
            <div className="lg:col-span-8 space-y-6">
                {/* WPM Graph */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} /> Velocity Telemetry
                        </h3>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Peak</p>
                                <p className="text-lg font-mono font-black text-neon-cyan">{Math.max(...result.wpmHistory.map(h => h.wpm), result.wpm)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.wpmHistory}>
                                <defs>
                                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#475569" fontSize={10} fontStyle="italic" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#06B6D4', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="wpm" stroke="#06B6D4" strokeWidth={4} fill="url(#colorWpm)" animationDuration={1500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mistake Heatmap */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Target size={16} /> Mistake Analysis
                        </h3>
                        <div className="space-y-3">
                            {topMistakes.length > 0 ? topMistakes.map(([pair, count], idx) => {
                                const [expected, typed] = pair.split('→');
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded font-mono text-neon-cyan font-bold">{expected}</span>
                                                <ArrowRight size={12} className="text-slate-600" />
                                                <span className="w-8 h-8 flex items-center justify-center bg-neon-pink/20 rounded font-mono text-neon-pink font-bold">{typed}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 italic">Confusion detected</span>
                                        </div>
                                        <span className="text-lg font-mono font-black text-white">{count}x</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-center py-8 text-slate-500 text-sm italic">Flawless execution. No mistakes recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* AI Coaching */}
                    <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-neon-purple/10 group-hover:scale-110 transition-transform">
                            <Bot size={120} />
                        </div>
                        <h3 className="text-sm font-black text-neon-purple uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Zap size={16} /> Performance Insights
                        </h3>
                        <div className="relative z-10 space-y-4">
                            {isAnalyzing ? (
                                <div className="flex items-center gap-3 py-6">
                                    <RefreshCw className="animate-spin text-neon-purple" size={20} />
                                    <p className="text-sm text-slate-400 font-mono">Running tactical diagnostics...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-xs text-slate-500 font-black uppercase tracking-tighter mb-2">Tactical Tip</p>
                                        <p className="text-sm text-white font-medium leading-relaxed">{tip}</p>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                        <p className="text-xs text-slate-500 font-black uppercase tracking-tighter mb-2">Status</p>
                                        <p className="text-sm text-neon-purple font-bold italic">"{hype}"</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4 pt-4">
                    <button 
                        onClick={() => onAction('REPLAY')}
                        className="flex-1 py-5 bg-neon-cyan text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-neon-cyan/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                    >
                        <RefreshCw size={20} /> Re-Enter Arena
                    </button>
                    <button 
                        onClick={() => onAction('DISMISS')}
                        className="flex-1 py-5 bg-white/5 text-slate-400 border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                    >
                        <Layout size={20} /> Dashboard
                    </button>
                    <button className="p-5 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
