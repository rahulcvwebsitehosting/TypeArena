
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameResult, Opponent } from '../types';
import { Clock, Activity, Target, Zap } from 'lucide-react';

interface TypingEngineProps {
  text: string;
  isGameActive: boolean;
  onGameFinish: (result: GameResult) => void;
  onStatsUpdate?: (result: GameResult) => void;
  opponents?: Opponent[];
  isTimedMode?: boolean;
}

const TypingEngine: React.FC<TypingEngineProps> = ({ 
  text, 
  isGameActive, 
  onGameFinish, 
  onStatsUpdate,
  opponents, 
  isTimedMode = false 
}) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0); 
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState(0);
  const [missedChars, setMissedChars] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isGameActive) {
      setInput('');
      setStartTime(null);
      setCurrentTime(0);
      setWpm(0);
      setAccuracy(100);
      setErrors(0);
      setMissedChars({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isGameActive, text]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const calculateStats = useCallback((finalInput?: string) => {
    if (!startTime) return null;
    const currentInput = finalInput !== undefined ? finalInput : input;
    const timeElapsedMin = (Date.now() - startTime) / 60000;
    const wordsTyped = currentInput.length / 5;
    const currentWpm = timeElapsedMin > 0.01 ? Math.round(wordsTyped / timeElapsedMin) : 0;
    const totalChars = currentInput.length;
    const netAccuracy = totalChars > 0 
        ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100))
        : 100;
    
    const stats: GameResult = { 
        wpm: currentWpm, 
        accuracy: netAccuracy, 
        errors, 
        timeTaken: timeElapsedMin * 60, 
        characterStats: missedChars 
    };

    setWpm(currentWpm);
    setAccuracy(netAccuracy);

    if (onStatsUpdate) {
        onStatsUpdate(stats);
    }

    return stats;
  }, [input, startTime, errors, missedChars, onStatsUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (startTime && isGameActive) {
            calculateStats();
        }
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, isGameActive, calculateStats]);

  useEffect(() => {
    let animationFrameId: number;
    const updateTimer = () => {
        if (startTime && isGameActive) {
            setCurrentTime(Date.now() - startTime);
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    };
    if (startTime && isGameActive) {
        animationFrameId = requestAnimationFrame(updateTimer);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [startTime, isGameActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGameActive) return;
    const val = e.target.value;
    
    // Safety check: don't allow typing beyond buffer
    if (val.length > text.length) return;

    if (!startTime && val.length === 1) {
        setStartTime(Date.now());
    }

    if (val.length > input.length) {
        const charIndex = val.length - 1;
        const typedChar = val[charIndex];
        const expectedChar = text[charIndex];
        if (typedChar !== expectedChar) {
             setErrors(prev => prev + 1);
             setMissedChars(prev => ({ ...prev, [expectedChar]: (prev[expectedChar] || 0) + 1 }));
        }
    }
    
    setInput(val);

    // Auto-finish only if NOT in timed mode
    if (!isTimedMode && val.length === text.length) {
        const finalStats = calculateStats(val);
        if (finalStats) onGameFinish(finalStats);
    }
  };

  const renderText = () => {
    // Only render a window of text to keep performance high for marathon mode
    const startIndex = Math.max(0, input.length - 100);
    const endIndex = Math.min(text.length, input.length + 300);
    const visibleText = text.split('').slice(startIndex, endIndex);

    return visibleText.map((char, localIndex) => {
      const index = localIndex + startIndex;
      let className = "font-mono text-2xl lg:text-3xl transition-colors duration-75 relative ";
      const typedChar = input[index];
      
      if (index === input.length) {
        className += "bg-neon-purple/20 border-b-2 border-neon-purple text-slate-900 dark:text-white ";
        return <span key={index} className={className}>{char}</span>;
      } else if (index < input.length) {
        if (typedChar === char) {
          className += "text-neon-cyan ";
        } else {
          className += "text-red-500 bg-red-100 dark:bg-red-900/20 ";
        }
      } else {
        className += "text-slate-300 dark:text-slate-600 ";
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  const renderOpponents = () => {
    if (!opponents) return null;
    return (
        <div className="mb-6 space-y-4 p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
             <div className="space-y-1">
                 <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-neon-cyan">
                    <span>YOU</span>
                    <span className="font-mono">{wpm} WPM</span>
                 </div>
                 <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                     <div 
                        className="absolute top-0 left-0 h-full bg-neon-cyan transition-all duration-300 ease-linear"
                        style={{ width: `${(input.length / text.length) * 100}%` }}
                     ></div>
                 </div>
             </div>
             {opponents.map(opp => (
                <div key={opp.id} className="space-y-1">
                    <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>{opp.name}</span>
                        <span className="font-mono">{opp.wpm} WPM</span>
                    </div>
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-75 ease-linear"
                            style={{ 
                                width: `${opp.progress}%`, 
                                backgroundColor: opp.color
                            }}
                        ></div>
                    </div>
                </div>
             ))}
        </div>
    )
  }

  const formatSeconds = (ms: number) => Math.floor(ms / 1000).toString().padStart(2, '0');
  const formatMillis = (ms: number) => Math.floor((ms % 1000) / 10).toString().padStart(2, '0');

  // Anti-cheat handlers
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative flex flex-col items-center">
      {/* Visual Gaming Timer HUD - Hidden in Timed Mode as parent shows it better */}
      {!isTimedMode && (
        <div className={`transition-all duration-500 transform ${startTime && isGameActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90'} mb-8 w-full`}>
            <div className="flex flex-col items-center">
                <div className="relative bg-slate-900/90 dark:bg-black/80 backdrop-blur-md px-10 py-3 rounded-2xl border-b-4 border-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-6 group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neon-cyan/20 rounded-lg animate-pulse">
                            <Clock size={24} className="text-neon-cyan" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Time</span>
                            <span className="font-mono text-3xl font-black text-white tabular-nums">
                                {formatSeconds(currentTime)}<span className="text-neon-cyan animate-pulse">.</span>{formatMillis(currentTime)}
                            </span>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-slate-700"></div>

                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-neon-purple/20 rounded-lg">
                            <Activity size={24} className="text-neon-purple" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Speed</span>
                            <span className="font-mono text-3xl font-black text-white tabular-nums">{wpm} <span className="text-xs text-neon-purple font-mono uppercase">WPM</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Stats Card */}
      <div className={`w-full grid grid-cols-3 gap-1 mb-6 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner transition-all ${startTime && isGameActive ? 'opacity-50 scale-95 blur-[0.5px]' : 'opacity-100'}`}>
        <div className="bg-white dark:bg-abyss p-4 rounded-xl text-center flex flex-col items-center justify-center">
            <Zap size={14} className="text-neon-purple mb-1 opacity-50" />
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">WPM</p>
            <p className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{wpm}</p>
        </div>
        <div className="bg-white dark:bg-abyss p-4 rounded-xl text-center flex flex-col items-center justify-center">
            <Target size={14} className="text-neon-cyan mb-1 opacity-50" />
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Accuracy</p>
            <p className={`text-3xl font-black tabular-nums ${accuracy >= 95 ? 'text-neon-green' : 'text-slate-800 dark:text-white'}`}>{accuracy}%</p>
        </div>
        <div className="bg-white dark:bg-abyss p-4 rounded-xl text-center flex flex-col items-center justify-center">
            <Activity size={14} className="text-red-500 mb-1 opacity-50" />
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Errors</p>
            <p className="text-3xl font-black text-red-500 tabular-nums">{errors}</p>
        </div>
      </div>

      {renderOpponents()}

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        onContextMenu={handleContextMenu}
        className="relative min-h-[280px] p-8 md:p-12 bg-white dark:bg-abyss rounded-3xl border border-slate-200 dark:border-white/10 cursor-text shadow-xl ring-4 ring-transparent focus-within:ring-neon-purple/10 transition-all w-full overflow-hidden"
      >
        <input 
            ref={inputRef}
            type="text"
            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
            value={input}
            onChange={handleChange}
            onPaste={handlePaste}
            autoComplete="off"
            disabled={!isGameActive}
        />
        <div 
          onCopy={handleCopy}
          className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium"
        >
            {renderText()}
        </div>
        {!isGameActive && !startTime && text.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/90 rounded-3xl z-10 animate-fade-in backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neon-purple/20 flex items-center justify-center animate-bounce">
                        <Zap className="text-neon-purple" size={32} />
                    </div>
                    <p className="text-xl font-black text-slate-800 dark:text-white tracking-widest uppercase">Strike Any Key to Start</p>
                    {isTimedMode && <p className="text-xs text-neon-cyan font-bold uppercase">60 Seconds on the Clock</p>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TypingEngine;
