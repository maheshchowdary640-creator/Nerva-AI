import React, { createContext, useContext, useState, useEffect } from 'react';
import { DayData, SimulationEngine } from '../services/simulationService';
import { Anomaly, AnomalyCluster, SentinelIncident } from '../types/sentinel';
import { InvestigationState, TaskStatus } from '../types/orchestrator';
import { RecoveryStrategy, StrategySimulationResult, DecisionRecommendation } from '../types/planner';
import { BusinessEvent } from '../types/business';
import { PolicyDecision, ApprovalRequest, AutonomyLevel } from '../types/policy';
import { 
  ExecutionPlan, ExecutionTask, ExecutionTaskStatus, StockTransferRequest,
  LogisticsTask, InternalNotification, ExecutionAuditEvent, RecoveryMonitor,
  PredictionComparison, IncidentMemoryRecord 
} from '../types/execution';
import sentinelService from '../services/sentinelService';
import investigationService from '../services/investigationService';
import recoveryPlannerService from '../services/recoveryPlannerService';
import strategySimulationService from '../services/strategySimulationService';
import decisionIntelligenceService from '../services/decisionIntelligenceService';
import { policyEngineService } from '../services/policyEngineService';
import { workflowExecutionService } from '../services/workflowExecutionService';
import { recoveryMonitoringService } from '../services/recoveryMonitoringService';
import { incidentMemoryService } from '../services/incidentMemoryService';
import { nervaIntelligenceService, AIProviderStatus } from '../services/nervaIntelligenceService';

interface SimulationContextProps {
  currentDay: number;
  isAuthorized: boolean;
  selectedStrategy: string | null;
  dayData: DayData;
  isSimulating: boolean;
  simulationStep: number;
  activeAnomalies: Anomaly[];
  activeClusters: AnomalyCluster[];
  activeIncident: SentinelIncident | null;
  investigationState: InvestigationState;
  isAgentInvestigating: boolean;
  recoveryStrategies: RecoveryStrategy[];
  simulationResults: (StrategySimulationResult & { score: number })[];
  decisionRecommendation: DecisionRecommendation | null;
  isSimulatingStrategies: boolean;
  simulationAgentStep: number;
  policyDecision: PolicyDecision | null;
  approvalRequests: ApprovalRequest[];
  isPolicyChecking: boolean;
  activeAutonomyLevel: AutonomyLevel;
  activeInventory: Record<string, Record<string, number>>;
  reservedInventory: Record<string, Record<string, number>>;
  inTransitInventory: Record<string, Record<string, number>>;
  executionPlan: ExecutionPlan | null;
  stockTransferRequest: StockTransferRequest | null;
  logisticsTask: LogisticsTask | null;
  internalNotifications: InternalNotification[];
  auditEvents: ExecutionAuditEvent[];
  recoveryMonitor: RecoveryMonitor | null;
  currentRecoveryHour: number;
  predictionComparisons: PredictionComparison[];
  similarIncidents: (IncidentMemoryRecord & { similarityScore: number })[];
  executionAgentStatus: 'WAITING' | 'READY' | 'RUNNING' | 'MONITORING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';
  
  // Gemini Explanation & Q&A Layer States
  aiStatus: AIProviderStatus;
  isAiLoading: boolean;
  currentBriefing: string;
  currentInvestigationExplanation: string;
  currentDecisionExplanation: string;
  currentPostmortem: string;
  askNervaAnswer: string;
  
  // Judge Demo Mode States
  judgeDemoMode: boolean;
  judgeDemoStep: number;
  showPresenterNotes: boolean;
  
  setDay: (day: number) => void;
  selectStrategy: (strategy: string) => void;
  authorizeAction: (strategy: string) => void;
  resetSimulation: () => void;
  setNormalState: () => void;
  startAgentInvestigation: () => void;
  simulateRecoveryStrategies: () => void;
  runPolicyCheck: () => void;
  runNextExecutionStep: () => void;
  executeFullRecoveryWorkflow: () => void;
  advanceRecoveryHour: (hours: number) => void;
  
  // Gemini Actions
  askNerva: (question: string) => void;
  clearNervaAnswer: () => void;
  
