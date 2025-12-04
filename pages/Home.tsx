import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Award, TrendingUp, Zap, ChevronRight, Flame, Globe, Lock } from 'lucide-react';
import { getLevelProgress } from '../constants';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  const xp = user?.xp || 0;
  const progressData = getLevelProgress(xp);
  // Ensure we don't get NaN or weird values, and clamp between 0-100
  const targetProgress = Math.min(100, Math.max(0, progressData.percentage || 0));

  const handleCardClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); // Prevent immediate navigation to show animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    
    // Cleanup ripple after animation
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
        navigate(path);
    }, 300); // Slight delay for visual feedback
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="mb-8 relative">
        <h1 className="text-5xl font-extrabold text-slate-800 dark:text-white mb-3 tracking-tight">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">{user?.username || 'Guest'}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
          Your arena awaits. Break records, climb ranks, and dominate the leaderboard.
        </p>
      </header>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Single Player */}
        <div 
            onClick={(e) => handleCardClick(e, '/singleplayer')}
            className="group relative p-8 glass-panel rounded-3xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-t border-slate-200 dark:border-white/10 hover:border-neon-purple/50 overflow-hidden cursor-pointer flex flex-col"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/0 to-neon-purple/5 group-hover:from-neon-purple/10 group-hover:to-neon-purple/20 transition-all duration-500"></div>
            {ripples.map(r => (
                <span key={r.id} className="absolute w-4 h-4 bg-neon-purple/40 rounded-full animate-click-burst pointer-events-none z-50" style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }} />
            ))}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-neon-purple/10 rounded-2xl border border-neon-purple/20 group-hover:scale-110 transition-transform duration-300">
                        <Play size={32} className="text-neon-purple" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">SOLO</span>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-purple transition-colors">Practice Mode</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">Sharpen your skills with AI-generated challenges. Custom difficulty and code modes available.</p>
                
                <div className="flex items-center text-neon-purple font-bold tracking-wide group-hover:gap-2 transition-all mt-auto">
                    START TYPING <ChevronRight size={20} />
                </div>
            </div>
        </div>

        {/* Ranked Multiplayer */}
        <div 
            onClick={(e) => handleCardClick(e, '/multiplayer')}
            className="group relative p-8 glass-panel rounded-3xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-t border-slate-200 dark:border-white/10 hover:border-neon-cyan/50 overflow-hidden cursor-pointer flex flex-col"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/0 to-neon-cyan/5 group-hover:from-neon-cyan/10 group-hover:to-neon-cyan/20 transition-all duration-500"></div>
            {ripples.map(r => (
                <span key={r.id} className="absolute w-4 h-4 bg-neon-cyan/40 rounded-full animate-click-burst pointer-events-none z-50" style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }} />
            ))}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20 group-hover:scale-110 transition-transform duration-300">
                        <Globe size={32} className="text-neon-cyan" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">RANKED</span>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-cyan transition-colors">Multiplayer</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">Compete in real-time ranked matches. Earn XP and climb the global leaderboard.</p>
                
                <div className="flex items-center text-neon-cyan font-bold tracking-wide group-hover:gap-2 transition-all mt-auto">
                    FIND MATCH <ChevronRight size={20} />
                </div>
            </div>
        </div>

        {/* Play with Friends */}
        <div 
            onClick={(e) => handleCardClick(e, '/multiplayer?mode=host')}
            className="group relative p-8 glass-panel rounded-3xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-t border-slate-200 dark:border-white/10 hover:border-neon-green/50 overflow-hidden cursor-pointer flex flex-col"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/0 to-neon-green/5 group-hover:from-neon-green/10 group-hover:to-neon-green/20 transition-all duration-500"></div>
            {ripples.map(r => (
                <span key={r.id} className="absolute w-4 h-4 bg-neon-green/40 rounded-full animate-click-burst pointer-events-none z-50" style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }} />
            ))}

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-neon-green/10 rounded-2xl border border-neon-green/20 group-hover:scale-110 transition-transform duration-300">
                        <Lock size={32} className="text-neon-green" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">PRIVATE</span>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-green transition-colors">Race a Friend</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 text-sm leading-relaxed">Create a private lobby and invite friends. 1v1 duels with custom rules.</p>
                
                <div className="flex items-center text-neon-green font-bold tracking-wide group-hover:gap-2 transition-all mt-auto">
                    CREATE LOBBY <ChevronRight size={20} />
                </div>
            </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-green relative overflow-hidden">
            <div className="absolute right-0 top-0 p-32 bg-neon-green/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <Award className="text-neon-green" size={20} />
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Current Rank</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2 relative z-10">{user?.rank || 'Unranked'}</p>
            
            <div className="flex flex-col gap-1 relative z-10">
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>{progressData.currentRankXP} XP</span>
                    <span>{progressData.rankTotalXP} XP</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                    <div 
                        className={`h-full bg-gradient-to-r from-neon-green to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300 ease-out relative ${targetProgress <= 0.1 ? 'opacity-0' : 'opacity-100'}`} 
                        style={{ width: `${targetProgress}%` }}
                    >
                        {/* Shimmer overlay - only visible if progress > 0 */}
                        {targetProgress > 0 && (
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-purple relative overflow-hidden">
             <div className="absolute right-0 top-0 p-32 bg-neon-purple/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <Zap className="text-neon-purple" size={20} />
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Best WPM</h3>
            </div>
            <p className="text-4xl font-mono font-bold text-slate-800 dark:text-white relative z-10">{user?.bestWpm || 0}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-cyan relative overflow-hidden">
             <div className="absolute right-0 top-0 p-32 bg-neon-cyan/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <TrendingUp className="text-neon-cyan" size={20} />
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Average WPM</h3>
            </div>
            <p className="text-4xl font-mono font-bold text-slate-800 dark:text-white relative z-10">{user?.avgWpm || 0}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-orange-500 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-32 bg-orange-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <Flame className="text-orange-500 animate-pulse" size={20} />
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Win Streak</h3>
            </div>
            <p className="text-4xl font-mono font-bold text-slate-800 dark:text-white relative z-10">
                {user?.winStreak || 0}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
