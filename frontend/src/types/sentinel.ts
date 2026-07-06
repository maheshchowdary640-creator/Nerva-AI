export type AnomalySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'WARNING' | 'CRITICAL';
export type AnomalyStatus = 'DETECTED' | 'CORRELATED' | 'ESCALATED' | 'RESOLVED';
export type SignalType = 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'SUPPLIER' | 'WORKFORCE' | 'FINANCE';

export interface Anomaly {
  id: string;
  timestamp: string;
  branchId: string;
  signalType: SignalType;
  detectorType: string;
  metric: string;
  observedValue: number | string;
  expectedValue: number | string;
  deviation: number;
  deviationPercent: number;
  severity: AnomalySeverity;
  confidence: number; // 0 - 100
  status: AnomalyStatus;
  relatedEventIds: string[];
  evidence: string;
}

export interface AnomalyCluster {
  id: string;
  branchId: string;
  timestamp: string;
  anomalies: Anomaly[];
  status: 'DETECTED' | 'CORRELATED' | 'ESCALATED' | 'RESOLVED';
  confidence: number;
  totalRevenueExposure: number;
  description: string;
}

export interface SentinelIncident {
  id: string;
  title: string;
  code: string;
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVING' | 'RESOLVED' | 'STRATEGY_RECOMMENDED' | 'AWAITING_POLICY_CHECK';
  severity: 'low' | 'medium' | 'high' | 'critical';
  primaryAnomalyId: string;
  relatedAnomalyIds: string[];
  relatedEventIds: string[];
  affectedDomains: SignalType[];
  confidence: number;
  estimatedExposure: number;
  impactDecline: number;
  triggerRule: string;
  detectedAt: string;
  description: string;
  rootCauseChain: string[];
  affectedBranches: string[];
}
