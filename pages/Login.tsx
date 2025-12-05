import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { Keyboard, Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowRight, Zap, ShieldAlert, Play } from 'lucide-react';
import { isMockMode } from '../services/firebase';

const { useNavigate } = ReactRouterDOM;

const Login: React.FC = () => {
  const { login, signup, guestLogin } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);

  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  const addRipple = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

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
      if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmail('demo@typearena.com');
      setPassword('demo123');
      try {
          await login('demo@typearena.com', 'demo123');
          navigate('/');
      } catch (e) {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-void p-4 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150"></div>
      
      {/* Animated Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/30 rounded-full blur-[100px] animate-pulse-fast mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/30 rounded-full blur-[120px] animate-pulse mix-blend-screen" style={{ animationDuration: '4s' }}></div>
      
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltStyle}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Glow Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink rounded-[26px] blur opacity-30 animate-glow"></div>
        
        <div className="bg-white/80 dark:bg-abyss/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-10 rounded-3xl shadow-2xl relative ring-1 ring-black/5 dark:ring-white/5">
            {isMockMode && (
                <div className="absolute top-4 right-4 group z-20">
                    <ShieldAlert size={20} className="text-neon-green animate-pulse cursor-help" />
                    <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-black/90 text-neon-green text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-neon-green/30 shadow-xl">
                        <p className="font-bold mb-1">OFFLINE DEMO MODE</p>
                         Backend is simulated locally. No Internet or API Key required.
                    </div>
                </div>
            )}

            <div className="flex flex-col items-center mb-8">
                <div className="relative p-5 bg-gradient-to-br from-neon-purple to-neon-pink rounded-2xl mb-6 shadow-lg shadow-neon-purple/30 transform transition-transform hover:rotate-12 duration-300 group cursor-pointer">
                    <Keyboard className="text-white relative z-10" size={32} />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping opacity-0 group-hover:opacity-100"></div>
                </div>
                <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-lg">
                    TYPE<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple animate-pulse">ARENA</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mt-2 flex items-center gap-2">
                    <Zap size={12} className="text-neon-cyan" /> 
                    SYSTEM ACCESS // {isMockMode ? 'OFFLINE' : 'ONLINE'}
                </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-black/40 rounded-xl p-1 mb-6 border border-slate-200 dark:border-white/5">
                <button 
                    onClick={() => setMode('LOGIN')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 active:scale-95 ${mode === 'LOGIN' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm dark:shadow-inner ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    LOGIN
                </button>
                <button 
                    onClick={() => setMode('SIGNUP')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 active:scale-95 ${mode === 'SIGNUP' ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm dark:shadow-inner ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    REGISTER
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 dark:text-red-400 text-sm animate-[shake_0.5s_ease-in-out]">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'SIGNUP' && (
                    <div className="group relative transition-all duration-300">
                        <UserIcon className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-purple transition-colors duration-300 group-focus-within:scale-110" size={20} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-white/5"
                            placeholder="Codename"
                            required
                        />
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neon-purple to-transparent w-0 group-focus-within:w-full transition-all duration-500"></div>
                    </div>
                )}
                <div className="group relative transition-all duration-300">
                    <Mail className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-cyan transition-colors duration-300 group-focus-within:scale-110" size={20} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-cyan focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-white/5"
                        placeholder="Email Address"
                        required
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neon-cyan to-transparent w-0 group-focus-within:w-full transition-all duration-500"></div>
                </div>
                <div className="group relative transition-all duration-300">
                    <Lock className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-neon-pink transition-colors duration-300 group-focus-within:scale-110" size={20} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-neon-pink focus:border-transparent outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-white/5"
                        placeholder="Password"
                        required
                        minLength={6}
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neon-pink to-transparent w-0 group-focus-within:w-full transition-all duration-500"></div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    onClick={addRipple}
                    className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] flex items-center justify-center gap-2 text-lg relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    
                    {/* Ripple Effects */}
                    {ripples.map(r => (
                        <span 
                            key={r.id} 
                            className="absolute w-8 h-8 bg-white/40 rounded-full animate-click-burst pointer-events-none" 
                            style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
                        />
                    ))}

                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                    <span className="relative z-10">{mode === 'LOGIN' ? 'INITIALIZE' : 'JOIN NETWORK'}</span>
                </button>
            </form>
            
            {/* Quick Demo Login Button */}
            {isMockMode && mode === 'LOGIN' && (
                <button
                    onClick={handleDemoLogin}
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3 bg-neon-green/10 border border-neon-green/30 hover:bg-neon-green/20 text-neon-green font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm group"
                >
                    <Play size={16} className="fill-neon-green group-hover:scale-110 transition-transform" />
                    ⚡ Quick Demo Login
                </button>
            )}

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-white dark:bg-abyss px-2 text-slate-500 dark:text-slate-600">Or continue as</span>
                </div>
            </div>

            <button 
                onClick={() => {
                    guestLogin();
                    navigate('/');
                }}
                className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 text-sm border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 group hover:border-neon-cyan/50"
            >
                Ghost Access <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-neon-cyan" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;