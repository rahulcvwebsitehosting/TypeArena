
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
  const [currentTime, setCurrentTime] = useState(0); 
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showKeyboard, setShowKeyboard] = useState(() => {
    const saved = localStorage.getItem('typearena_show_kb');
    // Default to false (hidden) if no preference is saved
    return saved === 'true';
  });
  
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('');
  const [lastInputCorrect, setLastInputCorrect] = useState<boolean>(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState(0);
  const [missedChars, setMissedChars] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem('typearena_show_kb', String(showKeyboard));
  }, [showKeyboard]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't register system keys as "presses" for visual feedback
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === ' ') {
        setLastKeyPressed(e.key);
      }
    };
    const handleKeyUp = () => {
      // Optional: keep it highlighed for a short burst
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const processInput = (newVal: string) => {
    if (!isGameActive) return;
    
    if (newVal.length > text.length) return;

    if (!startTime && newVal.length === 1) {
        setStartTime(Date.now());
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
        }
        
        setInput(newVal);
    } else {
        setInput(newVal);
    }

    if (!isTimedMode && newVal.length === text.length) {
        const finalStats = calculateStats(newVal);
        if (finalStats) onGameFinish(finalStats);
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
    // Auto-clear highlight after a moment
    setTimeout(() => setLastKeyPressed(''), 150);
  };

  const renderText = () => {
    const startIndex = Math.max(0, input.length - 100);
    const endIndex = Math.min(text.length, input.length + 300);
    const visibleText = text.split('').slice(startIndex, endIndex);

    return visibleText.map((char, localIndex) => {
      const index = localIndex + startIndex;
      let className = "font-mono text-2xl lg:text-3xl transition-colors duration-75 relative ";
      const typedChar = input[index];
      
      if (index === input.length) {
        className += "bg-neon-cyan/20 border-b-2 border-neon-cyan text-slate-900 dark:text-white ";
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

  const formatSeconds = (ms: number) => Math.floor(ms / 1000).toString().padStart(2, '0');
  const formatMillis = (ms: number) => Math.floor((ms % 1000) / 10).toString().padStart(2, '0');

  return (
    <div className="w-full max-w-5xl mx-auto relative flex flex-col items-center">
      
      {/* HUD Header */}
      <div className="w-full flex justify-between items-end mb-6 px-4">
        <div className="flex gap-4">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Speed</p>
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
        className="relative min-h-[200px] p-8 md:p-12 bg-white/5 backdrop-blur-md rounded-[2.5rem] border-2 border-white/10 cursor-text shadow-2xl w-full overflow-hidden transition-all focus-within:border-neon-cyan/50"
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
        <div className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium">
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
