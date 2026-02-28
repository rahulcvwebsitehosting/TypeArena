
import React, { useState, useEffect } from 'react';
import { Difficulty, GameMode, GameResult } from '../types';
import { generatePracticeText } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import ResultDashboard from '../components/ResultDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Terminal, RefreshCw } from 'lucide-react';

const SinglePlayer: React.FC = () => {
  const { addMatch, user } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [result, setResult] = useState<GameResult | null>(null);

  const loadGame = async () => {
    setLoading(true);
    setGameState('IDLE');
    setResult(null);
    const newText = await generatePracticeText(difficulty);
    setText(newText);
    setLoading(false);
    setGameState('PLAYING');
  };

  useEffect(() => {
    loadGame();
  }, [difficulty]);

  const handleFinish = async (res: GameResult) => {
    setResult(res);
    setGameState('FINISHED');
    addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.SINGLE_PLAYER,
        difficulty: difficulty,
        errors: res.errors
    }, 50);
  };

  if (gameState === 'FINISHED' && result) {
      return (
        <ResultDashboard 
            result={result} 
            userRankPos={1} // Practice is always personal victory if finished
            leaderboard={[{ id: 'user', name: user?.username || 'You', wpm: result.wpm, accuracy: result.accuracy, rank: 1, isUser: true }]} 
            playerName={user?.username || 'Player'}
            onAction={(a) => a === 'REPLAY' ? loadGame() : navigate('/')}
        />
      );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Terminal className="text-neon-purple" size={32} /> Tactical Practice
        </h2>
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
            {Object.values(Difficulty).map((d) => (
                <button
                    key={d}
                    onClick={() => !loading && difficulty !== d && setDifficulty(d)}
                    disabled={loading}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest ${
                        difficulty === d ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20 scale-105' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    {d}
                </button>
            ))}
            <button
                onClick={() => !loading && loadGame()}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-black transition-all uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center"
                title="Refresh Paragraph"
            >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
            <Loader2 className="animate-spin text-neon-purple mb-4" size={48} />
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Synthesizing Challenge...</p>
        </div>
      ) : (
        <TypingEngine 
            text={text}
            isGameActive={gameState === 'PLAYING'}
            onGameFinish={handleFinish}
        />
      )}
    </div>
  );
};

export default SinglePlayer;
