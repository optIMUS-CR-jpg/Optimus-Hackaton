export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: Date;
}

export type MatrixQuadrant = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

export interface Task {
  id: string;
  title: string;
  quadrant: MatrixQuadrant;
  completed: boolean;
}

export interface Note {
  id: string;
  content: string;
  updatedAt: Date;
}

export interface CognitiveProfile {
  planificacion: number;
  memoria: number;
  enfoque: number;
  flexibilidad: number;
  organizacion: number;
  testCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'manual' | 'ai';
  description?: string;
}
