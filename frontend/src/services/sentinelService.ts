import { DayData } from './simulationService';
import { Anomaly, AnomalyCluster, SentinelIncident } from '../types/sentinel';
import { anomalyDetectionService } from './anomalyDetectionService';
import { incidentTriggerService } from './incidentTriggerService';

export interface SentinelOutput {
  anomalies: Anomaly[];
  clusters: AnomalyCluster[];
  incident: SentinelIncident | null;
}

export const sentinelService = {
  runDetectionPipeline(
    dayData: DayData, 
    historicalData: DayData[]
  ): SentinelOutput {
    // 1. Detect raw anomalies
    const anomalies = anomalyDetectionService.detectAnomalies(dayData, historicalData);

    // 2. Correlate into clusters
    const clusters = anomalyDetectionService.correlateAnomalies(anomalies, dayData);

    // 3. Evaluate incident triggers
    const incident = incidentTriggerService.evaluateTriggers(anomalies, clusters, dayData);

    return {
      anomalies,
      clusters,
      incident
    };
  }
};
export default sentinelService;
