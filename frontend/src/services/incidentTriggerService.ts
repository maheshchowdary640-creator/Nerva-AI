import { DayData } from './simulationService';
import { Anomaly, AnomalyCluster, SentinelIncident, SignalType } from '../types/sentinel';

export const incidentTriggerService = {
  evaluateTriggers(
    anomalies: Anomaly[], 
    clusters: AnomalyCluster[], 
    dayData: DayData
  ): SentinelIncident | null {
    // If we are before Day 7, the cumulative revenue crisis has not peaked to trigger the incident
    if (dayData.day < 7) return null;

    // If day is 7 and the operator authorized the mitigation strategy, the incident resolves
    const isMitigated = dayData.day === 7 && dayData.isAuthorized && dayData.selectedStrategy === 'B';

    // Find the cluster for Hyderabad Central
    const hydCluster = clusters.find(c => c.branchId === 'HYD-001');
    const branchAnomalies = anomalies.filter(a => a.branchId === 'HYD-001');

    // 1. Identify affected domains
    const affectedDomainsSet = new Set<SignalType>();
    branchAnomalies.forEach(a => affectedDomainsSet.add(a.signalType));
    const affectedDomains = Array.from(affectedDomainsSet);

    // 2. Identify critical anomalies
    const criticalAnomalies = branchAnomalies.filter(a => a.severity === 'CRITICAL');
    const warningOrHighAnomalies = branchAnomalies.filter(a => a.severity === 'WARNING' || a.severity === 'MEDIUM');

    // Trigger Rules evaluation
    let triggered = false;
    let triggerRule = '';

    if (criticalAnomalies.length >= 1) {
      triggered = true;
      triggerRule = 'RULE-CRIT-ANOMALY: Critical operational anomaly detected in branch signal streams.';
    } else if (affectedDomains.length >= 3 && warningOrHighAnomalies.length >= 3) {
      triggered = true;
      triggerRule = 'RULE-MULTI-DOMAIN: Multiple warning/high alerts detected across 3+ operational domains.';
    } else if (hydCluster && hydCluster.anomalies.length >= 4) {
      triggered = true;
      triggerRule = 'RULE-CLUSTER-THRESHOLD: Correlated anomaly cluster size exceeds safety margins.';
    }

    // If triggered, return the SentinelIncident object
    if (triggered) {
      const primaryAnomaly = criticalAnomalies[0] || warningOrHighAnomalies[0] || branchAnomalies[0];
      const relatedAnomalies = branchAnomalies.filter(a => a.id !== primaryAnomaly.id);
      
      const relatedEventIdsSet = new Set<string>();
      branchAnomalies.forEach(a => {
        a.relatedEventIds.forEach(id => relatedEventIdsSet.add(id));
      });
      const relatedEventIds = Array.from(relatedEventIdsSet);

      // Average confidence score across anomalies in the cluster
      const confidence = hydCluster ? hydCluster.confidence : 91;

      // Mathematical financial exposure
      const estimatedExposure = hydCluster ? hydCluster.totalRevenueExposure : 710000;

      // Status translation
      let incidentStatus: SentinelIncident['status'] = 'DETECTED';
      if (isMitigated) {
        incidentStatus = 'RESOLVED';
      } else if (dayData.day === 7) {
        incidentStatus = 'DETECTED'; // Keep status "Detected" on Day 7, or Investigating/Mitigating as appropriate
      } else if (dayData.day >= 5) {
        incidentStatus = 'MITIGATING';
      } else if (dayData.day >= 3) {
        incidentStatus = 'INVESTIGATING';
      }

      return {
        id: 'INC-2041',
        title: 'Hyderabad Branch Revenue Decline',
        code: 'NRV-2041',
        status: incidentStatus,
        severity: 'critical',
        primaryAnomalyId: primaryAnomaly.id,
        relatedAnomalyIds: relatedAnomalies.map(a => a.id),
        relatedEventIds,
        affectedDomains,
        confidence,
        estimatedExposure,
        impactDecline: 35,
        triggerRule,
        detectedAt: 'Day 3, 09:12 AM',
        description: 'Systemic supply chain breakdown starting from primary supplier delivery delay, culminating in empty shelves of top-selling products and a subsequent drop in footfall, complaints surge, and revenue loss at the Hyderabad branch.',
        rootCauseChain: [
          'Supplier delivery delay (Apex Distributors delayed 52 hrs)',
          'Replenishment stock not received at Madhapur warehouse',
          'Inventory escalation policy failed due to staff shortage (2 absent)',
          '8 out of 15 top-selling beverages & dairy products stockout',
          'Customer complaints spike (48% PRODUCT_UNAVAILABLE)',
          'Hyderabad Branch revenue drops 35% on Day 7'
        ],
        affectedBranches: ['HYD-001']
      };
    }

    return null;
  }
};
export default incidentTriggerService;
