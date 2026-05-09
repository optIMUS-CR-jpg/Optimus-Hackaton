import React, { useState, useCallback, useEffect } from 'react';
import { FileText, Save, Trash2, Search, Calendar, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Note } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotesScreen: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('cian_notes');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [activeNote, setActiveNote] = useState<Note | null>(notes[0]);

  useEffect(() => {
    localStorage.setItem('cian_notes', JSON.stringify(notes));
  }, [notes]);

  const updateContent = (content: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, content, updatedAt: new Date() };
    setActiveNote(updated);
    setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
  };

  const handleAddNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: '',
      updatedAt: new Date()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (activeNote?.id === id) {
        setActiveNote(filtered[0] || null);
      }
      return filtered;
    });
  }, [activeNote]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={handleAddNote}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Plus className="w-6 h-6 text-indigo-400" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Notas</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden custom-scrollbar">
        {notes.length > 0 ? (
          <>
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col p-4 sm:p-6 bg-slate-900/20 backdrop-blur-sm">
              <div className="mb-6 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="BUSCAR ENTRADA..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-[10px] uppercase font-bold tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {notes.map((note, i) => (
                  <motion.button
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveNote(note)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl transition-all border flex flex-col gap-2 group",
                      activeNote?.id === note.id 
                        ? "bg-slate-800/80 border-indigo-500/30 shadow-lg" 
                        : "bg-transparent border-transparent hover:bg-slate-800/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("w-1 h-1 rounded-full", activeNote?.id === note.id ? "bg-indigo-400" : "bg-slate-700")} />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-tighter text-slate-500">
                        {format(new Date(note.updatedAt), 'HH:mm')} :: {format(new Date(note.updatedAt), 'dd/MM')}
                      </span>
                    </div>
                    <p className={cn("text-xs font-medium line-clamp-2 leading-relaxed tracking-tight", activeNote?.id === note.id ? "text-white" : "text-slate-400")}>
                      {note.content || "Vacío..."}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden group">
              <textarea
                value={activeNote?.content || ''}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="COMIENZA A ESCRIBIR..."
                className="flex-1 bg-transparent resize-none text-base sm:text-lg leading-relaxed text-slate-200 placeholder:text-slate-800 focus:outline-none custom-scrollbar relative z-10 selection:bg-indigo-500/30 font-sans tracking-tight min-h-[300px]"
              />
              
              <div className="mt-8 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-600 relative z-10 border-t border-slate-800 pt-8">
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700">LEN:</span>
                    <span className="text-indigo-400">{activeNote?.content.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700">WDS:</span>
                    <span className="text-indigo-400">{(activeNote?.content.split(/\s+/).filter(Boolean).length || 0)}</span>
                  </div>
                </div>
                <div 
                  onClick={() => activeNote && handleDeleteNote(activeNote.id)}
                  className="flex items-center gap-2 group cursor-pointer hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ELIMINAR REGISTRO</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800/50">
              <Plus className="w-8 h-8 text-indigo-500/40" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">Bitácora Vacía</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">No hay registros activos. Tu bitácora está lista para recibir nuevos conocimientos.</p>
            <button 
              onClick={handleAddNote}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
            >
              Presiona '+' para crear uno nuevo
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
