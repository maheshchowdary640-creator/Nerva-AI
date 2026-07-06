export type AutonomyLevel =
  | 'LEVEL_0' // Monitoring Only
  | 'LEVEL_1' // Anomaly Detection
  | 'LEVEL_2' // AI Recommendations
  | 'LEVEL_3' // Workflow Preparation
  | 'LEVEL_4' // Low-Risk Autonomous Execution (Active Level)
  | 'LEVEL_5'; // Policy-Constrained Autonomous Operations

export type ApproverRole = 'AUTO_EXECUTE' | 'MANAGER_APPROVAL' | 'CFO_APPROVAL' | 'HUMAN_ONLY';

export type ApprovalWorkflowState =
  | 'NOT_REQUIRED'
  | 'PENDING_MANAGER'
  | 'PENDING_CFO'
  | 'APPROVED'
  | 'REJECTED'
  | 'BLOCKED';

export type PolicyDecisionStatus =
  | 'AUTONOMOUS_EXECUTION_PERMITTED'
  | 'APPROVAL_REQUIRED'
  | 'ACTION_BLOCKED';

export interface PolicyRule {
  id: string;
  name: string;
  actionType: string;
  description: string;
  thresholdAmount?: number;
  requiredApprover: ApproverRole;
}

export interface PolicyDecision {
  strategyId: string;
  incidentId: string;
  isAuthorized: boolean;
  approvalRequired: boolean;
  requiredApproverRole: 'NONE' | 'MANAGER' | 'CFO' | 'HUMAN';
  decisionStatus: PolicyDecisionStatus;
  reason: string;
  evaluatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  incidentId: string;
  strategyId: string;
  requestedBy: string;
  requiredApproverRole: 'MANAGER' | 'CFO';
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  decidedAt?: string;
}
