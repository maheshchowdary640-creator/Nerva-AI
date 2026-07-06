import { RecoveryMonitor, RecoveryCheckpoint, PredictionComparison } from '../types/execution';
import { StrategySimulationResult } from '../types/planner';

export const recoveryMonitoringService = {
  createRecoveryMonitor(
    incidentId: string,
    executionPlanId: string,
    strategyId: string,
    simResult: StrategySimulationResult
  ): RecoveryMonitor {
    const startedAt = new Date().toISOString();
    const monitorId = `MON-${Date.now()}`;

    // Predictions from Strategy B Simulation Results
    const predictedMetrics = {
      inventoryHealth: simResult.afterMetrics.inventoryHealth,
      topSellerAvailability: simResult.afterMetrics.topSellerAvailability,
      customerSentiment: simResult.afterMetrics.customerSentiment,
      revenueDecline: 5, // Expected final baseline decline of 5%
      operationalRiskScore: simResult.afterMetrics.operationalRiskScore,
      revenueExposure: simResult.afterMetrics.estimatedRevenueExposure
    };

    // Checkpoints: 0 HOURS, 6 HOURS, 24 HOURS
    const checkpoints: RecoveryCheckpoint[] = [
      {
        id: `${monitorId}-CP-0`,
        monitorId,
        checkpointLabel: 'TRANSFER RECEIVED (0 HOURS)',
        elapsedHours: 0,
        timestamp: new Date(Date.now() + 1000 * 60).toISOString(),
        metrics: {
          inventoryHealth: 91, // Restocked instantly
          topSellerAvailability: 100,
          customerSentiment: 42, // Sentiment takes time to cool down
          revenueDecline: 35, // Revenue has not recovered yet
          operationalRiskScore: 18, // Risk drops immediately
          revenueExposure: 710000
        },
        predictionComparison: [],
        status: 'PENDING'
      },
      {
        id: `${monitorId}-CP-6`,
        monitorId,
        checkpointLabel: 'SIMULATED 6 HOURS',
        elapsedHours: 6,
        timestamp: new Date(Date.now() + 1000 * 60 * 6).toISOString(),
        metrics: {
          inventoryHealth: 91,
          topSellerAvailability: 100,
          customerSentiment: 55, // Sentiment recovering
          revenueDecline: 25, // Sales recovery starting (+14% sales lift)
          operationalRiskScore: 18,
          revenueExposure: 550000
        },
        predictionComparison: [],
        status: 'PENDING'
      },
      {
        id: `${monitorId}-CP-24`,
        monitorId,
        checkpointLabel: 'SIMULATED 24 HOURS',
        elapsedHours: 24,
        timestamp: new Date(Date.now() + 1000 * 60 * 24).toISOString(),
        metrics: {
          inventoryHealth: 91,
          topSellerAvailability: 100,
          customerSentiment: 75, // Sentiment fully restored
          revenueDecline: 5, // Revenue decline drops to baseline (96.3% healthy)
          operationalRiskScore: 15,
          revenueExposure: 426000
        },
        predictionComparison: [],
        status: 'PENDING'
      }
    ];

    return {
      id: monitorId,
      incidentId,
      executionPlanId,
      strategyId,
      status: 'PENDING',
      startedAt,
      lastEvaluatedAt: startedAt,
      predictedMetrics,
      observedMetrics: { ...checkpoints[0].metrics }, // Default to 0h values
      checkpoints
    };
  },

  evaluateCheckpoint(
    monitor: RecoveryMonitor,
    elapsedHours: number
  ): RecoveryMonitor {
    const updatedMonitor = { ...monitor };
    const checkpoints = [...updatedMonitor.checkpoints];
    const cpIndex = checkpoints.findIndex(c => c.elapsedHours === elapsedHours);
    
    if (cpIndex === -1) return monitor;

    const checkpoint = { ...checkpoints[cpIndex] };
    const observed = checkpoint.metrics;
    const predicted = monitor.predictedMetrics;

    // Calculate prediction comparisons dynamically
    const comps: PredictionComparison[] = [
      this.calculateMetricComparison('Inventory Health', predicted.inventoryHealth, observed.inventoryHealth),
      this.calculateMetricComparison('Top-Seller Availability', predicted.topSellerAvailability, observed.topSellerAvailability),
      this.calculateMetricComparison('Customer Sentiment', predicted.customerSentiment, observed.customerSentiment),
      this.calculateMetricComparison('Revenue Exposure', predicted.revenueExposure, observed.revenueExposure)
    ];

    checkpoint.predictionComparison = comps;
    checkpoint.status = 'COMPLETED';
    checkpoints[cpIndex] = checkpoint;

    updatedMonitor.checkpoints = checkpoints;
    updatedMonitor.observedMetrics = { ...observed };
    updatedMonitor.lastEvaluatedAt = new Date().toISOString();

    // Advance monitor status based on elapsed checkpoints
    if (elapsedHours === 0) {
      updatedMonitor.status = 'ACTIVE';
    } else if (elapsedHours === 6) {
      updatedMonitor.status = 'RECOVERING';
    } else if (elapsedHours === 24) {
      updatedMonitor.status = 'RECOVERED';
      updatedMonitor.completedAt = new Date().toISOString();
    }

    return updatedMonitor;
  },

  calculateMetricComparison(
    metricName: string,
    predicted: number,
    observed: number
  ): PredictionComparison {
    const absDiff = Math.abs(predicted - observed);
    
    // Cost scaling vs percentage scaling
    const maxVal = Math.max(predicted, observed, 1);
    const pctDiff = Math.round((absDiff / maxVal) * 100);
    const accuracy = Math.max(0, 100 - pctDiff);

    return {
      metric: metricName,
      predictedValue: predicted,
      observedValue: observed,
      absoluteDifference: absDiff,
      percentageDifference: pctDiff,
      accuracyScore: accuracy
    };
  },

  getOverallAccuracy(comparisons: PredictionComparison[]): number {
    if (comparisons.length === 0) return 0;
    const sum = comparisons.reduce((acc, curr) => acc + curr.accuracyScore, 0);
    return Math.round(sum / comparisons.length);
  }
};
export default recoveryMonitoringService;
