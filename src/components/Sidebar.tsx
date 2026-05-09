import React from 'react';
import { MessageSquare, Plus, History, X, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-[#0F172A] border-r border-slate-800 z-[70] p-6 flex flex-col gap-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <History className="w-3.5 h-3.5 opacity-50" />
                Índice :: Historial
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => { onNewChat(); onClose(); }}
              className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-indigo-500 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/10 text-[10px] sm:text-xs"
            >
              <Plus className="w-4 h-4" />
              Nueva Sesión
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "w-full p-4 rounded-xl transition-all flex items-center gap-3 border border-transparent group relative",
                    currentSessionId === session.id 
                      ? "bg-slate-800 border-slate-700 text-indigo-400" 
                      : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
                  )}
                >
                  <button 
                    onClick={() => { onSelectSession(session.id); onClose(); }}
                    className="flex-1 flex items-center gap-3 text-left overflow-hidden"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate text-xs font-bold uppercase tracking-tight">{session.title}</span>
                  </button>
                  
                  {sessions.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">
                  AI
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema CIAN</span>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">Operativo // 0X01</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
