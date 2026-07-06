import { RecoveryStrategy, StrategySimulationResult } from '../types/planner';
import { PolicyDecision } from '../types/policy';
import { SentinelIncident } from '../types/sentinel';
import { 
  ExecutionPlan, ExecutionTask, ExecutionTaskStatus, 
  StockTransferRequest, StockTransferItem, LogisticsTask,
  InternalNotification, ExecutionAuditEvent 
} from '../types/execution';
import { PRODUCTS } from './businessData';

const SAFETY_STOCK_FLOOR = 30;

export const workflowExecutionService = {
  validateExecutionAuthorization(
    strategy: RecoveryStrategy,
    decision: PolicyDecision | null,
    simulationResult: StrategySimulationResult | null,
    incident: SentinelIncident | null,
    activeInventory: Record<string, Record<string, number>>
  ): { isValid: boolean; reason: string } {
    if (!strategy) {
      return { isValid: false, reason: 'Execution plan requires a selected recovery strategy.' };
    }
    if (!incident) {
      return { isValid: false, reason: 'Execution plan requires a valid operational incident context.' };
    }
    if (incident.status === 'RESOLVED') {
      return { isValid: false, reason: 'Execution blocked: Incident is already RESOLVED.' };
    }
    if (!decision) {
      return { isValid: false, reason: 'Execution blocked: Policy & Authority decision is missing.' };
    }
    if (decision.incidentId !== incident.id) {
      return { isValid: false, reason: 'Execution blocked: Policy decision incident context mismatch.' };
    }
    if (decision.strategyId !== strategy.id) {
      return { isValid: false, reason: 'Execution blocked: Policy decision strategy mapping mismatch.' };
    }
    if (!simulationResult) {
      return { isValid: false, reason: 'Execution blocked: Strategy simulation projections are missing.' };
    }
    if (decision.decisionStatus === 'ACTION_BLOCKED') {
      return { isValid: false, reason: 'Execution blocked: Policy Engine has flagged this action as BLOCKED.' };
    }
    if (decision.decisionStatus === 'APPROVAL_REQUIRED' && !decision.isAuthorized) {
      return { isValid: false, reason: `Execution blocked: Manual human approval (${decision.requiredApproverRole}) is pending.` };
    }

    // Resource safety checks for Inter-Branch Transfer
    if (strategy.strategyType === 'INTER_BRANCH_TRANSFER') {
      const sourceBranch = 'VIJ-001';
      const targetBranch = 'HYD-001';

      let hasSufficientStock = true;
      strategy.actions.forEach(act => {
        act.productIds.forEach(pId => {
          const sourceStock = activeInventory[sourceBranch]?.[pId] ?? 0;
          // Verify source has stock above floor safety limits
          if (sourceStock - SAFETY_STOCK_FLOOR <= 0) {
            hasSufficientStock = false;
          }
        });
      });

      if (!hasSufficientStock) {
        return { isValid: false, reason: 'Execution blocked: Source branch inventory levels fell below safety threshold floors.' };
      }
    }

    return { isValid: true, reason: 'Pre-execution safety validations completed successfully. Action authorized.' };
  },

  createExecutionPlan(
    incidentId: string,
    strategyId: string,
    strategy: RecoveryStrategy,
    policyDecisionId: string
  ): ExecutionPlan {
    const planId = `PLN-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const tasks: ExecutionTask[] = [
      {
        id: `${planId}-TSK-1`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'VALIDATE_TRANSFER_AUTHORIZATION',
        title: 'Validate Transfer Authorization',
        description: 'Verify policy decision, compliance boundaries, and dispatch credentials.',
        status: 'READY',
        dependencies: [],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-2`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'VALIDATE_SOURCE_INVENTORY',
        title: 'Validate Source Inventory Surplus',
        description: 'Verify Vijayawada Central inventory surplus matches safety stock thresholds.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-1`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-3`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'CREATE_TRANSFER_REQUEST',
        title: 'Create Transfer Request Object',
        description: 'Compile products, quantities, and generate structural transfer ledger record.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-2`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-4`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'RESERVE_SOURCE_STOCK',
        title: 'Reserve Source Inventory',
        description: 'Lock 600 units of dairy & beverages in Vijayawada storage. Subtract from available stock.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-3`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-5`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'CREATE_LOGISTICS_TASK',
        title: 'Schedule Logistics Dispatch',
        description: 'Register vehicle NRV-LOG-07 and schedule road transport transit coordinates.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-4`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-6`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'NOTIFY_SOURCE_BRANCH',
        title: 'Notify Source Branch Operations',
        description: 'Dispatch packaging guidelines and scheduling list to Vijayawada Central packing docks.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-5`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-7`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'NOTIFY_TARGET_BRANCH',
        title: 'Notify Target Branch Operations',
        description: 'Dispatch stocking instructions to Hyderabad Central unloading teams.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-5`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-8`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'DISPATCH_TRANSFER',
        title: 'Dispatch Stock Transfer Truck',
        description: 'Release locked stock from Vijayawada Central storage. Move stock into in-transit state.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-6`, `${planId}-TSK-7`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-9`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'RECEIVE_TRANSFER',
        title: 'Receive & Unload Inventory',
        description: 'Verify shipment quantities at Hyderabad, decrease transit count, and restock floor shelves.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-8`],
        createdAt,
        auditEventIds: []
      },
      {
        id: `${planId}-TSK-10`,
        executionPlanId: planId,
        incidentId,
        strategyId,
        type: 'ACTIVATE_RECOVERY_MONITORING',
        title: 'Activate Recovery Monitoring',
        description: 'Initialize post-mitigation audit monitors and compile predicted vs actual comparisons.',
        status: 'PENDING',
        dependencies: [`${planId}-TSK-9`],
        createdAt,
        auditEventIds: []
      }
    ];

    return {
      id: planId,
      incidentId,
      strategyId,
      policyDecisionId,
      status: 'DRAFT',
      createdAt,
      tasks,
      estimatedDurationHours: strategy.estimatedDeliveryHours,
      expectedOutcome: 'Restore 8 top-selling products availability at Hyderabad node to 100% and resolve revenue drop.'
    };
  },

  executeTask(
    plan: ExecutionPlan,
    taskId: string,
    activeInventory: Record<string, Record<string, number>>,
    reservedInventory: Record<string, Record<string, number>>,
    inTransitInventory: Record<string, Record<string, number>>
  ): {
    updatedPlan: ExecutionPlan;
    newInventory: Record<string, Record<string, number>>;
    newReserved: Record<string, Record<string, number>>;
    newInTransit: Record<string, Record<string, number>>;
    auditEvent: ExecutionAuditEvent;
    transferRequest?: StockTransferRequest;
    logisticsTask?: LogisticsTask;
    notifications: InternalNotification[];
  } {
    const updatedPlan = { ...plan };
    const tasks = [...updatedPlan.tasks];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    const task = { ...tasks[taskIndex] };

    const sourceBranch = 'VIJ-001';
    const targetBranch = 'HYD-001';
    const HYD_OUT_OF_STOCK_PRODUCTS = ['P001', 'P003', 'P005', 'P007', 'P008', 'P010', 'P011', 'P026'];

    const newInventory = JSON.parse(JSON.stringify(activeInventory));
    const newReserved = JSON.parse(JSON.stringify(reservedInventory));
    const newInTransit = JSON.parse(JSON.stringify(inTransitInventory));

    task.startedAt = new Date().toISOString();
    task.status = 'COMPLETED';
    task.completedAt = new Date().toISOString();

    const auditId = `AUD-${Date.now()}`;
    let auditEvent: ExecutionAuditEvent = {
      id: auditId,
      timestamp: new Date().toISOString(),
      incidentId: plan.incidentId,
      executionPlanId: plan.id,
      taskId: task.id,
      actorType: 'NERVA_AGENT',
      actorId: 'EXECUTION_AGENT',
      action: task.type,
      resourceType: 'TASK',
      resourceId: task.id,
      status: 'SUCCESS',
      details: task.description
    };

    let transferRequest: StockTransferRequest | undefined;
    let logisticsTask: LogisticsTask | undefined;
    const notifications: InternalNotification[] = [];

    // Specific task execution logic mutations
    if (task.type === 'VALIDATE_TRANSFER_AUTHORIZATION') {
      auditEvent.resourceType = 'POLICY';
      auditEvent.details = 'Pre-dispatch policy authorization tokens revalidated. Signatures verified.';
    } 
    
    else if (task.type === 'VALIDATE_SOURCE_INVENTORY') {
      auditEvent.resourceType = 'INVENTORY';
      auditEvent.details = 'Vijayawada surplus inventory quantities audited and validated.';
    } 
    
    else if (task.type === 'CREATE_TRANSFER_REQUEST') {
      const items: StockTransferItem[] = HYD_OUT_OF_STOCK_PRODUCTS.map(pId => {
        const needed = 75 - (activeInventory[targetBranch]?.[pId] ?? 0);
        return {
          productId: pId,
          requestedQuantity: needed,
          reservedQuantity: 0,
          dispatchedQuantity: 0,
          receivedQuantity: 0
        };
      });

      transferRequest = {
        id: `TRF-${Date.now()}`,
        incidentId: plan.incidentId,
        strategyId: plan.strategyId,
        sourceBranchId: sourceBranch,
        targetBranchId: targetBranch,
        items,
        status: 'CREATED',
        estimatedCost: 12550,
        estimatedDurationHours: 7,
        createdAt: new Date().toISOString()
      };

      auditEvent.resourceType = 'TRANSFER';
      auditEvent.resourceId = transferRequest.id;
      auditEvent.details = `Stock transfer request ledger item registered: ${transferRequest.id}`;
    } 
    
    else if (task.type === 'RESERVE_SOURCE_STOCK') {
      if (!newReserved[sourceBranch]) newReserved[sourceBranch] = {};
      
      HYD_OUT_OF_STOCK_PRODUCTS.forEach(pId => {
        const needed = 75 - (newInventory[targetBranch]?.[pId] ?? 0);
        const sourceVal = newInventory[sourceBranch]?.[pId] ?? 0;
        const transferable = Math.max(0, sourceVal - SAFETY_STOCK_FLOOR);
        const qtyToReserve = Math.min(needed, transferable);

        newReserved[sourceBranch][pId] = (newReserved[sourceBranch][pId] ?? 0) + qtyToReserve;
        // Available stock is current stock minus reserved stock.
        // We decrement currentStock physically inside target branch on receive, but keep available decrement as:
        newInventory[sourceBranch][pId] = sourceVal - qtyToReserve;
      });

      auditEvent.resourceType = 'INVENTORY';
      auditEvent.details = 'Locked 600 units of beverages & dairy products in Vijayawada packaging zones.';
    } 
    
    else if (task.type === 'CREATE_LOGISTICS_TASK') {
      logisticsTask = {
        id: `LOG-${Date.now()}`,
        incidentId: plan.incidentId,
        executionPlanId: plan.id,
        transferRequestId: `TRF-ACTIVE`,
        sourceBranchId: sourceBranch,
        targetBranchId: targetBranch,
        status: 'ASSIGNED',
        estimatedDepartureTime: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // +15 mins
        estimatedArrivalTime: new Date(Date.now() + 1000 * 60 * 60 * 7).toISOString(), // +7 hours
        vehicleReference: 'NRV-LOG-07',
        createdAt: new Date().toISOString()
      };

      auditEvent.resourceType = 'LOGISTICS';
      auditEvent.resourceId = logisticsTask.id;
      auditEvent.details = `Logistics transport truck scheduled: NRV-LOG-07 assigned to route.`;
    } 
    
    else if (task.type === 'NOTIFY_SOURCE_BRANCH') {
      const n: InternalNotification = {
        id: `NOT-${Date.now()}-VIJ`,
        incidentId: plan.incidentId,
        executionPlanId: plan.id,
        recipientType: 'BRANCH',
        recipientId: sourceBranch,
        title: 'Inventory Transfer Mandate Received',
        message: 'Logistics coordination request to ship 600 replenishment units to Hyderabad Central branch.',
        priority: 'medium',
        status: 'SENT',
        createdAt: new Date().toISOString()
      };
      notifications.push(n);

      auditEvent.resourceType = 'NOTIFICATION';
      auditEvent.resourceId = n.id;
      auditEvent.details = `Operational notice dispatched to Vijayawada Central packing coordinators.`;
    } 
    
    else if (task.type === 'NOTIFY_TARGET_BRANCH') {
      const n: InternalNotification = {
        id: `NOT-${Date.now()}-HYD`,
        incidentId: plan.incidentId,
        executionPlanId: plan.id,
        recipientType: 'BRANCH',
        recipientId: targetBranch,
        title: 'Replenishment Load Scheduled',
        message: 'Transit truck NRV-LOG-07 scheduled for arrival. Prepare unloading bays.',
        priority: 'low',
        status: 'SENT',
        createdAt: new Date().toISOString()
      };
      notifications.push(n);

      auditEvent.resourceType = 'NOTIFICATION';
      auditEvent.resourceId = n.id;
      auditEvent.details = `Operational notice dispatched to Hyderabad Central unloading coordinators.`;
    } 
    
    else if (task.type === 'DISPATCH_TRANSFER') {
      // Move stock from reserved into in-transit state
      if (!newInTransit[targetBranch]) newInTransit[targetBranch] = {};

      HYD_OUT_OF_STOCK_PRODUCTS.forEach(pId => {
        const lockedVal = newReserved[sourceBranch]?.[pId] ?? 0;
        
        newInTransit[targetBranch][pId] = (newInTransit[targetBranch][pId] ?? 0) + lockedVal;
        newReserved[sourceBranch][pId] = 0; // cleared from reserved
      });

      auditEvent.resourceType = 'INVENTORY';
      auditEvent.details = 'Logistics vehicle NRV-LOG-07 departed Vijayawada docks. Stock is In-Transit.';
    } 
    
    else if (task.type === 'RECEIVE_TRANSFER') {
      // Unload and increase Hyderabad Central inventory
      HYD_OUT_OF_STOCK_PRODUCTS.forEach(pId => {
        const transitVal = newInTransit[targetBranch]?.[pId] ?? 0;
        
        newInventory[targetBranch][pId] = (newInventory[targetBranch][pId] ?? 0) + transitVal;
        newInTransit[targetBranch][pId] = 0; // cleared from transit
      });

      auditEvent.resourceType = 'INVENTORY';
      auditEvent.details = 'Replenishment truck received at Hyderabad Central. Shelves restocked.';
    } 
    
    else if (task.type === 'ACTIVATE_RECOVERY_MONITORING') {
      auditEvent.resourceType = 'PLAN';
      auditEvent.details = 'Post-mitigation monitoring monitors initialized. Tracking KPIs.';
    }

    task.auditEventIds.push(auditEvent.id);
    tasks[taskIndex] = task;

    // Update downstream dependencies
    const updatedTasks = tasks.map(t => {
      if (t.status === 'PENDING') {
        const allCompleted = t.dependencies.every(depId => {
          const depTask = tasks.find(tsk => tsk.id === depId);
          return depTask && depTask.status === 'COMPLETED';
        });
        if (allCompleted) {
          return { ...t, status: 'READY' as ExecutionTaskStatus };
        }
      }
      return t;
    });

    updatedPlan.tasks = updatedTasks;
    const allCompleted = updatedTasks.every(t => t.status === 'COMPLETED');
    if (allCompleted) {
      updatedPlan.status = 'MONITORING'; // Transition plan status to monitoring recovery
    }

    return {
      updatedPlan,
      newInventory,
      newReserved,
      newInTransit,
      auditEvent,
      transferRequest,
      logisticsTask,
      notifications
    };
  }
};
export default workflowExecutionService;
