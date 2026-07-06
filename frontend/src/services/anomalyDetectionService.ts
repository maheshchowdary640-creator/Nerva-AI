import { DayData } from './simulationService';
import { Anomaly, AnomalyCluster } from '../types/sentinel';
import { DetectorRegistry } from './detectors';
import { confidenceUtils } from './confidenceUtils';

const registry = new DetectorRegistry();

export const anomalyDetectionService = {
  // Detect all raw anomalies for the active day
  detectAnomalies(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    // If the simulation is authorized and completed on Day 7, anomalies are resolved
    if (dayData.day === 7 && dayData.isAuthorized && dayData.selectedStrategy === 'B') {
      return [];
    }
    
    // Otherwise run all detectors
    return registry.runAll(dayData, historicalData);
  },

  // Group anomalies temporally and topologically into clusters
  correlateAnomalies(anomalies: Anomaly[], dayData: DayData): AnomalyCluster[] {
    const clusters: AnomalyCluster[] = [];
    const branchGroups: Record<string, Anomaly[]> = {};

    // Group anomalies by branch
    anomalies.forEach(anomaly => {
      const bId = anomaly.branchId;
      if (!branchGroups[bId]) {
        branchGroups[bId] = [];
      }
      branchGroups[bId].push(anomaly);
    });

    // Create clusters for branches with multiple anomalies
    Object.entries(branchGroups).forEach(([branchId, branchAnomalies]) => {
      if (branchAnomalies.length === 0) return;

      // Group anomalies by branch and timeframe (current day).
      // For Hyderabad crisis, we expect all anomalies to coalesce starting Day 3.
      // If there are multiple anomalies (e.g. 2+), we group them into a correlated cluster.
      if (branchAnomalies.length >= 2 || branchId === 'HYD-001') {
        // Mark their status as CORRELATED
        branchAnomalies.forEach(anm => {
          anm.status = 'CORRELATED';
        });

        // Calculate total financial exposure in this cluster (highest value of financial exposure, or sum of losses)
        const finExposureAnomaly = branchAnomalies.find(a => a.id.includes('ANM-FIN-EXP'));
        // Extract numeric value from ₹7.10L format
        let totalExposure = 0;
        if (finExposureAnomaly) {
          const valStr = String(finExposureAnomaly.observedValue).replace('₹', '').replace('L', '');
          totalExposure = parseFloat(valStr) * 100000;
        } else {
          // Fallback calculation
          totalExposure = branchId === 'HYD-001' && dayData.day >= 3 ? (dayData.day - 2) * 142000 : 0;
        }

        // Calculate average confidence score of anomalies in the cluster
        const avgConfidence = Math.round(
          branchAnomalies.reduce((sum, a) => sum + a.confidence, 0) / branchAnomalies.length
        );

        clusters.push({
          id: `CLT-${branchId}-${dayData.day}`,
          branchId,
          timestamp: `Day ${dayData.day}, 09:00 AM`,
          anomalies: branchAnomalies,
          status: 'CORRELATED',
          confidence: avgConfidence,
          totalRevenueExposure: totalExposure,
          // Mandatory correlation text: "Multiple temporally related operational anomalies detected."
          description: 'Multiple temporally related operational anomalies detected.'
        });
      }
    });

    return clusters;
  }
};
export default anomalyDetectionService;
