import { GameMode, GameResult, Difficulty, Opponent, Rank } from "../types";
import { generateMarathonText } from "../services/geminiService";
import TypingEngine from "../components/TypingEngine";
import ResultDashboard from "../components/ResultDashboard";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";
import {
  Loader2,
  Zap,
  Check,
  Copy,
  Lock,
  Globe,
  Users,
  User as UserIcon,
  Timer,
  Wifi,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BOT_NAMES = [
  "Speedster_99",
  "CodeNinja",
  "TypeMaster_X",
  "KeyboardWarrior",
  "FingerSlippage",
  "Glitch_Runner",
];
const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const Multiplayer: React.FC = () => {
  const { addMatch, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [lobbyMode, setLobbyMode] = useState<
    "SELECT" | "HOSTING" | "JOINED" | "SEARCHING"
  >("SELECT");
  const [status, setStatus] = useState<
    "IDLE" | "SEARCHING" | "COUNTDOWN" | "RACING" | "FINISHED"
  >("IDLE");
  const [text, setText] = useState("");
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [raceTimer, setRaceTimer] = useState(60);
  const [result, setResult] = useState<GameResult | null>(null);
  const [userRankPos, setUserRankPos] = useState(1);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const [loadingText, setLoadingText] = useState("Initializing Arena...");
  const [lobbyId, setLobbyId] = useState<string>("");
  const [peerCount, setPeerCount] = useState(0);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);
  const currentStatsRef = useRef<GameResult | null>(null);

  const calculateAdjustedWpm = (wpm: number, accuracy: number) =>
    wpm * (accuracy / 100);

  const getDifficultyByRank = (rank: Rank | undefined): Difficulty => {
    if (!rank) return Difficulty.EASY;
    const r = rank.toString();
    if (r.includes("Bronze") || r.includes("Silver")) return Difficulty.EASY;
    if (r.includes("Gold") || r.includes("Platinum")) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  };

  // BROADCAST LOCAL STATS
  const broadcastStats = (stats: GameResult) => {
    if (!channelRef.current || !user) return;
    const progress = Math.min(100, (stats.totalChars / text.length) * 100);
    channelRef.current.track({
      id: user.id,
      name: user.username,
      wpm: stats.wpm,
      progress: progress,
      accuracy: stats.accuracy,
      isFinished: stats.totalChars >= text.length,
    });
  };

  useEffect(() => {
    if (!lobbyId || !user) return;

    const channel = supabase.channel(`lobby:${lobbyId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setPeerCount(Object.keys(state).length);

        // SYNC OPPONENT DATA FROM PRESENCE
        const incomingOpponents: Opponent[] = [];
        Object.values(state).forEach((presenceArray: any) => {
          const p = presenceArray[0];
          if (p.id !== user.id) {
            incomingOpponents.push({
              id: p.id,
              name: p.name || "Rival",
              progress: p.progress || 0,
              wpm: p.wpm || 0,
              accuracy: p.accuracy || 100,
              color: COLORS[incomingOpponents.length % COLORS.length],
              isFinished: p.isFinished || false,
            });
          }
        });
        setOpponents(incomingOpponents);
      })
      .on("broadcast", { event: "START_RACE" }, (p) => {
        if (lobbyMode === "JOINED") {
          setText(p.payload.text);
          setStatus("COUNTDOWN");
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [lobbyId, user?.id, lobbyMode, text.length]);

  useEffect(() => {
    const lobby = searchParams.get("lobby");
    const mode = searchParams.get("mode");
    if (lobby) {
      setLobbyId(lobby);
      setLobbyMode("JOINED");
    } else if (mode === "host") {
      handleCreateLobby();
    } else {
      setLobbyMode("SELECT");
      setStatus("IDLE");
      setLobbyId("");
      setOpponents([]);
      setResult(null);
      setIsHost(false);
    }
  }, [searchParams]);

  const [isHost, setIsHost] = useState(false);

  const handleCreateLobby = () => {
    const id = Math.random().toString(36).substring(7).toUpperCase();
    setLobbyId(id);
    setLobbyMode("HOSTING");
    setIsHost(true);
  };

  const startMatchmaking = async () => {
    setStatus("SEARCHING");
    setLoadingText("Synthesizing Bulk Marathon Terrain...");

    // OPTIMIZED: One call instead of five
    const difficulty = getDifficultyByRank(user?.rank);
    const marathonText = await generateMarathonText(difficulty);
    setText(marathonText);

    // Simulate initial bots for ranked solo matchmaking
    const bots: Opponent[] = [];
    for (let i = 0; i < 2; i++) {
      bots.push({
        id: `bot-${i}`,
        name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
        progress: 0,
        wpm: Math.max(
          20,
          Math.floor(Math.random() * 30) + (user?.avgWpm || 40) - 10,
        ),
        accuracy: 95,
        color: COLORS[i],
        isFinished: false,
      });
    }
    setOpponents(bots);
    setStatus("COUNTDOWN");
  };

  const handleHostStart = async () => {
    setLoadingText("Finalizing Arena...");
    const difficulty = getDifficultyByRank(user?.rank);
    const marathonText = await generateMarathonText(difficulty);
    setText(marathonText);

    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "START_RACE",
        payload: { text: marathonText },
      });
    }
    setStatus("COUNTDOWN");
  };

  useEffect(() => {
    if (status === "COUNTDOWN") {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
      } else {
        setStatus("RACING");
        if (opponents.some((o) => o.id.startsWith("bot"))) startBotRace();
        startRaceClock();
      }
    }
  }, [status, countdown]);

  const startRaceClock = () => {
    clockIntervalRef.current = setInterval(() => {
      setRaceTimer((prev) => {
        if (prev <= 1) {
          clearInterval(clockIntervalRef.current!);
          handleFinish(
            currentStatsRef.current || {
              wpm: 0,
              accuracy: 100,
              errors: 0,
              timeTaken: 60,
              totalChars: 0,
              backspaces: 0,
              rawWpm: 0,
              wpmHistory: [],
              confusionMap: {},
              characterStats: {},
            },
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBotRace = () => {
    const start = Date.now();
    raceIntervalRef.current = setInterval(() => {
      setOpponents((prev) =>
        prev.map((opp) => {
          if (!opp.id.startsWith("bot")) return opp;
          // Realistic Bot Velocity with Jitter
          const elapsedMin = (Date.now() - start) / 60000;
          const jitter = 0.9 + Math.random() * 0.2; // 90% to 110% speed variance
          const currentProgress = Math.min(
            100,
            ((opp.wpm * jitter * 5 * elapsedMin) / text.length) * 100,
          );
          return {
            ...opp,
            progress: currentProgress,
            isFinished: currentProgress >= 100,
          };
        }),
      );
    }, 200);
  };

  const handleFinish = (res: GameResult) => {
    if (status === "FINISHED") return;

    if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);

    const userScore = calculateAdjustedWpm(res.wpm, res.accuracy);
    const results = [
      {
        id: "user",
        name: user?.username || "You",
        wpm: res.wpm,
        accuracy: res.accuracy,
        score: userScore,
        isUser: true,
      },
      ...opponents.map((b) => ({
        id: b.id,
        name: b.name,
        wpm: b.wpm,
        accuracy: b.accuracy,
        score: calculateAdjustedWpm(b.wpm, b.accuracy),
        isUser: false,
      })),
    ]
      .sort((a, b) => b.score - a.score)
      .map((p, i) => ({ ...p, rank: i + 1 }));

    setLeaderboard(results);
    const rank = results.find((p) => p.isUser)?.rank || results.length;
    setUserRankPos(rank);
    setResult(res);
    setStatus("FINISHED");

    addMatch(
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        wpm: res.wpm,
        accuracy: res.accuracy,
        mode: GameMode.MULTIPLAYER,
        difficulty: getDifficultyByRank(user?.rank),
        errors: res.errors,
      },
      rank === 1 ? 300 : rank === 2 ? 150 : 75,
      rank === 1,
    );
  };

  if (status === "IDLE" && lobbyMode === "SELECT") {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-4xl font-black italic mb-12">ARENA SELECTION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            onClick={startMatchmaking}
            className="p-12 bg-white/5 border border-white/10 rounded-3xl hover:border-neon-cyan cursor-pointer transition-all hover:-translate-y-2"
          >
            <Globe size={48} className="mx-auto mb-4 text-neon-cyan" />
            <h3 className="text-2xl font-bold">RANKED MARATHON</h3>
            <p className="text-slate-500 mt-2">60s Global Endurance</p>
          </div>
          <div
            onClick={handleCreateLobby}
            className="p-12 bg-white/5 border border-white/10 rounded-3xl hover:border-neon-purple cursor-pointer transition-all hover:-translate-y-2"
          >
            <Lock size={48} className="mx-auto mb-4 text-neon-purple" />
            <h3 className="text-2xl font-bold">PRIVATE DUEL</h3>
            <p className="text-slate-500 mt-2">1v1 Invitation Only</p>
          </div>
        </div>
      </div>
    );
  }

  if (lobbyMode === "HOSTING" && status === "IDLE") {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-8">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Wifi className="mx-auto mb-4 text-neon-cyan animate-pulse" />
          <h3 className="text-xl font-bold mb-2">Lobby Created</h3>
          <p className="text-sm text-slate-500 mb-6">
            Share the link below to invite rivals.
          </p>
          <div className="flex gap-2 p-3 bg-black/40 rounded-xl border border-white/10">
            <code className="flex-1 text-neon-cyan font-mono overflow-hidden text-ellipsis">
              {window.location.origin}/#/multiplayer?lobby={lobbyId}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/#/multiplayer?lobby=${lobbyId}`,
                );
              }}
              className="p-1 hover:text-neon-cyan transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            {peerCount} Rival(s) in Room
          </p>
          <button
            onClick={handleHostStart}
            disabled={peerCount < 2}
            className="w-full py-4 bg-neon-cyan text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            INITIATE RACE
          </button>
        </div>
      </div>
    );
  }

  if (lobbyMode === "JOINED" && status === "IDLE") {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-8">
        <div className="p-12 bg-white/5 border border-white/10 rounded-3xl">
          <Loader2
            className="mx-auto mb-6 text-neon-purple animate-spin"
            size={48}
          />
          <h3 className="text-2xl font-black uppercase tracking-widest mb-2">
            Lobby Joined
          </h3>
          <p className="text-slate-500">
            Waiting for the host to initiate the race...
          </p>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {peerCount} Rival(s) in Room
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "SEARCHING") {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin text-neon-cyan mb-6" size={64} />
        <h2 className="text-2xl font-black uppercase tracking-widest">
          {loadingText}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {status === "FINISHED" && result ? (
        <ResultDashboard
          result={result}
          userRankPos={userRankPos}
          leaderboard={leaderboard}
          playerName={user?.username || "Player"}
          onAction={(a) => {
            if (a === "REPLAY") {
              if (isHost) {
                navigate("/multiplayer?mode=host");
                window.location.reload(); // Force full reset
              } else {
                navigate("/multiplayer");
              }
            } else {
              navigate("/");
            }
          }}
        />
      ) : (
        <>
          <div className="mb-8 flex justify-between items-center border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-neon-cyan" size={24} />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                Arena Protocol
              </h2>
            </div>
            <div className="flex items-center gap-8">
              {opponents.map((opp) => (
                <div key={opp.id} className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    {opp.name}
                  </span>
                  <span className="text-lg font-mono font-black text-neon-purple">
                    {opp.wpm} <span className="text-[8px] opacity-60">WPM</span>
                  </span>
                </div>
              ))}
              <div
                className={`px-8 py-3 rounded-2xl border-2 transition-all ${raceTimer <= 10 ? "border-neon-pink bg-neon-pink/10 animate-pulse" : "border-neon-cyan bg-white/5"}`}
              >
                <span
                  className={`font-mono text-3xl font-black ${raceTimer <= 10 ? "text-neon-pink" : "text-white"}`}
                >
                  00:{raceTimer.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bars for Opponents */}
          <div className="space-y-2 mb-10">
            {opponents.map((opp) => (
              <div
                key={opp.id}
                className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5"
              >
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-300"
                  style={{
                    width: `${opp.progress}%`,
                    backgroundColor: opp.color,
                    boxShadow: `0 0 10px ${opp.color}`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <span className="text-[8px] font-black uppercase text-white/40">
                    {opp.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <TypingEngine
            text={text}
            isGameActive={status === "RACING"}
            onGameFinish={handleFinish}
            onStatsUpdate={(s) => {
              currentStatsRef.current = s;
              broadcastStats(s);
            }}
            opponents={opponents}
            isTimedMode={true}
          />

          {status === "COUNTDOWN" && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md">
              <div className="text-[15rem] font-black text-white italic animate-pop-in drop-shadow-[0_0_80px_rgba(6,182,212,0.8)]">
                {countdown > 0 ? countdown : "GO"}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Multiplayer;
