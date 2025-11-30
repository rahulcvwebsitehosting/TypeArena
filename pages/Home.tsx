import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Play, Users, Award, TrendingUp, Zap, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/singleplayer" className="group relative p-8 glass-panel rounded-3xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border-t border-slate-200 dark:border-white/10 hover:border-neon-purple/50 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/0 to-neon-purple/5 group-hover:from-neon-purple/10 group-hover:to-neon-purple/20 transition-all duration-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-neon-purple/10 rounded-2xl border border-neon-purple/20 group-hover:scale-110 transition-transform duration-300">
                        <Play size={32} className="text-neon-purple" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">SOLO</span>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-purple transition-colors">Practice Mode</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1">Sharpen your skills with AI-generated challenges. Custom difficulty and code modes available.</p>
                
                <div className="flex items-center text-neon-purple font-bold tracking-wide group-hover:gap-2 transition-all">
                    START TYPING <ChevronRight size={20} />
                </div>
            </div>
        </Link>

        <Link to="/multiplayer" className="group relative p-8 glass-panel rounded-3xl hover:-translate-y-1 active:scale-95 transition-all duration-300 border-t border-slate-200 dark:border-white/10 hover:border-neon-cyan/50 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/0 to-neon-cyan/5 group-hover:from-neon-cyan/10 group-hover:to-neon-cyan/20 transition-all duration-500"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-neon-cyan/10 rounded-2xl border border-neon-cyan/20 group-hover:scale-110 transition-transform duration-300">
                        <Users size={32} className="text-neon-cyan" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">PVP</span>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-neon-cyan transition-colors">Multiplayer Race</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 flex-1">Compete in real-time. Earn double XP. Prove your speed against the world.</p>
                
                <div className="flex items-center text-neon-cyan font-bold tracking-wide group-hover:gap-2 transition-all">
                    FIND MATCH <ChevronRight size={20} />
                </div>
            </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-neon-green relative overflow-hidden">
            <div className="absolute right-0 top-0 p-32 bg-neon-green/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <Award className="text-neon-green" size={20} />
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Current Rank</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1 relative z-10">{user?.rank}</p>
            <div className="flex items-center gap-2 text-sm text-slate-500 relative z-10">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex-1">
                    <div className="h-full bg-neon-green w-[45%]"></div>
                </div>
                <span>{user?.xp} XP</span>
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
      </div>
    </div>
  );
};

export default Home;