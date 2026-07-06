declare var process: any;

import { SimulationEngine } from '../services/simulationService';
import { recoveryPlannerService } from '../services/recoveryPlannerService';
import { strategySimulationService } from '../services/strategySimulationService';
import { decisionIntelligenceService } from '../services/decisionIntelligenceService';
import { investigationService } from '../services/investigationService';
import sentinelService from '../services/sentinelService';
import { policyEngineService } from '../services/policyEngineService';
import { workflowExecutionService } from '../services/workflowExecutionService';
import { recoveryMonitoringService } from '../services/recoveryMonitoringService';
import { incidentMemoryService } from '../services/incidentMemoryService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ [PASS] ${message}`);
  }
}

console.log('NERVA AI - AUTONOMOUS EXECUTION & RECOVERY MONITORING TEST SUITE');
console.log('================================================================\n');

// Initialize Day 7 simulation state
const currentDay = 7;
const isAuthorized = false;
const selectedStrategy = 'B';
const dayData = SimulationEngine.getSimulationData(currentDay, isAuthorized, selectedStrategy);

// Generate Sentinel anomalies and cluster
const historicalData = Array.from({ length: currentDay }, (_, idx) => {
  return SimulationEngine.getSimulationData(idx + 1, false, selectedStrategy);
});
const { anomalies, incident } = sentinelService.runDetectionPipeline(dayData, historicalData);

// Generate Agent Investigation State
const investigationState = investigationService.runFullInvestigation('INC-2041', dayData, anomalies);

// Generate candidate strategies and simulate metrics
const strategies = recoveryPlannerService.generateRecoveryStrategies('INC-2041', investigationState, dayData);
const snapshot = strategySimulationService.createBusinessStateSnapshot(dayData);
const simResults = strategySimulationService.simulateAllStrategies(strategies, snapshot);
const { recommendation } = decisionIntelligenceService.rankStrategies(simResults, 'INC-2041');

const stratA = strategies.find(s => s.id === 'STRAT-A')!;
const stratB = strategies.find(s => s.id === 'STRAT-B')!;

const resultA = simResults.find(r => r.strategyId === 'STRAT-A')!;
const resultB = simResults.find(r => r.strategyId === 'STRAT-B')!;

// Evaluate policy decisions
const decB = policyEngineService.evaluateStrategyAuthorization(stratB, resultB, 'LEVEL_4');
const decA = policyEngineService.evaluateStrategyAuthorization(stratA, resultA, 'LEVEL_4');

// Setup baseline active inventory map
const activeInventory = JSON.parse(JSON.stringify(dayData.inventory));

// --- 1. TEST PRE-EXECUTION AUTHORIZATION VALIDATIONS ---
const validationB = workflowExecutionService.validateExecutionAuthorization(stratB, decB, resultB, incident, activeInventory);
assert(validationB.isValid === true, 'Strategy B (transfer) passes pre-execution authorization check under LEVEL 4.');

const validationA = workflowExecutionService.validateExecutionAuthorization(stratA, decA, resultA, incident, activeInventory);
assert(validationA.isValid === false, 'Strategy A (procurement) is blocked from execution because CFO approval is pending.');

// --- 2. TEST EXECUTION PLAN GENERATION ---
const plan = workflowExecutionService.createExecutionPlan('INC-2041', stratB.id, stratB, decB.evaluatedAt);
assert(plan.status === 'DRAFT', 'Execution plan is initialized in DRAFT.');
assert(plan.tasks.length === 10, 'Execution plan generates exactly 10 tasks in dependency chain.');
assert(plan.tasks[0].status === 'READY', 'First task (authorization validation) starts as READY.');
assert(plan.tasks[1].status === 'PENDING', 'Second task (source inventory check) is PENDING first completion.');

// --- 3. TEST STEP-BY-STEP DEPENDENCY RESOLUTION & WORKFLOW EXECUTION ---
let inventoryMap = JSON.parse(JSON.stringify(activeInventory));
let reservedMap: Record<string, Record<string, number>> = {};
let transitMap: Record<string, Record<string, number>> = {};
let currentPlan = { ...plan };
let auditEvents: any[] = [];

// Step 1: Validate Authority
const step1 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-1`, inventoryMap, reservedMap, transitMap);
currentPlan = step1.updatedPlan;
assert(currentPlan.tasks[0].status === 'COMPLETED', 'Task 1 completes.');
assert(currentPlan.tasks[1].status === 'READY', 'Task 2 dependencies resolve to READY.');

// Step 2: Validate Source Stock
const step2 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-2`, inventoryMap, reservedMap, transitMap);
currentPlan = step2.updatedPlan;
assert(currentPlan.tasks[1].status === 'COMPLETED', 'Task 2 completes.');
assert(currentPlan.tasks[2].status === 'READY', 'Task 3 dependencies resolve to READY.');

// Step 3: Create request
const step3 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-3`, inventoryMap, reservedMap, transitMap);
currentPlan = step3.updatedPlan;
assert(step3.transferRequest !== undefined, 'Task 3 outputs a structured StockTransferRequest object.');

// Step 4: Reserve Stock
const step4 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-4`, inventoryMap, reservedMap, transitMap);
currentPlan = step4.updatedPlan;
inventoryMap = step4.newInventory;
reservedMap = step4.newReserved;
assert(reservedMap['VIJ-001']?.['P007'] === 75, 'Task 4 locks stock inside reserved inventory (75 units of P007 reserved).');
assert(inventoryMap['VIJ-001']?.['P007'] === 65, 'Available stock at source Vijayawada correctly decremented (140 - 75 = 65 remaining).');

