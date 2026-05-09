import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'motion/react';
import { CognitiveProfile } from '../types';
import { Brain, Activity, Target, Zap, RotateCcw } from 'lucide-react';

interface RadarScreenProps {
  profile: CognitiveProfile;
  onReset: () => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({ profile, onReset }) => {
  const data = [
    { subject: 'Planificación', value: profile.planificacion, fullMark: 5 },
    { subject: 'Memoria', value: profile.memoria, fullMark: 5 },
    { subject: 'Enfoque', value: profile.enfoque, fullMark: 5 },
    { subject: 'Flexibilidad', value: profile.flexibilidad, fullMark: 5 },
    { subject: 'Organización', value: profile.organizacion, fullMark: 5 },
  ];

  const numericValues = [
    profile.planificacion,
    profile.memoria,
    profile.enfoque,
    profile.flexibilidad,
    profile.organizacion
  ];
  
  const totalScore = numericValues.reduce((a, b) => a + b, 0);
  const average = totalScore / numericValues.length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0B1120]">
      <header className="flex items-center justify-between px-4 sm:px-8 py-6 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-6">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center">
            CIAN <span className="opacity-80 ml-2 sm:ml-3">Perfil Cognitivo</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-indigo-400 font-mono tracking-widest font-bold uppercase">KIVIAT-DIAGRAM v1.0</p>
            <p className="text-xs font-medium text-slate-400">ESTADO: ANALIZADO</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square w-full bg-slate-900/40 rounded-3xl border border-slate-800 p-4 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]} 
                  tick={false} 
                  axisLine={false}
                />
                <Radar
                  name="Perfil"
                  dataKey="value"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Promedio General" value={average.toFixed(1)} icon={Activity} color="text-indigo-400" />
              <StatCard title="Puntos Totales" value={totalScore.toString()} icon={Target} color="text-emerald-400" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-slate-800 pb-3">Análisis de Capacidades</h3>
              <div className="space-y-4">
                {data.map((item) => (
                  <div key={item.subject} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                      <span className="text-slate-400">{item.subject}</span>
                      <span className="text-white">{item.value}/5</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / 5) * 100}%` }}
                        className="h-full bg-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onReset}
              className="w-full py-4 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar Evaluación
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-sm">
    <div className="flex items-center gap-3 mb-2">
      <Icon className={cn("w-4 h-4", color)} />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
  </div>
);

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
