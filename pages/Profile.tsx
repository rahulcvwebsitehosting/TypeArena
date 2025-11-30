import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getNextRankXP, XP_PER_RANK } from '../constants';
import { Trophy, Activity, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (!user) return <div>Please login</div>;

  const nextRankXp = getNextRankXP(user.xp);
  const currentLevelXp = user.xp % XP_PER_RANK;
  const progress = (currentLevelXp / XP_PER_RANK) * 100;

  const chartData = [...user.matches].reverse().map((m, i) => ({
    name: i.toString(),
    wpm: m.wpm,
    accuracy: m.accuracy
  }));

  const chartGridColor = theme === 'dark' ? '#ffffff10' : '#00000010';
  const chartTooltipBg = theme === 'dark' ? '#0F0518' : '#FFFFFF';
  const chartTooltipBorder = theme === 'dark' ? '#ffffff20' : '#00000010';
  const chartTooltipText = theme === 'dark' ? '#f8fafc' : '#0F172A';

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Header Profile Card */}
        <div className="relative overflow-hidden glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink"></div>
            
            <div className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-50 dark:bg-abyss flex items-center justify-center text-5xl font-bold text-slate-800 dark:text-white">
                     {user.username.charAt(0).toUpperCase()}
                </div>
            </div>
            
            <div className="relative z-10 flex-1 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">{user.username}</h2>
                        <p className="text-neon-cyan font-bold tracking-widest uppercase text-sm border-2 border-neon-cyan/30 inline-block px-3 py-1 rounded-full">{user.rank}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-center md:text-right bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Total XP</p>
                        <p className="text-3xl font-mono font-bold text-slate-800 dark:text-white">{user.xp}</p>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="relative h-6 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-white tracking-widest uppercase">
                        Progress to next rank
                    </div>
                </div>
            </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-8">
                    <Activity className="text-neon-purple" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">WPM History</h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                            <XAxis dataKey="name" hide />
                            <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: chartTooltipBg, 
                                    borderColor: chartTooltipBorder, 
                                    color: chartTooltipText,
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' 
                                }}
                                itemStyle={{ color: chartTooltipText }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="wpm" 
                                stroke="#8b5cf6" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorWpm)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="text-neon-cyan" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Matches</h3>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-2">
                    {user.matches.slice(0, 10).map((match, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                            <div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{match.mode}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-500">{new Date(match.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="block font-mono font-bold text-slate-800 dark:text-white text-lg group-hover:text-neon-cyan transition-colors">{match.wpm} WPM</span>
                                <span className={`text-xs font-bold ${match.accuracy > 90 ? 'text-neon-green' : 'text-yellow-500'}`}>{match.accuracy}% Acc</span>
                            </div>
                        </div>
                    ))}
                    {user.matches.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <Trophy size={32} className="opacity-20" />
                            <p>No matches played yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default Profile;