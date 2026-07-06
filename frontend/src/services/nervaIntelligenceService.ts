import { Anomaly, SentinelIncident } from '../types/sentinel';
import { InvestigationState } from '../types/orchestrator';
import { RecoveryStrategy, StrategySimulationResult, DecisionRecommendation } from '../types/planner';
import { PolicyDecision } from '../types/policy';
import { ExecutionPlan, RecoveryMonitor } from '../types/execution';

export type AIProviderStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_CONFIGURED' | 'RATE_LIMITED' | 'ERROR';

export interface NervaIntelligenceContext {
  incident: SentinelIncident | null;
  anomalies: Anomaly[];
  investigationEvidence: any[];
  rootCauseHypothesis: any;
  strategies: RecoveryStrategy[];
  simulationResults: StrategySimulationResult[];
  decisionRecommendation: DecisionRecommendation | null;
  policyDecision: PolicyDecision | null;
  executionSummary?: {
    planId: string;
    status: string;
    progressPercent: number;
    tasksCount: number;
    completedCount: number;
  };
  recoverySummary?: {
    monitorStatus: string;
    currentHour: number;
    observedInventoryHealth: number;
    observedSentiment: number;
    observedRevenueDecline: number;
    predictionAccuracy: number;
  };
}

export const nervaIntelligenceService = {
  // Build sanitized, minimal context mapping current workspace state
  buildNervaIntelligenceContext(
    incident: SentinelIncident | null,
    anomalies: Anomaly[],
    investigation: InvestigationState,
    strategies: RecoveryStrategy[],
    simResults: StrategySimulationResult[],
    recommendation: DecisionRecommendation | null,
    policyDecision: PolicyDecision | null,
    plan: ExecutionPlan | null,
    monitor: RecoveryMonitor | null,
    currentHour: number
  ): NervaIntelligenceContext {
    return {
      incident: incident ? {
        id: incident.id,
        title: incident.title,
        code: incident.code,
        status: incident.status,
        severity: incident.severity,
        confidence: incident.confidence,
        estimatedExposure: incident.estimatedExposure,
        detectedAt: incident.detectedAt,
        description: incident.description,
        rootCauseChain: incident.rootCauseChain,
        affectedBranches: incident.affectedBranches,
        primaryAnomalyId: incident.primaryAnomalyId,
        relatedAnomalyIds: incident.relatedAnomalyIds,
        relatedEventIds: incident.relatedEventIds,
        affectedDomains: incident.affectedDomains,
        triggerRule: incident.triggerRule,
        impactDecline: incident.impactDecline
      } : null,
      anomalies: anomalies.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        branchId: a.branchId,
        signalType: a.signalType,
        detectorType: a.detectorType,
        metric: a.metric,
        observedValue: a.observedValue,
        expectedValue: a.expectedValue,
        deviationPercent: a.deviationPercent,
        severity: a.severity,
        confidence: a.confidence,
        status: a.status,
        relatedEventIds: [],
        evidence: a.evidence,
        deviation: a.deviation
      })),
      investigationEvidence: investigation.evidence.map(e => ({
        id: e.id,
        agentId: e.agentId,
        signalType: e.signalType,
        title: e.title,
        summary: e.summary,
        confidence: e.confidence,
        metrics: e.metrics
      })),
      rootCauseHypothesis: investigation.hypothesis ? {
        title: investigation.hypothesis.title,
        evidenceSummary: investigation.hypothesis.evidenceSummary,
        confidence: investigation.hypothesis.confidence,
        causalChain: investigation.hypothesis.causalChain
      } : null,
      strategies: strategies,
      simulationResults: simResults,
      decisionRecommendation: recommendation,
      policyDecision: policyDecision,
      executionSummary: plan ? {
        planId: plan.id,
        status: plan.status,
        progressPercent: Math.round((plan.tasks.filter(t => t.status === 'COMPLETED').length / plan.tasks.length) * 100),
        tasksCount: plan.tasks.length,
        completedCount: plan.tasks.filter(t => t.status === 'COMPLETED').length
      } : undefined,
      recoverySummary: monitor ? {
        monitorStatus: monitor.status,
        currentHour: currentHour,
        observedInventoryHealth: monitor.observedMetrics.inventoryHealth,
        observedSentiment: monitor.observedMetrics.customerSentiment,
        observedRevenueDecline: monitor.observedMetrics.revenueDecline,
        predictionAccuracy: monitor.checkpoints.find(c => c.elapsedHours === currentHour)?.predictionComparison[0]?.accuracyScore ?? 100
      } : undefined
    };
  },

  async checkGeminiHealth(): Promise<AIProviderStatus> {
    try {
      const res = await fetch('http://localhost:5000/api/nerva/health');
      if (!res.ok) return 'UNAVAILABLE';
      const data = await res.json();
      return data.status === 'AVAILABLE' ? 'AVAILABLE' : 'NOT_CONFIGURED';
    } catch {
      return 'UNAVAILABLE';
    }
  },

  async generateExplanation(type: string, context: NervaIntelligenceContext): Promise<string> {
    try {
      const res = await fetch('http://localhost:5000/api/nerva/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text;
      }
    } catch (e) {
      console.warn('Gemini endpoint offline. Using deterministic explanation fallback.', e);
    }
    
    // Fallback to deterministic briefing if API is offline or unconfigured
    return this.getDeterministicFallback(type, context);
  },

  async askQuestion(question: string, context: NervaIntelligenceContext): Promise<string> {
    try {
      const res = await fetch('http://localhost:5000/api/nerva/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text;
      }
    } catch (e) {
      console.warn('Gemini endpoint offline. Ask NERVA falling back.', e);
    }

    return this.getAskNervaDeterministicFallback(question, context);
  },

  // Deterministic Fallback generator templates
  getDeterministicFallback(type: string, context: NervaIntelligenceContext): string {
    if (type === 'INCIDENT_BRIEFING') {
      return `### Executive Briefing (Fallback Mode)
NERVA Sentinel detected a critical **revenue decline anomaly** of **35%** at target branch **Hyderabad Central** on simulated Day 7. 

**Incident Summary:**
- **Trigger Rule:** MULTI_DOMAIN_OUT_OF_STOCK
- **Revenue Exposure:** ₹710,000 at risk
- **Affected Domains:** Inventory (8 top-selling products out of stock), Suppliers (Apex delay of 52 hours), and Workforce (APSRTC coordinator absence).
- **Core Diagnosis:** A supplier transit breakdown was exacerbated by workforce absences, triggering stockouts and elevated customer drop-offs.`;
    }

    if (type === 'INVESTIGATION_SUMMARY') {
      return `### Specialist Investigation Analysis (Fallback Mode)
Specialist agents have completed their diagnostic trace checks on incident **INC-2041**:

- **Inventory Agent:** Confirmed 8 top-selling SKUs (including Pure Cow Milk and Masala Chai) are at zero stock levels. Stock depletion velocity hit critical levels 48 hours ago.
- **Supplier Agent:** Isolated a 52-hour delay at Apex Distributors caused by hub sorting backlog.
- **Workforce Agent:** Registered key dispatcher absences at Madhapur logistics hub.
- **Customer Intel Agent:** Documented a 180% surge in complaints regarding product unavailability.
- **AI-SUPPORTED ROOT CAUSE HYPOTHESIS:** Supplier-delay-driven stock-out crisis at Hyderabad node, aggravated by workforce capacity risk.`;
    }

    if (type === 'DECISION_EXPLANATION') {
      return `### Strategy Recommendation Briefing (Fallback Mode)
NERVA ranked three recovery strategies based on simulation snapshots:

1. **Strategy B (Inter-Branch Stock Transfer) — RECOMMENDED (Score: 92/100)**
   - *Expected Recovery:* 92% recovery within 24 hours.
   - *Direct Cost:* ₹12,550 (fully within ₹20,000 Level 4 autonomy threshold).
   - *Risk:* LOW. Reroutes surplus from Vijayawada Central without breaching source safety margins.
   
2. **Strategy A (Emergency Spot Procurement) — BACKUP (Score: 71/100)**
   - *Expected Recovery:* 78% recovery.
   - *Direct Cost:* ₹77,848 (exceeds autonomy limit; requires CFO sign-off).
   
3. **Strategy C (Wait for Supplier) — BLOCKED (Score: 15/100)**
   - *Expected Recovery:* 15%. Direct cost is ₹0 but exposure matches full ₹710,000 loss.`;
    }

    if (type === 'POSTMORTEM') {
      const acc = context.recoverySummary?.predictionAccuracy ?? 100;
      return `### Incident Postmortem Report (Fallback Mode)
Replenishment workflow for incident **INC-2041** was completed successfully.

- **Mitigation Action:** Inter-Branch Stock Transfer (600 units Vijayawada $\\rightarrow$ Hyderabad).
- **Recovery Outcome:** Hyderabad shelves replenished, top-sellers availability restored to 100%, and revenue decline minimized to baseline levels.
- **Prediction Accuracy:** **${acc}%** correlation between simulated predictions and observed metrics.
- **Incident Memory:** Incident profile successfully logged to local vector memory database for future retrieval matches.`;
    }

    return `Operational intelligence metrics loaded successfully. NERVA hybrid core remains active.`;
  },

  getAskNervaDeterministicFallback(question: string, context: NervaIntelligenceContext): string {
    const q = question.toLowerCase();
    if (q.includes('why') && q.includes('trigger')) {
      return "NERVA triggered incident NRV-2041 because Hyderabad Central's revenue decline hit 35% with 8 top-selling products concurrently out of stock due to a 52-hour supplier delay.";
    }
    if (q.includes('evidence') || q.includes('hypothesis')) {
      return "The root-cause hypothesis is supported by: (1) Supplier delay logs showing 52-hour latencies, (2) Inventory logs showing zero stock on top items, and (3) Customer complaint logs showing a 180% surge due to stockouts.";
    }
    if (q.includes('strategy b') || q.includes('recommend')) {
      return "Strategy B (stock transfer) is recommended because it has a 94% success rate, low direct cost (₹12,550), low risk, and is auto-authorized under Policy Rule POL-003.";
    }
    if (q.includes('accuracy') || q.includes('prediction')) {
      return "NERVA's recovery prediction was 100% accurate at the 24-hour mark, matching the simulated target of 91% inventory health and 75% customer sentiment.";
    }
    if (q.includes('policy') || q.includes('execute')) {
      return "The AI does not execute directly without validation. Under Policy Level 4 Controlled Autonomy, the Risk Agent pre-authorizes Strategy B (cost ₹12,550 < ₹20,000 threshold), while Strategy A requires manual CFO signatures.";
    }

    return "NERVA Core: Generative Q&A is currently offline. Active incident context: NRV-2041 is resolving using Strategy B (Inter-Branch Replenishment) with 94% expected success rate.";
  }
};
export default nervaIntelligenceService;
