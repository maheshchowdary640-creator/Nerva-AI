# Implementation Plan - Phase 6: Policy-Constrained Autonomy & Approval Engine

This plan outlines the design of the **Policy & Autonomy Approval Engine** for NERVA AI. The engine evaluates candidate strategies against corporate operational guidelines, threshold amounts, and autonomy levels to determine if autonomous execution is permitted or if human signature approval is required.

## User Review Required

> [!IMPORTANT]
> - All policy checks, autonomy boundaries, and approval requests are fully deterministic and calculated offline from business data, without calling Gemini or external LLMs.
> - An interactive **RUN POLICY CHECK** button will be added to the War Room terminal (visible once the recovery strategy simulation completes).
> - Triggering the check will show the Risk & Policy Agent running in the grid, then display the policy decision pill (`AUTONOMOUS_EXECUTION_PERMITTED` or `APPROVAL_REQUIRED`).
> - The **Policy & Autonomy Page** will be connected to the real active rules database, displaying the current autonomy level (Level 4), boundaries, and the active approval queue.

---

## Proposed Changes

### 1. Types & Models
#### [NEW] [policy.ts](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/types/policy.ts)
Define interface structures for policy rules, decisions, requests, and autonomy levels:
- `AutonomyLevel`: `LEVEL_0` to `LEVEL_5`
- `ApprovalStatus`: `PENDING` | `APPROVED` | `REJECTED`
- `ApprovalWorkflowState`: `NOT_REQUIRED` | `PENDING_MANAGER` | `PENDING_CFO` | `APPROVED` | `REJECTED` | `BLOCKED`
- `PolicyRule`: id, name, description, category, thresholdAmount, requiredApprover (`AUTO_EXECUTE` | `MANAGER_APPROVAL` | `CFO_APPROVAL` | `HUMAN_ONLY`).
- `PolicyDecision`: strategyId, incidentId, isAuthorized, approvalRequired, requiredApproverRole, decisionStatus (`AUTONOMOUS_EXECUTION_PERMITTED` | `APPROVAL_REQUIRED` | `ACTION_BLOCKED`), reason.
- `ApprovalRequest`: id, incidentId, strategyId, requestedBy, requiredApproverRole, amount, reason, status, createdAt, decidedAt.

---

### 2. Services
#### [NEW] [policyEngineService.ts](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/services/policyEngineService.ts)
Implements corporate guidelines evaluation:
- Holds the 6 default corporate rules in a registry.
- `evaluateStrategyAuthorization(strategy, simulationResult, recommendation, currentAutonomyLevel)`:
  - Compares the recommended strategy's actions against rules and thresholds.
  - **Strategy B (Inter-Branch Transfer)**: Cost ₹12,550 is below the ₹20,000 threshold for stock transfers, risk is LOW, and autonomy is LEVEL 4 $\rightarrow$ Decision: `AUTONOMOUS_EXECUTION_PERMITTED`.
  - **Strategy A (Emergency Purchase)**: Cost ₹77,848 exceeds ₹50,000 threshold $\rightarrow$ Decision: `APPROVAL_REQUIRED` (CFO approval).
  - Employee Termination: Labeled `HUMAN_ONLY` $\rightarrow$ Decision: `ACTION_BLOCKED`.

---

### 3. Context & UI Integrations
#### [MODIFY] [SimulationContext.tsx](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/context/SimulationContext.tsx)
- State variables: `policyDecision`, `approvalRequests`, `isPolicyChecking`, `activeAutonomyLevel`.
- `runPolicyCheck()` action:
  - Transitions the Risk & Policy Agent in the network grid to `RUNNING`.
  - Calls `policyEngineService.evaluateStrategyAuthorization` on the pre-selected strategy.
  - Compiles the decision status, creates a pending CFO approval request if evaluating Strategy A, and updates the incident status to `AWAITING_POLICY_CHECK` or `STRATEGY_RECOMMENDED`.
- `resetSimulation` clears all Phase 6 states.

#### [MODIFY] [WarRoom.tsx](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/pages/WarRoom.tsx)
- Bind the **RUN POLICY CHECK** button (visible after strategy simulation results compile).
- Link the Risk & Policy Agent grid node status dynamically.
- Render the **Policy Check & Autonomy Decision Console** displaying:
  - Decision outcome (permitted / approval needed).
  - Evaluation details (autonomy limit vs cost, risk level, approver).

#### [MODIFY] [PolicyAutonomy.tsx](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/pages/PolicyAutonomy.tsx)
- Replace static rules and logs with real rules data.
- Display the active approval request queue. If the user evaluates Strategy A, show the CFO approval request as `PENDING`.
- Show authority boundary details and current active level (Level 4).

#### [MODIFY] [CommandCenter.tsx](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/pages/CommandCenter.tsx)
- Update the incident next step badge:
  - If policy check is not run: "Next Step: Policy & Authority Check".
  - If policy check is run: "Policy Check Complete / Ready for Execution".

#### [MODIFY] [Incidents.tsx](file:///c:/Users/mahes/Desktop/AI%20Resume%20Analyzer/frontend/src/pages/Incidents.tsx)
- Bind row status displays.

---

## Verification Plan

### Automated Tests
- Type checking: `npx tsc --noEmit`
- Node script tests: Add policy checks to `src/tests/runTests.ts` and run `npx tsx src/tests/runTests.ts`
- Bundling: `npm run build`

### Manual Verification
- Verify that advancing to Day 7 triggers `NRV-2041`.
- Verify the **Start AI Investigation** and **Simulate Recovery Strategies** buttons run successfully.
- Verify the **RUN POLICY CHECK** button appears.
- Click it, watch the Risk & Policy Agent node transition from `WAITING` $\rightarrow$ `RUNNING` $\rightarrow$ `COMPLETED`.
- Verify that Strategy B (Inter-Branch Transfer) is auto-authorized (Decision: `AUTONOMOUS_EXECUTION_PERMITTED` because cost ₹12,550 is below the ₹20,000 threshold and risk is LOW).
- Select Strategy A (Emergency Purchase) and run policy check. Verify that CFO approval is required (`APPROVAL_REQUIRED`) since the cost (₹77,848) exceeds ₹50,000.
- Verify the **Policy & Autonomy** page displays Level 4 and lists the actual rules and approval queue items.
- Reset the simulation and verify that all policy variables are cleared.
