import React from 'react';
import { 
  Activity, ShieldAlert, Network, Cpu, Settings2, CheckCircle2,
  TrendingDown, FileText, Database, ShieldCheck, HelpCircle, Sparkles, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export const HowItThinks: React.FC = () => {
  const pipeline = [
    {
      step: 1,
      title: "SENSE",
      sub: "Operational Feeds",
      desc: "Continuous structured telemetry feeds from 6 distinct signal streams: Sales, Inventory, Customer Sentiment, Suppliers, Workforce Attendance, and Financial Margins.",
      icon: Activity,
      color: "text-blue-400 bg-blue-950/20 border-blue-500/25"
    },
    {
      step: 2,
      title: "DETECT",
      sub: "Sentinel Processor",
      desc: "Mathematical detectors compare real-time metrics against rolling 7-day healthy baselines, identifying stockout velocities, sentiment drops, and cost leakages.",
      icon: ShieldAlert,
      color: "text-amber-400 bg-amber-950/20 border-amber-500/25"
    },
    {
      step: 3,
      title: "CORRELATE",
      sub: "Cross-Signal Clusterer",
      desc: "Sentinel clusters concurrent anomalies by branch location, timestamp proximity, and domain streams to identify systemic operational threat boundaries.",
      icon: Network,
      color: "text-rose-400 bg-rose-950/20 border-rose-500/25"
    },
    {
      step: 4,
      title: "INVESTIGATE",
      sub: "Multi-Agent Diagnostics",
      desc: "Coordinator assigns specialized agents (Inventory, Supplier, Workforce, Customer) to run diagnostics on telemetry databases.",
      icon: Cpu,
      color: "text-violet-400 bg-violet-950/20 border-violet-500/25"
    },
    {
      step: 5,
      title: "HYPOTHESIZE",
      sub: "Evidence Core",
      desc: "Correlation Agent synthesizes diagnostic logs into a structured root-cause hypothesis, isolating contributing factors without assuming causation.",
      icon: FileText,
      color: "text-indigo-400 bg-indigo-950/20 border-indigo-500/25"
    },
    {
      step: 6,
      title: "SIMULATE",
      sub: "State Sandbox",
      desc: "Captures an immutable business state snapshot. Clones the snapshot to model Strategy A (procure), B (transfer), and C (wait) in sandbox environments.",
      icon: Database,
      color: "text-teal-400 bg-teal-950/20 border-teal-500/25"
    },
    {
      step: 7,
      title: "DECIDE",
      sub: "Decision Intelligence",
      desc: "Ranks recovery options by evaluating simulated success rates, direct implementation costs, prevented losses, operational risks, and recovery speeds.",
      icon: TrendingDown,
      color: "text-emerald-400 bg-emerald-950/20 border-emerald-500/25"
    },
    {
      step: 8,
      title: "GOVERN",
      sub: "Policy Engine",
      desc: "Validates recommended strategies against corporate rules. If cost exceeds ₹20k, locks dispatch and queues request for manual CFO signature.",
      icon: Settings2,
      color: "text-purple-400 bg-purple-950/20 border-purple-500/25"
    },
    {
      step: 9,
      title: "ACT",
      sub: "Execution Orchestrator",
      desc: "Generates 10 workflow tasks in dependency order. Mutates state: locks source stock, schedules logistics NRV-LOG-07, and receives replenishment.",
      icon: ShieldCheck,
      color: "text-cyan-400 bg-cyan-950/20 border-cyan-500/25"
    },
    {
      step: 10,
      title: "LEARN",
      sub: "Incident Memory",
      desc: "Monitors post-action checkpoints (0h, 6h, 24h). Computes prediction accuracy scorecard and logs incident profile for future similarity matchings.",
      icon: CheckCircle2,
      color: "text-pink-400 bg-pink-950/20 border-pink-500/25"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      {/* Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="NERVA Hybrid Intelligence Architecture" />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Core Tagline Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-900 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-violet-600/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-violet-400 border-l border-b border-violet-500/20">
            HYBRID COGNITION PATTERN
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            NERVA AI Brand Positioning
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide">
            “The Autonomous Nervous System for Business Operations”
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-5xl">
            NERVA separates **computational decision capability** from **natural explanation synthesis**. Every sensing alert, investigation diagnosis, strategy sandboxing, policy validation check, and execution dispatch is driven by strict deterministic logic. Generative AI is restricted to explaining these computations to humans.
          </p>
        </div>

        {/* 10 Step Visual Grid Flow */}
        <div className="space-y-4">
          <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center">
              <Network className="h-4.5 w-4.5 text-violet-400 mr-2" />
              Operational Reasoning Flow (Sense-to-Learn)
            </h3>
            <span className="text-[9px] text-slate-550 font-black tracking-widest uppercase">
              10-Stage Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipeline.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.step}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 hover:border-slate-850 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all relative group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-500 tracking-wider">STAGE 0{step.step}</span>
                      <div className={`p-1.5 rounded-lg border ${step.color}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-black text-white text-xs tracking-wider uppercase">{step.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{step.sub}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-normal">
                      {step.desc}
                    </p>
                  </div>

                  {step.step < 10 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-800 font-bold group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Division of Authority Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Deterministic Core */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/20 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>DETERMINISTIC COGNITION CORE (Source of Truth)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every operation executed by NERVA is computed mathematically and validated algorithmically:
            </p>
            <ul className="text-[10px] text-slate-455 space-y-2 pt-1.5 list-disc pl-4 leading-normal">
              <li><strong className="text-slate-350">Anomaly Sensing:</strong> ripping standard deviation variance checks.</li>
              <li><strong className="text-slate-350">specialist Diagnostics:</strong> reading database transaction metrics.</li>
              <li><strong className="text-slate-350">Strategy Sandboxing:</strong> cloning current state parameter snapshots.</li>
              <li><strong className="text-slate-350">Autonomy Policies:</strong> hardcoded cost limits (₹20k/₹50k threshold bounds).</li>
              <li><strong className="text-slate-350">State Mutations:</strong> reserved/transit inventory adjustments.</li>
            </ul>
          </div>

          {/* Generative Explainer */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              <span>GENERATIVE AI LAYER (Optional Explanation & Synthesis)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Gemini acts exclusively as a read-only translation layer for humans:
            </p>
            <ul className="text-[10px] text-slate-455 space-y-2 pt-1.5 list-disc pl-4 leading-normal">
              <li><strong className="text-slate-350">Executive Briefings:</strong> compiling telemetry states into summaries.</li>
              <li><strong className="text-slate-350">Hypothesis Summarizer:</strong> narrating correlated causal timelines.</li>
              <li><strong className="text-slate-350">Postmortem Narratives:</strong> drafting incident resolution briefs.</li>
              <li><strong className="text-slate-350">Judge Q&A Interface:</strong> answering user operational questions.</li>
              <li><strong className="text-slate-350">Authority Limit:</strong> cannot override rules or write database changes.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
export default HowItThinks;
