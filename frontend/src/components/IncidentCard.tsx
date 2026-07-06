import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, TrendingDown } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useSimulation } from '../context/SimulationContext';

interface IncidentCardProps {
  id: string;
  title: string;
  code: string;
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVING' | 'RESOLVED' | 'STRATEGY_RECOMMENDED' | 'AWAITING_POLICY_CHECK';
  severity: 'low' | 'medium' | 'high' | 'critical';
  revenueAtRisk: number;
  impactDecline: number;
  detectedAt: string;
  description: string;
  showButton?: boolean;
  investigationStatus?: string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  title,
  code,
  status,
  severity,
  revenueAtRisk,
  impactDecline,
  detectedAt,
  description,
  showButton = true,
  investigationStatus,
}) => {
  const navigate = useNavigate();
  const { policyDecision } = useSimulation();

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'border-rose-500/30 bg-rose-950/10 shadow-rose-950/5';
      case 'high': return 'border-orange-500/20 bg-orange-950/5 shadow-orange-950/5';
      default: return 'border-slate-900 bg-slate-950/20';
    }
  };

  return (
    <div className={`glass-card rounded-3xl p-6 border ${getSeverityColor()} relative overflow-hidden transition-all duration-300 group shadow-lg`}>
      {/* Background Pulse Glow */}
      {severity === 'critical' && status !== 'RESOLVED' && (
        <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-rose-500/5 blur-3xl animate-pulse-slow pointer-events-none" />
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            status === 'RESOLVED' 
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/25'
              : 'bg-rose-950/40 text-rose-400 border border-rose-500/25 animate-pulse'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Incident Code
              </span>
              <span className="text-xs font-extrabold text-violet-400 leading-none">
                {code}
              </span>
              {investigationStatus && (
                <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-violet-950/40 text-violet-400 border border-violet-500/20 rounded-md">
                  Agents: {investigationStatus}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide mt-1">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <StatusBadge status={status} />
          <span className="text-[10px] text-slate-500 font-semibold">{detectedAt}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed mt-4">
        {description}
      </p>

      {/* Dynamic Operational Dispatch Checklist */}
      {investigationStatus && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-900 text-[10px] space-y-2">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-900/60 pb-1.5 flex items-center justify-between">
            <span>Operational Dispatch Workflow</span>
            <span className="text-violet-400 font-extrabold">{status.replace(/_/g, ' ')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sentinel Telemetry:</span>
              <strong className="text-emerald-400 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                Complete
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Agent Investigation:</span>
              <strong className={
                investigationStatus === 'Detected' 
                  ? 'text-amber-400 flex items-center' 
                  : 'text-emerald-400 flex items-center'
              }>
                {investigationStatus === 'Detected' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />}
                {investigationStatus === 'Detected' ? 'Queued' : 'Hypothesis Generated'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recovery Simulation:</span>
              <strong className={
                status === 'AWAITING_POLICY_CHECK' || status === 'RESOLVED'
                  ? 'text-emerald-400 flex items-center' 
                  : (investigationStatus === 'Hypothesis Generated' ? 'text-amber-400 flex items-center animate-pulse' : 'text-slate-500 flex items-center')
              }>
                {status === 'AWAITING_POLICY_CHECK' || status === 'RESOLVED' ? 'Complete' : (investigationStatus === 'Hypothesis Generated' ? 'Awaiting Action' : 'Waiting')}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Recommended Action:</span>
              <strong className={
                status === 'AWAITING_POLICY_CHECK' || status === 'RESOLVED' || policyDecision
                  ? 'text-indigo-400 font-extrabold'
                  : 'text-slate-500'
              }>
                {status === 'AWAITING_POLICY_CHECK' || status === 'RESOLVED' || policyDecision ? 'Inter-Branch Stock Transfer' : 'Pending Simulation'}
              </strong>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-900/60 mt-1.5 text-slate-500 flex justify-between items-center">
            <span>Next Operational Step:</span>
            <strong className={status === 'RESOLVED' ? 'text-emerald-400 font-bold' : 'text-violet-400 font-bold'}>
              {status === 'RESOLVED' 
                ? 'Complete' 
                : (policyDecision
                    ? (policyDecision.isAuthorized 
                        ? 'Policy Check Complete / Ready for Execution' 
                        : `Awaiting ${policyDecision.requiredApproverRole} Signature`
                      )
                    : (status === 'AWAITING_POLICY_CHECK' 
                        ? 'Policy & Authority Check' 
                        : (investigationStatus === 'Hypothesis Generated' ? 'Run Recovery Simulation' : 'Start Agent Investigation')
                      )
                  )
              }
            </strong>
          </div>
        </div>
      )}

      {/* Metric Breakdown Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-900/60">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
            Impact Decline
          </span>
          <span className="text-xl font-extrabold text-rose-400 mt-1 flex items-center">
            <TrendingDown className="h-4 w-4 mr-1 text-rose-500" />
            -{impactDecline}%
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
            Revenue at Risk
          </span>
          <span className="text-xl font-extrabold text-white mt-1">
            ₹{(revenueAtRisk / 100000).toFixed(1)}L
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
            Resolution State
          </span>
          <span className={`text-xs font-bold block mt-1.5 ${
            status === 'RESOLVED' ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {status === 'RESOLVED' ? 'Mitigation Complete' : 'Awaiting Decision'}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showButton && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-900/60">
          <span className="text-[10px] text-slate-500 font-semibold">
            * Integration: Connected to real-time incident event log
          </span>
          <button
            onClick={() => navigate('/war-room')}
            className="flex items-center space-x-1.5 px-4.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white shadow-md shadow-violet-600/10 cursor-pointer border border-violet-500/20 transition-all group"
          >
            <span>Open AI War Room</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};
export default IncidentCard;
