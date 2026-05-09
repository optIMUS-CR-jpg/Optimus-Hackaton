import React, { useState } from 'react';
import { Target, AlertCircle, Clock, Zap, Plus, X, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Task, MatrixQuadrant, ChatSession } from '../types';

interface EisenhowerScreenProps {
  sessions: ChatSession[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const EisenhowerScreen: React.FC<EisenhowerScreenProps> = ({ sessions, tasks, setTasks }) => {
  const [isAddingTask, setIsAddingTask] = useState<MatrixQuadrant | null>(null);

  const quadrants: { id: MatrixQuadrant; title: string; subtitle: string; icon: any; color: string; label: string; border: string; labelBg: string }[] = [
    { id: 'urgent-important', title: 'Q1: Urgente e Importante', subtitle: 'HACER AHORA', icon: Zap, color: 'text-red-400', border: 'border-red-500/30', labelBg: 'bg-red-500/20', label: 'Q1: Urgente & Importante' },
    { id: 'important-not-urgent', title: 'Q2: Planificar / Decidir', subtitle: 'AGENDAR', icon: Clock, color: 'text-indigo-400', border: 'border-indigo-500/30', labelBg: 'bg-indigo-500/20', label: 'Q2: Importante' },
    { id: 'urgent-not-important', title: 'Q3: Delegar / Outsource', subtitle: 'DELEGAR', icon: AlertCircle, color: 'text-amber-400', border: 'border-amber-500/30', labelBg: 'bg-amber-500/20', label: 'Q3: Delegar' },
    { id: 'not-urgent-not-important', title: 'Q4: Eliminar / Ignorar', subtitle: 'DROP', icon: Target, color: 'text-slate-400', border: 'border-slate-600/30', labelBg: 'bg-slate-500/20', label: 'Q4: Eliminar' },
  ];

  const completeTask = (id: string) => {
    // Eliminación por completado: se elimina automáticamente del estado
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTask = (title: string, quadrant: MatrixQuadrant) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      quadrant,
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setIsAddingTask(null);
  };

  const currentTaskTitles = tasks.map(t => t.title);
  const availableChats = sessions.filter(s => !currentTaskTitles.includes(s.title));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Matriz Eisenhower</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest font-bold">AURA-OS v3.2</p>
            <p className="text-xs font-medium text-slate-400">Mayo 24, 2026</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 border-2 border-slate-700 shadow-xl shadow-indigo-500/10 shrink-0"></div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-[#0B1120] overflow-y-auto custom-scrollbar relative">
        {quadrants.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-slate-800/20 border rounded-2xl p-6 flex flex-col shadow-sm backdrop-blur-sm min-h-[300px]",
              q.border
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", q.color)}>
                {q.label}
              </h3>
              <span className={cn("px-2 py-0.5 text-[9px] font-bold rounded border uppercase tracking-wider", q.labelBg, q.color + "/40", q.color)}>
                {q.subtitle}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {tasks.filter(t => t.quadrant === q.id).length > 0 ? (
                tasks.filter(t => t.quadrant === q.id).map(task => (
                  <motion.div 
                    layout
                    key={task.id}
                    onClick={() => completeTask(task.id)}
                    className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Prioridad Ejecutiva</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-slate-700 group-hover:border-indigo-500 flex items-center justify-center transition-all">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 opacity-10 py-10">
                  <q.icon className="w-12 h-12 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sección Limpia</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsAddingTask(q.id)}
              className="mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Plus className="w-3.5 h-3.5" />
              Vincular Chat
            </button>
          </motion.div>
        ))}

        <AnimatePresence>
          {isAddingTask && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                    <List className="w-5 h-5 text-indigo-400" />
                    Vincular Sesión
                  </h2>
                  <button 
                    onClick={() => setIsAddingTask(null)}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Selecciona un chat activo para el cuadrante:
                    <span className="ml-2 text-indigo-400">{isAddingTask.replace('-', ' ')}</span>
                  </p>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {availableChats.length > 0 ? (
                      availableChats.map(chat => (
                        <button
                          key={chat.id}
                          onClick={() => addTask(chat.title, isAddingTask)}
                          className="w-full text-left p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group flex items-center justify-between"
                        >
                          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{chat.title}</span>
                          <Plus className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-xs text-slate-600 font-medium">No hay sesiones disponibles para vincular.</p>
                        <p className="text-[10px] text-slate-700 mt-2 uppercase tracking-widest leading-relaxed">Todas tus sesiones ya están en la matriz o no tienes sesiones creadas.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddingTask(null)}
                  className="w-full mt-8 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  Cancelar Operación
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
