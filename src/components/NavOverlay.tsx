import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavOverlayProps {
  currentTab: number;
  totalTabs: number;
  onTabChange: (index: number) => void;
}

export const NavOverlay: React.FC<NavOverlayProps> = ({ currentTab, totalTabs, onTabChange }) => {
  const nextTab = () => onTabChange((currentTab + 1) % totalTabs);
  const prevTab = () => onTabChange((currentTab - 1 + totalTabs) % totalTabs);

  const labels = ['Chat', 'Cal', 'Matriz', 'Notas', 'Tiempo', 'Perfil'];

  return (
    <nav className="h-24 bg-[#0F172A] border-t border-slate-800 flex items-center justify-center gap-4 sm:gap-12 relative z-[80] px-4">
      <button 
        onClick={prevTab}
        className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 transition-all shadow-lg border border-slate-700 active:scale-90"
        aria-label="Pantalla anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-4 sm:gap-6">
        {Array.from({ length: totalTabs }).map((_, i) => (
          <button
            key={i}
            onClick={() => onTabChange(i)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 min-w-[3rem]",
              currentTab === i ? "scale-110" : "opacity-60 hover:opacity-100"
            )}
            aria-label={`Ir a pantalla ${i + 1}`}
          >
            <div className={cn(
              "rounded-full transition-all duration-500",
              currentTab === i 
                ? "w-3 h-3 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20" 
                : "w-2 h-2 bg-slate-700"
            )} />
            <span className={cn(
              "text-[9px] font-bold tracking-tighter uppercase",
              currentTab === i ? "text-indigo-400 font-black" : "text-slate-600"
            )}>
              {labels[i]}
            </span>
          </button>
        ))}
      </div>

      <button 
        onClick={nextTab}
        className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 transition-all shadow-lg border border-slate-700 active:scale-90"
        aria-label="Siguiente pantalla"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </nav>
  );
};
