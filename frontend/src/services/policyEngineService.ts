import { PolicyRule, PolicyDecision, AutonomyLevel } from '../types/policy';
import { RecoveryStrategy, StrategySimulationResult } from '../types/planner';

// Default corporate policy rules registry
export const CORPORATE_POLICY_RULES: PolicyRule[] = [
  {
    id: 'POL-001',
    name: 'Internal Notification Dispatch',
    actionType: 'NOTIFICATION',
    description: 'Dispatch alert notifications to internal communication streams (Slack/Email).',
    requiredApprover: 'AUTO_EXECUTE'
  },
  {
    id: 'POL-002',
    name: 'Internal Task Creation',
    actionType: 'CREATE_TASK',
    description: 'Log and assign internal maintenance or checkup tasks inside workbooks.',
    requiredApprover: 'AUTO_EXECUTE'
  },
  {
    id: 'POL-003',
    name: 'Inter-Branch Stock Transfer Limit',
    actionType: 'TRANSFER_INVENTORY',
    description: 'Autonomously transfer stock between operational network branch coordinates.',
    thresholdAmount: 20000,
    requiredApprover: 'AUTO_EXECUTE' // If below ₹20k, otherwise requires manager signature
  },
  {
    id: 'POL-004',
    name: 'Low-Value Restock Purchase',
    actionType: 'PURCHASE_INVENTORY',
    description: 'Procure emergency stock from approved spot-market wholesale partners.',
    thresholdAmount: 50000,
    requiredApprover: 'MANAGER_APPROVAL' // If below ₹50k, requires manager signature
  },
  {
    id: 'POL-005',
    name: 'High-Value Restock Purchase',
    actionType: 'PURCHASE_INVENTORY_HIGH',
    description: 'Procure high-volume restock exceeding standard emergency caps.',
    thresholdAmount: 50000,
    requiredApprover: 'CFO_APPROVAL' // If above ₹50k, requires CFO signature
  },
  {
    id: 'POL-006',
    name: 'Staff Termination Constraint',
    actionType: 'TERMINATE_EMPLOYEE',
    description: 'Initiate employment termination or staffing disciplinary workflows.',
    requiredApprover: 'HUMAN_ONLY'
  }
];

