import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

export type AgentStatus = 'ACTIVE' | 'IDLE' | 'SIMULATING' | 'ANALYSING' | 'EXECUTING';

interface AgentNodeProps {
  name: string;
  role: string;
  status: AgentStatus;
  load: number; // 0 - 100
  isActive?: boolean;
}

export const AgentNode: React.FC<AgentNodeProps> = ({
  name,
  role,
  status,
  load,
  isActive = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'EXECUTING':
        return { text: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-950/20', dot: 'bg-indigo-500 animate-ping' };
      case 'SIMULATING':
        return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-950/20', dot: 'bg-amber-500 animate-pulse' };
      case 'ANALYSING':
        return { text: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-950/20', dot: 'bg-violet-500 animate-pulse' };
      case 'ACTIVE':
        return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-950/10', dot: 'bg-emerald-500' };
      default:
        return { text: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-900/50', dot: 'bg-slate-500' };
    }
  };

  const colors = getStatusColor();

  return (
    <div className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between shadow-md relative overflow-hidden group ${
      isActive 
        ? 'border-violet-500/40 bg-gradient-to-br from-violet-950/30 to-indigo-950/10 shadow-violet-900/5' 
        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
    }`}>
      {/* Visual background highlight */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/2 to-indigo-500/2 pointer-events-none" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
            isActive ? 'bg-violet-950/50 border-violet-500/30 text-violet-400' : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-wide text-xs leading-none">
              {name}
            </h4>
            <span className="text-[9px] text-slate-500 font-semibold block mt-1">
              {role}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Load progress bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold">
          <span>Communication Load</span>
          <span className="text-slate-400">{load}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900/60">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500" 
            style={{ width: `${load}%` }} 
          />
        </div>
      </div>
    </div>
  );
};
export default AgentNode;
