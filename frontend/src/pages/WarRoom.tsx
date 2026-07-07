import React, { useState } from 'react';
import { 
  ShieldAlert, Sparkles, Network, ArrowRight, ShieldCheck, 
  Play, Loader2, TrendingDown, Cpu, AlertTriangle, HelpCircle,
  ShoppingBag, Database, Users, Truck, Wallet, FileText, CheckCircle2, BarChart3,
  Archive, History
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import PageHeader from '../components/PageHeader';
import AgentNode, { AgentStatus } from '../components/AgentNode';
import StrategyCard from '../components/StrategyCard';
import ExecutionTimeline from '../components/ExecutionTimeline';
import { StatusBadge } from '../components/StatusBadge';

export const WarRoom: React.FC = () => {
  const { 
    currentDay, isAuthorized, selectedStrategy, dayData, 
    isSimulating, simulationStep, selectStrategy, authorizeAction, resetSimulation, setDay,
    activeAnomalies, activeIncident, investigationState, isAgentInvestigating, startAgentInvestigation,
    recoveryStrategies, simulationResults, decisionRecommendation, isSimulatingStrategies, simulationAgentStep,
    simulateRecoveryStrategies,
    policyDecision, approvalRequests, isPolicyChecking, runPolicyCheck,
    activeInventory, reservedInventory, inTransitInventory, executionPlan, stockTransferRequest,
    logisticsTask, internalNotifications, auditEvents, recoveryMonitor, currentRecoveryHour,
    predictionComparisons, similarIncidents, executionAgentStatus,
    runNextExecutionStep, executeFullRecoveryWorkflow, advanceRecoveryHour,
    aiStatus, isAiLoading, currentBriefing, currentInvestigationExplanation,
    currentDecisionExplanation, currentPostmortem, askNervaAnswer, askNerva, clearNervaAnswer
  } = useSimulation();

  const [questionInput, setQuestionInput] = useState('');
  const [showInvestigationExplanation, setShowInvestigationExplanation] = useState(false);
  const [showDecisionExplanation, setShowDecisionExplanation] = useState(false);
  const [showPostmortem, setShowPostmortem] = useState(false);

  const handleAskNerva = () => {
    if (questionInput.trim()) {
      askNerva(questionInput);
    }
  };

  const hypothesis = investigationState.hypothesis;
  const recommendation = decisionRecommendation;

  // Root cause chain elements
  const rootCauses = [
    { title: 'Supplier Delivery Delay', desc: 'Apex Distributors delivery delayed by 52 hrs', icon: '🔴' },
    { title: 'Stock Not Received', desc: 'Madhapur hub warehouse failed replenishment', icon: '📦' },
    { title: 'Escalation Failure', desc: '2 key logistics coordinators absent at hub', icon: '⚠️' },
    { title: 'Top Products Out of Stock', desc: '8/15 top dairy & beverages at 0 stock', icon: '❌' },
    { title: 'Customer Complaints Spike', desc: 'Complaints up 180%; 48% unavailable', icon: '💬' },
    { title: 'Revenue Decline Triggered', desc: 'Daily revenue dropped by 35% at HYD', icon: '📉' },
  ];

  // Agent network definition
  const agents = [
    { name: 'Sentinel Agent', role: 'Telemetry Monitoring' },
    { name: 'Investigation Agent', role: 'Root Cause Diagnostics' },
    { name: 'Inventory Agent', role: 'Supply Chain Operations' },
    { name: 'Customer Intelligence Agent', role: 'Sentiment & Complaints' },
    { name: 'Supplier Agent', role: 'Logistics Liaison' },
    { name: 'Finance Agent', role: 'P&L / Risk Assessment' },
    { name: 'Simulation Agent', role: 'Predictive Modeling' },
    { name: 'Risk & Policy Agent', role: 'Autonomy Guardrails' },
    { name: 'Execution Agent', role: 'Operational Dispatch' }
  ];

  const getAgentStatus = (name: string): AgentStatus => {
    if (name === 'Sentinel Agent') return 'ACTIVE';
    
    if (name === 'Risk & Policy Agent') {
      if (isPolicyChecking) return 'ANALYSING';
      if (policyDecision) return 'ACTIVE';
      if (isSimulating && simulationStep === 3) return 'ANALYSING';
      if (isAuthorized) return 'ACTIVE';
      return 'IDLE';
    }

    if (name === 'Execution Agent') {
      if (executionAgentStatus === 'RUNNING') return 'EXECUTING';
      if (executionAgentStatus === 'MONITORING') return 'ANALYSING';
      if (executionAgentStatus === 'READY' || executionAgentStatus === 'COMPLETED') return 'ACTIVE';
      return 'IDLE';
    }

    if (name === 'Simulation Agent') {
      if (isSimulatingStrategies) {
        return simulationAgentStep >= 7 ? 'SIMULATING' : 'ANALYSING';
      }
      if (recommendation) return 'ACTIVE';
      return 'IDLE';
    }

    let taskAgentId = '';
    if (name === 'Investigation Agent') taskAgentId = 'AGT-COORD';
    else if (name === 'Inventory Agent') taskAgentId = 'AGT-INV';
    else if (name === 'Customer Intelligence Agent') taskAgentId = 'AGT-CUST';
    else if (name === 'Supplier Agent') taskAgentId = 'AGT-SUP';
    else if (name === 'Finance Agent') taskAgentId = 'AGT-FIN';

    const task = investigationState.tasks.find(t => t.agentId === taskAgentId);
    if (!task) return 'IDLE';
    
    if (task.status === 'RUNNING') return 'ANALYSING';
    if (task.status === 'COMPLETED') return 'ACTIVE';
    return 'IDLE';
  };

  const getAgentLoad = (name: string): number => {
    if (name === 'Sentinel Agent') return 0;
    
    if (name === 'Risk & Policy Agent') {
      if (isPolicyChecking) return 90;
      if (policyDecision) return 10;
      return 0;
    }

    if (name === 'Execution Agent') {
      if (executionAgentStatus === 'RUNNING') return 95;
      if (executionAgentStatus === 'MONITORING') return 45;
      if (executionAgentStatus === 'READY') return 0;
      return 0;
    }

    if (name === 'Simulation Agent') {
      if (isSimulatingStrategies) return 92;
      if (recommendation) return 10;
      return 0;
    }

    let taskAgentId = '';
    if (name === 'Investigation Agent') taskAgentId = 'AGT-COORD';
    else if (name === 'Inventory Agent') taskAgentId = 'AGT-INV';
    else if (name === 'Customer Intelligence Agent') taskAgentId = 'AGT-CUST';
    else if (name === 'Supplier Agent') taskAgentId = 'AGT-SUP';
    else if (name === 'Finance Agent') taskAgentId = 'AGT-FIN';

    const task = investigationState.tasks.find(t => t.agentId === taskAgentId);
    if (!task) return 0;
    if (task.status === 'RUNNING') return 88;
    if (task.status === 'COMPLETED') return 12;
    return 0;
  };

  const currentStrategyCode = selectedStrategy || 'B';
  const getStrategyName = () => {
    if (currentStrategyCode === 'A') return 'Emergency supplier purchase';
    if (currentStrategyCode === 'C') return 'Wait for supplier';
    return 'Inter-branch stock transfer';
  };

  const hydDecline = dayData.branches['HYD-001']?.revenueDecline ?? 0;
  const hydExposure = dayData.branches['HYD-001']?.revenueExposure ?? 0;
  
  const confidenceScore = hypothesis ? hypothesis.confidence : (activeIncident ? activeIncident.confidence : 91);

  const getSimulationProgressText = () => {
    switch (simulationAgentStep) {
      case 0: return 'Analyzing target branch operational deficit...';
      case 1: return 'Generating feasible candidate recovery strategies...';
      case 2: return 'Capturing current business state snapshot...';
      case 3: return 'Cloning state and simulating Strategy A (Emergency buy)...';
      case 4: return 'Cloning state and simulating Strategy B (Inter-branch transfer)...';
      case 5: return 'Cloning state and simulating Strategy C (Wait for Apex)...';
      case 6: return 'Recalculating P&L health and safety thresholds...';
      case 7: return 'Ranking candidates using normalized Decision weights...';
      case 8: return 'Compiling recommendations...';
      default: return 'Running Strategy Projections...';
    }
  };

  const recommendedResult = recommendation && simulationResults.find(
    r => r.strategyId === recommendation.recommendedStrategyId
  );

  const executionProgress = executionPlan 
    ? Math.round((executionPlan.tasks.filter(t => t.status === 'COMPLETED').length / executionPlan.tasks.length) * 100)
    : 0;

  const overallAccuracy = predictionComparisons.length > 0
    ? Math.round(predictionComparisons.reduce((acc, c) => acc + c.accuracyScore, 0) / predictionComparisons.length)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="AI War Room — Emergency Dashboard" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Incident Summary Card & Telemetry */}
        {currentDay >= 3 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 glass-card rounded-3xl p-6 border border-rose-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-rose-600/10 border-l border-b border-rose-500/20 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-400">
                CRITICAL THREAT: INC-2041
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Incident Threat Analysis
                </span>
                <h3 className="text-xl font-bold text-white tracking-wide mt-1.5">
                  Hyderabad Branch Revenue Decline (Incident NRV-2041)
                </h3>
                
                {/* Optional Gemini briefing integration */}
                {currentBriefing ? (
                  <div className="text-xs text-indigo-200 bg-indigo-950/10 border border-indigo-950/20 p-4.5 rounded-2xl leading-relaxed mt-2.5 max-w-3xl">
                    <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-2 pb-1 border-b border-indigo-950">
                      <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                      <span>
                        {currentBriefing.includes('Fallback Mode') 
                          ? 'Executive Briefing (Fallback Mode)' 
                          : 'Gemini Executive Briefing'}
                      </span>
                    </div>
                    <div className="prose prose-invert text-slate-350 leading-relaxed font-mono">
                      {currentBriefing.split('\n').map((line, idx) => (
                        <p key={idx} className="mt-1">{line}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 leading-relaxed mt-2.5 max-w-3xl">
                    Sentinel Agent flagged a systemic stockout loop causing high customer drop-off. Primary supply line (Apex Distributors) replenishment delayed by <strong>52 hours</strong>. 2 inventory management coordinators absent, disabling safety-buffer escalations.
                  </p>
                )}
              </div>

              {/* Technical indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-900/60">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Revenue Drop
                  </span>
                  <span className="text-xl font-extrabold text-rose-400 mt-1 block">
                    {hydDecline.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Financial Exposure
                  </span>
                  <span className="text-xl font-extrabold text-white mt-1 block">
                    ₹{(hydExposure / 100000).toFixed(1)}L
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    AI Confidence Score
                  </span>
                  <span className="text-xl font-extrabold text-indigo-400 mt-1 block">
                    {confidenceScore}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Operational Status
                  </span>
                  <span className={`text-xs font-bold mt-2 block ${
                    executionAgentStatus === 'COMPLETED' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                  }`}>
                    {executionAgentStatus === 'COMPLETED'
                      ? 'Mitigation Deployed & Resolved' 
                      : (policyDecision
                          ? (policyDecision.isAuthorized ? 'Autonomous Execution Approved' : 'Awaiting Approval Signature')
                          : (recommendation 
                              ? 'Awaiting Policy Check' 
                              : (investigationState.status === 'Hypothesis Generated' 
                                  ? 'Hypothesis Generated' 
                                  : (isAgentInvestigating ? 'Investigation Running' : 'Awaiting Investigation'))))}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Investigation Terminal Console */}
            <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-widest">
                  Mitigation Terminal
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Select a recovery strategy below. Operations above ₹20k require CFO signature under Autonomy Policy.
                </p>
              </div>

              <div className="space-y-3">
                {investigationState.status === 'Detected' && (
                  <button
                    onClick={startAgentInvestigation}
                    disabled={isAgentInvestigating}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/15 border border-violet-500/20 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isAgentInvestigating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Running Agent Reasoning...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-4 w-4 text-white" />
                        <span>Start AI Investigation</span>
                      </>
                    )}
                  </button>
                )}

                {investigationState.status === 'Hypothesis Generated' && !recommendation && (
                  <button
                    onClick={simulateRecoveryStrategies}
                    disabled={isSimulatingStrategies}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/15 border border-violet-500/20 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {isSimulatingStrategies ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Simulating Projections...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 text-white animate-pulse" />
                        <span>Simulate Recovery Strategies</span>
                      </>
                    )}
                  </button>
                )}

                {recommendation && (
                  <>
                    {executionAgentStatus === 'COMPLETED' ? (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold text-center flex items-center justify-center space-x-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Mitigation Resolved</span>
                      </div>
                    ) : (
                      <>
                        {isPolicyChecking && (
                          <button
                            disabled
                            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 py-3 text-xs font-bold text-slate-500 cursor-not-allowed"
                          >
                            <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                            <span>Evaluating Policy Rules...</span>
                          </button>
                        )}

                        {!isPolicyChecking && !policyDecision && (
                          <button
                            onClick={runPolicyCheck}
                            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/15 border border-violet-500/20 cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            <ShieldAlert className="h-4 w-4 text-white animate-pulse" />
                            <span>Run Policy Check</span>
                          </button>
                        )}

                        {!isPolicyChecking && policyDecision && (
                          <>
                            {policyDecision.isAuthorized ? (
                              <div className="text-xs text-center text-slate-400 font-semibold p-1">
                                Pre-authorization compliance complete. Execute dispatcher below.
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold text-center flex flex-col items-center justify-center space-y-1">
                                <span className="flex items-center space-x-1.5">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                                  <span>Approval Required: {policyDecision.requiredApproverRole} Signature</span>
                                </span>
                                <span className="text-[8px] text-slate-500 font-semibold leading-normal pt-1">
                                  Action locked. Request logged to Policy Approval queue.
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-900/20 border border-slate-900 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">All Operations Clear</h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              There are no active incidents. Advance the simulation timeline to <strong>Day 7 (Revenue Crisis)</strong> in the Demo Console to trigger a retail network crisis and run the Agent Orchestrator.
            </p>
            <button 
              onClick={() => setDay(7)}
              className="px-4.5 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl border border-violet-500/20 cursor-pointer"
            >
              Simulate Day 7 Crisis
            </button>
          </div>
        )}

        {/* Strategy Simulation visual progress panel */}
        {isSimulatingStrategies && (
          <div className="p-5 rounded-2xl bg-indigo-950/15 border border-indigo-500/25 space-y-3 animate-pulse">
            <div className="flex justify-between items-center text-xs font-bold text-indigo-400">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Simulation Agent active — Executing projections</span>
              </div>
              <span>Step {simulationAgentStep + 1} of 9</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500" 
                style={{ width: `${((simulationAgentStep + 1) / 9) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-450">
              {getSimulationProgressText()}
            </p>
          </div>
        )}

        {currentDay >= 3 && (
          <>
            {/* Visual Root Cause Chain */}
            {investigationState.status !== 'Hypothesis Generated' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Active Root Cause Chain
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                  {rootCauses.map((rc, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between space-y-3 relative group hover:border-slate-800 transition-all">
                      <div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Step 0{idx + 1}</span>
                          <span>{rc.icon}</span>
                        </div>
                        <h4 className="font-bold text-white text-xs mt-2 leading-snug">
                          {rc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          {rc.desc}
                        </p>
                      </div>
                      {idx < 5 && (
                        <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-700 font-extrabold">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI-SUPPORTED ROOT CAUSE HYPOTHESIS */}
            {investigationState.status === 'Hypothesis Generated' && hypothesis && !recommendation && (
              <div className="glass-card rounded-3xl p-6 border border-violet-500/30 shadow-xl shadow-violet-950/20 space-y-5 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-violet-600/10 border-l border-b border-violet-500/25 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-violet-400">
                  {hypothesis.label}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-xs font-bold text-violet-400">
                      <Sparkles className="h-4.5 w-4.5 text-violet-400 animate-pulse" />
                      <span>Orchestrator Synthesis Complete</span>
                    </div>
                    
                    <button
                      onClick={() => setShowInvestigationExplanation(!showInvestigationExplanation)}
                      className="text-[9px] font-bold bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-3 py-1 rounded-lg border border-violet-500/20 cursor-pointer"
                    >
                      {showInvestigationExplanation ? "Hide Diagnostic Details" : "Explain Diagnostics"}
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {hypothesis.title}
                  </h3>
                  
                  {showInvestigationExplanation && currentInvestigationExplanation ? (
                    <div className="text-xs text-violet-200 bg-violet-950/15 border border-violet-950/30 p-4.5 rounded-2xl leading-relaxed mt-2 animate-fade-in font-mono">
                      <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-violet-450 tracking-widest mb-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                          {currentInvestigationExplanation.includes('Fallback Mode')
                            ? 'Diagnostic Explanation (Fallback Mode)'
                            : 'Gemini Diagnostic Explanation'}
                        </span>
                      </div>
                      {currentInvestigationExplanation.split('\n').map((line, idx) => (
                        <p key={idx} className="mt-1">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-455 leading-relaxed max-w-4xl pt-1">
                      {hypothesis.evidenceSummary}
                    </p>
                  )}
                </div>

                {/* Hypothesis Causal Chain */}
                <div className="space-y-2.5 pt-3 border-t border-slate-900/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Causal Chain Graph Projections
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-1.5">
                    {hypothesis.causalChain.map((chain, idx) => (
                      <React.Fragment key={chain}>
                        <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-900 text-xs font-bold text-slate-300 flex items-center shadow-inner">
                          <span className="h-4 w-4 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center mr-2">
                            {idx + 1}
                          </span>
                          <span>{chain}</span>
                        </div>
                        {idx < hypothesis.causalChain.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600 mx-0.5" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-semibold flex items-center space-x-1.5 pt-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Disclaimer: Hypothesis is AI-assisted correlation. Workforce employee attendance is presented as contributing operational risk, not a direct cause.</span>
                </div>
              </div>
            )}

            {/* DECISION INTELLIGENCE PANEL */}
            {recommendation && (
              <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 shadow-xl shadow-indigo-950/20 space-y-5 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-indigo-600/10 border-l border-b border-indigo-500/25 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {recommendation.recommendedStrategyId === 'STRAT-B' ? 'NERVA RECOMMENDED' : 'DECISION ADVISORY'}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                      <span>Decision Recommendation Compiled (Score: {recommendation.decisionScore}/100)</span>
                    </div>

                    <button
                      onClick={() => setShowDecisionExplanation(!showDecisionExplanation)}
                      className="text-[9px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg border border-indigo-500/20 cursor-pointer"
                    >
                      {showDecisionExplanation ? "Hide Explanation" : "Explain Recommendation"}
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {recommendation.recommendedStrategyId === 'STRAT-B' ? 'Inter-Branch Stock Transfer Recommended' : 'Alternative Action Recommended'}
                  </h3>

                  {showDecisionExplanation && currentDecisionExplanation ? (
                    <div className="text-xs text-indigo-200 bg-indigo-950/15 border border-indigo-950/30 p-4.5 rounded-2xl leading-relaxed mt-2 animate-fade-in font-mono">
                      <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>
                          {currentDecisionExplanation.includes('Fallback Mode')
                            ? 'Recommendation Explanation (Fallback Mode)'
                            : 'Gemini Recommendation Explanation'}
                        </span>
                      </div>
                      {currentDecisionExplanation.split('\n').map((line, idx) => (
                        <p key={idx} className="mt-1">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-350 leading-relaxed max-w-4xl pt-1">
                      {recommendation.comparisonSummary}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {recommendation.reasonCodes.map(code => (
                    <span 
                      key={code}
                      className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 uppercase tracking-wide"
                    >
                      {code.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* POLICY & AUTHORITY DECISION PANEL */}
            {policyDecision && (
              <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 shadow-xl shadow-indigo-950/20 space-y-5 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-indigo-600/10 border-l border-b border-indigo-500/25 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Policy Evaluation
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                      <ShieldAlert className="h-4 w-4 text-indigo-400 mr-2" />
                      Policy & Authority Check complete
                    </span>
                    <StatusBadge status={policyDecision.decisionStatus} />
                  </div>

                  <h3 className="text-base font-extrabold text-white">
                    {policyDecision.decisionStatus === 'AUTONOMOUS_EXECUTION_PERMITTED' 
                      ? 'Autonomous Execution Permitted' 
                      : (policyDecision.decisionStatus === 'ACTION_BLOCKED' ? 'Operational Action Blocked' : 'Human Approval Required')}
                  </h3>

                  <p className="text-xs text-slate-450 leading-relaxed max-w-4xl pt-1">
                    {policyDecision.reason}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-900/60 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Target Action
                    </span>
                    <strong className="text-slate-200 mt-1 block font-bold">
                      {policyDecision.strategyId === 'STRAT-A' ? 'Emergency Supplier Purchase' : 'Inter-Branch Stock Transfer'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Action Cost
                    </span>
                    <strong className="text-white mt-1 block font-black">
                      {policyDecision.strategyId === 'STRAT-A' ? '₹77,848' : '₹12,550'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Autonomy Limit
                    </span>
                    <strong className="text-slate-400 mt-1 block">
                      {policyDecision.strategyId === 'STRAT-A' ? '₹50,000' : '₹20,000'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      Simulated Risk
                    </span>
                    <strong className={`mt-1 block ${
                      policyDecision.strategyId === 'STRAT-A' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'
                    }`}>
                      {policyDecision.strategyId === 'STRAT-A' ? 'MEDIUM' : 'LOW'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 7: AUTONOMOUS RECOVERY EXECUTION PANEL */}
            {policyDecision && policyDecision.isAuthorized && (
              <div className="glass-card rounded-3xl p-6 border border-violet-500/30 shadow-xl shadow-violet-950/20 space-y-6 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-violet-600/10 border-l border-b border-violet-500/25 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-violet-400">
                  Execution Dispatcher
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-900 pb-4 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base flex items-center">
                      <Cpu className="h-5 w-5 text-violet-400 mr-2 animate-pulse" />
                      Autonomous Recovery Execution Workflow
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Enforces structured task sequences in dependency order. Active Plan: <strong className="text-slate-400">{executionPlan ? executionPlan.id : 'DRAFT'}</strong>
                    </p>
                  </div>

                  {/* Execution Control Buttons */}
                  {!executionPlan || (executionPlan.status !== 'MONITORING' && executionPlan.status !== 'COMPLETED') ? (
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={runNextExecutionStep}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-850 cursor-pointer"
                      >
                        {!executionPlan ? 'Draft Execution Plan' : 'Run Next Execution Step'}
                      </button>
                      <button
                        onClick={executeFullRecoveryWorkflow}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        Execute Full Recovery Workflow
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="h-4 w-4 animate-bounce" />
                      <span>Execution Sequence Completed</span>
                    </div>
                  )}
                </div>

                {/* Main Plan Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task list Column */}
                  <div className="lg:col-span-2 space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Structured Workflow Task Dependencies ({executionProgress}% complete)
                    </span>

                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${executionProgress}%` }} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {executionPlan ? (
                        executionPlan.tasks.map((tsk, idx) => {
                          const isDone = tsk.status === 'COMPLETED';
                          const isRunning = tsk.status === 'READY';
                          return (
                            <div 
                              key={tsk.id}
                              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                isDone 
                                  ? 'bg-emerald-950/5 border-emerald-500/20 text-emerald-400 shadow-sm'
                                  : (isRunning 
                                      ? 'bg-violet-950/10 border-violet-500/30 text-white shadow-md animate-pulse'
                                      : 'bg-slate-950/40 border-slate-900 text-slate-500')
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-[8px] font-black tracking-wider uppercase block opacity-60">Step 0{idx + 1}</span>
                                <h5 className="font-bold text-xs">{tsk.title}</h5>
                                <p className="text-[9px] opacity-75">{tsk.description}</p>
                              </div>
                              <div className="shrink-0 ml-2">
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  isRunning ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                                  ) : (
                                    <span className="h-4 w-4 rounded-full border border-slate-800 text-[8px] font-black flex items-center justify-center">L</span>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 p-8 text-center text-xs text-slate-500 border border-dashed border-slate-900 rounded-2xl">
                          Click "Draft Execution Plan" or "Execute Full Recovery Workflow" above to begin dispatching stock transfers.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Event Column */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 flex flex-col justify-between space-y-4">
                    <div className="flex-1 space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block pb-1 border-b border-slate-900">
                        Operational Dispatch Audits
                      </span>

                      <div className="space-y-2.5 overflow-y-auto max-h-[220px] font-mono text-[9px] text-slate-400 leading-normal scrollbar-thin">
                        {auditEvents.length > 0 ? (
                          auditEvents.map(evt => (
                            <div key={evt.id} className="border-b border-slate-900 pb-1.5">
                              <span className="text-violet-400">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>{' '}
                              <strong className={evt.status === 'FAILURE' ? 'text-rose-400' : 'text-slate-200'}>
                                {evt.action}:
                              </strong>{' '}
                              <span>{evt.details}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 text-center py-12">
                            [Awaiting Execution Dispatcher Actions]
                          </div>
                        )}
                      </div>
                    </div>

                    {stockTransferRequest && (
                      <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2 text-[10px]">
                        <div className="flex justify-between font-bold">
                          <span>Request Ref:</span>
                          <span className="text-white">{stockTransferRequest.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Route:</span>
                          <span className="text-white">Vijayawada ➔ Hyderabad</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transfer Load:</span>
                          <span className="text-white">600 units (8 top sellers)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <strong className="text-indigo-400 uppercase tracking-widest">{stockTransferRequest.status}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 7: RECOVERY MONITORING UI SECTION */}
            {recoveryMonitor && (
              <div className="glass-card rounded-3xl p-6 border border-slate-950 space-y-6 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 bg-slate-900 border-l border-b border-slate-800 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Recovery Monitoring
                </div>

                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-900 pb-4 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-base">
                      Post-Mitigation Recovery Monitor
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Compares real-time observed telemetry trends with simulated projections. Elapsed Time Checkpoint:{' '}
                      <strong className="text-indigo-400">{currentRecoveryHour === 0 ? '0 HOURS' : `${currentRecoveryHour} Simulated Hours`}</strong>
                    </p>
                  </div>

                  {currentRecoveryHour < 24 ? (
                    <div className="flex items-center space-x-2.5">
                      {currentRecoveryHour === 0 && (
                        <button
                          onClick={() => advanceRecoveryHour(6)}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                        >
                          Advance Recovery to 6 Hours
                        </button>
                      )}
                      {currentRecoveryHour === 6 && (
                        <button
                          onClick={() => advanceRecoveryHour(24)}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                        >
                          Advance Recovery to 24 Hours (Final Resolution)
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => setShowPostmortem(!showPostmortem)}
                        className="px-4 py-2 bg-indigo-900/20 border border-indigo-500/25 text-indigo-400 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {showPostmortem ? "Hide Postmortem" : "Explain Incident Postmortem"}
                      </button>
                      <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Mitigation Target Completed & Resolved</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Gemini Postmortem summary */}
                {currentRecoveryHour === 24 && showPostmortem && currentPostmortem && (
                  <div className="text-xs text-indigo-200 bg-indigo-950/15 border border-indigo-950/30 p-5 rounded-2xl leading-relaxed mt-2 animate-fade-in font-mono space-y-2">
                    <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase text-indigo-455 tracking-widest mb-1.5 pb-1 border-b border-indigo-950">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>
                        {currentPostmortem.includes('Fallback Mode')
                          ? 'Incident Postmortem (Fallback Mode)'
                          : 'Gemini Incident Postmortem Narrative'}
                      </span>
                    </div>
                    {currentPostmortem.split('\n').map((line, idx) => (
                      <p key={idx} className="mt-1">{line}</p>
                    ))}
                  </div>
                )}

                {/* Predicted vs Observed Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Observed branch metrics (HYD-001)
                    </span>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-3.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Inventory Health:</span>
                        <strong className="text-emerald-400">{recoveryMonitor.observedMetrics.inventoryHealth}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Availability:</span>
                        <strong className="text-emerald-400">{recoveryMonitor.observedMetrics.topSellerAvailability}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sentiment:</span>
                        <strong className="text-white">{recoveryMonitor.observedMetrics.customerSentiment}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Daily Drop Rate:</span>
                        <strong className="text-white">{recoveryMonitor.observedMetrics.revenueDecline}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Revenue Exposure:</span>
                        <strong className="text-white">₹{recoveryMonitor.observedMetrics.revenueExposure.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Projections vs observed verification Matrix
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] text-left text-slate-400 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900/60 font-extrabold uppercase text-[8px] text-slate-500">
                            <th className="py-2 px-2.5">Evaluated Metric</th>
                            <th className="py-2 px-2.5">Simulated Predicted</th>
                            <th className="py-2 px-2.5">Observed Recovery</th>
                            <th className="py-2 px-2.5">Variance</th>
                            <th className="py-2 px-2.5 text-right">Accuracy Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictionComparisons.map(comp => (
                            <tr key={comp.metric} className="border-b border-slate-900/40 hover:bg-slate-900/5 transition-colors">
                              <td className="py-2.5 px-2.5 font-bold text-slate-200">{comp.metric}</td>
                              <td className="py-2.5 px-2.5 font-semibold">
                                {comp.metric === 'Revenue Exposure' ? `₹${comp.predictedValue.toLocaleString()}` : `${comp.predictedValue}%`}
                              </td>
                              <td className="py-2.5 px-2.5 font-semibold text-indigo-400">
                                {comp.metric === 'Revenue Exposure' ? `₹${comp.observedValue.toLocaleString()}` : `${comp.observedValue}%`}
                              </td>
                              <td className="py-2.5 px-2.5 text-slate-500">
                                {comp.metric === 'Revenue Exposure' 
                                  ? `₹${comp.absoluteDifference.toLocaleString()}` 
                                  : `${comp.absoluteDifference}%`}
                              </td>
                              <td className="py-2.5 px-2.5 text-right text-emerald-400 font-extrabold">{comp.accuracyScore}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative h-20 w-20 rounded-full border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                      <div className="text-center">
                        <span className="text-xl font-black text-indigo-400 block">{overallAccuracy}%</span>
                        <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold">Accuracy</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-white text-[10px]">Statistical Modeling Margin</h5>
                      <p className="text-[9px] text-slate-500 leading-normal">
                        Compares Strategy B simulated recovery with actual observed checkpoint telemetry inputs.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PHASE 7: INCIDENT RESOLUTION SUMMARY BOX */}
                {currentRecoveryHour === 24 && (
                  <div className="p-6 rounded-3xl bg-emerald-950/10 border border-emerald-500/30 shadow-xl space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                      <h5 className="font-black text-emerald-400 text-xs uppercase tracking-widest flex items-center">
                        <CheckCircle2 className="h-4.5 w-4.5 mr-2 animate-bounce" />
                        Incident Resolved Memory Logged
                      </h5>
                      <span className="text-[9px] text-slate-500 font-bold">Ref: INC-2041</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed text-slate-300">
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 block">Problem Context:</span>
                          <strong className="text-white">Hyderabad Branch Revenue Decline</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Root Cause Signature:</span>
                          <strong className="text-white">Supplier-delay stock-out crisis</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Restoration Action:</span>
                          <strong className="text-white">Inter-Branch Stock Transfer (600 units)</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-500 block">Resolution Hours:</span>
                          <strong className="text-white">24 simulated hours</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Estimated Loss Prevented:</span>
                          <strong className="text-emerald-400 font-extrabold">₹284,000</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Verification Accuracy:</span>
                          <strong className="text-indigo-400 font-extrabold">{overallAccuracy}%</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-550 block">Final Inventory Health:</span>
                          <strong className="text-emerald-400">91%</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Final Customer Sentiment:</span>
                          <strong className="text-emerald-400">75%</strong>
                        </div>
                        <div>
                          <span className="text-slate-550 block">Organizational Memory:</span>
                          <strong className="text-indigo-400">Stored dynamically</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ASK NERVA Contextual Q&A Interface (Phase 8) */}
            {currentDay >= 3 && (
              <div className="glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
                    <HelpCircle className="h-4.5 w-4.5 text-indigo-400 mr-2" />
                    ASK NERVA — Contextual operational evidence queries
                  </h3>
                  <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">
                    Hybrid explanation engine
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 leading-normal">
                  Submit operational questions regarding current signals, incident hypotheses, policy checks, or predictions.
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Type a question (e.g., 'Why did NERVA recommend Strategy B?', 'What evidence supports the hypothesis?')"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskNerva()}
                    className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500 text-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleAskNerva}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Ask Nerva
                  </button>
                </div>

                {/* Preset Questions Drawer */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Why did NERVA trigger NRV-2041?",
                    "What evidence supports the root-cause hypothesis?",
                    "Why was Strategy B recommended?",
                    "Why did the Policy Engine authorize Strategy B autonomously?"
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setQuestionInput(q);
                        askNerva(q);
                      }}
                      className="px-2.5 py-1 text-[8px] bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded text-slate-400 font-bold transition-all cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Answer Display */}
                {isAiLoading && !askNervaAnswer && (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-center space-x-2 text-xs text-slate-400">
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-400" />
                    <span>Synthesizing response from NERVA operational context...</span>
                  </div>
                )}

                {askNervaAnswer && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-950/60 space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-indigo-400">
                      <span>NERVA Response Summary</span>
                      <button 
                        onClick={clearNervaAnswer}
                        className="text-slate-500 hover:text-slate-350"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="prose prose-invert text-xs leading-relaxed text-slate-350 font-mono">
                      {askNervaAnswer}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PHASE 7: HISTORICAL RETRIEVAL INCIDENT MEMORIES PANEL */}
            {currentRecoveryHour === 24 && similarIncidents.length > 0 && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
                    <History className="h-4.5 w-4.5 text-indigo-400 mr-2" />
                    NERVA Incident Memory — Similar Historical Records
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    Similarity search retrieved historical matching anomalies and their resolutions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarIncidents.map(mem => (
                    <div 
                      key={mem.id}
                      className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 flex flex-col justify-between space-y-4 relative"
                    >
                      <div className="absolute top-3.5 right-3.5 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded text-[8px] font-black text-indigo-400 uppercase tracking-widest">
                        {mem.similarityScore}% Match
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Memory ID: {mem.id}</span>
                          <span>Incident: {mem.incidentId}</span>
                        </div>

                        <h4 className="font-extrabold text-white text-xs mt-2">
                          {mem.incidentId === 'INC-1082' ? 'Vijayawada Logistics Bottleneck' : 'Warangal Stock Out Crisis'}
                        </h4>

                        <p className="text-[10px] text-slate-450 leading-normal pt-1">
                          Root cause: <strong className="text-slate-350">{mem.rootCauseSignature.replace(/-/g, ' ')}</strong>. 
                          Resolved using <strong className="text-indigo-400">{mem.strategyType.replace(/_/g, ' ')}</strong>.
                        </p>
                      </div>

                      {/* Memory Metrics */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-900/60 text-[9px] text-slate-500 text-center">
                        <div>
                          <span>Inventory Health</span>
                          <strong className="text-slate-300 block mt-0.5">{mem.recoveryMetrics.inventoryHealth}%</strong>
                        </div>
                        <div>
                          <span>Sentiment</span>
                          <strong className="text-slate-300 block mt-0.5">{mem.recoveryMetrics.customerSentiment}%</strong>
                        </div>
                        <div>
                          <span>Accuracy</span>
                          <strong className="text-emerald-400 block mt-0.5">{mem.predictionAccuracy}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Grid & Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Grid */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
                    <Network className="h-4.5 w-4.5 text-violet-400 mr-2" />
                    Distributed Agent Collaboration grid
                  </h3>
                  <span className="text-[9px] text-slate-550 font-black tracking-widest uppercase">
                    Telemetry Node Statuses
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {agents.map(agent => (
                    <AgentNode
                      key={agent.name}
                      name={agent.name}
                      role={agent.role}
                      status={getAgentStatus(agent.name)}
                      load={getAgentLoad(agent.name)}
                      isActive={getAgentStatus(agent.name) === 'ANALYSING' || getAgentStatus(agent.name) === 'EXECUTING' || getAgentStatus(agent.name) === 'SIMULATING'}
                    />
                  ))}
                </div>
              </div>

              {/* Execution Timeline */}
              <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
                <ExecutionTimeline
                  currentStep={isSimulating ? simulationStep : (isAuthorized ? 4 : 3)}
                  isSimulating={isSimulating}
                  isAuthorized={isAuthorized}
                  selectedStrategyName={getStrategyName()}
                />
              </div>
            </div>

            {/* Candidate Strategy Cards Panel */}
            {recommendation && !policyDecision && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    Simulated Candidate Recovery Strategies
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    Recalculated metrics and cost evaluations for each alternative strategy
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {simulationResults.map(res => {
                    const strat = recoveryStrategies.find(s => s.id === res.strategyId);
                    if (!strat) return null;

                    const isRec = recommendation.recommendedStrategyId === res.strategyId;

                    return (
                      <div 
                        key={res.strategyId}
                        className={`p-5 rounded-3xl bg-slate-950/60 border flex flex-col justify-between space-y-4 relative ${
                          isRec ? 'border-indigo-500/30 bg-indigo-950/5 shadow-xl shadow-indigo-950/5' : 'border-slate-900'
                        }`}
                      >
                        {isRec && (
                          <div className="absolute top-3 right-3 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-500/30">
                            NERVA Recommended
                          </div>
                        )}

                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Strategy {res.strategyId.replace('STRAT-', '')}
                          </span>
                          <h4 className="font-extrabold text-white text-xs leading-snug">
                            {strat.name}
                          </h4>
                          <p className="text-[10px] text-slate-450 leading-normal">
                            {strat.description}
                          </p>
                        </div>

                        {/* Evaluated Metrics */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-900/60 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Expected Recovery:</span>
                            <strong className="text-white">{res.expectedRecoveryPercent}%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Direct Action Cost:</span>
                            <strong className="text-white">
                              {res.estimatedDirectCost > 0 ? `₹${res.estimatedDirectCost.toLocaleString()}` : '₹0'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Loss Prevented:</span>
                            <strong className="text-emerald-400">
                              {res.estimatedLossPrevented > 0 ? `₹${res.estimatedLossPrevented.toLocaleString()}` : '₹0'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Additional Exposure Loss:</span>
                            <strong className={res.estimatedAdditionalLoss > 0 ? 'text-rose-400' : 'text-slate-500'}>
                              {res.estimatedAdditionalLoss > 0 ? `₹${res.estimatedAdditionalLoss.toLocaleString()}` : '₹0'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Resolution Time:</span>
                            <strong className="text-white">{res.estimatedResolutionHours} hours</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Risk level:</span>
                            <span className={`font-bold ${
                              res.riskLevel === 'LOW' ? 'text-emerald-400' : (res.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400')
                            }`}>{res.riskLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Decision Score:</span>
                            <strong className="text-indigo-400 font-extrabold">{res.score}/100</strong>
                          </div>
                        </div>

                        {/* Click to select/evaluate Strategy */}
                        {!isAuthorized && !isSimulating && (
                          <button
                            onClick={() => selectStrategy(res.strategyId.replace('STRAT-', ''))}
                            className={`w-full py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                              currentStrategyCode === res.strategyId.replace('STRAT-', '')
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                            }`}
                          >
                            {currentStrategyCode === res.strategyId.replace('STRAT-', '') ? 'Selected for Dispatch' : 'Evaluate Projections'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Before / After Projections Block */}
            {recommendation && recommendedResult && !policyDecision && (
              <div className="glass-card rounded-3xl p-6 border border-slate-950 space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-white text-sm">
                    Simulated Business State Projections (Strategy {currentStrategyCode})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    Simulation Agent projections for target branch metrics (Hyderabad Central)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before */}
                  <div className="p-4 rounded-2xl bg-rose-950/5 border border-rose-500/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400">Current State (Crisis)</span>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500/20 text-rose-400 rounded">Day 7 Snapshot</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Inventory Health:</span>
                        <strong className="text-slate-200">{recommendedResult.beforeMetrics.inventoryHealth}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Top-Seller Availability:</span>
                        <strong className="text-slate-200">{recommendedResult.beforeMetrics.topSellerAvailability.toFixed(1)}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Customer Sentiment:</span>
                        <strong className="text-slate-200">{recommendedResult.beforeMetrics.customerSentiment}%</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Operational Risk:</span>
                        <strong className="text-rose-400">HIGH</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimated Revenue Exposure:</span>
                        <strong className="text-rose-400">₹{(recommendedResult.beforeMetrics.estimatedRevenueExposure / 100000).toFixed(2)}L</strong>
                      </div>
                    </div>
                  </div>

                  {/* After */}
                  {(() => {
                    const activeRes = simulationResults.find(r => r.strategyId === `STRAT-${currentStrategyCode}`) || recommendedResult;
                    return (
                      <div className="p-4 rounded-2xl bg-indigo-950/5 border border-indigo-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400">Simulated Recovery State (Strategy {currentStrategyCode})</span>
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-400 rounded">Projected Restock</span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Inventory Health:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500">{recommendedResult.beforeMetrics.inventoryHealth}%</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <strong className="text-emerald-400">{activeRes.afterMetrics.inventoryHealth}%</strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Top-Seller Availability:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500">{recommendedResult.beforeMetrics.topSellerAvailability.toFixed(1)}%</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <strong className="text-emerald-400">{activeRes.afterMetrics.topSellerAvailability.toFixed(0)}%</strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Customer Sentiment:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500">{recommendedResult.beforeMetrics.customerSentiment}%</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <strong className="text-emerald-400">{activeRes.afterMetrics.customerSentiment}%</strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Operational Risk:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500">HIGH</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <strong className="text-emerald-400">
                                {activeRes.afterMetrics.operationalRiskScore <= 30 ? 'LOW' : (activeRes.afterMetrics.operationalRiskScore <= 60 ? 'MEDIUM' : 'HIGH')}
                              </strong>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Estimated Revenue Exposure:</span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-slate-500">₹{(recommendedResult.beforeMetrics.estimatedRevenueExposure / 100000).toFixed(2)}L</span>
                              <ArrowRight className="h-3 w-3 text-slate-600" />
                              <strong className="text-emerald-400">₹{(activeRes.afterMetrics.estimatedRevenueExposure / 100000).toFixed(2)}L</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Decision Intelligence comparison table */}
            {recommendation && !policyDecision && (
              <div className="glass-card rounded-3xl p-6 border border-slate-950 space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h4 className="font-bold text-white text-sm">
                    NERVA Decision Intelligence Matrix
                  </h4>
                  <span className="text-[10px] text-slate-550 font-black tracking-widest uppercase mt-1">
                    Normalized comparison scores and operational constraints across generated candidate options
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] text-left text-slate-400 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900/60 font-extrabold uppercase text-[8px] text-slate-500">
                        <th className="py-2.5 px-3">Rank & Option</th>
                        <th className="py-2.5 px-3">Recovery Rate</th>
                        <th className="py-2.5 px-3">Loss Prevented</th>
                        <th className="py-2.5 px-3">Direct Cost</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Risk Level</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3 text-right">Decision Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulationResults.map((res, idx) => {
                        const strat = recoveryStrategies.find(s => s.id === res.strategyId);
                        const isRecommended = idx === 0;

                        return (
                          <tr 
                            key={res.strategyId}
                            className={`border-b border-slate-900/40 hover:bg-slate-900/10 transition-colors ${
                              isRecommended ? 'bg-indigo-950/5 text-slate-200' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-bold flex items-center space-x-1.5">
                              <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                isRecommended ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <span>{strat?.name}</span>
                              {isRecommended && (
                                <span className="px-1.5 py-0.2 text-[7px] font-black bg-indigo-500/10 text-indigo-400 rounded uppercase border border-indigo-500/20">
                                  Rec
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-semibold">{res.expectedRecoveryPercent}%</td>
                            <td className="py-3 px-3 text-emerald-400 font-semibold">
                              {res.estimatedLossPrevented > 0 ? `₹${(res.estimatedLossPrevented/100000).toFixed(2)}L` : '₹0'}
                            </td>
                            <td className="py-3 px-3 font-semibold">
                              {res.estimatedDirectCost > 0 ? `₹${(res.estimatedDirectCost/100000).toFixed(3)}L` : '₹0'}
                            </td>
                            <td className="py-3 px-3 font-semibold">{res.estimatedResolutionHours} hours</td>
                            <td className={`py-3 px-3 font-bold uppercase ${
                              res.riskLevel === 'LOW' ? 'text-emerald-400' : (res.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400')
                            }`}>{res.riskLevel}</td>
                            <td className="py-3 px-3 font-semibold">{res.confidence}%</td>
                            <td className="py-3 px-3 text-right text-indigo-400 font-black text-xs">{res.score}/100</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Specialist Evidence Cards Panel */}
            {investigationState.status === 'Hypothesis Generated' && !recommendation && (
              <div className="space-y-4">
                <div className="border-b border-slate-900 pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
                    <FileText className="h-4.5 w-4.5 text-violet-400 mr-2" />
                    Specialist Agent Investigation Evidence Cards
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    Structured evidence objects compiled by active specialists
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investigationState.evidence.map(evd => {
                    const isRiskOnly = evd.contributingRiskOnly;
                    
                    return (
                      <div 
                        key={evd.id} 
                        className={`p-5 rounded-2xl bg-slate-950/60 border flex flex-col justify-between space-y-4 hover:border-slate-800 transition-all ${
                          isRiskOnly ? 'border-amber-500/25 bg-amber-950/5' : 'border-slate-900'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">{evd.signalType} Telemetry</span>
                            <span className="px-1.5 py-0.5 border border-slate-800 bg-slate-900 rounded text-slate-400 font-bold uppercase">
                              Agent: {evd.agentId.replace('AGT-', '')}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-xs mt-2">
                            {evd.title}
                          </h4>
                          
                          <p className="text-[10px] text-slate-455 leading-normal pt-0.5">
                            {evd.summary}
                          </p>
                        </div>

                        {/* Evidence Metrics */}
                        <div className="space-y-2 pt-3 border-t border-slate-900/60">
                          {evd.metrics.map((met, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-semibold">{met.label}:</span>
                              <strong className="text-slate-200">
                                {met.observed} <span className="text-slate-600 font-normal">vs {met.expected}</span>
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-[8px] text-slate-500 pt-2 border-t border-slate-900/40">
                          <span>Evidence ID: {evd.id}</span>
                          <span>Confidence: <strong className="text-slate-400">{evd.confidence}%</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recovery Strategies selector */}
            {!recommendation && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  AI Recovery Strategy Evaluation (Mock Terminal)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StrategyCard
                    id="A"
                    letter="A"
                    title="Emergency supplier purchase"
                    description="Purchase 800 units of beverages & dairy products from local premium wholesale market."
                    cost="₹48,000"
                    timeframe="12 hours"
                    successRate={78}
                    policyStatus="Requires Manager Signature"
                    isSelected={currentStrategyCode === 'A'}
                    onSelect={() => !isAuthorized && !isSimulating && selectStrategy('A')}
                  />
                  
                  <StrategyCard
                    id="B"
                    letter="B"
                    title="Inter-branch stock transfer"
                    description="Re-route 600 units of dairy & beverages from Vijayawada Central (surplus of 820 units)."
                    cost="₹12,550"
                    timeframe="6 hours"
                    successRate={94}
                    policyStatus="Auto-Execute Threshold Approved"
                    isRecommended={true}
                    isSelected={currentStrategyCode === 'B'}
                    onSelect={() => !isAuthorized && !isSimulating && selectStrategy('B')}
                  />

                  <StrategyCard
                    id="C"
                    letter="C"
                    title="Wait for supplier delivery"
                    description="Wait for Apex Distributors delayed delivery. Take no immediate re-routing action."
                    cost="₹0"
                    timeframe="52 hours"
                    successRate={15}
                    policyStatus="Operator Manual Overwrite"
                    isSelected={currentStrategyCode === 'C'}
                    onSelect={() => !isAuthorized && !isSimulating && selectStrategy('C')}
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Architecture Integration Hint Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/20 text-[10px] text-slate-500 leading-normal space-y-1">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Decision Intelligence Blueprint
          </p>
          <p>
            TODO: Connect Agent network nodes dynamically to actual agent worker microservices. Setup message routing using RabbitMQ/Redis streams. Connect Correlation Agent synthesis to distributed hypothesis nodes.
          </p>
        </div>
      </div>
    </div>
  );
};
export default WarRoom;
