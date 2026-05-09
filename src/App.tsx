/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavOverlay } from './components/NavOverlay';
import { Sidebar } from './components/Sidebar';
import { ChatScreen } from './components/ChatScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { EisenhowerScreen } from './components/EisenhowerScreen';
import { NotesScreen } from './components/NotesScreen';
import { PomodoroScreen } from './components/PomodoroScreen';
import { RadarScreen } from './components/RadarScreen';
import { ChatSession, ChatMessage, Task, CognitiveProfile, CalendarEvent } from './types';
import { X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  // Persistencia: Cargar datos iniciales
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('cian_sessions');
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: '1', 
        title: 'Plan de Estudio Mayo', 
        messages: [
          { role: 'assistant', content: 'Hola, soy CIAN. Tu asistente inteligente de productividad. ¿Cómo puedo optimizar tu día hoy?', timestamp: new Date() }
        ], 
        updatedAt: new Date() 
      }
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('cian_tasks');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('cian_events');
    if (saved) {
      return JSON.parse(saved).map((e: any) => ({ ...e, date: new Date(e.date) }));
    }
    return [
      { id: '1', title: 'Examen de Arquitectura', date: new Date(), type: 'manual' },
      { id: '2', title: 'Plan CIAN: Estudio Intensivo', date: new Date(), type: 'ai' },
    ];
  });

  const [profile, setProfile] = useState<CognitiveProfile>(() => {
    const saved = localStorage.getItem('cian_profile');
    if (saved) return JSON.parse(saved);
    return {
      planificacion: 0,
      memoria: 0,
      enfoque: 0,
      flexibilidad: 0,
      organizacion: 0,
      testCompleted: false
    };
  });

  const handleResetProfile = useCallback(() => {
    const defaultProfile = {
      planificacion: 0,
      memoria: 0,
      enfoque: 0,
      flexibilidad: 0,
      organizacion: 0,
      testCompleted: false
    };
    setProfile(defaultProfile);
    localStorage.removeItem('cian_profile');
    
    // Iniciar nuevo chat para reiniciar test
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'Nuevo Diagnóstico',
      messages: [{ role: 'assistant', content: 'Protocolo de reinicio completado. Hola, soy CIAN. Para optimizar tu día, necesito diagnosticar tu perfil cognitivo. ¿Comenzamos con el test? Responde con un número del 1 (Nunca) al 5 (Siempre).', timestamp: new Date() }],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setActiveTab(0);
  }, []);

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0]?.id || '1');

  // Guardado automático
  useEffect(() => {
    localStorage.setItem('cian_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('cian_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('cian_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cian_profile', JSON.stringify(profile));
  }, [profile]);

  // Sincronización: Si un evento en el calendario es "Hoy" o "Mañana",
  // muévelo automáticamente al cuadrante "Urgente e Importante" de la Matriz.
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const limit = new Date(today);
    limit.setDate(today.getDate() + 1); // Mañana
    limit.setHours(23, 59, 59, 999);
    
    const urgentEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && eventDate <= limit;
    });

    setTasks(prev => {
      let updated = [...prev];
      let changed = false;

      urgentEvents.forEach(event => {
        if (!updated.find(t => t.id === `auto-${event.id}`)) {
          updated.push({
            id: `auto-${event.id}`,
            title: event.title,
            quadrant: 'urgent-important',
            completed: false
          });
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [events]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleUpdateSession = useCallback((messages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages, updatedAt: new Date() } 
        : s
    ));
  }, [currentSessionId]);

  const handleNewChat = useCallback(() => {
    setShowNewChatModal(true);
  }, []);

  const confirmNewChat = () => {
    if (!newChatName.trim()) return;
    
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: newChatName,
      messages: [{ role: 'assistant', content: `Nueva sesión "${newChatName}" iniciada. ¿En qué trabajamos ahora?`, timestamp: new Date() }],
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setNewChatName('');
    setShowNewChatModal(false);
    setActiveTab(0);
  };

  const handleDeleteSession = useCallback((sessionId: string) => {
    if (sessions.length <= 1) return;
    
    const sessionToDelete = sessions.find(s => s.id === sessionId);
    if (!sessionToDelete) return;

    // Sincronización: Eliminar también de la matriz
    setTasks(prev => prev.filter(t => t.title !== sessionToDelete.title));
    
    const newSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(newSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(newSessions[0].id);
    }
  }, [sessions, currentSessionId]);

  const renderScreen = () => {
    switch (activeTab) {
      case 0: return (
        <ChatScreen 
          onOpenMenu={() => setIsSidebarOpen(true)} 
          currentSession={currentSession} 
          onUpdateSession={handleUpdateSession} 
          events={events}
          tasks={tasks}
          onAction={(type, data) => {
            if (type === 'CREATE_EVENT') {
              const [year, month, day] = data.date.split('-').map(Number);
              const eventDate = new Date(year, month - 1, day);
              setEvents(prev => [...prev, { id: Date.now().toString(), title: data.title, date: eventDate, type: 'ai' }]);
            } else if (type === 'DELETE_EVENT') {
              setEvents(prev => prev.filter(e => !e.title.toLowerCase().includes(data.title.toLowerCase())));
            } else if (type === 'CREATE_TASK') {
              setTasks(prev => [...prev, { id: Date.now().toString(), title: data.title, quadrant: data.quadrant || 'important-not-urgent', completed: false }]);
            } else if (type === 'DELETE_TASK') {
              setTasks(prev => prev.filter(t => !t.title.toLowerCase().includes(data.title.toLowerCase())));
            } else if (type === 'UPDATE_PROFILE') {
              setProfile({ ...data, testCompleted: true });
            } else if (type === 'NAVIGATE') {
              setActiveTab(data.tab);
            } else if (type === 'CREATE_NOTE') {
              // Note handling logic
            }
          }}
        />
      );
      case 1: return (
        <CalendarScreen 
          events={events} 
          onAddEvent={(e) => setEvents(prev => [...prev, e])} 
          onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} 
          onUpdateEvent={(updated) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))}
        />
      );
      case 2: return <EisenhowerScreen sessions={sessions} tasks={tasks} setTasks={setTasks} />;
      case 3: return <NotesScreen />;
      case 4: return <PomodoroScreen />;
      case 5: return <RadarScreen profile={profile} onReset={handleResetProfile} />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#0B1120] text-white selection:bg-white/20 select-none overflow-hidden flex flex-col font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 relative z-10 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full overflow-hidden"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <NavOverlay 
        currentTab={activeTab} 
        totalTabs={6} 
        onTabChange={setActiveTab} 
      />

      {/* Modal Nueva Sesión */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B1120]/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Nueva Sesión</h3>
                <button onClick={() => setShowNewChatModal(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Nombre del proyecto..."
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmNewChat()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all mb-6"
              />
              <button 
                onClick={confirmNewChat}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-xs"
              >
                Crear Sesión
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

