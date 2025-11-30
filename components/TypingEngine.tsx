import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameResult, Opponent } from '../types';

interface TypingEngineProps {
  text: string;
  isGameActive: boolean;
  onGameFinish: (result: GameResult) => void;
  opponents?: Opponent[];
}

const TypingEngine: React.FC<TypingEngineProps> = ({ text, isGameActive, onGameFinish, opponents }) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stats tracking
  const [errors, setErrors] = useState(0);
  const [missedChars, setMissedChars] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isGameActive) {
      setInput('');
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
      setErrors(0);
      setMissedChars({});
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isGameActive, text]);

  // Keep focus on input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const calculateStats = useCallback(() => {
    if (!startTime) return;
    const timeElapsedMin = (Date.now() - startTime) / 60000;
    const wordsTyped = input.length / 5;
    const currentWpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;
    
    // Calculate net accuracy
    const totalChars = input.length;
    const netAccuracy = totalChars > 0 
        ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100))
        : 100;

    setWpm(currentWpm);
    setAccuracy(netAccuracy);
  }, [input, startTime, errors]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (startTime && isGameActive && input.length < text.length) {
            calculateStats();
        }
    }, 500);
    return () => clearInterval(interval);
  }, [startTime, isGameActive, input.length, text.length, calculateStats]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGameActive) return;

    const val = e.target.value;
    
    // Start timer on first char
    if (!startTime && val.length === 1) {
      setStartTime(Date.now());
    }

    // Check for new errors
    if (val.length > input.length) {
        const charIndex = val.length - 1;
        const typedChar = val[charIndex];
        const expectedChar = text[charIndex];

        if (typedChar !== expectedChar) {
             setErrors(prev => prev + 1);
             setMissedChars(prev => ({
                 ...prev,
                 [expectedChar]: (prev[expectedChar] || 0) + 1
             }));
        }
    }

    setInput(val);

    if (val.length === text.length) {
        const endTime = Date.now();
        const timeTaken = (endTime - (startTime || endTime)) / 1000;
        
        // Final Calc (same logic as running calc)
        const finalWpm = Math.round((val.length / 5) / (timeTaken / 60));
        const finalAcc = val.length > 0 
            ? Math.max(0, Math.round(((val.length - errors) / val.length) * 100))
            : 100;

        onGameFinish({
            wpm: finalWpm,
            accuracy: finalAcc,
            errors,
            timeTaken,
            characterStats: missedChars
        });
    }
  };

  // Render text with high-contrast highlighting
  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = "font-mono text-2xl lg:text-3xl transition-all duration-75 relative ";
      const typedChar = input[index];

      if (index === input.length) {
        // Cursor position
        className += "text-slate-800 dark:text-white bg-neon-purple/50 animate-pulse rounded-sm z-10 shadow-[0_0_10px_rgba(139,92,246,0.8)] ";
        return <span key={index} className={`${className} border-b-2 border-neon-purple`}>{char}</span>;
      } else if (index < input.length) {
        if (typedChar === char) {
          className += "text-neon-cyan/90 dark:text-neon-cyan/90 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)] ";
        } else {
          className += "text-neon-pink bg-neon-pink/10 underline decoration-neon-pink decoration-2 decoration-wavy ";
        }
      } else {
        className += "text-slate-400 dark:text-slate-700 ";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  // Render Opponent Bars
  const renderOpponents = () => {
    if (!opponents) return null;
    return (
        <div className="mb-8 space-y-6 p-6 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
             {/* Player's Bar (You) */}
             <div className="space-y-2">
                 <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-neon-cyan">
                    <span className="flex items-center gap-2">
                        YOU 
                        {input.length === text.length && <span className="text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded border border-neon-green/20">FINISHED</span>}
                    </span>
                    <div className="flex gap-4 font-mono">
                         <span>{accuracy}% ACC</span>
                         <span>{wpm} WPM</span>
                    </div>
                 </div>
                 <div className="relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                     <div 
                        className="absolute top-0 left-0 h-full bg-neon-cyan shadow-[0_0_10px_#06b6d4] transition-all duration-300 ease-linear"
                        style={{ width: `${(input.length / text.length) * 100}%` }}
                     ></div>
                 </div>
             </div>

             {opponents.map(opp => (
                <div key={opp.id} className="space-y-2">
                    <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                            {opp.name}
                            {opp.isFinished && <span className="text-neon-green bg-neon-green/10 px-1.5 py-0.5 rounded border border-neon-green/20">FINISHED</span>}
                        </span>
                        <div className="flex gap-4 font-mono opacity-80">
                            <span>{opp.accuracy}% ACC</span>
                            <span>{opp.wpm} WPM</span>
                        </div>
                    </div>
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-75 ease-linear opacity-80"
                            style={{ 
                                width: `${opp.progress}%`, 
                                backgroundColor: opp.color,
                                boxShadow: `0 0 8px ${opp.color}`
                            }}
                        >
                            {/* Shiny leading edge */}
                            <div className="absolute top-0 right-0 h-full w-1 bg-white/50 shadow-[0_0_8px_white]"></div>
                        </div>
                    </div>
                </div>
             ))}
        </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* HUD */}
      <div className="flex justify-between items-center mb-8 p-6 glass-panel rounded-2xl border-neon-purple/20">
        <div className="text-center w-1/3 border-r border-slate-200 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Speed (WPM)</p>
            <p className="text-4xl lg:text-5xl font-black text-neon-cyan drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{wpm}</p>
        </div>
        <div className="text-center w-1/3 border-r border-slate-200 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Accuracy</p>
            <p className={`text-4xl lg:text-5xl font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] ${accuracy >= 95 ? 'text-neon-green' : accuracy >= 80 ? 'text-yellow-500 dark:text-yellow-400' : 'text-neon-pink'}`}>
                {accuracy}%
            </p>
        </div>
        <div className="text-center w-1/3">
            <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Errors</p>
            <p className="text-4xl lg:text-5xl font-black text-neon-pink drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">{errors}</p>
        </div>
      </div>

      {renderOpponents()}

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative min-h-[250px] p-8 md:p-12 glass-panel rounded-3xl shadow-2xl cursor-text ring-1 ring-slate-200 dark:ring-white/10 hover:ring-neon-purple/50 transition-all bg-white/50 dark:bg-black/40"
      >
        {/* Hidden Input */}
        <input 
            ref={inputRef}
            type="text"
            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
            value={input}
            onChange={handleChange}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            disabled={!isGameActive}
        />
        
        {/* Visual Text Overlay */}
        <div className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium">
            {renderText()}
        </div>

        {!isGameActive && !startTime && text.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-3xl z-10">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2 animate-pulse">SYSTEM READY</p>
                    <p className="text-neon-purple font-mono text-sm">[ Type to initialize ]</p>
                </div>
            </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
        <span>MODE: {opponents ? 'MULTIPLAYER_SYNC' : 'SINGLE_THREAD'}</span>
        <span>STATUS: {isGameActive ? 'RECORDING' : 'IDLE'}</span>
      </div>
    </div>
  );
};

export default TypingEngine;