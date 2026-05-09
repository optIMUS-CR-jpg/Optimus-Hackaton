import React, { useState, useRef, useEffect } from 'react';
import { Menu, Send, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { ChatMessage, ChatSession, CalendarEvent, Task } from '../types';
import { getChatResponse } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatScreenProps {
  onOpenMenu: () => void;
  currentSession: ChatSession;
  onUpdateSession: (messages: ChatMessage[]) => void;
  onAction: (type: string, data: any) => void;
  events: CalendarEvent[];
  tasks: Task[];
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onOpenMenu, currentSession, onUpdateSession, onAction, events, tasks }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession.messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...currentSession.messages, userMessage];
    onUpdateSession(newMessages);
    setInput('');
    setIsTyping(true);

    const context = {
      events: events.map(e => ({ title: e.title, date: format(e.date, 'yyyy-MM-dd HH:mm') })),
      tasks: tasks.map(t => ({ title: t.title, quadrant: t.quadrant, completed: t.completed })),
      currentDate: format(new Date(), 'yyyy-MM-dd EEEE')
    };

    const response = await getChatResponse(newMessages, context);
    
    // Parse actions
    let cleanResponse = response;
    const actionRegex = /\[ACTION: (\w+)\](\{.*?\})/g;
    let match;
    
    while ((match = actionRegex.exec(response)) !== null) {
      const actionType = match[1];
      try {
        const actionData = JSON.parse(match[2]);
        onAction(actionType, actionData);
        // Remove the action string from the visible response
        cleanResponse = cleanResponse.replace(match[0], '');
      } catch (e) {
        console.error("Error parsing AI action:", e);
      }
    }

    const botMessage: ChatMessage = {
      role: 'assistant',
      content: cleanResponse.trim(),
      timestamp: new Date()
    };

    onUpdateSession([...newMessages, botMessage]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={onOpenMenu}
            className="p-2.5 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Menu className="w-6 h-6 text-slate-400" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Asistente</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest font-bold uppercase">CIAN-OS v2.4</p>
            <p className="text-xs font-medium text-slate-400">SESIÓN: 0X4F2E</p>
          </div>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 p-4 sm:p-8 pb-32 custom-scrollbar scroll-smooth bg-[#0B1120]/50"
      >
        <AnimatePresence initial={false}>
          {currentSession.messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border",
                msg.role === 'user' 
                  ? "bg-slate-800 border-slate-700 text-slate-300" 
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-slate-800 border border-slate-700 text-white" 
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              )}>
                {msg.content}
                <div className="mt-2 text-[9px] font-mono font-bold text-slate-600 uppercase">
                  {format(msg.timestamp, 'HH:mm:ss')} // {msg.role.toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mr-auto"
            >
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-1 items-center">
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 py-6 bg-[#0F172A]/80 backdrop-blur-xl border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex gap-4 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl focus-within:border-indigo-500/50 transition-all">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="PREGUNTA O ESCRIBE UN COMANDO..."
            className="flex-1 bg-transparent px-4 sm:px-6 py-2 text-[12px] sm:text-sm text-white placeholder:text-slate-600 focus:outline-none font-mono uppercase tracking-widest min-w-0"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 sm:px-6 py-2 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-30 disabled:hover:bg-indigo-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest shrink-0"
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
};
