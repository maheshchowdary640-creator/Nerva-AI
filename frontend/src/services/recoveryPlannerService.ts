import { DayData } from './simulationService';
import { InvestigationState } from '../types/orchestrator';
import { RecoveryStrategy, StrategyAction } from '../types/planner';
import { PRODUCTS } from './businessData';

// Constants for strategy derivations
const SAFETY_THRESHOLD = 30; // Minimum stock count required to maintain safety floor at source branch
const HYD_OUT_OF_STOCK_PRODUCTS = ['P001', 'P003', 'P005', 'P007', 'P008', 'P010', 'P011', 'P026'];
const TARGET_BUFFER = 75; // Baseline safety buffer count for Hyderabad top-sellers
const EMERGENCY_TARGET_BUFFER = 40; // Emergency restock level for spot market buys
const LOGISTICS_COST_PER_KM = 40;
const HYD_VIJ_DISTANCE_KM = 275;
const LOADING_FEES = 1550;
const EMERGENCY_MULTIPLIER = 1.48; // 48% premium for emergency wholesale purchase and rush delivery

export const recoveryPlannerService = {
  generateRecoveryStrategies(
    incidentId: string,
    investigationState: InvestigationState,
    dayData: DayData
  ): RecoveryStrategy[] {
    const targetBranch = 'HYD-001';
    const sourceBranch = 'VIJ-001';

    // 1. Calculate active product stock deficit for Emergency Procurement
    let emergencyQuantity = 0;
    let emergencyBaseCost = 0;
    const affectedProducts: string[] = [];

    // Calculate active product stock deficit for Inter-branch transfer (bulk target)
    let transferQuantity = 0;

    HYD_OUT_OF_STOCK_PRODUCTS.forEach(pId => {
      const currentStock = dayData.inventory[targetBranch]?.[pId] ?? 0;
      affectedProducts.push(pId);

      // Emergency deficit (restores up to 40 units)
      if (currentStock < EMERGENCY_TARGET_BUFFER) {
        const def = EMERGENCY_TARGET_BUFFER - currentStock;
        emergencyQuantity += def;

        // Fetch cost price for product
        const product = PRODUCTS.find(p => p.id === pId);
        const costPrice = product ? product.cost : 100;
        emergencyBaseCost += def * costPrice;
      }

      // Transfer deficit (restores up to 75 units)
      if (currentStock < TARGET_BUFFER) {
        transferQuantity += (TARGET_BUFFER - currentStock);
      }
    });

    // 2. Perform Source Branch Safety Validation check (Vijayawada inventory check)
    let totalTransferable = 0;
    const transferQuantities: Record<string, number> = {};
    let safetyCheckPassed = true;

    affectedProducts.forEach(pId => {
      const sourceStock = dayData.inventory[sourceBranch]?.[pId] ?? 0;
      const surplus = sourceStock - SAFETY_THRESHOLD;
      
      if (surplus > 0) {
        const needed = TARGET_BUFFER - (dayData.inventory[targetBranch]?.[pId] ?? 0);
        const transferQty = Math.min(needed, surplus);
        transferQuantities[pId] = transferQty;
        totalTransferable += transferQty;
      } else {
        // If Vijayawada falls below safety threshold for a product, flag validation failure
        safetyCheckPassed = false;
      }
    });

    const isTransferFeasible = safetyCheckPassed && totalTransferable > 0;

    const strategies: RecoveryStrategy[] = [];

    // --- STRATEGY A: EMERGENCY SUPPLIER PURCHASE ---
    const emergencyCost = Math.round(emergencyBaseCost * EMERGENCY_MULTIPLIER); 
    // 40 units per product * costs + 48% markup yields exactly ₹77,848 (around ₹78,000!)
    
    const actionA: StrategyAction = {
      id: 'ACT-001-A',
      type: 'PURCHASE_INVENTORY',
      description: `Emergency purchase of ${emergencyQuantity} units from wholesale spot market.`,
      sourceBranchId: '',
      targetBranchId: targetBranch,
      productIds: affectedProducts,
      quantity: emergencyQuantity,
      estimatedCost: emergencyCost,
      estimatedDurationHours: 4
    };

    strategies.push({
      id: 'STRAT-A',
      incidentId,
      name: 'Emergency Supplier Purchase',
      description: 'Procure replenishment inventory directly from local wholesale spot markets to bypass delayed primary supply chain.',
      strategyType: 'EMERGENCY_PROCUREMENT',
      status: 'GENERATED',
      generatedAt: new Date().toISOString(),
      sourceEvidenceIds: ['EVD-INV-001', 'EVD-SUP-001'],
      requiredResources: ['Spot Market Vendor Agreement', 'Emergency Finance Approval'],
      affectedBranches: [targetBranch],
      affectedProducts,
      estimatedDirectCost: emergencyCost, // Derived dynamically (₹77,848)
      estimatedDeliveryHours: 4,
      operationalComplexity: 'MEDIUM',
      assumptions: [
        'Local spot market has required inventory quantities',
        'Emergency courier dispatch available within 1 hour',
        'Vendor accepts standard wholesale billing authorization'
      ],
      actions: [actionA]
    });

    // --- STRATEGY B: INTER-BRANCH STOCK TRANSFER ---
    const transferCost = (HYD_VIJ_DISTANCE_KM * LOGISTICS_COST_PER_KM) + LOADING_FEES; // 275 * 40 + 1550 = ₹12,550
    const actionB: StrategyAction = {
      id: 'ACT-001-B',
      type: 'TRANSFER_INVENTORY',
      description: `Transfer ${totalTransferable} units from Vijayawada Central (surplus) to Hyderabad Central.`,
      sourceBranchId: sourceBranch,
      targetBranchId: targetBranch,
      productIds: affectedProducts,
      quantity: totalTransferable,
      estimatedCost: transferCost,
      estimatedDurationHours: 7
    };

    strategies.push({
      id: 'STRAT-B',
      incidentId,
      name: 'Inter-Branch Stock Transfer',
      description: 'Re-route surplus stock from Vijayawada Central. Safe margins audit ensures source branch operations remain unaffected.',
      strategyType: 'INTER_BRANCH_TRANSFER',
      status: isTransferFeasible ? 'GENERATED' : 'REJECTED',
      generatedAt: new Date().toISOString(),
      sourceEvidenceIds: ['EVD-INV-001', 'EVD-WF-001'],
      requiredResources: ['Logistics transit truck', 'Vijayawada packing coordinator team'],
      affectedBranches: [sourceBranch, targetBranch],
      affectedProducts,
      estimatedDirectCost: transferCost, // Derived dynamically
      estimatedDeliveryHours: 7,
      operationalComplexity: 'LOW',
      assumptions: [
        'Logistics transit truck is available for immediate dispatch',
        'Vijayawada Central inventory surplus matches records',
        'Inter-state road transit permits are pre-approved'
      ],
      actions: [actionB]
    });

    // --- STRATEGY C: WAIT FOR ORIGINAL SUPPLIER ---
    const delayHours = 52;
    const actionC: StrategyAction = {
      id: 'ACT-001-C',
      type: 'WAIT',
      description: 'Suspend immediate local intervention and wait for delayed Apex Distributors delivery load.',
      sourceBranchId: '',
      targetBranchId: targetBranch,
      supplierId: 'SUP-001',
      productIds: affectedProducts,
      quantity: 0,
      estimatedCost: 0,
      estimatedDurationHours: delayHours
    };

    strategies.push({
      id: 'STRAT-C',
      incidentId,
      name: 'Wait for Original Supplier',
      description: 'Maintain status quo and monitor incoming Apex Distributors shipment delay (52 hours). No local re-routing.',
      strategyType: 'WAIT_FOR_SUPPLIER',
      status: 'GENERATED',
      generatedAt: new Date().toISOString(),
      sourceEvidenceIds: ['EVD-SUP-001'],
      requiredResources: [],
      affectedBranches: [targetBranch],
      affectedProducts,
      estimatedDirectCost: 0,
      estimatedDeliveryHours: delayHours,
      operationalComplexity: 'LOW',
      assumptions: [
        'Apex Distributors delayed delivery does not slip past 52 hours',
        'Customer patience index does not degrade further'
      ],
      actions: [actionC]
    });

    return strategies;
  }
};
export default recoveryPlannerService;
