import React from 'react';
import { CheckCircle2, Loader2, PlayCircle, ShieldAlert, Cpu } from 'lucide-react';

interface TimelineStep {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  agent: string;
}

interface ExecutionTimelineProps {
  currentStep: number; // 0 to 4
  isSimulating: boolean;
  isAuthorized: boolean;
  selectedStrategyName: string;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  currentStep,
  isSimulating,
  isAuthorized,
  selectedStrategyName,
}) => {
  const steps: TimelineStep[] = [
    {
      title: 'Anomaly Detected',
      description: 'Sentinel Agent identified a 35% revenue decline and delayed shipment.',
      status: isAuthorized || currentStep > 0 ? 'completed' : 'active',
      agent: 'Sentinel Agent',
    },
    {
      title: 'Root Cause Mapped',
      description: 'Investigation Agent traced stockout delay to supplier Apex Distributors.',
      status: isAuthorized || currentStep > 1 ? 'completed' : (isSimulating && currentStep === 1 ? 'active' : 'pending'),
      agent: 'Investigation Agent',
    },
    {
      title: 'Simulation Model Run',
      description: 'Simulation Agent tested stock transfer from Vijayawada Central.',
      status: isAuthorized || currentStep > 2 ? 'completed' : (isSimulating && currentStep === 2 ? 'active' : 'pending'),
      agent: 'Simulation Agent',
    },
    {
      title: 'Awaiting Authorization',
      description: isAuthorized 
        ? `Strategy ${selectedStrategyName} approved by operator.` 
        : 'Controlled Autonomy requires Human-in-the-Loop approval.',
      status: isAuthorized ? 'completed' : (isSimulating && currentStep === 3 ? 'active' : (currentStep === 3 ? 'active' : 'pending')),
      agent: 'Risk & Policy Agent',
    },
    {
      title: 'Executing Stock Re-route',
      description: isAuthorized 
        ? '600 units of dairy & beverages successfully re-routed and shelves refilled.' 
        : 'Pending execution command.',
      status: isAuthorized ? 'completed' : (isSimulating && currentStep === 4 ? 'active' : 'pending'),
      agent: 'Execution Agent',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide">
            Autonomous Mitigation Runway
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold block mt-1">
            Real-time execution log via distributed agent network
          </span>
        </div>
        
        {isSimulating && (
          <div className="flex items-center space-x-2 text-[10px] font-bold text-violet-400 bg-violet-950/20 border border-violet-500/20 px-2.5 py-1 rounded-lg animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>AI Simulation Running</span>
          </div>
        )}
      </div>

      <div className="relative pl-6 border-l border-slate-800 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          
          return (
            <div key={idx} className="relative group">
              {/* Vertical line segment highlight */}
              {isCompleted && idx < steps.length - 1 && (
                <div className="absolute -left-[25px] top-6 w-[2px] h-full bg-violet-500 relative z-0" />
              )}

              {/* Node Indicator Icon */}
              <span className={`absolute -left-[35px] top-0.5 h-5 w-5 rounded-full border flex items-center justify-center z-10 transition-all ${
                isCompleted 
                  ? 'bg-violet-600 border-violet-500 text-white' 
                  : isActive
                    ? 'bg-slate-950 border-amber-500 text-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-850 text-slate-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isActive && isSimulating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isActive ? (
                  <PlayCircle className="h-3 w-3 animate-ping" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                )}
              </span>

              {/* Text detail */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isActive 
                  ? 'border-amber-500/30 bg-amber-950/5 shadow-inner' 
                  : (isCompleted 
                    ? 'border-violet-500/10 bg-slate-950/40' 
                    : 'border-transparent text-slate-600')
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${
                    isActive ? 'text-amber-400' : (isCompleted ? 'text-white' : 'text-slate-500')
                  }`}>
                    {step.title}
                  </h4>
                  <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-md ${
                    isActive 
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' 
                      : (isCompleted 
                        ? 'bg-violet-500/10 border-violet-500/25 text-violet-400' 
                        : 'bg-slate-900/60 border-slate-850 text-slate-600')
                  }`}>
                    {step.agent}
                  </span>
                </div>
                <p className={`text-[10px] leading-normal mt-1.5 ${
                  isActive ? 'text-slate-300' : (isCompleted ? 'text-slate-400' : 'text-slate-600')
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ExecutionTimeline;
