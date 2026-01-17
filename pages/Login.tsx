
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login, signup, guestLogin } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (err: any): string => {
    if (!err) return "An unexpected error occurred.";
    if (typeof err === 'string') return err;
    
    // Try common error structures from Supabase/PostgREST
    const message = 
      err.message || 
      err.error_description || 
      (err.error && typeof err.error === 'string' ? err.error : err.error?.message) || 
      err.details || 
      err.code;

    if (typeof message === 'string' && message !== "[object Object]" && message.trim() !== "") {
      // Humanize some common codes
      if (message === 'invalid_credentials') return "Invalid email or password.";
      if (message === 'Email address is invalid') return "Please enter a valid email address.";
      if (message.includes('User already registered')) return "This email is already in use.";
      return message;
    }

    // If it's an object we couldn't parse properly, try to see if it has a string value
    const str = String(err);
    if (str !== "[object Object]" && str.trim() !== "") {
      return str;
    }

    return "Authentication failed. Please verify your connection and try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        await login(email, password);
      } else {
        if (username.trim().length < 3) {
          throw new Error("Username must be at least 3 characters long.");
        }
        await signup(email, password, username.trim());
      }
      navigate('/');
    } catch (err: any) {
      console.error('Auth Error Details:', err);
      const msg = getErrorMessage(err);
      setError(msg);
    } finally {
      setIsSubmitting(false);
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
                <p className="text-slate-500 dark:text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
                    CLOUD SYNC // SECURE ACCESS
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
                    <span className="break-words">{error}</span>
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
                    className="w-full py-3 bg-neon-purple hover:bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    <span>{mode === 'LOGIN' ? 'ENTER' : 'JOIN'}</span>
                </button>
            </form>

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
