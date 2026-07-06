import React from 'react';
import { Check, ShieldAlert, Sparkles, Clock, CircleDollarSign } from 'lucide-react';

interface StrategyCardProps {
  id: string;
  letter: string;
  title: string;
  description: string;
  cost: string;
  timeframe: string;
  successRate: number; // percentage
  policyStatus: string;
  isRecommended?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  letter,
  title,
  description,
  cost,
  timeframe,
  successRate,
  policyStatus,
  isRecommended = false,
  isSelected,
  onSelect,
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`glass-card rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer ${
        isSelected 
          ? 'border-violet-500 bg-gradient-to-br from-violet-950/25 to-indigo-950/10 shadow-lg shadow-violet-500/5' 
          : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute right-0 top-0 bg-violet-600 border-l border-b border-violet-500 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white flex items-center space-x-1 rounded-bl-xl shadow-md">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>Recommended</span>
        </div>
      )}

      {/* Top Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className={`h-7 w-7 rounded-lg border flex items-center justify-center font-black text-xs ${
            isSelected 
              ? 'bg-violet-600 border-violet-500 text-white' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {letter}
          </div>
          <h4 className="font-bold text-white text-sm tracking-wide group-hover:text-violet-300 transition-colors">
            {title}
          </h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed pr-6">
          {description}
        </p>
      </div>

      {/* Metric details */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-900/40 text-[10px] text-slate-400 font-semibold">
        <div className="flex items-center space-x-1">
          <CircleDollarSign className="h-3.5 w-3.5 text-slate-500" />
          <span>Est. Cost: <strong className="text-slate-200">{cost}</strong></span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>ETA: <strong className="text-slate-200">{timeframe}</strong></span>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`h-1.5 w-1.5 rounded-full ${
            successRate >= 90 ? 'bg-emerald-500' : (successRate >= 70 ? 'bg-amber-500' : 'bg-rose-500')
          }`} />
          <span>Success: <strong className="text-slate-200">{successRate}%</strong></span>
        </div>
      </div>

      {/* Policy and Select Status */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900/40">
        <span className="text-[9px] text-slate-500 flex items-center space-x-1">
          <ShieldAlert className="h-3 w-3" />
          <span>Policy: {policyStatus}</span>
        </span>
        
        <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
            : 'border-slate-800 text-transparent'
        }`}>
          <Check className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};
export default StrategyCard;
