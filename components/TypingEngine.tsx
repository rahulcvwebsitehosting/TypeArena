import React, { useState, useEffect, useRef, useCallback } from "react";
import { GameResult, Opponent } from "../types";
import {
  Clock,
  Activity,
  Target,
  Zap,
  Keyboard,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react";
import VirtualKeyboard from "./VirtualKeyboard";

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
  isTimedMode = false,
}) => {
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showKeyboard, setShowKeyboard] = useState(() => {
    const saved = localStorage.getItem("typearena_show_kb");
    return saved === "true";
  });

  const [lastKeyPressed, setLastKeyPressed] = useState<string>("");
  const [lastInputCorrect, setLastInputCorrect] = useState<boolean>(true);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputValRef = useRef(""); // Track latest input to avoid stale state
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  
  const backspacesRef = useRef(0);
  const missedCharsRef = useRef<Record<string, number>>({});
  const confusionMapRef = useRef<Record<string, number>>({});
  const wpmHistoryRef = useRef<{ time: number; wpm: number }[]>([]);

  // Normalize text to handle newlines and special whitespace from Gemini
  const normalizedText = React.useMemo(() => {
    return text.replace(/\s+/g, " ").trim();
  }, [text]);

  useEffect(() => {
    localStorage.setItem("typearena_show_kb", String(showKeyboard));
  }, [showKeyboard]);

  useEffect(() => {
    if (isGameActive) {
      setInput("");
      inputValRef.current = "";
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
      backspacesRef.current = 0;
      missedCharsRef.current = {};
      confusionMapRef.current = {};
      wpmHistoryRef.current = [];
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isGameActive, normalizedText]);

  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      activeCharRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [input.length]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const calculateStats = useCallback(
    (currentInput: string, overrideStartTime?: number) => {
      const effectiveStartTime = overrideStartTime || startTime;
      if (!effectiveStartTime) return null;

      const now = Date.now();
      const timeElapsedSec = (now - effectiveStartTime) / 1000;
      const timeElapsedMin = timeElapsedSec / 60;

      if (timeElapsedSec < 0.2) return null;

      const totalChars = currentInput.length;
      if (totalChars === 0) return null;

      // Calculate errors by comparing full input to normalized text
      let currentErrors = 0;
      for (let i = 0; i < totalChars; i++) {
        if (currentInput[i] !== normalizedText[i]) {
          currentErrors++;
        }
      }

      /**
       * STANDARD WPM FORMULA:
       * Gross WPM = (All typed characters / 5) / time (min)
       * Net WPM = Gross WPM - (Errors / time (min))
       */
      const grossWpm = totalChars / 5 / timeElapsedMin;
      const errorRate = currentErrors / timeElapsedMin;
      const netWpm = Math.max(0, Math.round(grossWpm - errorRate));

      const netAccuracy = Math.max(
        0,
        Math.round(((totalChars - currentErrors) / totalChars) * 100),
      );

      const stats: GameResult = {
        wpm: netWpm,
        accuracy: netAccuracy,
        errors: currentErrors,
        timeTaken: timeElapsedSec,
        totalChars,
        backspaces: backspacesRef.current,
        rawWpm: Math.round(grossWpm),
        wpmHistory: [...wpmHistoryRef.current],
        confusionMap: { ...confusionMapRef.current },
        characterStats: { ...missedCharsRef.current },
      };

      return stats;
    },
    [
      startTime,
      normalizedText,
    ],
  );

  // WPM Sampler for Graph
  useEffect(() => {
    if (!startTime || !isGameActive) return;

    const interval = setInterval(() => {
      const stats = calculateStats(inputValRef.current);
      if (stats) {
        wpmHistoryRef.current.push({
          time: Math.round((Date.now() - startTime) / 1000),
          wpm: stats.wpm,
        });
        setWpm(stats.wpm);
        setAccuracy(stats.accuracy);
        
        // Broadcast stats periodically in multiplayer
        if (onStatsUpdate) {
          onStatsUpdate({ ...stats, wpmHistory: [...wpmHistoryRef.current] });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isGameActive, calculateStats, onStatsUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        backspacesRef.current += 1;
        setLastKeyPressed("Backspace");
      } else if (e.key.length === 1 || e.key === "Enter" || e.key === " ") {
        setLastKeyPressed(e.key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const processInput = (newVal: string) => {
    if (!isGameActive) return;
    if (newVal.length > normalizedText.length) return;

    const oldVal = inputValRef.current;
    inputValRef.current = newVal;
    setInput(newVal);

    let currentStartTime = startTime;
    if (!startTime && newVal.length === 1) {
      currentStartTime = Date.now();
      setStartTime(currentStartTime);
    }

    if (newVal.length > oldVal.length) {
      const charIndex = newVal.length - 1;
      const typedChar = newVal[charIndex];
      const expectedChar = normalizedText[charIndex];

      const match = typedChar === expectedChar;
      setLastInputCorrect(match);

      if (!match) {
        missedCharsRef.current[expectedChar] = (missedCharsRef.current[expectedChar] || 0) + 1;

        const expectedDisplay = expectedChar === " " ? "SPACE" : expectedChar.toLowerCase();
        const typedDisplay = typedChar === " " ? "SPACE" : typedChar.toLowerCase();
        const confusionKey = `${expectedDisplay}→${typedDisplay}`;
        
        confusionMapRef.current[confusionKey] = (confusionMapRef.current[confusionKey] || 0) + 1;
      }
    }

    // Immediate state synchronization
    const latestStats = calculateStats(newVal, currentStartTime || undefined);
    if (latestStats) {
      setWpm(latestStats.wpm);
      setAccuracy(latestStats.accuracy);
      // We don't call onStatsUpdate here to avoid spamming the network in multiplayer
      // It is handled by the 1-second interval instead

      if (newVal.length === normalizedText.length) {
        if (onStatsUpdate) onStatsUpdate(latestStats);
        onGameFinish(latestStats);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    processInput(e.target.value);
  };

  const handleVirtualKeyPress = (key: string) => {
    if (!isGameActive) return;
    
    const currentInput = inputValRef.current;
    let nextInput = currentInput;

    if (key === "Backspace") {
      nextInput = currentInput.slice(0, -1);
    } else if (key.length === 1 || key === " ") {
      let charToType = key;
      const expectedChar = normalizedText[currentInput.length];
      
      // Smart case-matching for virtual keyboard
      if (expectedChar && key.length === 1 && key !== " ") {
        if (expectedChar.toLowerCase() === key.toLowerCase()) {
          charToType = expectedChar;
        }
      }
      
      nextInput = currentInput + charToType;
    }

    processInput(nextInput);
    setLastKeyPressed(key);
    setTimeout(() => setLastKeyPressed(""), 150);
  };

  const handleVirtualKeyPressRef = useRef(handleVirtualKeyPress);
  useEffect(() => {
    handleVirtualKeyPressRef.current = handleVirtualKeyPress;
  });

  const stableHandleVirtualKeyPress = useCallback((key: string) => {
    handleVirtualKeyPressRef.current(key);
  }, []);

  const renderText = () => {
    return normalizedText.split("").map((char, index) => {
      let className =
        "font-mono text-xl md:text-2xl lg:text-3xl transition-colors duration-75 relative ";
      const typedChar = input[index];

      if (index === input.length) {
        className +=
          "bg-neon-cyan/20 border-b-2 border-neon-cyan text-slate-900 dark:text-white ";
        return (
          <span key={index} ref={activeCharRef} className={className}>
            {char}
          </span>
        );
      } else if (index < input.length) {
        if (typedChar === char) {
          className += "text-neon-cyan ";
        } else {
          className += "text-red-500 bg-red-100 dark:bg-red-900/20 ";
        }
      } else {
        className += "text-slate-300 dark:text-slate-600 ";
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative flex flex-col items-center">
      <div className="w-full flex justify-between items-end mb-6 px-4">
        <div className="flex gap-4">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
              Net WPM
            </p>
            <p className="text-2xl font-mono font-black text-neon-purple">
              {wpm} <span className="text-xs">WPM</span>
            </p>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">
              Accuracy
            </p>
            <p className="text-2xl font-mono font-black text-neon-cyan">
              {accuracy}%
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyboard(!showKeyboard)}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${showKeyboard ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan" : "bg-white/5 border-white/10 text-slate-500"}`}
        >
          {showKeyboard ? <Eye size={16} /> : <EyeOff size={16} />}
          {showKeyboard ? "Hide Virtual Keyboard" : "Show Virtual Keyboard"}
        </button>
      </div>

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative min-h-[200px] max-h-[50vh] p-6 md:p-8 lg:p-12 bg-white/5 backdrop-blur-md rounded-[2.5rem] border-2 border-white/10 cursor-text shadow-2xl w-full overflow-y-auto scrollbar-hide transition-all focus-within:border-neon-cyan/50"
      >
        <textarea
          ref={inputRef}
          className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default z-10 resize-none"
          value={input}
          onChange={handleChange}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          disabled={!isGameActive}
        />
        <div className="leading-relaxed select-none break-words whitespace-pre-wrap font-medium pb-8">
          {renderText()}
        </div>
        {!isGameActive && !startTime && normalizedText.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Zap className="text-neon-cyan animate-bounce" size={48} />
              <p className="text-2xl font-black text-white tracking-widest uppercase italic">
                Ready to Race?
              </p>
            </div>
          </div>
        )}
      </div>

      {showKeyboard && (
        <div className="hidden md:block w-full">
          <VirtualKeyboard
            onKeyPress={stableHandleVirtualKeyPress}
            targetKey={normalizedText[input.length]}
            lastPressedKey={lastKeyPressed}
            isCorrect={lastInputCorrect}
          />
        </div>
      )}
    </div>
  );
};

export default TypingEngine;
