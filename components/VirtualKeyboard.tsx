
import React from 'react';
import { Delete, CornerDownLeft, ArrowBigUp, Keyboard as KeyboardIcon, Hash } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  targetKey?: string; // The character the user SHOULD type next
  lastPressedKey?: string;
  isCorrect?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  onKeyPress, 
  targetKey, 
  lastPressedKey,
  isCorrect 
}) => {
  // Rows mapped to your exact specification
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'BACKSPACE'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
    ['SHIFT_L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '!', '?', 'SHIFT_R'],
    ['123_L', 'SPACE', '123_R', 'ICON']
  ];

  const getKeyLabel = (key: string) => {
    switch (key) {
      case 'BACKSPACE': return <Delete size={20} />;
      case 'ENTER': return <CornerDownLeft size={20} />;
      case 'SHIFT_L':
      case 'SHIFT_R': return <ArrowBigUp size={20} />;
      case '123_L':
      case '123_R': return <span className="text-sm font-black opacity-60">123</span>;
      case 'ICON': return <KeyboardIcon size={20} className="opacity-60" />;
      case 'SPACE': return null; // Space has a custom interior design
      default: return key;
    }
  };

  const isTarget = (key: string) => {
    if (!targetKey) return false;
    const target = targetKey.toUpperCase();
    if (key === 'SPACE' && target === ' ') return true;
    if (key === 'BACKSPACE' && target === 'BACKSPACE') return true;
    return key === target;
  };

  const isPressed = (key: string) => {
    if (!lastPressedKey) return false;
    const pressed = lastPressedKey.toUpperCase();
    if (key === 'SPACE' && pressed === ' ') return true;
    if (key === 'BACKSPACE' && pressed === 'BACKSPACE') return true;
    if ((key === 'SHIFT_L' || key === 'SHIFT_R') && pressed === 'SHIFT') return true;
    if (key === 'ENTER' && pressed === 'ENTER') return true;
    return key === pressed;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border-2 border-neon-cyan/20 mt-8 select-none animate-fade-in shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => {
              const target = isTarget(key);
              const pressed = isPressed(key);
              const isSpace = key === 'SPACE';
              
              // Key sizing logic
              let widthClass = "w-12 h-14 md:w-14 md:h-16";
              if (key === 'BACKSPACE' || key === 'ENTER') widthClass = "w-20 md:w-24";
              if (key.includes('SHIFT')) widthClass = "w-24 md:w-28";
              if (key.includes('123')) widthClass = "w-20 md:w-24";
              if (key === 'ICON') widthClass = "w-14";
              if (isSpace) widthClass = "flex-grow max-w-[480px] min-w-[200px]";

              return (
                <button
                  key={key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    let output = key;
                    if (key === 'SPACE') output = ' ';
                    if (key === 'BACKSPACE') output = 'Backspace';
                    onKeyPress(output);
                  }}
                  className={`
                    relative flex items-center justify-center rounded-xl font-bold transition-all duration-100
                    ${widthClass}
                    bg-white/5 border-2 border-neon-cyan/30 text-white/90
                    ${target ? 'border-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.6)] z-10' : ''}
                    ${pressed ? (isCorrect ? 'bg-neon-green/40 border-neon-green scale-90 translate-y-1' : 'bg-neon-pink/40 border-neon-pink scale-90 translate-y-1') : 'active:scale-95'}
                    hover:bg-white/10 hover:border-neon-cyan/60
                  `}
                >
                  {/* Home row guides for F and J */}
                  {(key === 'F' || key === 'J') && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-neon-cyan/40 rounded-full" />
                  )}

                  <span className="text-lg md:text-xl drop-shadow-md">
                    {getKeyLabel(key)}
                  </span>

                  {isSpace && (
                    <div className="w-[80%] h-1 bg-neon-cyan/20 rounded-full blur-[1px]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center gap-10">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_10px_#06b6d4]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Target</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neon-green shadow-[0_0_10px_#10B981]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correct</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neon-pink shadow-[0_0_10px_#F43F5E]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Error</span>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
