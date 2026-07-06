import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  highlightColor?: 'default' | 'violet' | 'emerald' | 'rose' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  highlightColor = 'default',
}) => {
  const getColorClasses = () => {
    switch (highlightColor) {
      case 'violet':
        return {
          glow: 'group-hover:shadow-violet-500/10',
          border: 'border-violet-500/10 group-hover:border-violet-500/20',
          text: 'text-violet-400',
          iconBg: 'bg-violet-950/40 text-violet-400 border-violet-500/20',
        };
      case 'emerald':
        return {
          glow: 'group-hover:shadow-emerald-500/10',
          border: 'border-emerald-500/10 group-hover:border-emerald-500/20',
          text: 'text-emerald-400',
          iconBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20',
        };
      case 'rose':
        return {
          glow: 'group-hover:shadow-rose-500/10',
          border: 'border-rose-500/10 group-hover:border-rose-500/20',
          text: 'text-rose-400',
          iconBg: 'bg-rose-950/40 text-rose-400 border-rose-500/20',
        };
      case 'amber':
        return {
          glow: 'group-hover:shadow-amber-500/10',
          border: 'border-amber-500/10 group-hover:border-amber-500/20',
          text: 'text-amber-400',
          iconBg: 'bg-amber-950/40 text-amber-400 border-amber-500/20',
        };
      default:
        return {
          glow: 'group-hover:shadow-indigo-500/5',
          border: 'border-slate-900 group-hover:border-slate-800',
          text: 'text-indigo-400',
          iconBg: 'bg-slate-900/80 text-slate-400 border-slate-800',
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`glass-card rounded-2xl p-5 border ${colors.border} flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-lg ${colors.glow}`}>
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {title}
        </span>
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shadow-inner ${colors.iconBg}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="text-3xl font-extrabold text-white tracking-tight leading-none">
          {value}
        </div>
        
        <div className="flex items-center justify-between pt-1">
          {trend ? (
            <div className="flex items-center space-x-1.5">
              {trend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              )}
              <span className={`text-xs font-bold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-[10px] text-slate-500 font-medium">
                  {trend.label}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium leading-none">
              {subtext}
            </span>
          )}
          
          {/* Custom SVG sparkline simulation to fill space and look highly premium */}
          <div className="h-6 w-16 opacity-40">
            <svg viewBox="0 0 40 10" className="w-full h-full">
              <path 
                d={trend?.isPositive 
                  ? "M0,9 Q10,7 20,4 T40,1" 
                  : "M0,2 Q10,3 20,6 T40,9"
                } 
                fill="none" 
                stroke={trend?.isPositive ? "#34d399" : "#f43f5e"} 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MetricCard;