export const policyEngineService = {
  getRules(): PolicyRule[] {
    return CORPORATE_POLICY_RULES;
  },

  evaluateStrategyAuthorization(
    strategy: RecoveryStrategy,
    simulationResult: StrategySimulationResult,
    currentAutonomyLevel: AutonomyLevel = 'LEVEL_4'
  ): PolicyDecision {
    const evaluatedAt = new Date().toISOString();
    const incidentId = strategy.incidentId;
    const strategyId = strategy.id;

    // Check for explicit blocked actions
    const hasForbiddenAction = strategy.actions.some(
      action => action.type === 'TERMINATE_EMPLOYEE'
    );
    if (hasForbiddenAction) {
      return {
        strategyId,
        incidentId,
        isAuthorized: false,
        approvalRequired: false,
        requiredApproverRole: 'HUMAN',
        decisionStatus: 'ACTION_BLOCKED',
        reason: 'Restricted action detected: Employee termination workflow requires exclusive human oversight.',
        evaluatedAt
      };
    }

    // LEVEL 0 - LEVEL 3 do not allow any autonomous action dispatch
    if (
      currentAutonomyLevel === 'LEVEL_0' ||
      currentAutonomyLevel === 'LEVEL_1' ||
      currentAutonomyLevel === 'LEVEL_2' ||
      currentAutonomyLevel === 'LEVEL_3'
    ) {
      const requiredRole = currentAutonomyLevel === 'LEVEL_3' ? 'MANAGER' : 'CFO';
      return {
        strategyId,
        incidentId,
        isAuthorized: false,
        approvalRequired: true,
        requiredApproverRole: requiredRole as any,
        decisionStatus: 'APPROVAL_REQUIRED',
        reason: `Current active autonomy level (${currentAutonomyLevel}) does not permit autonomous operational changes. Human approval is required.`,
        evaluatedAt
      };
    }

    // Strategy-specific rules check
    if (strategy.strategyType === 'WAIT_FOR_SUPPLIER') {
      return {
        strategyId,
        incidentId,
        isAuthorized: true,
        approvalRequired: false,
        requiredApproverRole: 'NONE',
        decisionStatus: 'AUTONOMOUS_EXECUTION_PERMITTED',
        reason: 'Wait strategy incurs ₹0 direct cost. Suspension of immediate action does not require operational funding approval.',
        evaluatedAt
      };
    }

    if (strategy.strategyType === 'INTER_BRANCH_TRANSFER') {
      const cost = strategy.estimatedDirectCost;
      const transferRule = CORPORATE_POLICY_RULES.find(r => r.actionType === 'TRANSFER_INVENTORY');
      const limit = transferRule?.thresholdAmount ?? 20000;

      if (cost <= limit) {
        if (simulationResult.riskLevel === 'HIGH') {
          return {
            strategyId,
            incidentId,
            isAuthorized: false,
            approvalRequired: true,
            requiredApproverRole: 'MANAGER',
            decisionStatus: 'APPROVAL_REQUIRED',
            reason: `Stock transfer cost of ₹${cost.toLocaleString()} is within auto-execute limit, but simulated operational risk is HIGH, requiring Manager approval.`,
            evaluatedAt
          };
        }

        return {
          strategyId,
          incidentId,
          isAuthorized: true,
          approvalRequired: false,
          requiredApproverRole: 'NONE',
          decisionStatus: 'AUTONOMOUS_EXECUTION_PERMITTED',
          reason: `Stock transfer is below ₹${limit.toLocaleString()} and risk is ${simulationResult.riskLevel}. Autonomous execution permitted.`,
          evaluatedAt
        };
      } else {
        return {
          strategyId,
          incidentId,
          isAuthorized: false,
          approvalRequired: true,
          requiredApproverRole: 'MANAGER',
          decisionStatus: 'APPROVAL_REQUIRED',
          reason: `Stock transfer cost (₹${cost.toLocaleString()}) exceeds the ₹${limit.toLocaleString()} auto-execute limit. Manager approval required.`,
          evaluatedAt
        };
      }
    }

    if (strategy.strategyType === 'EMERGENCY_PROCUREMENT') {
      const cost = strategy.estimatedDirectCost;
      const purchaseRule = CORPORATE_POLICY_RULES.find(r => r.actionType === 'PURCHASE_INVENTORY');
      const limit = purchaseRule?.thresholdAmount ?? 50000;

      if (cost <= limit) {
        return {
          strategyId,
          incidentId,
          isAuthorized: false,
          approvalRequired: true,
          requiredApproverRole: 'MANAGER',
          decisionStatus: 'APPROVAL_REQUIRED',
          reason: `Emergency purchase cost of ₹${cost.toLocaleString()} is below the ₹${limit.toLocaleString()} threshold. Manager approval required.`,
          evaluatedAt
        };
      } else {
        return {
          strategyId,
          incidentId,
          isAuthorized: false,
          approvalRequired: true,
          requiredApproverRole: 'CFO',
          decisionStatus: 'APPROVAL_REQUIRED',
          reason: `Emergency purchase cost of ₹${cost.toLocaleString()} exceeds the ₹${limit.toLocaleString()} CFO threshold. CFO approval required.`,
          evaluatedAt
        };
      }
    }

    // Default fallback
    return {
      strategyId,
      incidentId,
      isAuthorized: false,
      approvalRequired: true,
      requiredApproverRole: 'MANAGER',
      decisionStatus: 'APPROVAL_REQUIRED',
      reason: 'Action parameters are outside standard auto-execution boundaries.',
      evaluatedAt
    };
  }
};
export default policyEngineService;
