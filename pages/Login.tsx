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
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-void p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-purple/20 rounded-full blur-[150px] animate-pulse-fast"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-abyss/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in ring-1 ring-black/5 dark:ring-white/5">
        <div className="flex flex-col items-center mb-10">
            <div className="p-5 bg-gradient-to-br from-neon-purple to-neon-pink rounded-2xl mb-6 shadow-lg shadow-neon-purple/30 transform rotate-3">
                <Keyboard className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">TYPE<span className="text-neon-cyan">ARENA</span></h1>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mt-2">SYSTEM ACCESS // REQ_AUTH</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-black/40 rounded-xl p-1 mb-8 border border-slate-200 dark:border-white/5">
            <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 active:scale-95 ${mode === 'LOGIN' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm dark:shadow-inner' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                LOGIN
            </button>
            <button 
                onClick={() => setMode('SIGNUP')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 active:scale-95 ${mode === 'SIGNUP' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm dark:shadow-inner' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                REGISTER
            </button>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 dark:text-red-400 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'SIGNUP' && (
                <div className="group relative">
                    <UserIcon className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-purple transition-colors" size={20} />
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                        placeholder="Codename"
                        required
                    />
                </div>
            )}
            <div className="group relative">
                <Mail className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-cyan transition-colors" size={20} />
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-cyan focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                    placeholder="Email Address"
                    required
                />
            </div>
            <div className="group relative">
                <Lock className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-pink transition-colors" size={20} />
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-pink focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                    placeholder="Password"
                    required
                    minLength={6}
                />
            </div>
            
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2 text-lg transform hover:-translate-y-0.5"
            >
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {mode === 'LOGIN' ? 'INITIALIZE' : 'JOIN NETWORK'}
            </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="bg-white dark:bg-abyss px-2 text-slate-500 dark:text-slate-600">Or continue as</span>
            </div>
        </div>

        <div className="text-center space-y-3">
             <p className="text-slate-500 text-xs">Don't wanna save progress?</p>
             <button 
                onClick={() => {
                    guestLogin();
                    navigate('/');
                }}
                className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition-colors active:scale-95 text-sm border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 group"
            >
                Ghost Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;