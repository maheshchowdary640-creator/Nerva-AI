import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SignalHealthCardProps {
  name: string;
  health: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  anomalies: number;
  lastUpdated: string;
  icon: LucideIcon;
  subMetricLabel: string;
  subMetricValue: string;
  sparklinePath: string;
}

export const SignalHealthCard: React.FC<SignalHealthCardProps> = ({
  name,
  health,
  status,
  anomalies,
  lastUpdated,
  icon: Icon,
  subMetricLabel,
  subMetricValue,
  sparklinePath,
}) => {
  const getBorderColor = () => {
    if (status === 'CRITICAL') return 'border-rose-500/20 hover:border-rose-500/30 shadow-rose-950/5';
    if (status === 'WARNING') return 'border-amber-500/20 hover:border-amber-500/30 shadow-amber-950/5';
    return 'border-slate-900 hover:border-slate-800 shadow-indigo-950/5';
  };

  const getGlowColor = () => {
    if (status === 'CRITICAL') return 'rgba(244, 63, 94, 0.05)';
    if (status === 'WARNING') return 'rgba(245, 158, 11, 0.05)';
    return 'rgba(99, 102, 241, 0.02)';
  };

  const getStrokeColor = () => {
    if (status === 'CRITICAL') return '#f43f5e';
    if (status === 'WARNING') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div 
      className={`glass-card rounded-2xl p-5 border ${getBorderColor()} transition-all duration-300 relative overflow-hidden group shadow-lg flex flex-col justify-between`}
      style={{
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.02), 0 4px 20px 0 ${getGlowColor()}`
      }}
    >
      {/* Background radial highlight */}
      <div 
        className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity duration-300 group-hover:opacity-20 pointer-events-none"
        style={{
          background: getStrokeColor()
        }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
            status === 'CRITICAL' 
              ? 'bg-rose-950/30 text-rose-400 border-rose-500/20' 
              : status === 'WARNING'
                ? 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
          }`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide text-sm">
              {name}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              Updated {lastUpdated}
            </span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Health Value Section */}
      <div className="mt-5 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
            Node Health
          </span>
          <span className={`text-3xl font-black tracking-tight ${
            status === 'CRITICAL' 
              ? 'text-rose-400 text-glow' 
              : status === 'WARNING'
                ? 'text-amber-400'
                : 'text-emerald-400'
          }`}>
            {health}%
          </span>
        </div>

        {/* Local Stream Metric */}
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
            {subMetricLabel}
          </span>
          <span className="text-sm font-extrabold text-slate-300">
            {subMetricValue}
          </span>
        </div>
      </div>

      {/* Sparkline Visual & Details */}
      <div className="mt-4 pt-3 border-t border-slate-900/40 flex items-center justify-between">
        <div className="text-[10px] font-bold text-slate-400 flex items-center space-x-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${
            anomalies > 0 
              ? 'bg-rose-500 animate-pulse' 
              : 'bg-emerald-500'
          }`} />
          <span>{anomalies > 0 ? `${anomalies} Anomaly Detected` : 'Operational Baseline'}</span>
        </div>

        <div className="h-6 w-20">
          <svg viewBox="0 0 50 15" className="w-full h-full">
            <path 
              d={sparklinePath} 
              fill="none" 
              stroke={getStrokeColor()} 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
export default SignalHealthCard;
