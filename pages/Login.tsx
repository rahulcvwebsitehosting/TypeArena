
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight, Zap, Play } from 'lucide-react';
import { isMockMode } from '../services/firebase';

const Login: React.FC = () => {
  const { login, signup, guestLogin } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        if (username.length < 3) throw new Error("Username must be at least 3 characters");
        await signup(email, password, username);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let msg = "Failed to authenticate";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/user-not-found') msg = "Account not found. Please register first.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already registered. Please login.";
      if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
          await login('demo@typearena.com', 'demo123');
          navigate('/');
      } catch (e) {
          try {
             await signup('demo@typearena.com', 'demo123', 'Demo_Player');
             navigate('/');
          } catch(err) {
             setError("Demo login failed.");
             setIsSubmitting(false);
          }
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-void p-4">
      <div className="w-full max-w-md bg-white dark:bg-abyss border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center mb-8">
                <div className="p-4 bg-neon-purple rounded-xl mb-4 text-white">
                    <Keyboard size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                    TYPE<span className="text-neon-cyan">ARENA</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-xs mt-2">
                    SYSTEM ACCESS // {isMockMode ? 'OFFLINE' : 'ONLINE'}
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-black/20 rounded-lg p-1 mb-6">
                <button 
                    onClick={() => { setMode('LOGIN'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'LOGIN' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-500'}`}
                >
                    LOGIN
                </button>
                <button 
                    onClick={() => { setMode('SIGNUP'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'SIGNUP' ? 'bg-white dark:bg-white/10 shadow-sm' : 'text-slate-500'}`}
                >
                    REGISTER
                </button>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} className="mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'SIGNUP' && (
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-neon-purple transition-colors"
                            placeholder="Codename"
                            required
                        />
                    </div>
                )}
                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-neon-cyan transition-colors"
                        placeholder="Email Address"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-neon-pink transition-colors"
                        placeholder="Password"
                        required
                        minLength={6}
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-neon-purple hover:bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    <span>{mode === 'LOGIN' ? 'ENTER' : 'JOIN'}</span>
                </button>
            </form>
            
            {/* Quick Demo Login Button */}
            {isMockMode && mode === 'LOGIN' && (
                <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                    className="w-full mt-3 py-2 bg-neon-green/10 border border-neon-green/30 hover:bg-neon-green/20 text-neon-green font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <Play size={14} /> Quick Demo Login
                </button>
            )}

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-white dark:bg-abyss px-2 text-slate-500">Or continue as</span>
                </div>
            </div>

            <button 
                onClick={() => {
                    guestLogin();
                    navigate('/');
                }}
                className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold rounded-lg transition-colors text-sm border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2"
            >
                Ghost Access <ArrowRight size={16} />
            </button>
      </div>
    </div>
  );
};

export default Login;