// Skip intermediate notifications (5, 6, 7) and dispatch (Step 8)
const step5 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-5`, inventoryMap, reservedMap, transitMap);
currentPlan = step5.updatedPlan;
const step6 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-6`, inventoryMap, reservedMap, transitMap);
currentPlan = step6.updatedPlan;
const step7 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-7`, inventoryMap, reservedMap, transitMap);
currentPlan = step7.updatedPlan;

// Step 8: Dispatch
const step8 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-8`, inventoryMap, reservedMap, transitMap);
currentPlan = step8.updatedPlan;
reservedMap = step8.newReserved;
transitMap = step8.newInTransit;
assert(reservedMap['VIJ-001']?.['P007'] === 0, 'Dispatched stock is cleared from reserved status.');
assert(transitMap['HYD-001']?.['P007'] === 75, 'Dispatched stock is moved into target in-transit status.');

// Step 9: Receive Unload
const step9 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-9`, inventoryMap, reservedMap, transitMap);
currentPlan = step9.updatedPlan;
inventoryMap = step9.newInventory;
transitMap = step9.newInTransit;
assert(transitMap['HYD-001']?.['P007'] === 0, 'Received stock is cleared from in-transit status.');
assert(inventoryMap['HYD-001']?.['P007'] === 75, 'Hyderabad Central current inventory replenished successfully (0 -> 75 units).');

// Step 10: Recovery Monitoring
const step10 = workflowExecutionService.executeTask(currentPlan, `${currentPlan.id}-TSK-10`, inventoryMap, reservedMap, transitMap);
currentPlan = step10.updatedPlan;
assert(currentPlan.status === 'MONITORING', 'Execution Plan status transitions to MONITORING after dispatch completion.');

// --- 4. TEST RECOVERY MONITORING TIMELINE ---
let monitor = recoveryMonitoringService.createRecoveryMonitor('INC-2041', plan.id, plan.strategyId, resultB);
assert(monitor.status === 'PENDING', 'Recovery monitor initialized as PENDING.');

// CP 0 check
monitor = recoveryMonitoringService.evaluateCheckpoint(monitor, 0);
assert(monitor.status === 'ACTIVE', 'Checkpoint 0 HOURS transitions monitor to ACTIVE status.');
assert(monitor.observedMetrics.inventoryHealth === 91, 'Checkpoint 0 HOURS reports restored inventory health (91%).');
assert(monitor.observedMetrics.customerSentiment === 42, 'Checkpoint 0 HOURS customer sentiment remains at crisis baseline (42%).');

// CP 6 check
monitor = recoveryMonitoringService.evaluateCheckpoint(monitor, 6);
assert(monitor.status === 'RECOVERING', 'Checkpoint 6 HOURS transitions monitor to RECOVERING status.');
assert(monitor.observedMetrics.customerSentiment === 55, 'Checkpoint 6 HOURS customer sentiment is recovering.');
assert(monitor.observedMetrics.revenueDecline === 25, 'Checkpoint 6 HOURS revenue drop begins resolving (+14% sales lift).');

// CP 24 check
monitor = recoveryMonitoringService.evaluateCheckpoint(monitor, 24);
assert(monitor.status === 'RECOVERED', 'Checkpoint 24 HOURS transitions monitor to RECOVERED status.');
assert(monitor.observedMetrics.customerSentiment === 75, 'Checkpoint 24 HOURS customer sentiment fully restored to predicted target (75%).');
assert(monitor.observedMetrics.revenueDecline === 5, 'Checkpoint 24 HOURS revenue drop fully normalized.');

// --- 5. TEST PREDICTED VS OBSERVED CALCULATIONS ---
const comps = monitor.checkpoints.find(c => c.elapsedHours === 24)!.predictionComparison;
const accuracy = recoveryMonitoringService.getOverallAccuracy(comps);
assert(accuracy >= 95 && accuracy <= 100, `Overall prediction accuracy score within valid range (Accuracy: ${accuracy}%).`);

// --- 6. TEST RESOLUTION & INCIDENT MEMORY ---
const finalMetrics = monitor.observedMetrics;
const memory = incidentMemoryService.createMemoryFromResolvedIncident(incident!, plan.id, accuracy, finalMetrics);
assert(memory.incidentId === 'INC-2041', 'Resolved incident saved successfully as Incident Memory.');
assert(memory.predictionAccuracy === accuracy, 'Incident memory matches the computed evaluation accuracy score.');

const memories = incidentMemoryService.getIncidentMemories();
assert(memories.length === 3, 'Incident Memory database count correctly increments.');

const matches = incidentMemoryService.findSimilarIncidents(incident!);
assert(matches[0].similarityScore >= 80, `Similarity search returns historical match (Match: ${matches[0].id} with Score ${matches[0].similarityScore}%).`);

console.log('\n================================================================');
console.log('🟢 [ALL TESTS PASSED] Phase 7 operational workflows verified.');
process.exit(0);
