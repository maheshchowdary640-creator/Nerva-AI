import { DayData } from './simulationService';
import { Anomaly } from '../types/sentinel';
import { 
  InvestigationState, InvestigationTask, InvestigationEvidence, RootCauseHypothesis, TaskStatus 
} from '../types/orchestrator';

// Define core specialist agents
export const SPECIALIST_AGENTS = [
  { id: 'AGT-COORD', name: 'Investigation Coordinator Agent', role: 'Task Dispatch & Assembly' },
  { id: 'AGT-INV', name: 'Inventory Agent', role: 'Shelf Stock Telemetry' },
  { id: 'AGT-CUST', name: 'Customer Intelligence Agent', role: 'Sentiment & Complaints' },
  { id: 'AGT-SUP', name: 'Supplier Agent', role: 'Logistics Tracking' },
  { id: 'AGT-WF', name: 'Workforce Agent', role: 'Attendance & Capacity' },
  { id: 'AGT-FIN', name: 'Finance Agent', role: 'P&L Risk Analysis' },
  { id: 'AGT-CORR', name: 'Correlation Agent', role: 'Causal Modelling' },
];

export const investigationService = {
  // 1. Initial State (Awaiting Investigation click)
  startInvestigation(incidentId: string): InvestigationState {
    const tasks: InvestigationTask[] = [
      { id: 'TSK-001', agentId: 'AGT-COORD', name: 'Initialize Investigation Tasks', status: 'RUNNING' },
      { id: 'TSK-002', agentId: 'AGT-INV', name: 'Analyze stock levels & stockouts', status: 'QUEUED' },
      { id: 'TSK-003', agentId: 'AGT-CUST', name: 'Evaluate complaints & customer sentiment', status: 'QUEUED' },
      { id: 'TSK-004', agentId: 'AGT-SUP', name: 'Analyze supplier delay hours & reliability', status: 'QUEUED' },
      { id: 'TSK-005', agentId: 'AGT-WF', name: 'Audit staff attendance logs', status: 'QUEUED' },
      { id: 'TSK-006', agentId: 'AGT-FIN', name: 'Analyze revenue drop & exposure risk', status: 'QUEUED' },
      { id: 'TSK-007', agentId: 'AGT-CORR', name: 'Synthesize evidence & build causal chain', status: 'WAITING' }
    ];

    return {
      incidentId,
      status: 'Investigating',
      tasks,
      evidence: [],
      hypothesis: null
    };
  },

  // 2. Clear State
  resetInvestigation(incidentId: string): InvestigationState {
    return {
      incidentId,
      status: 'Detected',
      tasks: SPECIALIST_AGENTS.map((agent, idx) => ({
        id: `TSK-00${idx + 1}`,
        agentId: agent.id,
        name: `Investigate ${agent.role}`,
        status: 'WAITING' as TaskStatus
      })),
      evidence: [],
      hypothesis: null
    };
  },

  // 3. Compute and run specialist agent analysis mathematically
  runFullInvestigation(
    incidentId: string, 
    dayData: DayData, 
    anomalies: Anomaly[]
  ): InvestigationState {
    const branchId = 'HYD-001';
    const branch = dayData.branches[branchId];
    const complaints = dayData.complaints.filter(c => c.branchId === branchId);

    // Run Specialist Agents and extract real values from simulation state
    // A. INVENTORY AGENT
    const topSellersCount = 15;
    const invAnm = anomalies.find(a => a.id.includes('ANM-STK-CRIT'));
    const totalDepleted = invAnm ? invAnm.deviation : (dayData.day >= 5 ? 8 : 0);
    const availability = branch?.topSellerAvailability ?? 100;
    const invHealth = branch?.inventoryHealth ?? 85;

    const inventoryEvidence: InvestigationEvidence = {
      id: 'EVD-INV-001',
      agentId: 'AGT-INV',
      signalType: 'INVENTORY',
      confidence: 94,
      title: 'Top-Seller Availability Depletion',
      summary: `${totalDepleted} of ${topSellersCount} top-selling dairy & beverages are out of stock. Operational inventory health dropped to ${invHealth}%. Shelf availability stands at ${availability.toFixed(1)}%.`,
      metrics: [
        { label: 'Out of Stock Top Sellers', observed: totalDepleted, expected: 0 },
        { label: 'Shelf Availability Rate', observed: `${availability.toFixed(1)}%`, expected: '100%' },
        { label: 'Inventory Health Index', observed: `${invHealth}%`, expected: '85%' }
      ]
    };

    // B. CUSTOMER AGENT
    const totalComplaintsCount = complaints.filter(c => c.date === `Day ${dayData.day}`).length;
    const unavailCount = complaints.filter(c => c.category === 'PRODUCT_UNAVAILABLE').length;
    const concentration = complaints.length > 0 ? (unavailCount / complaints.length) * 100 : 0;
    const sentiment = branch?.customerSentiment ?? 88;

    const customerEvidence: InvestigationEvidence = {
      id: 'EVD-CUST-001',
      agentId: 'AGT-CUST',
      signalType: 'CUSTOMER',
      confidence: 92,
      title: 'Customer Complaints Concentration Spike',
      summary: `Complaint volume spiked to ${totalComplaintsCount} daily reports. Product availability concerns represent ${concentration.toFixed(1)}% of total complaints. Sentiment index collapsed to ${sentiment}%.`,
      metrics: [
        { label: 'Daily Complaints Count', observed: totalComplaintsCount, expected: 1 },
        { label: 'Unavailable Product Complaints Concentration', observed: `${concentration.toFixed(1)}%`, expected: '<10%' },
        { label: 'Sentiment Rating', observed: `${sentiment}%`, expected: '88%' }
      ]
    };

    // C. SUPPLIER AGENT
    const delay = dayData.day >= 3 ? 52 : 0;
    const reliability = dayData.suppliers['SUP-001'] ?? 95;

    const supplierEvidence: InvestigationEvidence = {
      id: 'EVD-SUP-001',
      agentId: 'AGT-SUP',
      signalType: 'SUPPLIER',
      confidence: 95,
      title: 'Primary Supplier Replenishment Delay',
      summary: `Apex Distributors (SUP-001) shipment delayed by 52 hours. Supplier reliability score dropped to ${reliability}%. Delayed shipment contained Beverages & Dairy restocks.`,
      metrics: [
        { label: 'Apex Restocking Delay', observed: `${delay} hours`, expected: '0 hours' },
        { label: 'Supplier Reliability Rating', observed: `${reliability}%`, expected: '95%' },
        { label: 'Delayed Replenishment Load', observed: '1,200 units', expected: '0 units' }
      ]
    };

    // D. WORKFORCE AGENT (Contributing risk only!)
    const present = dayData.attendance[branchId]?.presentCount ?? 42;
    const total = dayData.attendance[branchId]?.totalCount ?? 42;
    const absentCount = total - present;

    const workforceEvidence: InvestigationEvidence = {
      id: 'EVD-WF-001',
      agentId: 'AGT-WF',
      signalType: 'WORKFORCE',
      confidence: 88,
      title: 'Logistics Coordinator Attendance Shortage',
      summary: `${absentCount} logistics coordinators absent from hub, slowing inventory escalation actions. This attendance deviation is flagged as a contributing operational risk factor, not a direct cause.`,
      metrics: [
        { label: 'Absent Workers Count', observed: absentCount, expected: 0 },
        { label: 'Warehouse Operational Capacity', observed: absentCount > 0 ? '70%' : '100%', expected: '100%' }
      ],
      contributingRiskOnly: true // Flagged clearly as contributing risk only
    };

    // E. FINANCE AGENT
    const revenueDecline = branch ? Math.abs(branch.revenueDecline) : 0;
    const exposure = branch ? branch.revenueExposure : 0;

    const financeEvidence: InvestigationEvidence = {
      id: 'EVD-FIN-001',
      agentId: 'AGT-FIN',
      signalType: 'FINANCE',
      confidence: 96,
      title: 'Hyderabad Branch Revenue Collapse',
      summary: `Daily Hyderabad revenue declined by ${revenueDecline.toFixed(1)}%. Cumulative estimated financial exposure calculated at ₹${(exposure / 100000).toFixed(2)}L.`,
      metrics: [
        { label: 'Daily Revenue Deviation', observed: `-${revenueDecline.toFixed(1)}%`, expected: '0.0%' },
        { label: 'Est. Crisis exposure', observed: `₹${(exposure / 100000).toFixed(2)}L`, expected: '₹0.0L' }
      ]
    };

    // F. CORRELATION AGENT (Hypothesis generator)
    // Formula for confidence score to yield 90% (88-92% range) on Day 7
    // delayVal = (52/52)*20 = 20
    // stockVal = (8/8)*25 = 25
    // compVal = (48/48)*20 = 20
    // revVal = (35/35)*25 = 25
    // wfVal = (2/2)*10 = 10
    // total = 100 -> subtract 10 for deterministic 90% confidence
    const delayVal = (delay / 52) * 20;
    const stockVal = (totalDepleted / 8) * 25;
    const compVal = (concentration / 48) * 20;
    const revVal = (revenueDecline / 35) * 25;
    const wfVal = (absentCount / 2) * 10;
    const calculatedConfidence = Math.round(delayVal + stockVal + compVal + revVal + wfVal - 10);

    const hypothesis: RootCauseHypothesis = {
      title: 'Likely supplier-delay-driven stock-out crisis',
      causalChain: [
        'Supplier delivery delay',
        'Stock not received',
        'Inventory escalation failure',
        'Top products out of stock',
        'Customer complaints increase',
        'Revenue decline'
      ],
      confidence: Math.max(70, Math.min(95, calculatedConfidence)), // Day 7 calculates exactly 90%
      evidenceSummary: 'Sentinel telemetry and specialist agent reasoning isolate primary logistics bottlenecks. Delayed restocking by Apex S1 led to inventory depletion. Operational capacity was constrained by worker absence, accelerating out-of-stock events and causing sentiment drop and sales decline.',
      label: 'AI-SUPPORTED ROOT CAUSE HYPOTHESIS'
    };

    const tasks: InvestigationTask[] = [
      { id: 'TSK-001', agentId: 'AGT-COORD', name: 'Initialize Investigation Tasks', status: 'COMPLETED' },
      { id: 'TSK-002', agentId: 'AGT-INV', name: 'Analyze stock levels & stockouts', status: 'COMPLETED' },
      { id: 'TSK-003', agentId: 'AGT-CUST', name: 'Evaluate complaints & customer sentiment', status: 'COMPLETED' },
      { id: 'TSK-004', agentId: 'AGT-SUP', name: 'Analyze supplier delay hours & reliability', status: 'COMPLETED' },
      { id: 'TSK-005', agentId: 'AGT-WF', name: 'Audit staff attendance logs', status: 'COMPLETED' },
      { id: 'TSK-006', agentId: 'AGT-FIN', name: 'Analyze revenue drop & exposure risk', status: 'COMPLETED' },
      { id: 'TSK-007', agentId: 'AGT-CORR', name: 'Synthesize evidence & build causal chain', status: 'COMPLETED' }
    ];

    return {
      incidentId,
      status: 'Hypothesis Generated',
      tasks,
      evidence: [supplierEvidence, inventoryEvidence, customerEvidence, financeEvidence, workforceEvidence],
      hypothesis
    };
  }
};
export default investigationService;
