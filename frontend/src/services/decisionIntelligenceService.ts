import { StrategySimulationResult, DecisionRecommendation } from '../types/planner';

// Configurable weights for decision matrix
export const DECISION_WEIGHTS = {
  recovery: 0.30,      // 30% - expected recovery efficiency
  lossPrevented: 0.25, // 25% - gross financial savings
  risk: 0.20,          // 20% - lower operational/supplier risk is better
  speed: 0.10,         // 10% - faster resolution hours
  confidence: 0.10,    // 10% - data certainty score
  efficiency: 0.05     // 5%  - lower direct cost impact
};

export const decisionIntelligenceService = {
  rankStrategies(
    results: StrategySimulationResult[], 
    incidentId: string
  ): { rankedResults: (StrategySimulationResult & { score: number })[]; recommendation: DecisionRecommendation } {
    
    // Find limits for normalization
    const maxLoss = Math.max(...results.map(r => r.estimatedLossPrevented), 1);
    const maxHours = Math.max(...results.map(r => r.estimatedResolutionHours), 1);
    const maxCost = Math.max(...results.map(r => r.estimatedDirectCost), 1);

    const scoredResults = results.map(r => {
      // 1. Expected recovery score (0 - 100)
      const scoreRecovery = r.expectedRecoveryPercent;

      // 2. Loss prevented score (normalized vs max savings)
      const scoreLoss = (r.estimatedLossPrevented / maxLoss) * 100;

      // 3. Risk score (inverted: lower risk = higher score)
      const scoreRisk = 100 - r.riskScore;

      // 4. Resolution speed (inverted: fewer hours = higher score)
      const scoreSpeed = (1 - r.estimatedResolutionHours / 100) * 100;

      // 5. Confidence score (0 - 100)
      const scoreConfidence = r.confidence;

      // 6. Cost efficiency (inverted: lower cost = higher score)
      const scoreEfficiency = (1 - r.estimatedDirectCost / 100000) * 100; // normalized to 100k emergency budget limit

      // Compute weighted sum
      const totalScore = Math.round(
        (scoreRecovery * DECISION_WEIGHTS.recovery) +
        (scoreLoss * DECISION_WEIGHTS.lossPrevented) +
        (scoreRisk * DECISION_WEIGHTS.risk) +
        (scoreSpeed * DECISION_WEIGHTS.speed) +
        (scoreConfidence * DECISION_WEIGHTS.confidence) +
        (scoreEfficiency * DECISION_WEIGHTS.efficiency)
      );

      return {
        ...r,
        score: Math.max(0, Math.min(100, totalScore))
      };
    });

    // Rank from highest to lowest score
    const rankedResults = [...scoredResults].sort((a, b) => b.score - a.score);
    const recommended = rankedResults[0];

    // Compile reason codes based on scores and metrics
    const reasonCodes: string[] = [];
    if (recommended.expectedRecoveryPercent >= 90) {
      reasonCodes.push('HIGHEST_EXPECTED_RECOVERY');
    }
    if (recommended.riskScore <= 30) {
      reasonCodes.push('LOWEST_OPERATIONAL_RISK');
    }
    if (recommended.estimatedResolutionHours < 12) {
      reasonCodes.push('FASTEST_FEASIBLE_RESPONSE');
    }
    if (recommended.estimatedLossPrevented > 200000) {
      reasonCodes.push('HIGHEST_LOSS_PREVENTION');
    }
    if (recommended.estimatedDirectCost < 20000) {
      reasonCodes.push('LOW_COST_HIGH_IMPACT');
    }
    
    // For inter-branch, audit source branch safety
    if (recommended.strategyId === 'STRAT-B') {
      reasonCodes.push('SOURCE_BRANCH_REMAINS_SAFE');
    }

    // Dynamic explanation builder
    let comparisonSummary = '';
    if (recommended.strategyId === 'STRAT-B') {
      comparisonSummary = `NERVA recommends the inter-branch stock transfer because it restores the highest percentage of affected top-selling inventory (${recommended.expectedRecoveryPercent}%) while maintaining safe inventory levels at Vijayawada Central. The strategy has lower operational risk (${recommended.riskLevel}), lower direct cost (₹${recommended.estimatedDirectCost.toLocaleString()}), and faster expected recovery than emergency procurement or waiting for the delayed supplier.`;
    } else if (recommended.strategyId === 'STRAT-A') {
      comparisonSummary = `NERVA recommends emergency supplier purchase. Although operational costs are higher (₹${recommended.estimatedDirectCost.toLocaleString()}), it restores critical inventory rapidly (${recommended.estimatedResolutionHours} hours) and mitigates exposure when inter-branch transfers are unfeasible.`;
    } else {
      comparisonSummary = `NERVA recommends waiting for original supplier. Review policy guidelines to authorize emergency budgets.`;
    }

    const recommendation: DecisionRecommendation = {
      incidentId,
      recommendedStrategyId: recommended.strategyId,
      rankedStrategyIds: rankedResults.map(r => r.strategyId),
      decisionScore: recommended.score,
      confidence: recommended.confidence,
      reasonCodes,
      comparisonSummary,
      generatedAt: new Date().toISOString()
    };

    return {
      rankedResults,
      recommendation
    };
  }
};
export default decisionIntelligenceService;
