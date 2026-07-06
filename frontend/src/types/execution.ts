import { ActionType } from './planner';

export type ExecutionPlanStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'READY'
  | 'EXECUTING'
  | 'MONITORING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED';

export type ExecutionTaskStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'SKIPPED';

export type TransferStatus =
  | 'CREATED'
  | 'VALIDATING'
  | 'RESERVED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'FAILED';

export type LogisticsTaskStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'FAILED';

export type NotificationRecipientType = 'BRANCH' | 'ROLE' | 'USER' | 'SYSTEM';
export type NotificationStatus = 'CREATED' | 'SENT' | 'READ';

export type RecoveryMonitorStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'RECOVERING'
  | 'RECOVERED'
  | 'STALLED'
  | 'REGRESSED';

export interface ExecutionPlan {
  id: string;
  incidentId: string;
  strategyId: string;
  policyDecisionId: string;
  status: ExecutionPlanStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  tasks: ExecutionTask[];
  estimatedDurationHours: number;
  expectedOutcome: string;
}

export interface ExecutionTask {
  id: string;
  executionPlanId: string;
  incidentId: string;
  strategyId: string;
  type: string;
  title: string;
  description: string;
  status: ExecutionTaskStatus;
  dependencies: string[]; // task IDs
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  input?: any;
  output?: any;
  error?: string;
  auditEventIds: string[];
}

export interface ExecutionResult {
  executionPlanId: string;
  incidentId: string;
  strategyId: string;
  status: ExecutionPlanStatus;
  tasksCompleted: number;
  tasksFailed: number;
  businessChanges: string[];
  auditEvents: string[];
  startedAt: string;
  completedAt: string;
}

export interface StockTransferItem {
  productId: string;
  requestedQuantity: number;
  reservedQuantity: number;
  dispatchedQuantity: number;
  receivedQuantity: number;
}

export interface StockTransferRequest {
  id: string;
  incidentId: string;
  strategyId: string;
  sourceBranchId: string;
  targetBranchId: string;
  items: StockTransferItem[];
  status: TransferStatus;
  estimatedCost: number;
  estimatedDurationHours: number;
  createdAt: string;
  reservedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

export interface LogisticsTask {
  id: string;
  incidentId: string;
  executionPlanId: string;
  transferRequestId: string;
  sourceBranchId: string;
  targetBranchId: string;
  status: LogisticsTaskStatus;
  estimatedDepartureTime: string;
  estimatedArrivalTime: string;
  actualDepartureTime?: string;
  actualArrivalTime?: string;
  vehicleReference: string;
  createdAt: string;
}

export interface InternalNotification {
  id: string;
  incidentId: string;
  executionPlanId: string;
  recipientType: NotificationRecipientType;
  recipientId: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
}

export interface ExecutionAuditEvent {
  id: string;
  timestamp: string;
  incidentId: string;
  executionPlanId: string;
  taskId?: string;
  actorType: 'NERVA_AGENT' | 'SYSTEM' | 'HUMAN';
  actorId: string;
  action: string;
  resourceType: 'PLAN' | 'TASK' | 'TRANSFER' | 'LOGISTICS' | 'NOTIFICATION' | 'INVENTORY' | 'POLICY';
  resourceId: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'INFO';
  details: string;
}

export interface RecoveryCheckpoint {
  id: string;
  monitorId: string;
  checkpointLabel: string;
  elapsedHours: number;
  timestamp: string;
  metrics: {
    inventoryHealth: number;
    topSellerAvailability: number;
    customerSentiment: number;
    revenueDecline: number;
    operationalRiskScore: number;
    revenueExposure: number;
  };
  predictionComparison: PredictionComparison[];
  status: 'PENDING' | 'COMPLETED';
}

export interface PredictionComparison {
  metric: string;
  predictedValue: number;
  observedValue: number;
  absoluteDifference: number;
  percentageDifference: number;
  accuracyScore: number;
}

export interface RecoveryMonitor {
  id: string;
  incidentId: string;
  executionPlanId: string;
  strategyId: string;
  status: RecoveryMonitorStatus;
  startedAt: string;
  lastEvaluatedAt: string;
  completedAt?: string;
  predictedMetrics: {
    inventoryHealth: number;
    topSellerAvailability: number;
    customerSentiment: number;
    revenueDecline: number;
    operationalRiskScore: number;
    revenueExposure: number;
  };
  observedMetrics: {
    inventoryHealth: number;
    topSellerAvailability: number;
    customerSentiment: number;
    revenueDecline: number;
    operationalRiskScore: number;
    revenueExposure: number;
  };
  checkpoints: RecoveryCheckpoint[];
}

export interface IncidentResolutionSummary {
  incidentId: string;
  problem: string;
  rootCauseHypothesisId: string;
  strategyId: string;
  strategyName: string;
  executionPlanId: string;
  resolutionTimeHours: number;
  estimatedLossPrevented: number;
  predictedRecovery: number;
  observedRecovery: number;
  predictionAccuracy: number;
  finalBusinessMetrics: {
    inventoryHealth: number;
    topSellerAvailability: number;
    customerSentiment: number;
    revenueDecline: number;
    operationalRiskScore: number;
    revenueExposure: number;
  };
  resolvedAt: string;
}

export interface IncidentMemoryRecord {
  id: string;
  incidentId: string;
  incidentType: string;
  affectedSignalDomains: string[];
  branchId: string;
  rootCauseSignature: string;
  evidenceSignature: string;
  strategyType: string;
  strategyFeatures: string[];
  executionOutcome: string;
  recoveryMetrics: {
    inventoryHealth: number;
    topSellerAvailability: number;
    customerSentiment: number;
    revenueDecline: number;
    operationalRiskScore: number;
    revenueExposure: number;
  };
  predictionAccuracy: number;
  createdAt: string;
}
