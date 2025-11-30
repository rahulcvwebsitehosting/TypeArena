import React from 'react';
import { Rank } from '../types';
import { Trophy, Zap, Crown, Star } from 'lucide-react';

interface LevelUpModalProps {
  oldRank: Rank;
  newRank: Rank;
  onDismiss: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ oldRank, newRank, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={onDismiss}>
      <div className="relative flex flex-col items-center justify-center p-12 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        
        {/* Rays Background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[800px] h-[800px] bg-gradient-to-tr from-neon-purple/20 to-neon-cyan/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="w-[600px] h-[600px] border-[50px] border-dashed border-white/5 rounded-full animate-spin-slow opacity-30"></div>
            <div className="w-[400px] h-[400px] border-[2px] border-neon-cyan/20 rounded-full animate-reverse-spin opacity-50"></div>
        </div>

        {/* Main Emblem Container */}
        <div className="relative z-10 transform hover:scale-105 transition-transform duration-500 animate-[bounce_3s_infinite]">
            
            {/* Wings SVG (Left & Right) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] -z-10">
                <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                    <path d="M100,50 Q40,0 10,40 Q30,60 60,60 Q80,60 100,80 Q120,60 140,60 Q170,60 190,40 Q160,0 100,50" 
                          fill="url(#wingGrad)" opacity="0.8" />
                    <defs>
                        <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#F43F5E" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Shield Body */}
            <div className="w-48 h-56 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 rounded-[3rem] border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center justify-center relative overflow-hidden">
                {/* Glossy Overlay */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-[2.5rem] skew-y-6 transform origin-top-left"></div>
                
                {/* Inner Glow */}
                <div className="absolute inset-2 border border-white/20 rounded-[2.5rem]"></div>

                {/* Rank Icon */}
                <div className="relative z-20">
                    <Crown size={80} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse" />
                </div>
                
                {/* Particles */}
                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute bottom-10 right-10 w-1 h-1 bg-neon-cyan rounded-full animate-ping delay-300"></div>
            </div>

            {/* Star Topper */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative">
                    <Star size={48} className="fill-yellow-300 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,1)] animate-[spin_10s_linear_infinite]" />
                    <Star size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-white text-white animate-ping" />
                </div>
            </div>
        </div>

        {/* Text Banner */}
        <div className="relative z-20 mt-8 text-center space-y-2">
            <h2 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] transform -skew-x-12 animate-[fadeIn_0.5s_ease-out]">
                LEVEL UP!
            </h2>
            
            <div className="flex items-center justify-center gap-4 text-xl font-bold text-white/80">
                <span className="line-through opacity-50">{oldRank}</span>
                <Zap className="text-neon-cyan animate-pulse" />
                <span className="text-3xl text-neon-cyan drop-shadow-[0_0_10px_#06b6d4]">{newRank}</span>
            </div>
        </div>

        <button 
            onClick={onDismiss}
            className="mt-12 px-10 py-3 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
            Claim Rewards
        </button>

      </div>
    </div>
  );
};

export default LevelUpModal;
