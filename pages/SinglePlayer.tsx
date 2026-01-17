
import React, { useState, useEffect } from 'react';
import { Difficulty, GameMode, GameResult } from '../types';
import { generatePracticeText, analyzePerformance } from '../services/geminiService';
import TypingEngine from '../components/TypingEngine';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, RefreshCw, Bot, Terminal } from 'lucide-react';

const SinglePlayer: React.FC = () => {
  const { addMatch } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const [result, setResult] = useState<GameResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const loadGame = async () => {
    setLoading(true);
    setGameState('IDLE');
    setResult(null);
    setAnalysis('');
    const newText = await generatePracticeText(difficulty);
    setText(newText);
    setLoading(false);
    setGameState('PLAYING');
  };

  useEffect(() => {
    loadGame();
  }, [difficulty]);

  const handleFinish = async (res: GameResult) => {
    setGameState('FINISHED');
    setResult(res);
    addMatch({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.SINGLE_PLAYER,
        difficulty: difficulty,
        errors: res.errors
    }, 50);

    setAnalyzing(true);
    const feedback = await analyzePerformance(res);
    setAnalysis(feedback);
    setAnalyzing(false);
  };

  const [tip, hype] = analysis && analysis.includes('|') ? analysis.split('|') : [analysis, null];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Terminal className="text-neon-purple" /> Practice Zone
        </h2>
        <div className="flex gap-2 p-1 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
            {Object.values(Difficulty).map((d) => (
                <button
                    key={d}
                    onClick={() => !loading && difficulty !== d && setDifficulty(d)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                        difficulty === d ? 'bg-neon-purple text-white shadow-lg shadow-neon-purple/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                    {d}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5">
            <Loader2 className="animate-spin text-neon-purple mb-2" size={32} />
            <p className="text-slate-500 text-sm font-mono">Loading text...</p>
        </div>
      ) : (
        <TypingEngine 
            text={text}
            isGameActive={gameState === 'PLAYING'}
            onGameFinish={handleFinish}
        />
      )}

      {gameState === 'FINISHED' && result && (
          <div className="p-6 bg-white dark:bg-abyss rounded-xl border border-slate-200 dark:border-white/5 shadow-lg animate-pop-in">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Mission Complete</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg text-center transform hover:scale-105 transition-transform">
                      <p className="text-slate-500 text-xs uppercase font-bold">Speed</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.wpm}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg text-center transform hover:scale-105 transition-transform">
                      <p className="text-slate-500 text-xs uppercase font-bold">Accuracy</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.accuracy}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg text-center transform hover:scale-105 transition-transform">
                      <p className="text-slate-500 text-xs uppercase font-bold">Time</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.timeTaken.toFixed(1)}s</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg text-center transform hover:scale-105 transition-transform">
                      <p className="text-slate-500 text-xs uppercase font-bold">XP</p>
                      <p className="text-2xl font-bold text-yellow-500">+50</p>
                  </div>
              </div>

              {/* Minimal AI Coach */}
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border-l-4 border-neon-purple hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                       <Bot size={16} className="text-neon-purple"/>
                       <span className="text-xs font-bold uppercase text-slate-500">Coach Feedback</span>
                  </div>
                  {analyzing ? (
                      <span className="text-slate-400 text-sm">Analyzing...</span>
                  ) : (
                      <div className="text-sm">
                          <p className="text-slate-800 dark:text-white font-medium mb-1">{tip}</p>
                          {hype && <p className="text-slate-500 italic">{hype}</p>}
                      </div>
                  )}
              </div>

              <button 
                onClick={loadGame}
                className="w-full mt-6 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                  <RefreshCw size={18} /> Play Again
              </button>
          </div>
      )}
    </div>
  );
};

export default SinglePlayer;
