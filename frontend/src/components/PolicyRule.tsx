import React from 'react';
import { ShieldCheck, ShieldAlert, Zap } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface PolicyRuleProps {
  ruleName: string;
  threshold: string;
  action: 'AUTO_EXECUTE' | 'MANAGER_APPROVAL' | 'CFO_APPROVAL' | 'HUMAN_ONLY';
  category: 'Operations' | 'Finance' | 'Workforce' | 'Security';
}

export const PolicyRule: React.FC<PolicyRuleProps> = ({
  ruleName,
  threshold,
  action,
  category,
}) => {
  const getActionIcon = () => {
    switch (action) {
      case 'AUTO_EXECUTE':
        return <Zap className="h-4 w-4 text-indigo-400" />;
      case 'HUMAN_ONLY':
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      default:
        return <ShieldCheck className="h-4 w-4 text-amber-400" />;
    }
  };

  const getCategoryBg = () => {
    switch (category) {
      case 'Finance': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Workforce': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Security': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-900/60 hover:border-slate-850 transition-all hover:bg-slate-950/80 group">
      <div className="flex items-center space-x-3.5">
        {/* Dynamic Authority Icon */}
        <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          {getActionIcon()}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-white text-sm tracking-wide leading-none group-hover:text-indigo-400 transition-colors">
              {ruleName}
            </h4>
            <span className={`text-[9px] px-1.5 py-0.5 border rounded-md font-bold uppercase tracking-widest leading-none ${getCategoryBg()}`}>
              {category}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1.5 leading-none">
            Scope Boundary: <strong className="text-slate-400">{threshold}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <StatusBadge status={action} />
      </div>
    </div>
  );
};
export default PolicyRule;
