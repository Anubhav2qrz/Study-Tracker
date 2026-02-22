import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";

const WORK = 25 * 60;
const BREAK = 5 * 60;

export default function PomodoroTimer() {
  const [seconds, setSeconds] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = isBreak ? BREAK : WORK;
  const pct = ((total - seconds) / total) * 100;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const circumference = 2 * Math.PI * 140;

  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(isBreak ? BREAK : WORK);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [isBreak]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          if (!isBreak) setSessions((p) => p + 1);
          setIsBreak((b) => !b);
          return isBreak ? WORK : BREAK;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, isBreak]);

  return (
    <div className="space-y-8 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold">Pomodoro Timer</h2>

      <div className="flex items-center justify-center gap-3 mb-2">
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${!isBreak ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>Focus</span>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${isBreak ? "bg-success/20 text-success" : "text-muted-foreground"}`}>
          <Coffee size={14} className="inline mr-1" />Break
        </span>
      </div>

      {/* Timer ring */}
      <div className="relative w-72 h-72 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="150" cy="150" r="140"
            fill="none"
            stroke={isBreak ? "hsl(var(--success))" : "url(#timerGrad)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold tracking-wider">{mm}:{ss}</span>
          <span className="text-sm text-muted-foreground mt-2">{isBreak ? "Take a break" : "Stay focused"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="glass-card p-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(!running)}
          className="btn-glow text-primary-foreground p-5 rounded-2xl"
        >
          {running ? <Pause size={28} /> : <Play size={28} />}
        </motion.button>
        <div className="glass-card px-4 py-2 rounded-xl text-sm">
          <span className="text-muted-foreground">Sessions:</span>{" "}
          <span className="font-bold">{sessions}</span>
        </div>
      </div>
    </div>
  );
}
