
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
    if (key === 'SPACE') return (
      <div className="flex flex-col items-center gap-1 w-full max-w-[320px]">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-opacity duration-300 ${isKeyActive('SPACE') ? 'opacity-100' : 'opacity-20'}`}></div>
        </div>
        <span className="text-[8px] font-black tracking-[0.6em] text-white/30 uppercase">Space</span>
      </div>
    );
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
    <div className="w-full max-w-3xl mx-auto p-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 mt-8 select-none animate-fade-in shadow-2xl">
      <div className="space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const active = isKeyActive(key);
              const isSpace = key === 'SPACE';
              const isBS = key === 'BS';
              
              return (
                <button
                  key={key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onKeyPress(key === 'BS' ? 'Backspace' : key === 'SPACE' ? ' ' : key);
                  }}
                  className={`
                    flex items-center justify-center rounded-lg font-bold transition-all duration-75
                    ${isSpace ? 'px-12 flex-grow max-w-[450px] min-w-[200px]' : 'w-10 h-12 md:w-12 md:h-14'}
                    ${isBS ? 'w-16 bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-300'}
                    ${active 
                      ? `${isSpace ? 'bg-neon-cyan shadow-[0_0_20px_rgba(6,182,212,0.6)]' : 'bg-neon-purple shadow-[0_0_15px_rgba(139,92,246,0.6)]'} scale-95 text-white translate-y-0.5` 
                      : 'hover:bg-white/10 hover:border-white/20 border border-transparent'}
                  `}
                >
                  <span className={`${isSpace ? 'w-full' : 'text-sm md:text-base'}`}>{getKeyLabel(key)}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-8 text-[10px] uppercase font-black tracking-widest text-slate-500">
        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_5px_#8B5CF6]"></div> Standard</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#06B6D4]"></div> Space</span>
        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10"></div> Idle</span>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
