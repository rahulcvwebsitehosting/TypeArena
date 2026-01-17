
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameResult, Opponent } from '../types';
import { Clock } from 'lucide-react';

interface TypingEngineProps {
  text: string;
  isGameActive: boolean;
  onGameFinish: (result: GameResult) => void;
  opponents?: Opponent[];
}

const TypingEngine: React.FC<TypingEngineProps> = ({ text, isGameActive, onGameFinish, opponents }) => {
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

  const calculateStats = useCallback(() => {
    if (!startTime) return;
    const timeElapsedMin = (Date.now() - startTime) / 60000;
    const wordsTyped = input.length / 5;
    const currentWpm = timeElapsedMin > 0 ? Math.round(wordsTyped / timeElapsedMin) : 0;
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

  useEffect(() => {
    let animationFrameId: number;
    const updateTimer = () => {
        if (startTime && isGameActive && input.length < text.length) {
            setCurrentTime(Date.now() - startTime);
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    };
    if (startTime && isGameActive) {
        animationFrameId = requestAnimationFrame(updateTimer);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [startTime, isGameActive, input.length, text.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGameActive) return;
    const val = e.target.value;
    if (!startTime && val.length === 1) setStartTime(Date.now());
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
    if (val.length === text.length) {
        const endTime = Date.now();
        const timeTaken = (endTime - (startTime || endTime)) / 1000;
        const finalWpm = Math.round((val.length / 5) / (timeTaken / 60));
        const finalAcc = val.length > 0 
            ? Math.max(0, Math.round(((val.length - errors) / val.length) * 100))
            : 100;
        onGameFinish({ wpm: finalWpm, accuracy: finalAcc, errors, timeTaken, characterStats: missedChars });
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
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

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {startTime && isGameActive && (
        <div className="flex justify-center mb-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded font-mono text-xl">
                <Clock size={20} className="text-neon-cyan" />
                <span>{formatSeconds(currentTime)}.{formatMillis(currentTime)}</span>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-abyss rounded-lg border border-slate-200 dark:border-white/5">
        <div className="text-center w-1/3 border-r border-slate-100 dark:border-white/5">
            <p className="text-slate-500 text-xs uppercase font-bold">WPM</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{wpm}</p>
        </div>
        <div className="text-center w-1/3 border-r border-slate-100 dark:border-white/5">
            <p className="text-slate-500 text-xs uppercase font-bold">ACC</p>
            <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-green-500' : 'text-slate-800 dark:text-white'}`}>{accuracy}%</p>
        </div>
        <div className="text-center w-1/3">
            <p className="text-slate-500 text-xs uppercase font-bold">ERR</p>
            <p className="text-3xl font-bold text-red-500">{errors}</p>
        </div>
      </div>

      {renderOpponents()}

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative min-h-[200px] p-8 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/10 cursor-text shadow-sm"
      >
        <input 
            ref={inputRef}
            type="text"
            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
            value={input}
            onChange={handleChange}
            autoComplete="off"
            disabled={!isGameActive}
        />
        <div className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium">
            {renderText()}
        </div>
        {!isGameActive && !startTime && text.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-xl z-10">
                <p className="text-lg font-bold text-slate-500">Tap here to start</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TypingEngine;
