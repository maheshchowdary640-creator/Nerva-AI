import { SignalType } from './sentinel';

export type StrategyType = 'EMERGENCY_PROCUREMENT' | 'INTER_BRANCH_TRANSFER' | 'WAIT_FOR_SUPPLIER' | 'DEMAND_REDISTRIBUTION' | 'ALTERNATIVE_SUPPLIER' | 'CUSTOMER_RECOVERY';
export type StrategyStatus = 'GENERATED' | 'SIMULATING' | 'SIMULATED' | 'RANKED' | 'RECOMMENDED' | 'REJECTED';
export type ActionType = 'PURCHASE_INVENTORY' | 'TRANSFER_INVENTORY' | 'WAIT' | 'RESERVE_STOCK' | 'REDISTRIBUTE_STOCK' | 'NOTIFY_BRANCH' | 'NOTIFY_CUSTOMERS' | 'CREATE_LOGISTICS_TASK' | 'TERMINATE_EMPLOYEE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StrategyAction {
  id: string;
  type: ActionType;
  description: string;
  sourceBranchId: string;
  targetBranchId: string;
  supplierId?: string;
  productIds: string[];
  quantity: number;
  estimatedCost: number;
  estimatedDurationHours: number;
  metadata?: Record<string, any>;
}

export interface RecoveryStrategy {
  id: string;
  incidentId: string;
  name: string;
  description: string;
  strategyType: StrategyType;
  status: StrategyStatus;
  generatedAt: string;
  sourceEvidenceIds: string[];
  requiredResources: string[];
  affectedBranches: string[];
  affectedProducts: string[];
  estimatedDirectCost: number;
  estimatedDeliveryHours: number;
  operationalComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  assumptions: string[];
  actions: StrategyAction[];
}

export interface BusinessStateSnapshot {
  timestamp: string;
  simulationDay: number;
  branchStates: Record<string, {
    healthScore: number;
    revenue: number;
    revenueDecline: number;
    inventoryHealth: number;
    customerSentiment: number;
    workforceAttendance: number;
    topSellerAvailability: number;
    revenueExposure: number;
  }>;
  inventory: Record<string, Record<string, number>>; // branchId -> productId -> stockLevel
  suppliers: Record<string, number>; // supplierId -> reliability
}

export interface SimulatedMetrics {
  inventoryHealth: number;
  topSellerAvailability: number;
  revenueHealth: number;
  customerSentiment: number;
  operationalRiskScore: number;
  estimatedRevenueExposure: number;
  sourceBranchInventoryHealth?: number;
}

export interface StrategySimulationResult {
  strategyId: string;
  incidentId: string;
  status: 'SIMULATED';
  simulatedAt: string;
  beforeMetrics: SimulatedMetrics;
  afterMetrics: SimulatedMetrics;
  metricChanges: {
    inventoryHealth: number;
    topSellerAvailability: number;
    revenueHealth: number;
    customerSentiment: number;
    estimatedRevenueExposure: number;
  };
  estimatedDirectCost: number;
  estimatedAdditionalLoss: number;
  estimatedLossPrevented: number;
  expectedRecoveryPercent: number;
  estimatedResolutionHours: number;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  warnings: string[];
  assumptions: string[];
}

export interface DecisionRecommendation {
  incidentId: string;
  recommendedStrategyId: string;
  rankedStrategyIds: string[];
  decisionScore: number;
  confidence: number;
  reasonCodes: string[];
  comparisonSummary: string;
  generatedAt: string;
}
