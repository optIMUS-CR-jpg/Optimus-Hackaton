import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, Plus, Trash2, Edit2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { CalendarEvent } from '../types';

interface CalendarScreenProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ events, onAddEvent, onDeleteEvent, onUpdateEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showAllEvents, setShowAllEvents] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleManualAdd = () => {
    if (!newEventTitle.trim()) return;
    
    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        title: newEventTitle,
        date: parseLocalDate(newEventDate),
      });
    } else {
      onAddEvent({
        id: Date.now().toString(),
        title: newEventTitle,
        date: parseLocalDate(newEventDate),
        type: 'manual'
      });
    }
    
    setNewEventTitle('');
    setIsAddingEvent(false);
    setEditingEvent(null);
  };

  const handleEditClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDate(format(event.date, 'yyyy-MM-dd'));
    setIsAddingEvent(true);
  };

  const detailsRef = React.useRef<HTMLDivElement>(null);

  const handleDaySelect = (day: Date) => {
    setSelectedDate(day);
    setNewEventDate(format(day, 'yyyy-MM-dd'));
    if (window.innerWidth < 1024) { // Mobile/Tablet
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const selectedDayEvents = events.filter(e => selectedDate && isSameDay(e.date, selectedDate));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Plus className="w-6 h-6 text-indigo-400" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Calendario</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest font-bold">CAL-MGR v1.3</p>
            <p className="text-xs font-medium text-slate-400">{format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors border border-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              className="px-3 py-2 hover:bg-slate-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-400 transition-all border border-slate-800"
            >
              Hoy
            </button>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors border border-slate-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0B1120]">
        <div className="max-w-7xl mx-auto p-4 sm:p-8 flex flex-col gap-8 pb-32">
          {/* Calendario */}
          <section className="bg-slate-800/20 border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-7 mb-6">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500 pb-4 sm:pb-6">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  key={day.toString()}
                  onClick={() => handleDaySelect(day)}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center gap-1 rounded-xl transition-all border relative group cursor-pointer",
                    isSelected
                      ? "bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      : isToday(day) 
                        ? "bg-indigo-500/10 border-slate-700 text-white" 
                        : "hover:bg-slate-800/40 border-transparent text-slate-300",
                    !isSameMonth(day, currentDate) && "opacity-10"
                  )}
                >
                  <span className={cn(
                    "text-base font-semibold", 
                    isSelected ? "text-white" : isToday(day) ? "text-indigo-400" : ""
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1 px-1">
                    {dayEvents.slice(0, 4).map(e => (
                      <div key={e.id} className={cn(
                        "w-2 h-0.5 rounded-full",
                        e.type === 'ai' ? "bg-indigo-400" : "bg-purple-400"
                      )} />
                    ))}
                    {dayEvents.length > 4 && <div className="w-1 h-0.5 bg-slate-600 rounded-full" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

          {/* Detalles y Análisis */}
          <div ref={detailsRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <h3 className="font-bold uppercase tracking-widest text-[9px]">Análisis de Carga</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'SELECCIONA'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic opacity-80">
                  {selectedDayEvents.length > 0 
                    ? `Tienes ${selectedDayEvents.length} pendientes para esta fecha. Mantén el enfoque.`
                    : "Día despejado. Buen momento para adelantar proyectos o descansar."}
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col bg-slate-800/20 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                    {showAllEvents ? 'Agenda Completa (Total)' : 'Pendientes del Día'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                    {showAllEvents ? `${events.length} Registros` : selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : ''}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAllEvents(!showAllEvents)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border w-fit",
                    showAllEvents 
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                      : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                  )}
                >
                  {showAllEvents ? 'Ver Solo Hoy' : 'Ver Agenda Completa'}
                </button>
              </div>
              
              <div className="flex-1 space-y-3">
                {(showAllEvents ? events : selectedDayEvents).length > 0 ? (
                  (showAllEvents ? [...events].sort((a, b) => a.date.getTime() - b.date.getTime()) : selectedDayEvents).map(event => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={event.id} 
                      className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-4 group hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                      <div className={cn(
                        "w-1 h-6 rounded-full",
                        event.type === 'ai' ? "bg-indigo-500" : "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                      )} />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">{event.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">
                          {format(event.date, showAllEvents ? 'dd MMM · HH:mm' : 'HH:mm', { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                          className="p-2 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                          className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <CalendarIcon className="w-12 h-12 text-slate-800 mb-6 opacity-20" />
                    <p className="text-sm font-medium text-slate-500 max-w-[200px] leading-relaxed">
                      {showAllEvents ? "Tu agenda está vacía por ahora." : "Día libre de compromisos, CIAN no detecta pendientes."}
                    </p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsAddingEvent(true)}
                className="w-full py-5 border border-dashed border-slate-700 rounded-xl text-indigo-400/80 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-xs font-bold uppercase tracking-widest mt-8"
              >
                + AGREGAR PENDIENTE A {selectedDate ? format(selectedDate, "d MMM", { locale: es }) : 'ESTE DÍA'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Añadir Evento */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                {editingEvent ? 'Editar Pendiente' : 'Nuevo Pendiente'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddingEvent(false);
                  setEditingEvent(null);
                }} 
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Descripción</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Ej: Examen de Historia..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Fecha</label>
                <input 
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all [color-scheme:dark]"
                />
              </div>
              <button 
                onClick={handleManualAdd}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-xs mt-4"
              >
                {editingEvent ? 'Guardar Cambios' : 'Añadir al Calendario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
