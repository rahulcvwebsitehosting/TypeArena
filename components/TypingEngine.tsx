
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameResult, Opponent } from '../types';
import { Clock, Activity, Target, Zap, Keyboard, Monitor, Eye, EyeOff } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';

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
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showKeyboard, setShowKeyboard] = useState(() => {
    const saved = localStorage.getItem('typearena_show_kb');
    return saved === 'true';
  });
  
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');
  const [lastInputCorrect, setLastInputCorrect] = useState<boolean>(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const [errors, setErrors] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [missedChars, setMissedChars] = useState<Record<string, number>>({});
  const [confusionMap, setConfusionMap] = useState<Record<string, number>>({});
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);

  useEffect(() => {
    localStorage.setItem('typearena_show_kb', String(showKeyboard));
  }, [showKeyboard]);

  useEffect(() => {
    if (isGameActive) {
      setInput('');
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
      setErrors(0);
      setBackspaces(0);
      setMissedChars({});
      setConfusionMap({});
      setWpmHistory([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isGameActive, text]);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [input.length]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const calculateStats = useCallback((finalInput?: string, overrideStartTime?: number) => {
    const effectiveStartTime = overrideStartTime || startTime;
    if (!effectiveStartTime) return null;
    
    const currentInput = finalInput !== undefined ? finalInput : input;
    const now = Date.now();
    const timeElapsedSec = (now - effectiveStartTime) / 1000;
    const timeElapsedMin = timeElapsedSec / 60;
    
    if (timeElapsedSec < 0.2) return null; // Avoid division by zero or jitter at start

    const totalChars = currentInput.length;
    
    /**
     * STANDARD WPM FORMULA:
     * Gross WPM = (All typed characters / 5) / time (min)
     * Net WPM = Gross WPM - (Errors / time (min))
     */
    const grossWpm = (totalChars / 5) / timeElapsedMin;
    const errorRate = errors / timeElapsedMin;
    const netWpm = Math.max(0, Math.round(grossWpm - errorRate));

    const netAccuracy = totalChars > 0 
        ? Math.max(0, Math.round(((totalChars - errors) / totalChars) * 100))
        : 100;
    
    const stats: GameResult = { 
        wpm: netWpm, 
        accuracy: netAccuracy, 
        errors, 
        timeTaken: timeElapsedSec, 
        totalChars,
        backspaces,
        rawWpm: Math.round(grossWpm),
        wpmHistory,
        confusionMap,
        characterStats: missedChars 
    };

    return stats;
  }, [input, startTime, errors, backspaces, missedChars, confusionMap, wpmHistory]);

  // WPM Sampler for Graph
  useEffect(() => {
    if (!startTime || !isGameActive) return;

    const interval = setInterval(() => {
      const stats = calculateStats();
      if (stats) {
        setWpmHistory(prev => [
          ...prev, 
          { time: Math.round((Date.now() - startTime) / 1000), wpm: stats.wpm }
        ]);
        setWpm(stats.wpm);
        setAccuracy(stats.accuracy);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [startTime, isGameActive, calculateStats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        setBackspaces(prev => prev + 1);
        setLastKeyPressed('Backspace');
      } else if (e.key.length === 1 || e.key === 'Enter' || e.key === ' ') {
        setLastKeyPressed(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const processInput = (newVal: string) => {
    if (!isGameActive) return;
    if (newVal.length > text.length) return;

    let currentStartTime = startTime;
    if (!startTime && newVal.length === 1) {
        currentStartTime = Date.now();
        setStartTime(currentStartTime);
    }

    if (newVal.length > input.length) {
        const charIndex = newVal.length - 1;
        const typedChar = newVal[charIndex];
        const expectedChar = text[charIndex];
        
        const match = typedChar === expectedChar;
        setLastInputCorrect(match);

        if (!match) {
             setErrors(prev => prev + 1);
             setMissedChars(prev => ({ ...prev, [expectedChar]: (prev[expectedChar] || 0) + 1 }));
             
             const confusionKey = `${expectedChar.toLowerCase()}→${typedChar.toLowerCase()}`;
             setConfusionMap(prev => ({
                ...prev,
                [confusionKey]: (prev[confusionKey] || 0) + 1
             }));
        }
    }
    
    setInput(newVal);

    // Immediate state synchronization
    const latestStats = calculateStats(newVal, currentStartTime);
    if (latestStats) {
        setWpm(latestStats.wpm);
        setAccuracy(latestStats.accuracy);
        if (onStatsUpdate) onStatsUpdate(latestStats);
        
        if (newVal.length === text.length) {
            onGameFinish(latestStats);
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value);
  };

  const handleVirtualKeyPress = (key: string) => {
    if (!isGameActive) return;
    if (key === 'Backspace') {
      processInput(input.slice(0, -1));
    } else if (key.length === 1 || key === ' ') {
      processInput(input + key);
    }
    setLastKeyPressed(key);
    setTimeout(() => setLastKeyPressed(''), 150);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = "font-mono text-2xl lg:text-3xl transition-colors duration-75 relative ";
      const typedChar = input[index];
      
      if (index === input.length) {
        className += "bg-neon-cyan/20 border-b-2 border-neon-cyan text-slate-900 dark:text-white ";
        return <span key={index} ref={activeCharRef} className={className}>{char}</span>;
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

  return (
    <div className="w-full max-w-5xl mx-auto relative flex flex-col items-center">
      <div className="w-full flex justify-between items-end mb-6 px-4">
        <div className="flex gap-4">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Net WPM</p>
                <p className="text-2xl font-mono font-black text-neon-purple">{wpm} <span className="text-xs">WPM</span></p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Accuracy</p>
                <p className="text-2xl font-mono font-black text-neon-cyan">{accuracy}%</p>
            </div>
        </div>

        <button 
          onClick={() => setShowKeyboard(!showKeyboard)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showKeyboard ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan' : 'bg-white/5 border-white/10 text-slate-500'}`}
        >
          {showKeyboard ? <Eye size={16} /> : <EyeOff size={16} />}
          {showKeyboard ? 'Hide Virtual Keyboard' : 'Show Virtual Keyboard'}
        </button>
      </div>

      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative min-h-[200px] max-h-[50vh] p-8 md:p-12 bg-white/5 backdrop-blur-md rounded-[2.5rem] border-2 border-white/10 cursor-text shadow-2xl w-full overflow-y-auto scrollbar-hide transition-all focus-within:border-neon-cyan/50"
      >
        <input 
            ref={inputRef}
            type="text"
            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
            value={input}
            onChange={handleChange}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            disabled={!isGameActive}
        />
        <div className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium pb-8">
            {renderText()}
        </div>
        {!isGameActive && !startTime && text.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="text-neon-cyan animate-bounce" size={48} />
                    <p className="text-2xl font-black text-white tracking-widest uppercase italic">Ready to Race?</p>
                </div>
            </div>
        )}
      </div>

      {showKeyboard && (
        <VirtualKeyboard 
          onKeyPress={handleVirtualKeyPress} 
          targetKey={text[input.length]} 
          lastPressedKey={lastKeyPressed}
          isCorrect={lastInputCorrect}
        />
      )}
    </div>
  );
};

export default TypingEngine;
