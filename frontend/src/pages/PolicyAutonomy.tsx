import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Cpu, ToggleLeft, 
  HelpCircle, Settings, CheckCircle2, AlertTriangle, Zap,
  FileText, Clock, UserCheck
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { policyEngineService } from '../services/policyEngineService';
import PageHeader from '../components/PageHeader';
import PolicyRule from '../components/PolicyRule';
import { StatusBadge } from '../components/StatusBadge';

export const PolicyAutonomy: React.FC = () => {
  const { approvalRequests, activeAutonomyLevel, policyDecision } = useSimulation();
  
  const rules = policyEngineService.getRules();

  // Autonomy Level explanations
  const autonomyLevels = [
    { level: 0, title: 'LEVEL 0 — Monitoring Only', desc: 'Telemetry alerts only. Human operator retains direct manual control over all branches.', levelCode: 'LEVEL_0' },
    { level: 1, title: 'LEVEL 1 — Anomaly Detection', desc: 'Sentinel active. System flags anomalies; operator conducts manual investigation.', levelCode: 'LEVEL_1' },
    { level: 2, title: 'LEVEL 2 — AI Recommendations', desc: 'Specialist agent network drafts root cause. Manual strategy drafting and selection.', levelCode: 'LEVEL_2' },
    { level: 3, title: 'LEVEL 3 — Workflow Preparation', desc: 'Orchestrator compiles candidate strategies. Operator authorizes manual staging.', levelCode: 'LEVEL_3' },
    { level: 4, title: 'LEVEL 4 — Controlled Autonomy', desc: 'AI auto-resolves transfers below ₹20k. High-cost restocks trigger human authorization.', levelCode: 'LEVEL_4', active: true },
    { level: 5, title: 'LEVEL 5 — Full Autonomy', desc: 'Self-healing Operations. Full AI dispatch and transaction settlement without human approval.', levelCode: 'LEVEL_5' }
  ];

  const getRuleCategory = (actionType: string): 'Operations' | 'Finance' | 'Workforce' | 'Security' => {
    if (actionType === 'TRANSFER_INVENTORY' || actionType === 'NOTIFICATION') return 'Operations';
    if (actionType === 'PURCHASE_INVENTORY' || actionType === 'PURCHASE_INVENTORY_HIGH') return 'Finance';
    if (actionType === 'CREATE_TASK') return 'Workforce';
    return 'Security';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="Autonomy Levels & Operations Policy" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Autonomy Level Scale */}
        <div className="glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
          <div>
            <h4 className="font-bold text-white text-sm">
              Autonomic Operations Governance Scale
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
              Highlighting active autonomy boundary: Controlled Autonomy ({activeAutonomyLevel})
            </span>
          </div>

          {/* Scale steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 pt-3">
            {autonomyLevels.map((lvl) => {
              const isActive = lvl.levelCode === activeAutonomyLevel;
              return (
                <div 
                  key={lvl.level}
                  className={`p-4 rounded-2xl border transition-all duration-350 relative overflow-hidden flex flex-col justify-between space-y-4 ${
                    isActive 
                      ? 'border-violet-500 bg-gradient-to-br from-violet-950/40 to-indigo-950/20 shadow-lg shadow-violet-500/10' 
                      : 'border-slate-900 bg-slate-950/40 hover:border-slate-850'
                  }`}
                >
                  {/* Active banner */}
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-violet-600 border-l border-b border-violet-500 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-white rounded-bl">
                      Active
                    </div>
                  )}

                  <div>
                    <span className={`text-xs font-black h-6 w-6 rounded-lg border flex items-center justify-center ${
                      isActive 
                        ? 'bg-violet-600 border-violet-500 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      L{lvl.level}
                    </span>
                    <h5 className={`font-bold text-xs mt-3 ${isActive ? 'text-violet-400' : 'text-slate-300'}`}>
                      {lvl.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                      {lvl.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Rules and Approval Queue Double Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Policy Rules list (2 Columns) */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Autonomic Policy Boundaries (Level 4 Ruleset)
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Defines target execute and approval thresholds across the retail network
                </span>
              </div>
              
              <div className="flex items-center space-x-1.5 text-[10px] text-indigo-400 font-bold bg-indigo-950/20 border border-indigo-500/25 px-2.5 py-1 rounded-lg">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                <span>Enforcement Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rules.map(rule => (
                <PolicyRule
                  key={rule.id}
                  ruleName={rule.name}
                  threshold={rule.description}
                  action={rule.requiredApprover}
                  category={getRuleCategory(rule.actionType)}
                />
              ))}
            </div>
          </div>

          {/* Approval Request Queue (1 Column) */}
          <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between space-y-4">
            <div className="space-y-4 flex-1">
              <div className="border-b border-slate-900 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center">
                  <Clock className="h-4 w-4 text-violet-400 mr-2" />
                  Policy Approval Queue
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Requires manual signature authorization override
                </span>
              </div>

              {/* Active Approval Requests */}
              <div className="space-y-3.5">
                {approvalRequests.length > 0 ? (
                  approvalRequests.map(req => (
                    <div 
                      key={req.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/25 shadow-lg shadow-amber-950/5 space-y-3 animate-fade-in"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">{req.id}</span>
                        <StatusBadge status={req.status === 'PENDING' ? (req.requiredApproverRole === 'CFO' ? 'CFO_APPROVAL' : 'MANAGER_APPROVAL') : 'RESOLVED'} />
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-white text-xs">
                          {req.strategyId === 'STRAT-A' ? 'Emergency Purchase Order' : 'Inter-Branch Stock Transfer'}
                        </h5>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          {req.reason}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Amount:</span>
                        <strong className="text-white">₹{req.amount.toLocaleString()}</strong>
                      </div>

                      <div className="text-[9px] text-slate-500">
                        Requested: {new Date(req.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[10px] text-slate-500 border border-dashed border-slate-900 rounded-2xl">
                    <UserCheck className="h-5 w-5 mx-auto text-slate-700 mb-2.5" />
                    No active approval requests pending. Network operations are flowing inside autonomous parameters.
                  </div>
                )}
              </div>

              {/* Blocked actions demonstration log */}
              {policyDecision && policyDecision.decisionStatus === 'ACTION_BLOCKED' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-start space-x-2 animate-fade-in">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[8px] text-rose-500 block mb-1">Restricted policy constraint violation</span>
                    <span>{policyDecision.reason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hint Box */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 text-[9px] text-slate-500 leading-normal">
              Note: Autonomy LEVEL 4 is corporate standard. Level changes require board-level policy verification overrides.
            </div>
          </div>

        </div>

        {/* Architecture Integration Hint Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/20 text-[10px] text-slate-500 leading-normal space-y-1">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Policy Engine Integration Blueprint
          </p>
          <p>
            TODO: Connect policy evaluation middleware in backend/config/policyEngine.js to check signatures on transaction triggers. Setup multi-signature authorization nodes to check operator credentials before running dispatch APIs.
          </p>
        </div>
      </div>
    </div>
  );
};
export default PolicyAutonomy;
