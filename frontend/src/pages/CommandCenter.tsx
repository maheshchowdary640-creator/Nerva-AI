import React from 'react';
import { 
  Heart, AlertOctagon, TrendingDown, Cpu, 
  ArrowRight, ShieldCheck, Activity,
  ShoppingBag, Database, Users, Truck, Wallet, ShieldAlert
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { metricsService } from '../services/metricsService';
import { eventService } from '../services/eventService';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import SignalHealthCard from '../components/SignalHealthCard';
import IncidentCard from '../components/IncidentCard';
import { StatusBadge } from '../components/StatusBadge';

const JUDGE_DEMO_STEPS = [
  {
    step: 1,
    title: "NERVA is sensing the business",
    desc: "Six operational signal domains are running healthy at baseline levels. No anomalies detected.",
    note: "Explain that NERVA is not a chatbot. The six cards represent continuous operational signal domains."
  },
  {
    step: 2,
    title: "Supplier anomaly detected",
    desc: "A 52-hour delivery delay has entered the operational event stream at Day 3.",
    note: "Highlight that the supplier delay is an early signal. NERVA has not yet claimed a crisis."
  },
  {
    step: 3,
    title: "Inventory depletion is accelerating",
    desc: "Sentinel detects abnormal stock depletion at Day 4, before the actual revenue crisis hit.",
    note: "Explain that Sentinel identifies deviations from normal baselines before they hit financial metrics."
  },
  {
    step: 4,
    title: "Cross-domain risk detected",
    desc: "Critical stockouts and workforce absences combine at Day 5, increasing operational risk.",
    note: "Describe how NERVA correlates events across different departments (Inventory + Workforce)."
  },
  {
    step: 5,
    title: "Customer impact is growing",
    desc: "Complaint volume surges by 180% and sentiment drops to 42% at Day 6 due to empty shelves.",
    note: "Explain how empty shelves directly degrade the customer experience score."
  },
  {
    step: 6,
    title: "Critical Incident triggered: NRV-2041",
    desc: "Cross-domain anomalies exceed thresholds at Day 7. Sentinel triggers incident NRV-2041.",
    note: "Explain that Sentinel mathematically triggered NRV-2041 after cross-domain anomaly thresholds were exceeded."
  },
  {
    step: 7,
    title: "Activate specialist investigation agents",
    desc: "Coordinate coordinator, inventory, customer, supplier, and finance specialist agents.",
    note: "Emphasize that agents reason deterministically from structured telemetry logs, not LLMs."
  },
  {
    step: 8,
    title: "Root-cause hypothesis generated",
    desc: "Agent Orchestrator synthesizes findings into an evidence-supported root-cause hypothesis.",
    note: "Say that NERVA labels the result a hypothesis because correlation does not automatically prove causation."
  },
  {
    step: 9,
    title: "NERVA simulated & ranked recovery strategies",
    desc: "Simulator models Strategy A, B, and C on cloned snapshots. Decision Intelligence recommends B.",
    note: "Highlight that strategy ranking compares recovery, cost, loss prevented, risk, and speed."
  },
  {
    step: 10,
    title: "NERVA validates authority before action",
    desc: "Policy Engine runs pre-execution check. Strategy B is auto-authorized under Level 4 Autonomy.",
    note: "Explain policy-constrained autonomy. The AI cannot bypass company authority and limits."
  },
  {
    step: 11,
    title: "Execution Agent coordinates workflow",
    desc: "Enforces 10 workflow tasks in dependency order, locks source stock, and dispatches transit.",
    note: "Explain that tasks execute step-by-step or fully, actually modifying the simulation inventory state."
  },
  {
    step: 12,
    title: "Measure early operational response",
    desc: "Advance recovery to 6 simulated hours. Inventory restocked, sales recovery starts (+14%).",
    note: "Point out that metrics recover gradually over time, not instantly."
  },
  {
    step: 13,
    title: "Compare predicted & observed recovery",
    desc: "Advance recovery to 24 simulated hours. Metric accuracy calculated against simulation target.",
    note: "Show the prediction comparison matrix matching observed outcomes to simulated projections."
  },
  {
    step: 14,
    title: "Incident resolved & memory stored",
    desc: "Incident resolved. Resolution profile stored as Incident Memory for future similarity matches.",
    note: "Explain that NERVA stores structured resolution intelligence so similar future incidents can reuse successful operational knowledge."
  }
];

export const CommandCenter: React.FC = () => {
  const { 
    dayData, activeAnomalies, activeClusters, activeIncident, investigationState,
    judgeDemoMode, judgeDemoStep, showPresenterNotes,
    setJudgeDemoMode, advanceJudgeDemo, resetJudgeDemo, setShowPresenterNotes
  } = useSimulation();

  // Metrics calculation
  const businessHealth = metricsService.getBusinessWideHealthScore(dayData);
  
  // Driven directly by Sentinel Incident Trigger logic
  const activeIncidentsCount = activeIncident && activeIncident.status !== 'RESOLVED' ? 1 : 0;
  
  const revenueAtRiskValue = activeIncident 
    ? `₹${(activeIncident.estimatedExposure / 100000).toFixed(1)}L`
    : '₹0.0L';

  // AI Actions today: scale dynamically
  let aiActionsCount = 0;
  if (dayData.day === 1) aiActionsCount = 8;
  else if (dayData.day === 2) aiActionsCount = 12;
  else if (dayData.day === 3) aiActionsCount = 15;
  else if (dayData.day === 4) aiActionsCount = 19;
  else if (dayData.day === 5) aiActionsCount = 22;
  else if (dayData.day === 6) aiActionsCount = 25;
  else aiActionsCount = dayData.isAuthorized ? 31 : 27;

  // System cards details
  const getStreamStats = (stream: 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'SUPPLIER' | 'WORKFORCE' | 'FINANCE') => {
    const streamAnoms = activeAnomalies.filter(a => a.signalType === stream);
    const hasCritical = streamAnoms.some(a => a.severity === 'CRITICAL');
    const hasWarning = streamAnoms.some(a => a.severity === 'WARNING' || a.severity === 'MEDIUM');
    
    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    if (hasCritical) status = 'CRITICAL';
    else if (hasWarning) status = 'WARNING';

    switch (stream) {
      case 'SALES':
        const salesHealth = dayData.branches['HYD-001']?.healthScore >= 88 ? 94 : 76;
        return {
          health: salesHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Revenue Vol',
          value: `₹${(Object.values(dayData.branches).reduce((s, b) => s + b.revenue, 0) / 100000).toFixed(2)}L/day`,
          sparkline: 'M0,10 Q10,7 20,9 T40,6 T50,8',
          icon: ShoppingBag
        };
      case 'INVENTORY':
        let invHealth = 84;
        if (dayData.day === 3) invHealth = 72;
        else if (dayData.day === 4) invHealth = 58;
        else if (dayData.day === 5) invHealth = 34;
        else if (dayData.day >= 6) {
          invHealth = dayData.isAuthorized ? 76 : 28;
        }
        return {
          health: invHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Top-Seller Stock',
          value: `${dayData.branches['HYD-001']?.topSellerAvailability.toFixed(0)}% Avail`,
          sparkline: dayData.day >= 5 ? 'M0,5 Q10,6 20,11 T40,14 T50,15' : 'M0,5 Q10,6 20,5 T40,4 T50,5',
          icon: Database
        };
      case 'CUSTOMER':
        let custHealth = 88;
        if (dayData.day === 5) custHealth = 68;
        else if (dayData.day >= 6) {
          custHealth = dayData.isAuthorized ? 78 : 42;
        }
        return {
          health: custHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Sentiment Score',
          value: `${custHealth}% Pos`,
          sparkline: dayData.day >= 6 ? 'M0,4 Q10,6 20,12 T40,14 T50,13' : 'M0,4 Q10,5 20,4 T40,3 T50,4',
          icon: Users
        };
      case 'SUPPLIER':
        let supHealth = 95;
        if (dayData.day >= 3) {
          supHealth = dayData.isAuthorized ? 80 : 38;
        }
        return {
          health: supHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Fulfillment Rate',
          value: `${supHealth}% On-Time`,
          sparkline: dayData.day >= 3 ? 'M0,5 Q10,6 20,13 T40,15 T50,15' : 'M0,5 Q10,4 20,5 T40,4 T50,5',
          icon: Truck
        };
      case 'WORKFORCE':
        let workHealth = 92;
        if (dayData.day === 5) workHealth = 78;
        else if (dayData.day >= 6) {
          workHealth = dayData.isAuthorized ? 88 : 74;
        }
        return {
          health: workHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Attendance Rate',
          value: `${workHealth}% Attn`,
          sparkline: dayData.day >= 5 ? 'M0,6 Q10,7 20,10 T40,12 T50,11' : 'M0,6 Q10,5 20,6 T40,5 T50,6',
          icon: Users
        };
      case 'FINANCE':
        let finHealth = 96;
        if (dayData.day === 5) finHealth = 84;
        else if (dayData.day >= 6) {
          finHealth = dayData.isAuthorized ? 90 : 68;
        }
        return {
          health: finHealth,
          status,
          anomalies: streamAnoms.length,
          label: 'Margin Leakage',
          value: dayData.day >= 5 ? '₹12.5k Excess' : '₹0 Excess',
          sparkline: dayData.day >= 5 ? 'M0,4 Q10,5 20,9 T40,12 T50,13' : 'M0,4 Q10,3 20,4 T40,4 T50,4',
          icon: Wallet
        };
    }
  };

  const salesStats = getStreamStats('SALES');
  const inventoryStats = getStreamStats('INVENTORY');
  const customerStats = getStreamStats('CUSTOMER');
  const supplierStats = getStreamStats('SUPPLIER');
  const workforceStats = getStreamStats('WORKFORCE');
  const financeStats = getStreamStats('FINANCE');

  // Daily alert stream
  const todayEvents = dayData.events.filter((e: any) => e.day === dayData.day);

  // Group active anomalies by domain
  const anomalyDomains = Array.from(new Set(activeAnomalies.map(a => a.signalType)));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="NERVA Command Center — Sensing Layer" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Judge Demo Control Panel */}
        {judgeDemoMode ? (
          <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 shadow-xl shadow-indigo-950/30 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600/20 px-3.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-400">
              JUDGE DEMO PROTOCOL ACTIVE
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-indigo-950 pb-4">
              <div>
                <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                  Step {judgeDemoStep} of 14
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  {JUDGE_DEMO_STEPS[judgeDemoStep - 1].title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {JUDGE_DEMO_STEPS[judgeDemoStep - 1].desc}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={resetJudgeDemo}
                  className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-850 cursor-pointer"
                >
                  Reset Demo
                </button>
                {judgeDemoStep < 14 ? (
                  <button
                    onClick={advanceJudgeDemo}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    Next Valid Step
                  </button>
                ) : (
                  <button
                    onClick={() => setJudgeDemoMode(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Finish Demo
                  </button>
                )}
                <button
                  onClick={() => setJudgeDemoMode(false)}
                  className="px-3 py-2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Presenter Notes Option */}
            <div className="pt-1.5 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold">
                <button 
                  onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                  className="flex items-center space-x-1.5 hover:text-indigo-300 cursor-pointer"
                >
                  <span>{showPresenterNotes ? "Hide Presenter Note" : "Show Presenter Note"}</span>
                </button>
                <span className="text-slate-500 font-semibold">Guidelines for presentation scoring</span>
              </div>
              
              {showPresenterNotes && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-950/80 text-[10px] leading-relaxed text-indigo-300 font-mono shadow-inner">
                  <strong>Presenter Guideline:</strong> {JUDGE_DEMO_STEPS[judgeDemoStep - 1].note}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setJudgeDemoMode(true);
                resetJudgeDemo();
              }}
              className="flex items-center space-x-2 rounded-xl bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-500/25 px-4 py-2.5 text-xs font-bold text-indigo-400 cursor-pointer shadow-lg shadow-indigo-500/5 transition-all hover:scale-[1.01]"
            >
              <Cpu className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Start Judge Demo Mode</span>
            </button>
          </div>
        )}

        {/* Global Business KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Operational Health Score" 
            value={`${businessHealth}%`}
            subtext="Target 92%"
            highlightColor={businessHealth >= 85 ? 'emerald' : (businessHealth >= 65 ? 'amber' : 'rose')}
            icon={Heart}
          />
          <MetricCard 
            title="Active Operational Threats" 
            value={activeIncidentsCount.toString()}
            subtext={activeIncidentsCount > 0 ? "Replenishment Action Needed" : "System Balanced"}
            highlightColor={activeIncidentsCount > 0 ? 'rose' : 'emerald'}
            icon={AlertOctagon}
          />
          <MetricCard 
            title="Daily Exposure exposure" 
            value={revenueAtRiskValue}
            subtext={activeIncident ? "Vijayawada transfer routing" : "Zero exposure risk"}
            highlightColor={activeIncident ? 'rose' : 'emerald'}
            icon={TrendingDown}
          />
          <MetricCard 
            title="Autonomous Workflows Run" 
            value={aiActionsCount.toString()}
            subtext="Continuous telemetry auditing"
            highlightColor="violet"
            icon={Cpu}
          />
        </div>

        {/* Sentinel Alarm Box */}
        {activeIncident && (
          <IncidentCard 
            id={activeIncident.id}
            title={activeIncident.title}
            code={activeIncident.code}
            status={activeIncident.status}
            severity={activeIncident.severity}
            revenueAtRisk={activeIncident.estimatedExposure}
            impactDecline={activeIncident.impactDecline}
            detectedAt={activeIncident.detectedAt}
            description={activeIncident.description}
            showButton={true}
            investigationStatus={investigationState.status}
          />
        )}

        {/* Six Continuous Signal Streams Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
              <Activity className="h-4.5 w-4.5 text-indigo-400 mr-2" />
              Sensed Operational Signal Streams
            </h3>
            <span className="text-[9px] text-slate-550 font-black tracking-widest uppercase">
              Hybrid telemetry feeds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SignalHealthCard name="Sales Domain feed" lastUpdated="Just now" health={salesStats.health} status={salesStats.status} anomalies={salesStats.anomalies} subMetricLabel={salesStats.label} subMetricValue={salesStats.value} sparklinePath={salesStats.sparkline} icon={salesStats.icon} />
            <SignalHealthCard name="Inventory Domain feed" lastUpdated="Just now" health={inventoryStats.health} status={inventoryStats.status} anomalies={inventoryStats.anomalies} subMetricLabel={inventoryStats.label} subMetricValue={inventoryStats.value} sparklinePath={inventoryStats.sparkline} icon={inventoryStats.icon} />
            <SignalHealthCard name="Customer Domain feed" lastUpdated="Just now" health={customerStats.health} status={customerStats.status} anomalies={customerStats.anomalies} subMetricLabel={customerStats.label} subMetricValue={customerStats.value} sparklinePath={customerStats.sparkline} icon={customerStats.icon} />
            <SignalHealthCard name="Supplier Domain feed" lastUpdated="Just now" health={supplierStats.health} status={supplierStats.status} anomalies={supplierStats.anomalies} subMetricLabel={supplierStats.label} subMetricValue={supplierStats.value} sparklinePath={supplierStats.sparkline} icon={supplierStats.icon} />
            <SignalHealthCard name="Workforce Domain feed" lastUpdated="Just now" health={workforceStats.health} status={workforceStats.status} anomalies={workforceStats.anomalies} subMetricLabel={workforceStats.label} subMetricValue={workforceStats.value} sparklinePath={workforceStats.sparkline} icon={workforceStats.icon} />
            <SignalHealthCard name="Finance Domain feed" lastUpdated="Just now" health={financeStats.health} status={financeStats.status} anomalies={financeStats.anomalies} subMetricLabel={financeStats.label} subMetricValue={financeStats.value} sparklinePath={financeStats.sparkline} icon={financeStats.icon} />
          </div>
        </div>

        {/* Real-time telemetry log list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Anomalies Log (2 columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Sentinel Anomaly Log
              </h3>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Math processor filter
              </span>
            </div>

            {activeAnomalies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {anomalyDomains.map(domain => {
                  const domainAnom = activeAnomalies.filter(a => a.signalType === domain);
                  if (domainAnom.length === 0) return null;

                  return (
                    <div key={domain} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                          {domain} Telemetry
                        </h4>
                        <span className="h-5 w-5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold flex items-center justify-center">
                          {domainAnom.length}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {domainAnom.map(anm => {
                          let sevBorder = 'border-slate-850';
                          let sevText = 'text-slate-400';
                          if (anm.severity === 'CRITICAL') {
                            sevBorder = 'border-rose-500/20 bg-rose-950/5';
                            sevText = 'text-rose-400';
                          } else if (anm.severity === 'WARNING' || anm.severity === 'MEDIUM') {
                            sevBorder = 'border-amber-500/20 bg-amber-950/5';
                            sevText = 'text-amber-400';
                          }

                          return (
                            <div key={anm.id} className={`p-3 rounded-xl border ${sevBorder} space-y-2 text-[10px]`}>
                              <div className="flex justify-between items-center font-bold">
                                <span className="text-slate-300">{anm.metric}</span>
                                <span className={`uppercase font-bold tracking-wider ${sevText}`}>{anm.severity}</span>
                              </div>
                              <div className="text-slate-400 leading-normal">
                                {anm.evidence}
                              </div>
                              <div className="grid grid-cols-2 gap-2 border-t border-slate-900/60 pt-2 text-[9px] text-slate-500">
                                <div>Observed: <strong className="text-slate-300">{anm.observedValue}</strong></div>
                                <div>Expected: <strong className="text-slate-300">{anm.expectedValue}</strong></div>
                                <div>Confidence: <strong className="text-slate-400">{anm.confidence}%</strong></div>
                                <div>Status: <strong className="text-indigo-400 font-bold">{anm.status}</strong></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/20 border border-slate-900 flex flex-col items-center justify-center text-center space-y-2">
                <div className="h-9 w-9 rounded-full bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-bold text-white text-xs">No Telemetry Anomalies</h4>
                <p className="text-[10px] text-slate-500 max-w-sm">
                  Sentinel telemetry processor registers no deviation anomalies. Signal stream parameters conform to baseline standards.
                </p>
              </div>
            )}
          </div>

          {/* Sensed Events (1 column) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Sensed Operations Stream
              </h3>
              <span className="text-[9px] text-slate-550 font-black tracking-widest uppercase">
                Live chronological ledger
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-900 max-h-[350px] overflow-y-auto space-y-3.5 scrollbar-thin">
              {todayEvents.length > 0 ? (
                todayEvents.map((evt: any) => {
                  let badgeColor = 'bg-slate-900 text-slate-400 border-slate-800';
                  if (evt.severity === 'critical') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  else if (evt.severity === 'medium') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <div key={evt.id} className="text-[10px] leading-relaxed border-b border-slate-900/60 pb-3 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-bold">{evt.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${badgeColor}`}>
                          {evt.severity}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug">{evt.title}</h4>
                      <p className="text-slate-450 leading-normal">{evt.message}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-600 text-center py-20 text-[10px]">
                  [No operational events logged today]
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Architecture Integration Hint Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/20 text-[10px] text-slate-500 leading-normal space-y-1">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Backend & AI Agent Integration Blueprint
          </p>
          <p>
            TODO: Connect websocket telemetry listener to anomaly detection service. Connect live events to Kafka neural-signals topic. Integrate Gemini API analysis to automatically flag structural deviations.
          </p>
        </div>
      </div>
    </div>
  );
};
export default CommandCenter;
