import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Trophy, Zap, User, LogOut, Terminal, Users, Layers, Code, Sun, Moon } from 'lucide-react';
import LevelUpModal from './LevelUpModal';

const { Link, useLocation } = ReactRouterDOM;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, levelUpEvent, dismissLevelUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`group relative flex items-center gap-3 p-3 rounded-xl mb-2 transition-all duration-300 active:scale-95 overflow-hidden ${
          active 
            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/10 text-slate-800 dark:text-white border border-neon-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
        }`}
      >
        {active && (
            <div className="absolute left-0 top-0 h-full w-1 bg-neon-purple shadow-[0_0_10px_#8b5cf6]"></div>
        )}
        <Icon size={20} className={`transition-colors ${active ? 'text-neon-cyan' : 'text-slate-400 dark:text-slate-500 group-hover:text-neon-purple'}`} />
        <span className="font-medium tracking-wide">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Level Up Overlay */}
      {levelUpEvent && (
          <LevelUpModal 
            oldRank={levelUpEvent.oldRank} 
            newRank={levelUpEvent.newRank} 
            onDismiss={dismissLevelUp} 
          />
      )}

      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white/80 dark:bg-abyss/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen transition-colors duration-300">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg shadow-lg shadow-neon-purple/20">
                <Layers size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-400 dark:from-white dark:to-slate-400">TYPE</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">ARENA</span>
            </h1>
          </div>
          
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-3">Menu</div>
          <nav className="space-y-1">
            <NavItem to="/" icon={Trophy} label="Dashboard" />
            <NavItem to="/singleplayer" icon={Terminal} label="Practice Mode" />
            <NavItem to="/multiplayer" icon={Users} label="Multiplayer" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/about" icon={Code} label="Creator" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors active:scale-95"
          >
            <span className="text-sm font-bold flex items-center gap-2">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-neon-purple' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>

          {user ? (
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-neon-purple/30 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-neon-cyan transition-colors">{user.username}</span>
                <span className="text-xs text-neon-purple font-mono">{user.rank}</span>
              </div>
              <button onClick={logout} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-neon-pink transition active:scale-95">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink hover:opacity-90 rounded-xl text-sm font-bold transition active:scale-95 shadow-lg shadow-neon-purple/20 text-white">
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 dark:bg-abyss/90 backdrop-blur-md z-50 p-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
         <div className="flex items-center gap-2">
            <Layers size={20} className="text-neon-purple" />
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">TYPE<span className="text-neon-cyan">ARENA</span></h1>
         </div>
         <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 active:scale-95">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/singleplayer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-neon-purple active:scale-95"><Terminal size={20}/></Link>
            <Link to="/multiplayer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-neon-cyan active:scale-95"><Users size={20}/></Link>
            <Link to="/about" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-600 dark:text-white active:scale-95"><Code size={20}/></Link>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto mt-16 md:mt-0 relative">
        {/* Glow Orb in background (Dark mode only or subtle in light) */}
        <div className="absolute top-0 left-0 w-full h-96 bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-100"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;