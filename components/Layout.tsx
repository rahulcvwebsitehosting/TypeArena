
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Zap, User, LogOut, Terminal, Users, Layers, Code, Sun, Moon } from 'lucide-react';
import LevelUpModal from './LevelUpModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, levelUpEvent, dismissLevelUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
          active 
            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-bold' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
        }`}
      >
        <Icon size={20} className={active ? 'text-neon-purple' : ''} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-100 font-sans">
      {/* Level Up Overlay */}
      {levelUpEvent && (
          <LevelUpModal 
            oldRank={levelUpEvent.oldRank} 
            newRank={levelUpEvent.newRank} 
            onDismiss={dismissLevelUp} 
          />
      )}

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-abyss border-r border-slate-200 dark:border-white/5 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-neon-purple rounded-lg">
                <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              TYPE<span className="text-neon-cyan">ARENA</span>
            </h1>
          </div>
          
          <nav className="space-y-1">
            <NavItem to="/" icon={Trophy} label="Dashboard" />
            <NavItem to="/singleplayer" icon={Terminal} label="Practice" />
            <NavItem to="/multiplayer" icon={Users} label="Multiplayer" />
            <NavItem to="/profile" icon={User} label="Profile" />
            <NavItem to="/about" icon={Code} label="Creator" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200 dark:border-white/5 space-y-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="text-sm font-medium flex items-center gap-2">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-neon-purple' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>

          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-[120px]">{user.username}</span>
                <span className="text-xs text-slate-500">{user.rank}</span>
              </div>
              <button onClick={logout} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="block w-full py-2 text-center bg-neon-purple hover:bg-purple-600 rounded-lg text-sm font-bold text-white transition-colors">
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-abyss z-50 p-4 flex justify-between items-center border-b border-slate-200 dark:border-white/10">
         <div className="flex items-center gap-2">
            <Layers size={20} className="text-neon-purple" />
            <h1 className="text-lg font-bold">TYPE<span className="text-neon-cyan">ARENA</span></h1>
         </div>
         <div className="flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/singleplayer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-neon-purple"><Terminal size={20}/></Link>
            <Link to="/multiplayer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-neon-cyan"><Users size={20}/></Link>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
