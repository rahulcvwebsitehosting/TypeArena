import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Click {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#F43F5E', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

const CursorEffects: React.FC = () => {
  const [clicks, setClicks] = useState<Click[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const id = Date.now();
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      setClicks(prev => [...prev, { id, x: e.clientX, y: e.clientY, color }]);
      
      // Cleanup
      setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 600);
    };

    // mousedown provides instant feedback compared to click
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {clicks.map(click => (
        <div 
          key={click.id}
          className="absolute top-0 left-0 will-change-transform"
          style={{ transform: `translate(${click.x}px, ${click.y}px)` }}
        >
            {/* Core Flash */}
            <div 
                className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping"
                style={{ backgroundColor: click.color, animationDuration: '0.4s' }}
            ></div>
            
            {/* Expanding Ring */}
            <div 
                className="absolute w-8 h-8 rounded-full border-[3px] -translate-x-1/2 -translate-y-1/2 opacity-0 box-border"
                style={{ 
                    borderColor: click.color,
                    animation: 'expandRing 0.5s cubic-bezier(0, 0, 0.2, 1) forwards'
                }}
            ></div>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default CursorEffects;