  // Judge Actions
  setJudgeDemoMode: (active: boolean) => void;
  setJudgeDemoStep: (step: number) => void;
  setShowPresenterNotes: (show: boolean) => void;
  advanceJudgeDemo: () => void;
  resetJudgeDemo: () => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDay, setCurrentDayState] = useState<number>(() => {
    const saved = localStorage.getItem('nerva_current_day');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [isAuthorized, setIsAuthorizedState] = useState<boolean>(() => {
    const saved = localStorage.getItem('nerva_is_authorized');
    return saved === 'true';
  });

  const [selectedStrategy, setSelectedStrategyState] = useState<string | null>(() => {
    return localStorage.getItem('nerva_selected_strategy') || 'B'; // default B
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // Investigation Orchestrator States
  const [isAgentInvestigating, setIsAgentInvestigating] = useState(false);
  const [investigationState, setInvestigationState] = useState<InvestigationState>(() => {
    return investigationService.resetInvestigation('INC-2041');
  });

  // Phase 5 Recovery Simulation States
  const [recoveryStrategies, setRecoveryStrategies] = useState<RecoveryStrategy[]>([]);
  const [simulationResults, setSimulationResults] = useState<(StrategySimulationResult & { score: number })[]>([]);
  const [decisionRecommendation, setDecisionRecommendation] = useState<DecisionRecommendation | null>(null);
  const [isSimulatingStrategies, setIsSimulatingStrategies] = useState(false);
  const [simulationAgentStep, setSimulationAgentStep] = useState(0);
  const [simulatedEvents, setSimulatedEvents] = useState<BusinessEvent[]>([]);

  // Phase 6 Policy & Autonomy States
  const [policyDecision, setPolicyDecision] = useState<PolicyDecision | null>(null);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [isPolicyChecking, setIsPolicyChecking] = useState(false);
  const [activeAutonomyLevel] = useState<AutonomyLevel>('LEVEL_4'); // Active: Level 4

  // Phase 7 Execution States
  const [activeInventory, setActiveInventory] = useState<Record<string, Record<string, number>>>({});
  const [reservedInventory, setReservedInventory] = useState<Record<string, Record<string, number>>>({});
  const [inTransitInventory, setInTransitInventory] = useState<Record<string, Record<string, number>>>({});
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [stockTransferRequest, setStockTransferRequest] = useState<StockTransferRequest | null>(null);
  const [logisticsTask, setLogisticsTask] = useState<LogisticsTask | null>(null);
  const [internalNotifications, setInternalNotifications] = useState<InternalNotification[]>([]);
  const [auditEvents, setAuditEvents] = useState<ExecutionAuditEvent[]>([]);
  const [recoveryMonitor, setRecoveryMonitor] = useState<RecoveryMonitor | null>(null);
  const [currentRecoveryHour, setCurrentRecoveryHour] = useState<number>(-1);
  const [predictionComparisons, setPredictionComparisons] = useState<PredictionComparison[]>([]);
  const [similarIncidents, setSimilarIncidents] = useState<(IncidentMemoryRecord & { similarityScore: number })[]>([]);
  const [executionAgentStatus, setExecutionAgentStatus] = useState<'WAITING' | 'READY' | 'RUNNING' | 'MONITORING' | 'COMPLETED' | 'FAILED' | 'BLOCKED'>('WAITING');

  // Gemini Intelligence States
  const [aiStatus, setAiStatus] = useState<AIProviderStatus>('NOT_CONFIGURED');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentBriefing, setCurrentBriefing] = useState('');
  const [currentInvestigationExplanation, setCurrentInvestigationExplanation] = useState('');
  const [currentDecisionExplanation, setCurrentDecisionExplanation] = useState('');
  const [currentPostmortem, setCurrentPostmortem] = useState('');
  const [askNervaAnswer, setAskNervaAnswer] = useState('');

  // Judge Demo States
  const [judgeDemoMode, setJudgeDemoMode] = useState(false);
  const [judgeDemoStep, setJudgeDemoStep] = useState(1);
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);

  // 1. Generate DayData for current active day
  const dayData = SimulationEngine.getSimulationData(currentDay, isAuthorized, selectedStrategy);

  // 2. Generate historical day list for trend analysis
  const historicalData = Array.from({ length: currentDay }, (_, idx) => {
    const d = idx + 1;
    const dAuthorized = isAuthorized && d >= 7; 
    return SimulationEngine.getSimulationData(d, dAuthorized, selectedStrategy);
  });

  // 3. Run Sentinel Anomaly detection pipeline
  const { anomalies: activeAnomalies, clusters: activeClusters, incident: activeIncident } = 
    sentinelService.runDetectionPipeline(dayData, historicalData);

  // Fetch server provider status on init
  useEffect(() => {
    nervaIntelligenceService.checkGeminiHealth().then(status => {
      setAiStatus(status);
    });
  }, []);

  // Async call triggers for Gemini explanations
  useEffect(() => {
    if (currentDay === 7 && activeIncident) {
      setIsAiLoading(true);
      const ctx = nervaIntelligenceService.buildNervaIntelligenceContext(
        activeIncident, activeAnomalies, investigationState,
        recoveryStrategies, simulationResults, decisionRecommendation,
        policyDecision, executionPlan, recoveryMonitor, currentRecoveryHour
      );
      nervaIntelligenceService.generateExplanation('INCIDENT_BRIEFING', ctx).then(txt => {
        setCurrentBriefing(txt);
        setIsAiLoading(false);
      });
    } else {
      setCurrentBriefing('');
    }
  }, [currentDay, !!activeIncident]);

  useEffect(() => {
    if (investigationState.status === 'Hypothesis Generated') {
      setIsAiLoading(true);
      const ctx = nervaIntelligenceService.buildNervaIntelligenceContext(
        activeIncident, activeAnomalies, investigationState,
        recoveryStrategies, simulationResults, decisionRecommendation,
        policyDecision, executionPlan, recoveryMonitor, currentRecoveryHour
      );
      nervaIntelligenceService.generateExplanation('INVESTIGATION_SUMMARY', ctx).then(txt => {
        setCurrentInvestigationExplanation(txt);
        setIsAiLoading(false);
      });
    } else {
      setCurrentInvestigationExplanation('');
    }
  }, [investigationState.status]);

  useEffect(() => {
    if (decisionRecommendation) {
      setIsAiLoading(true);
      const ctx = nervaIntelligenceService.buildNervaIntelligenceContext(
        activeIncident, activeAnomalies, investigationState,
        recoveryStrategies, simulationResults, decisionRecommendation,
        policyDecision, executionPlan, recoveryMonitor, currentRecoveryHour
      );
      nervaIntelligenceService.generateExplanation('DECISION_EXPLANATION', ctx).then(txt => {
        setCurrentDecisionExplanation(txt);
        setIsAiLoading(false);
      });
    } else {
      setCurrentDecisionExplanation('');
    }
  }, [decisionRecommendation]);

  useEffect(() => {
    if (currentRecoveryHour === 24) {
      setIsAiLoading(true);
      const ctx = nervaIntelligenceService.buildNervaIntelligenceContext(
        activeIncident, activeAnomalies, investigationState,
        recoveryStrategies, simulationResults, decisionRecommendation,
        policyDecision, executionPlan, recoveryMonitor, currentRecoveryHour
      );
      nervaIntelligenceService.generateExplanation('POSTMORTEM', ctx).then(txt => {
        setCurrentPostmortem(txt);
        setIsAiLoading(false);
      });
    } else {
      setCurrentPostmortem('');
    }
  }, [currentRecoveryHour]);

  // Clear states on day/authorized changes
  useEffect(() => {
    setInvestigationState(investigationService.resetInvestigation('INC-2041'));
    setIsAgentInvestigating(false);
    setRecoveryStrategies([]);
    setSimulationResults([]);
    setDecisionRecommendation(null);
    setIsSimulatingStrategies(false);
    setSimulationAgentStep(0);
    setSimulatedEvents([]);
    setPolicyDecision(null);
    setApprovalRequests([]);
    setIsPolicyChecking(false);

    if (dayData && dayData.inventory) {
      setActiveInventory(JSON.parse(JSON.stringify(dayData.inventory)));
    }
    setReservedInventory({});
    setInTransitInventory({});
    setExecutionPlan(null);
    setStockTransferRequest(null);
    setLogisticsTask(null);
    setInternalNotifications([]);
    setAuditEvents([]);
    setRecoveryMonitor(null);
    setCurrentRecoveryHour(-1);
    setPredictionComparisons([]);
    setSimilarIncidents([]);
    setExecutionAgentStatus('WAITING');
    setAskNervaAnswer('');
  }, [currentDay, isAuthorized]);

  const setDay = (day: number) => {
    setCurrentDayState(day);
    localStorage.setItem('nerva_current_day', day.toString());
  };

  const selectStrategy = (strategy: string) => {
    setSelectedStrategyState(strategy);
    localStorage.setItem('nerva_selected_strategy', strategy);
    setPolicyDecision(null);
    setApprovalRequests([]);
    setExecutionPlan(null);
    setStockTransferRequest(null);
    setLogisticsTask(null);
    setInternalNotifications([]);
    setAuditEvents([]);
    setRecoveryMonitor(null);
    setCurrentRecoveryHour(-1);
    setPredictionComparisons([]);
    setExecutionAgentStatus('WAITING');
    if (dayData && dayData.inventory) {
      setActiveInventory(JSON.parse(JSON.stringify(dayData.inventory)));
    }
    setAskNervaAnswer('');
  };

  const authorizeAction = (strategy: string) => {
    setSelectedStrategyState(strategy);
    localStorage.setItem('nerva_selected_strategy', strategy);
    setIsSimulating(true);
    setSimulationStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setSimulationStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setIsAuthorizedState(true);
        localStorage.setItem('nerva_is_authorized', 'true');
        setIsSimulating(false);
      }
    }, 1200);
  };

  const resetSimulation = () => {
    setCurrentDayState(1);
    setIsAuthorizedState(false);
    setSelectedStrategyState('B');
    setIsSimulating(false);
    setSimulationStep(0);
    localStorage.setItem('nerva_current_day', '1');
    localStorage.setItem('nerva_is_authorized', 'false');
    localStorage.setItem('nerva_selected_strategy', 'B');

    setInvestigationState(investigationService.resetInvestigation('INC-2041'));
    setRecoveryStrategies([]);
    setSimulationResults([]);
    setDecisionRecommendation(null);
    setIsSimulatingStrategies(false);
    setSimulationAgentStep(0);
    setSimulatedEvents([]);
    setPolicyDecision(null);
    setApprovalRequests([]);
    setIsPolicyChecking(false);

    if (dayData && dayData.inventory) {
      setActiveInventory(JSON.parse(JSON.stringify(dayData.inventory)));
    }
    setReservedInventory({});
    setInTransitInventory({});
    setExecutionPlan(null);
    setStockTransferRequest(null);
    setLogisticsTask(null);
    setInternalNotifications([]);
    setAuditEvents([]);
    setRecoveryMonitor(null);
    setCurrentRecoveryHour(-1);
    setPredictionComparisons([]);
    setSimilarIncidents([]);
    setExecutionAgentStatus('WAITING');
    setAskNervaAnswer('');
  };

  const setNormalState = () => {
    setCurrentDayState(1);
    setIsAuthorizedState(false);
    setSelectedStrategyState('B');
    localStorage.setItem('nerva_current_day', '1');
    localStorage.setItem('nerva_is_authorized', 'false');

    setInvestigationState(investigationService.resetInvestigation('INC-2041'));
    setRecoveryStrategies([]);
    setSimulationResults([]);
    setDecisionRecommendation(null);
    setIsSimulatingStrategies(false);
    setSimulationAgentStep(0);
    setSimulatedEvents([]);
    setPolicyDecision(null);
    setApprovalRequests([]);
    setIsPolicyChecking(false);

    if (dayData && dayData.inventory) {
      setActiveInventory(JSON.parse(JSON.stringify(dayData.inventory)));
    }
    setReservedInventory({});
    setInTransitInventory({});
    setExecutionPlan(null);
    setStockTransferRequest(null);
    setLogisticsTask(null);
    setInternalNotifications([]);
    setAuditEvents([]);
    setRecoveryMonitor(null);
    setCurrentRecoveryHour(-1);
    setPredictionComparisons([]);
    setSimilarIncidents([]);
    setExecutionAgentStatus('WAITING');
    setAskNervaAnswer('');
  };

  const startAgentInvestigation = () => {
    if (isAgentInvestigating || isSimulating || isSimulatingStrategies) return;
    setIsAgentInvestigating(true);
    setInvestigationState(investigationService.startInvestigation('INC-2041'));

    let taskIdx = 0;
    const interval = setInterval(() => {
      taskIdx += 1;

      setInvestigationState(prev => {
        const updatedTasks = prev.tasks.map((t, idx) => {
          if (idx === taskIdx) return { ...t, status: 'RUNNING' as TaskStatus };
          if (idx < taskIdx) return { ...t, status: 'COMPLETED' as TaskStatus };
          return t;
        });
        let status = prev.status;
        if (taskIdx === 6) status = 'Hypothesis Generated';
        return { ...prev, status, tasks: updatedTasks };
      });

      if (taskIdx >= 6) {
        clearInterval(interval);
        setInvestigationState(() => {
          return investigationService.runFullInvestigation('INC-2041', dayData, activeAnomalies);
        });
        setIsAgentInvestigating(false);
      }
    }, 850);
  };

  const simulateRecoveryStrategies = () => {
    if (isSimulatingStrategies || isAgentInvestigating || isSimulating) return;
    setIsSimulatingStrategies(true);
    setSimulationAgentStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setSimulationAgentStep(step);

      if (step >= 8) {
        clearInterval(interval);
        const strategies = recoveryPlannerService.generateRecoveryStrategies('INC-2041', investigationState, dayData);
        const snapshot = strategySimulationService.createBusinessStateSnapshot(dayData);
        const simResults = strategySimulationService.simulateAllStrategies(strategies, snapshot);
        const { rankedResults, recommendation } = decisionIntelligenceService.rankStrategies(simResults, 'INC-2041');

        setRecoveryStrategies(strategies);
        setSimulationResults(rankedResults);
        setDecisionRecommendation(recommendation);

        const newEvents: BusinessEvent[] = [
          { id: 'EVT-SIM-001', timestamp: `Day ${currentDay}, 10:15 AM`, title: 'Investigation hypothesis received', message: 'Simulation Agent compiled root cause telemetry.', severity: 'low', branchId: 'HYD-001', stream: 'FINANCE', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-002', timestamp: `Day ${currentDay}, 10:16 AM`, title: '3 recovery strategies generated', message: 'Recovery Planner generated procurement, transfer, and wait models.', severity: 'low', branchId: 'HYD-001', stream: 'INVENTORY', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-003', timestamp: `Day ${currentDay}, 10:16 AM`, title: 'Business snapshot created', message: 'Engine captured operational parameters.', severity: 'low', branchId: 'HYD-001', stream: 'INVENTORY', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-004', timestamp: `Day ${currentDay}, 10:17 AM`, title: 'Strategy A simulated', message: 'Emergency procurement modeled 78% expected recovery.', severity: 'low', branchId: 'HYD-001', stream: 'INVENTORY', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-005', timestamp: `Day ${currentDay}, 10:17 AM`, title: 'Strategy B simulated', message: 'Inter-branch stock transfer modeled 92% recovery.', severity: 'low', branchId: 'HYD-001', stream: 'INVENTORY', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-006', timestamp: `Day ${currentDay}, 10:17 AM`, title: 'Strategy C simulated', message: 'Wait for supplier model calculated high exposure impact.', severity: 'low', branchId: 'HYD-001', stream: 'INVENTORY', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-007', timestamp: `Day ${currentDay}, 10:18 AM`, title: 'Strategies ranked', message: 'Decision Intelligence ranked strategies.', severity: 'low', branchId: 'HYD-001', stream: 'FINANCE', day: currentDay, type: 'system' as any },
          { id: 'EVT-SIM-008', timestamp: `Day ${currentDay}, 10:18 AM`, title: 'Inter-branch transfer recommended', message: 'Optimal recovery response.', severity: 'low', branchId: 'HYD-001', stream: 'FINANCE', day: currentDay, type: 'system' as any }
        ];
        
        setSimulatedEvents(newEvents);
        setIsSimulatingStrategies(false);
      }
    }, 700);
  };

  const runPolicyCheck = () => {
    if (isPolicyChecking || !decisionRecommendation) return;
    setIsPolicyChecking(true);

    setTimeout(() => {
      const strategyCode = selectedStrategy || 'B';
      const strategy = recoveryStrategies.find(s => s.id === `STRAT-${strategyCode}`);
      const result = simulationResults.find(r => r.strategyId === `STRAT-${strategyCode}`);

      if (strategy && result) {
        const decision = policyEngineService.evaluateStrategyAuthorization(strategy, result, activeAutonomyLevel);
        setPolicyDecision(decision);

        if (decision.decisionStatus === 'APPROVAL_REQUIRED') {
          const reqRole = decision.requiredApproverRole === 'CFO' ? 'CFO' : 'MANAGER';
          const newRequest: ApprovalRequest = {
            id: `APR-${Date.now()}`,
            incidentId: 'INC-2041',
            strategyId: strategy.id,
            requestedBy: 'NERVA Orchestrator',
            requiredApproverRole: reqRole,
            amount: strategy.estimatedDirectCost,
            reason: decision.reason,
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };
          setApprovalRequests([newRequest]);
          setExecutionAgentStatus('BLOCKED');
        } else if (decision.decisionStatus === 'AUTONOMOUS_EXECUTION_PERMITTED') {
          setApprovalRequests([]);
          setExecutionAgentStatus('READY');
        } else {
          setApprovalRequests([]);
          setExecutionAgentStatus('BLOCKED');
        }

        const policyEvent: BusinessEvent = {
          id: `EVT-POL-${Date.now()}`,
          timestamp: `Day ${currentDay}, 10:20 AM`,
          title: decision.decisionStatus === 'AUTONOMOUS_EXECUTION_PERMITTED' ? 'Execution authorized' : 'Approval request registered',
          message: decision.reason,
          severity: decision.decisionStatus === 'AUTONOMOUS_EXECUTION_PERMITTED' ? 'low' : 'medium',
          branchId: 'HYD-001',
          stream: 'FINANCE',
          day: currentDay,
          type: 'system' as any
        };
        setSimulatedEvents(prev => [...prev, policyEvent]);
      }
      setIsPolicyChecking(false);
    }, 1000);
  };

  const runNextExecutionStep = () => {
    const strategyCode = selectedStrategy || 'B';
    const strategy = recoveryStrategies.find(s => s.id === `STRAT-${strategyCode}`);
    const decision = policyDecision;
    const result = simulationResults.find(r => r.strategyId === `STRAT-${strategyCode}`);

    if (!strategy) return;

    if (!executionPlan) {
      const auth = workflowExecutionService.validateExecutionAuthorization(strategy, decision, result || null, activeIncident, activeInventory);
      if (!auth.isValid) {
        setExecutionAgentStatus('FAILED');
        const failAudit: ExecutionAuditEvent = {
          id: `AUD-FAIL-${Date.now()}`,
          timestamp: new Date().toISOString(),
          incidentId: 'INC-2041',
          executionPlanId: 'NONE',
          actorType: 'NERVA_AGENT',
          actorId: 'EXECUTION_AGENT',
          action: 'AUTHORIZATION_VALIDATION_FAILURE',
          resourceType: 'POLICY',
          resourceId: 'NONE',
          status: 'FAILURE',
          details: `Pre-execution validation failed: ${auth.reason}`
        };
        setAuditEvents([failAudit]);
        return;
      }

      const plan = workflowExecutionService.createExecutionPlan('INC-2041', strategy.id, strategy, decision?.evaluatedAt ?? new Date().toISOString());
      plan.status = 'READY';
      setExecutionPlan(plan);
      setExecutionAgentStatus('RUNNING');

      const initAudit: ExecutionAuditEvent = {
        id: `AUD-INIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        incidentId: 'INC-2041',
        executionPlanId: plan.id,
        actorType: 'NERVA_AGENT',
        actorId: 'EXECUTION_AGENT',
        action: 'EXECUTION_PLAN_INITIALIZED',
        resourceType: 'PLAN',
        resourceId: plan.id,
        status: 'SUCCESS',
        details: `Execution plan ${plan.id} pre-authorized.`
      };
      setAuditEvents([initAudit]);
      return;
    }

    const nextTask = executionPlan.tasks.find(t => t.status === 'READY');
    if (!nextTask) return;

    const {
      updatedPlan, newInventory, newReserved, newInTransit,
      auditEvent, transferRequest, logisticsTask, notifications
    } = workflowExecutionService.executeTask(executionPlan, nextTask.id, activeInventory, reservedInventory, inTransitInventory);

    setExecutionPlan(updatedPlan);
    setActiveInventory(newInventory);
    setReservedInventory(newReserved);
    setInTransitInventory(newInTransit);
    setAuditEvents(prev => [...prev, auditEvent]);

    if (transferRequest) setStockTransferRequest(transferRequest);
    if (logisticsTask) setLogisticsTask(logisticsTask);
    if (notifications.length > 0) setInternalNotifications(prev => [...prev, ...notifications]);

    if (nextTask.type === 'ACTIVATE_RECOVERY_MONITORING') {
      const monitor = recoveryMonitoringService.createRecoveryMonitor('INC-2041', executionPlan.id, executionPlan.strategyId, result!);
      const cp0Monitor = recoveryMonitoringService.evaluateCheckpoint(monitor, 0);
      setRecoveryMonitor(cp0Monitor);
      setCurrentRecoveryHour(0);
      setPredictionComparisons(cp0Monitor.checkpoints[0].predictionComparison);
      setExecutionAgentStatus('MONITORING');

      const matches = incidentMemoryService.findSimilarIncidents(activeIncident!);
      setSimilarIncidents(matches);
    }
  };

  const executeFullRecoveryWorkflow = () => {
    let currentPlan = executionPlan;
    if (!currentPlan) {
      runNextExecutionStep();
      setTimeout(runLoop, 200);
      return;
    }

    function runLoop() {
      setExecutionPlan(prevPlan => {
        if (!prevPlan) return null;
        const nextTask = prevPlan.tasks.find(t => t.status === 'READY');
        if (!nextTask) return prevPlan;

        const {
          updatedPlan, newInventory, newReserved, newInTransit,
          auditEvent, transferRequest, logisticsTask, notifications
        } = workflowExecutionService.executeTask(prevPlan, nextTask.id, activeInventory, reservedInventory, inTransitInventory);

        setActiveInventory(newInventory);
        setReservedInventory(newReserved);
        setInTransitInventory(newInTransit);
        setAuditEvents(prev => [...prev, auditEvent]);

        if (transferRequest) setStockTransferRequest(transferRequest);
        if (logisticsTask) setLogisticsTask(logisticsTask);
        if (notifications.length > 0) setInternalNotifications(prev => [...prev, ...notifications]);

        if (nextTask.type === 'ACTIVATE_RECOVERY_MONITORING') {
          const monitor = recoveryMonitoringService.createRecoveryMonitor('INC-2041', prevPlan.id, prevPlan.strategyId, result!);
          const cp0Monitor = recoveryMonitoringService.evaluateCheckpoint(monitor, 0);
          setRecoveryMonitor(cp0Monitor);
          setCurrentRecoveryHour(0);
          setPredictionComparisons(cp0Monitor.checkpoints[0].predictionComparison);
          setExecutionAgentStatus('MONITORING');

          const matches = incidentMemoryService.findSimilarIncidents(activeIncident!);
          setSimilarIncidents(matches);
        }

        if (updatedPlan.status !== 'MONITORING') {
          setTimeout(runLoop, 200);
        }
        return updatedPlan;
      });
    }

    const strategyCode = selectedStrategy || 'B';
    const result = simulationResults.find(r => r.strategyId === `STRAT-${strategyCode}`);
  };

  const advanceRecoveryHour = (hour: number) => {
    if (!recoveryMonitor || currentRecoveryHour >= hour) return;

    const updatedMonitor = recoveryMonitoringService.evaluateCheckpoint(recoveryMonitor, hour);
    setRecoveryMonitor(updatedMonitor);
    setCurrentRecoveryHour(hour);

    const cp = updatedMonitor.checkpoints.find(c => c.elapsedHours === hour);
    if (cp) {
      setPredictionComparisons(cp.predictionComparison);
    }

    if (hour === 24) {
      setExecutionAgentStatus('COMPLETED');
      if (executionPlan) {
        executionPlan.status = 'COMPLETED';
        executionPlan.completedAt = new Date().toISOString();
      }

      const accuracy = recoveryMonitoringService.getOverallAccuracy(cp?.predictionComparison || []);
      incidentMemoryService.createMemoryFromResolvedIncident(activeIncident!, executionPlan?.id ?? 'NONE', accuracy, updatedMonitor.observedMetrics);

      const resAudit: ExecutionAuditEvent = {
        id: `AUD-RES-${Date.now()}`,
        timestamp: new Date().toISOString(),
        incidentId: 'INC-2041',
        executionPlanId: executionPlan?.id ?? 'NONE',
        actorType: 'NERVA_AGENT',
        actorId: 'EXECUTION_AGENT',
        action: 'INCIDENT_RESOLVED_MEMORY_COMPILED',
        resourceType: 'POLICY',
        resourceId: 'INC-2041',
        status: 'SUCCESS',
        details: `Incident resolved. Accuracy: ${accuracy}%.`
      };
      setAuditEvents(prev => [...prev, resAudit]);
    }
  };

  // Gemini context Q&A action
  const askNerva = (question: string) => {
    if (!question) return;
    setIsAiLoading(true);
    setAskNervaAnswer('');
    
    const ctx = nervaIntelligenceService.buildNervaIntelligenceContext(
      activeIncident, activeAnomalies, investigationState,
      recoveryStrategies, simulationResults, decisionRecommendation,
      policyDecision, executionPlan, recoveryMonitor, currentRecoveryHour
    );
    nervaIntelligenceService.askQuestion(question, ctx).then(ans => {
      setAskNervaAnswer(ans);
      setIsAiLoading(false);
    });
  };

  const clearNervaAnswer = () => {
    setAskNervaAnswer('');
  };

  // Judge Demo Actions
  const advanceJudgeDemo = () => {
    setJudgeDemoStep(prev => {
      const nextStep = prev + 1;
      if (nextStep > 14) return 14;

      if (nextStep === 1) {
        setDay(1);
        resetSimulation();
      } else if (nextStep === 2) {
        setDay(3);
      } else if (nextStep === 3) {
        setDay(4);
      } else if (nextStep === 4) {
        setDay(5);
      } else if (nextStep === 5) {
        setDay(6);
      } else if (nextStep === 6) {
        setDay(7);
      } else if (nextStep === 7) {
        startAgentInvestigation();
      } else if (nextStep === 8) {
        simulateRecoveryStrategies();
      } else if (nextStep === 9) {
        runPolicyCheck();
      } else if (nextStep === 10) {
        runNextExecutionStep();
      } else if (nextStep === 11) {
        executeFullRecoveryWorkflow();
      } else if (nextStep === 12) {
        advanceRecoveryHour(6);
      } else if (nextStep === 13) {
        advanceRecoveryHour(24);
      }
      return nextStep;
    });
  };

  const resetJudgeDemo = () => {
    setJudgeDemoStep(1);
    setDay(1);
    resetSimulation();
  };

  // Merge state for consumers
  const mergedDayData = {
    ...dayData,
    inventory: Object.keys(activeInventory).length > 0 ? activeInventory : dayData.inventory,
    branches: {
      ...dayData.branches,
      'HYD-001': recoveryMonitor 
        ? {
            ...dayData.branches['HYD-001'],
            inventoryHealth: recoveryMonitor.observedMetrics.inventoryHealth,
            topSellerAvailability: recoveryMonitor.observedMetrics.topSellerAvailability,
            customerSentiment: recoveryMonitor.observedMetrics.customerSentiment,
            revenueDecline: recoveryMonitor.observedMetrics.revenueDecline,
            revenueExposure: recoveryMonitor.observedMetrics.revenueExposure
          }
        : dayData.branches['HYD-001']
    },
    events: [...dayData.events, ...simulatedEvents]
  };

  const finalIncident: SentinelIncident | null = activeIncident ? {
    ...activeIncident,
    status: (isAuthorized || currentRecoveryHour === 24
      ? 'RESOLVED' 
      : (policyDecision 
          ? (policyDecision.isAuthorized ? 'STRATEGY_RECOMMENDED' : 'AWAITING_POLICY_CHECK')
          : (decisionRecommendation 
              ? 'STRATEGY_RECOMMENDED' 
              : (investigationState.status === 'Hypothesis Generated' 
                  ? 'INVESTIGATING' 
                  : (investigationState.status === 'Investigating' ? 'INVESTIGATING' : 'DETECTED')
                )
            )
        )
    )
  } : null;

  return (
    <SimulationContext.Provider value={{
      currentDay,
      isAuthorized: isAuthorized || currentRecoveryHour === 24,
      selectedStrategy,
      dayData: mergedDayData,
      isSimulating,
      simulationStep,
      activeAnomalies,
      activeClusters,
      activeIncident: finalIncident,
      investigationState,
      isAgentInvestigating,
      recoveryStrategies,
      simulationResults,
      decisionRecommendation,
      isSimulatingStrategies,
      simulationAgentStep,
      policyDecision,
      approvalRequests,
      isPolicyChecking,
      activeAutonomyLevel,
      activeInventory,
      reservedInventory,
      inTransitInventory,
      executionPlan,
      stockTransferRequest,
      logisticsTask,
      internalNotifications,
      auditEvents,
      recoveryMonitor,
      currentRecoveryHour,
      predictionComparisons,
      similarIncidents,
      executionAgentStatus,
      
      aiStatus,
      isAiLoading,
      currentBriefing,
      currentInvestigationExplanation,
      currentDecisionExplanation,
      currentPostmortem,
      askNervaAnswer,
      
      judgeDemoMode,
      judgeDemoStep,
      showPresenterNotes,
      
      setDay,
      selectStrategy,
      authorizeAction,
      resetSimulation,
      setNormalState,
      startAgentInvestigation,
      simulateRecoveryStrategies,
      runPolicyCheck,
      runNextExecutionStep,
      executeFullRecoveryWorkflow,
      advanceRecoveryHour,
      askNerva,
      clearNervaAnswer,
      
      setJudgeDemoMode,
      setJudgeDemoStep,
      setShowPresenterNotes,
      advanceJudgeDemo,
      resetJudgeDemo
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within a SimulationProvider');
  return context;
};
export default SimulationContext;
