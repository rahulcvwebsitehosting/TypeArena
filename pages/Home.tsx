
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Award, TrendingUp, Zap, ChevronRight, Flame, Globe, Lock } from 'lucide-react';
import { getLevelProgress } from '../constants';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const xp = user?.xp || 0;
  const progressData = getLevelProgress(xp);
  const targetProgress = Math.min(100, Math.max(0, progressData.percentage || 0));

  return (
    <div className="space-y-10 pb-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
          Welcome, <span className="text-neon-purple">{user?.username || 'Guest'}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Ready to type?</p>
      </header>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
            onClick={() => navigate('/singleplayer')}
            className="group p-6 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-purple cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-purple/10 transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-purple/10 rounded-lg group-hover:bg-neon-purple/20 transition-colors">
                    <Play size={24} className="text-neon-purple" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">SOLO</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Practice Mode</h2>
            <p className="text-slate-500 text-sm mb-4">AI-generated challenges.</p>
            <div className="flex items-center text-neon-purple font-bold text-sm group-hover:gap-2 transition-all">
                START <ChevronRight size={16} />
            </div>
        </div>

        <div 
            onClick={() => navigate('/multiplayer')}
            className="group p-6 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-cyan cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-cyan/10 transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                    <Globe size={24} className="text-neon-cyan" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">RANKED</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Multiplayer</h2>
            <p className="text-slate-500 text-sm mb-4">Compete against others.</p>
            <div className="flex items-center text-neon-cyan font-bold text-sm group-hover:gap-2 transition-all">
                FIND MATCH <ChevronRight size={16} />
            </div>
        </div>

        <div 
            onClick={() => navigate('/multiplayer?mode=host')}
            className="group p-6 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 hover:border-neon-green cursor-pointer shadow-sm hover:shadow-xl hover:shadow-neon-green/10 transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neon-green/10 rounded-lg group-hover:bg-neon-green/20 transition-colors">
                    <Lock size={24} className="text-neon-green" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase">FRIENDS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Race a Friend</h2>
            <p className="text-slate-500 text-sm mb-4">Create private lobby.</p>
            <div className="flex items-center text-neon-green font-bold text-sm group-hover:gap-2 transition-all">
                CREATE <ChevronRight size={16} />
            </div>
        </div>
      </div>

      {/* Stats Overview - Enhanced Interaction */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-abyss p-6 rounded-xl border border-slate-200 dark:border-white/5 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 cursor-default hover:border-neon-green/30 hover:shadow-lg hover:shadow-neon-green/5 group">
            <div className="flex items-center gap-2 mb-2">
                <Award className="text-neon-green group-hover:scale-110 transition-transform" size={16} />
                <h3 className="text-slate-500 font-bold uppercase text-xs">Rank</h3>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{user?.rank || 'Unranked'}</p>
            <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-neon-green shadow-[0_0_8px_#10B981]" 
                    style={{ width: `${targetProgress}%` }}
                ></div>
            </div>
             <p className="text-xs text-slate-500 mt-1">{progressData.currentRankXP} / {progressData.rankTotalXP} XP</p>
        </div>

        <div className="bg-white dark:bg-abyss p-6 rounded-xl border border-slate-200 dark:border-white/5 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 cursor-default hover:border-neon-purple/30 hover:shadow-lg hover:shadow-neon-purple/5 group">
             <div className="flex items-center gap-2 mb-2">
                <Zap className="text-neon-purple group-hover:scale-110 transition-transform" size={16} />
                <h3 className="text-slate-500 font-bold uppercase text-xs">Best WPM</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white group-hover:text-neon-purple transition-colors">{user?.bestWpm || 0}</p>
        </div>

        <div className="bg-white dark:bg-abyss p-6 rounded-xl border border-slate-200 dark:border-white/5 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 cursor-default hover:border-neon-cyan/30 hover:shadow-lg hover:shadow-neon-cyan/5 group">
             <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-neon-cyan group-hover:scale-110 transition-transform" size={16} />
                <h3 className="text-slate-500 font-bold uppercase text-xs">Avg WPM</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white group-hover:text-neon-cyan transition-colors">{user?.avgWpm || 0}</p>
        </div>

        <div className="bg-white dark:bg-abyss p-6 rounded-xl border border-slate-200 dark:border-white/5 transform transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 cursor-default hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 group">
             <div className="flex items-center gap-2 mb-2">
                <Flame className="text-orange-500 group-hover:scale-110 transition-transform" size={16} />
                <h3 className="text-slate-500 font-bold uppercase text-xs">Streak</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white group-hover:text-orange-500 transition-colors">{user?.winStreak || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
