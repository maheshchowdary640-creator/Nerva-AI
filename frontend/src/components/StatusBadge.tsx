import React from 'react';

type StatusType = 
  | 'OPTIMAL' | 'HEALTHY' | 'NORMAL'
  | 'WARNING' | 'ALERT'
  | 'CRITICAL' | 'DANGER'
  | 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVING' | 'RESOLVED'
  | 'AUTO_EXECUTE' | 'MANAGER_APPROVAL' | 'CFO_APPROVAL' | 'HUMAN_ONLY'
  | 'low' | 'medium' | 'high' | 'critical'
  | 'STRATEGY_RECOMMENDED' | 'AWAITING_POLICY_CHECK'
  | 'AUTONOMOUS_EXECUTION_PERMITTED' | 'APPROVAL_REQUIRED' | 'ACTION_BLOCKED';

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = (): { bg: string; text: string; border: string; glow: string; label: string } => {
    switch (status.toUpperCase()) {
      case 'OPTIMAL':
      case 'HEALTHY':
      case 'NORMAL':
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          glow: 'shadow-emerald-500/10',
          label: status === 'OPTIMAL' || status === 'HEALTHY' || status === 'NORMAL' ? 'Optimal' : 'Resolved'
        };
      case 'WARNING':
      case 'ALERT':
      case 'INVESTIGATING':
      case 'MANAGER_APPROVAL':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          glow: 'shadow-amber-500/10',
          label: status === 'INVESTIGATING' ? 'Investigating' : (status === 'MANAGER_APPROVAL' ? 'Manager Approval' : 'Warning')
        };
      case 'CRITICAL':
      case 'DANGER':
      case 'DETECTED':
      case 'MITIGATING':
      case 'RESOLVING':
      case 'CFO_APPROVAL':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          glow: 'shadow-rose-500/10',
          label: status === 'DETECTED' ? 'Detected' : (status === 'MITIGATING' ? 'Mitigating' : (status === 'RESOLVING' ? 'Resolving' : (status === 'CFO_APPROVAL' ? 'CFO Approval' : 'Critical')))
        };
      case 'AUTO_EXECUTE':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          glow: 'shadow-indigo-500/10',
          label: 'Auto Execute'
        };
      case 'STRATEGY_RECOMMENDED':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          glow: 'shadow-indigo-500/10',
          label: 'Strategy Recommended'
        };
      case 'AWAITING_POLICY_CHECK':
        return {
          bg: 'bg-violet-500/10',
          text: 'text-violet-400',
          border: 'border-violet-500/20',
          glow: 'shadow-violet-500/10',
          label: 'Awaiting Policy Check'
        };
      case 'AUTONOMOUS_EXECUTION_PERMITTED':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          glow: 'shadow-emerald-500/10',
          label: 'Autonomous Execution Permitted'
        };
      case 'APPROVAL_REQUIRED':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          glow: 'shadow-amber-500/10',
          label: 'Approval Required'
        };
      case 'ACTION_BLOCKED':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          glow: 'shadow-rose-500/10',
          label: 'Action Blocked'
        };
      case 'HUMAN_ONLY':
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-300',
          border: 'border-slate-500/20',
          glow: 'shadow-slate-500/5',
          label: 'Human Only'
        };
      case 'LOW':
        return {
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          border: 'border-slate-500/10',
          glow: '',
          label: 'Low'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/15',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          glow: '',
          label: 'Medium'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15',
          text: 'text-orange-400',
          border: 'border-orange-500/20',
          glow: '',
          label: 'High'
        };
      default:
        return {
          bg: 'bg-slate-800',
          text: 'text-slate-400',
          border: 'border-slate-700',
          glow: '',
          label: status
        };
    }
  };

  const { bg, text, border, glow, label } = getStyle();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${bg} ${text} ${border} ${glow} backdrop-blur-md`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${text.replace('text-', 'bg-')}`} />
      {label}
    </span>
  );
};
