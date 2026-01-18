
import React from 'react';
import { Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  activeKey?: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, activeKey }) => {
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'BS'],
    ['SPACE']
  ];

  const getKeyLabel = (key: string) => {
    if (key === 'BS') return <Delete size={18} />;
    if (key === 'SPACE') return <div className="w-48 h-1 bg-white/20 rounded-full" />;
    return key;
  };

  const isKeyActive = (key: string) => {
    if (!activeKey) return false;
    const normalizedActive = activeKey.toUpperCase();
    if (key === 'BS' && normalizedActive === 'BACKSPACE') return true;
    if (key === 'SPACE' && normalizedActive === ' ') return true;
    return key === normalizedActive;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 mt-8 select-none animate-fade-in">
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const active = isKeyActive(key);
              return (
                <button
                  key={key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onKeyPress(key === 'BS' ? 'Backspace' : key === 'SPACE' ? ' ' : key);
                  }}
                  className={`
                    flex items-center justify-center rounded-lg font-bold transition-all duration-75
                    ${key === 'SPACE' ? 'px-12 flex-grow max-w-[400px]' : 'w-10 h-12 md:w-12 md:h-14'}
                    ${key === 'BS' ? 'w-16 bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-300'}
                    ${active 
                      ? 'scale-95 bg-neon-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.6)] translate-y-0.5' 
                      : 'hover:bg-white/10 hover:border-white/20 border border-transparent'}
                  `}
                >
                  <span className="text-sm md:text-base">{getKeyLabel(key)}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-8 text-[10px] uppercase font-black tracking-widest text-slate-500">
        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_5px_#8B5CF6]"></div> Active Key</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10"></div> Idle Key</span>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
