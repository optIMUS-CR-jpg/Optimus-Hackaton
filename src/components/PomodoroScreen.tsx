import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee, Settings2, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const PomodoroScreen: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [totalSessions, setTotalSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      setTotalSessions(prev => prev + 1);
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Temporizador</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest font-bold uppercase">ZEN-CHRONO v1.0</p>
            <p className="text-xs font-medium text-slate-400">SESIONES: {totalSessions}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 pb-24 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className="flex gap-2 sm:gap-4 p-1 sm:p-1.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 sm:mb-12 shadow-xl shrink-0 mt-2 sm:mt-0">
          <button 
            onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={cn(
              "px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              mode === 'work' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Foco
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={cn(
              "px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              mode === 'break' ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
            )}
          >
            Descanso
          </button>
        </div>

        <div className="relative w-full max-w-[240px] sx:max-w-[280px] sm:max-w-md aspect-square flex items-center justify-center mb-6 sm:mb-12 shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="45%" className="stroke-slate-800/40 fill-none" strokeWidth="8" />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              className={cn("fill-none transition-colors duration-1000", mode === 'work' ? "stroke-indigo-500" : "stroke-purple-500")}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ type: 'spring', damping: 20 }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={timeLeft}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="text-6xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter"
              >
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 font-mono text-[8px] sm:text-[10px] font-bold tracking-widest">
              {mode === 'work' ? 'ESTADO_FLUJO' : 'RECUPERACIÓN'}
            </div>
          </div>
        </div>

        <button 
          onClick={toggleTimer}
          className="mb-6 px-10 sm:px-12 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all text-[10px] sm:text-xs border border-indigo-400/30 shrink-0"
        >
          {isActive ? 'Detener Sesión' : 'Iniciar Pomodoro'}
        </button>

        <div className="flex items-center gap-12 shrink-0">
          <button 
            onClick={resetTimer}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all active:scale-90"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </main>
    </div>
  );
};
