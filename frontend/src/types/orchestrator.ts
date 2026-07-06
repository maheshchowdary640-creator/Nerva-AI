import { SignalType } from './sentinel';

export type TaskStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WAITING';
export type InvestigationStatus = 'Detected' | 'Investigating' | 'Hypothesis Generated' | 'Ready for Simulation' | 'Cleared';

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  signalDomain?: SignalType;
}

export interface InvestigationTask {
  id: string;
  agentId: string;
  name: string;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface InvestigationEvidence {
  id: string;
  agentId: string;
  signalType: SignalType;
  confidence: number;
  title: string;
  summary: string;
  metrics: {
    label: string;
    observed: string | number;
    expected: string | number;
  }[];
  contributingRiskOnly?: boolean;
}

export interface RootCauseHypothesis {
  title: string;
  causalChain: string[];
  confidence: number;
  evidenceSummary: string;
  label: string;
}

export interface InvestigationState {
  incidentId: string;
  status: InvestigationStatus;
  tasks: InvestigationTask[];
  evidence: InvestigationEvidence[];
  hypothesis: RootCauseHypothesis | null;
}
