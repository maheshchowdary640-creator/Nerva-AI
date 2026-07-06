import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Play, RotateCcw, Calendar, CheckCircle2, ChevronRight, SlidersHorizontal 
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  const { 
    currentDay, isAuthorized, setDay, resetSimulation, setNormalState 
  } = useSimulation();
  const location = useLocation();
  const [showControls, setShowControls] = useState(false);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Command Center';
    if (path === '/war-room') return 'AI War Room';
    if (path === '/incidents') return 'Incidents Log';
    if (path === '/signals') return 'Business Signals';
    if (path === '/policy') return 'Policy & Autonomy';
    return title;
  };

  const getTimelineLabel = (dayNum: number) => {
    switch (dayNum) {
      case 1:
      case 2:
        return 'Normal Business State';
      case 3:
        return 'Day 3 — Supplier Delay';
      case 4:
        return 'Day 4 — Inventory Warning';
      case 5:
        return 'Day 5 — Stock Crisis';
      case 6:
        return 'Day 6 — Complaint Spike';
      case 7:
        return 'Day 7 — Revenue Crisis';
      default:
        return `Day ${dayNum}`;
    }
  };

  return (
    <header className="border-b border-slate-900/60 bg-slate-950/40 backdrop-blur-md p-6 space-y-4">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <span>NERVA Network</span>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{getBreadcrumb()}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1 text-glow">
            {title}
          </h2>
        </div>

        {/* Right Info Section & Controller Toggle */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] font-semibold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Network: NERVA Demo Retail Network</span>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] font-semibold text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-violet-400 mr-1" />
            <span>Timeline: Day {currentDay}</span>
          </div>

          <button 
            onClick={() => setShowControls(!showControls)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-lg shadow-violet-600/15 border border-violet-500/20 cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Demo Console</span>
          </button>
        </div>
      </div>

      {/* Dropdown Simulation Controller */}
      {showControls && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-500/20 shadow-xl shadow-slate-950/50 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">
              Simulation Control Deck
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={setNormalState}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Normal State</span>
              </button>
              <button 
                onClick={resetSimulation}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>

          {/* Timeline Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const active = currentDay === d;
              let description = '';
              if (d === 1 || d === 2) description = 'Healthy Operations';
              else if (d === 3) description = 'Supplier Delay (52h)';
              else if (d === 4) description = 'Stock Levels Drop';
              else if (d === 5) description = '8 Key Items Stockout';
              else if (d === 6) description = 'Complaints Spike';
              else if (d === 7) description = 'Revenue Drops 35%';

              return (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border-violet-500/50 shadow-md shadow-violet-500/10'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${active ? 'text-violet-400' : 'text-slate-400'}`}>
                      Day {d}
                    </span>
                    <Play className={`h-3 w-3 ${active ? 'text-violet-400 fill-violet-400' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 mt-1 leading-tight">
                    {description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-500 flex justify-between items-center">
            <span>* Changing the day immediately triggers reactive computations for all metrics and streams in the context.</span>
            <span>Auth Status: {isAuthorized ? '🔴 Mitigated (Authorized)' : '⚪ Awaiting Action'}</span>
          </div>
        </div>
      )}
    </header>
  );
};
export default PageHeader;
