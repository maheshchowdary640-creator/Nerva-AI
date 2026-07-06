import { DayData } from './simulationService';
import { Anomaly, AnomalySeverity, SignalType } from '../types/sentinel';
import { confidenceUtils } from './confidenceUtils';
import { PRODUCTS } from './businessData';

export interface BaseDetector {
  id: string;
  name: string;
  detect(dayData: DayData, historicalData: DayData[]): Anomaly[];
}

// 1. Revenue Deviation Detector
export class RevenueDeviationDetector implements BaseDetector {
  id = 'DET-REV-DEV';
  name = 'Revenue Deviation Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const baseline = 400000; // Hyderabad Central baseline

    Object.entries(dayData.branches).forEach(([branchId, branch]) => {
      if (branchId !== 'HYD-001') return; // Target Hyderabad Central for this crisis

      const deviation = branch.revenue - baseline;
      const deviationPercent = (deviation / baseline) * 100;

      if (deviationPercent <= -10) {
        let severity: AnomalySeverity = 'WARNING';
        if (deviationPercent <= -30) severity = 'CRITICAL';
        else if (deviationPercent <= -20) severity = 'MEDIUM'; // (High/Medium)

        const confidence = confidenceUtils.calculateConfidence({
          deviationMagnitude: Math.min(1, Math.abs(deviationPercent) / 50),
          dataCompleteness: 1.0,
          persistence: dayData.day >= 5 ? 0.8 : 0.4,
          thresholdDistance: Math.min(1, (Math.abs(deviationPercent) - 10) / 30),
          evidenceConsistency: dayData.day >= 6 ? 0.9 : 0.5
        });

        anomalies.push({
          id: `ANM-REV-DEV-${dayData.day}`,
          timestamp: `Day ${dayData.day}, 09:00 AM`,
          branchId,
          signalType: 'FINANCE',
          detectorType: this.name,
          metric: 'Daily Branch Revenue',
          observedValue: `₹${(branch.revenue / 100000).toFixed(2)}L`,
          expectedValue: `₹${(baseline / 100000).toFixed(2)}L`,
          deviation,
          deviationPercent,
          severity,
          confidence,
          status: 'DETECTED',
          relatedEventIds: dayData.day >= 7 ? ['E009'] : [],
          evidence: `Daily revenue dropped by ${Math.abs(deviationPercent).toFixed(1)}% below baseline threshold.`
        });
      }
    });

    return anomalies;
  }
}

// 2. Sustained Revenue Trend Detector
export class SustainedRevenueTrendDetector implements BaseDetector {
  id = 'DET-REV-TREND';
  name = 'Sustained Revenue Trend Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    if (dayData.day < 5) return []; // Need at least 3 days of decline starting Day 3-4

    // Hyderabad Central check
    const baseline = 400000;
    const hydHistory = historicalData.map(d => d.branches['HYD-001']?.revenue ?? baseline);
    
    // Check if revenue is declining continuously for at least 3 days
    let declineCount = 0;
    for (let i = 1; i < hydHistory.length; i++) {
      if (hydHistory[i] < hydHistory[i - 1]) {
        declineCount++;
      } else {
        declineCount = 0;
      }
    }

    if (declineCount >= 3) {
      const currentRevenue = hydHistory[hydHistory.length - 1];
      const deviation = currentRevenue - baseline;
      const deviationPercent = (deviation / baseline) * 100;
      
      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: Math.min(1, Math.abs(deviationPercent) / 50),
        dataCompleteness: 1.0,
        persistence: Math.min(1, declineCount / 5),
        thresholdDistance: 0.8,
        evidenceConsistency: 0.9
      });

      anomalies.push({
        id: `ANM-REV-TRND-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId: 'HYD-001',
        signalType: 'FINANCE',
        detectorType: this.name,
        metric: 'Revenue Trend Slope',
        observedValue: `Decline slope: ${declineCount} consecutive days`,
        expectedValue: 'Stable or positive growth trend',
        deviation,
        deviationPercent,
        severity: 'CRITICAL',
        confidence,
        status: 'DETECTED',
        relatedEventIds: [],
        evidence: `Sustained daily revenue decline detected over ${declineCount} consecutive tracking cycles.`
      });
    }

    return anomalies;
  }
}

// 3. Critical Stock Detector
export class CriticalStockDetector implements BaseDetector {
  id = 'DET-STK-CRIT';
  name = 'Critical Stock Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    const branchStock = dayData.inventory[branchId];
    if (!branchStock) return [];

    const topSellers = PRODUCTS.filter(p => p.isTopSeller);
    let outOfStockCount = 0;
    let criticallyLowCount = 0;

    topSellers.forEach(p => {
      const stock = branchStock[p.id] ?? 0;
      if (stock === 0) outOfStockCount++;
      else if (stock <= 5) criticallyLowCount++;
    });

    const totalCriticalTopSellers = outOfStockCount + criticallyLowCount;

    // Trigger critical alarm if 5+ top sellers are critical/out of stock
    if (totalCriticalTopSellers >= 5) {
      const availabilityPct = ((topSellers.length - totalCriticalTopSellers) / topSellers.length) * 100;
      
      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: totalCriticalTopSellers / topSellers.length,
        dataCompleteness: 1.0,
        persistence: dayData.day >= 6 ? 0.9 : 0.6,
        thresholdDistance: (totalCriticalTopSellers - 5) / 10,
        evidenceConsistency: 0.85
      });

      anomalies.push({
        id: `ANM-STK-CRIT-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'INVENTORY',
        detectorType: this.name,
        metric: 'Top-Seller Stock Out Count',
        observedValue: `${totalCriticalTopSellers} items critical`,
        expectedValue: '0 items critical',
        deviation: totalCriticalTopSellers,
        deviationPercent: availabilityPct - 100,
        severity: 'CRITICAL',
        confidence,
        status: 'DETECTED',
        relatedEventIds: dayData.day >= 5 ? ['E006'] : [],
        evidence: `Critical stock alert: ${totalCriticalTopSellers} of ${topSellers.length} top-selling products are out of stock or critically depleted.`
      });
    }

    return anomalies;
  }
}

// 4. Stock Depletion Velocity Detector
export class StockDepletionVelocityDetector implements BaseDetector {
  id = 'DET-STK-VEL';
  name = 'Stock Depletion Velocity Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    
    if (dayData.day !== 4) return []; // Detect early depletion velocity warning on Day 4
    
    const currentStock = Object.values(dayData.inventory[branchId] ?? {}).reduce((s, v) => s + v, 0);
    const day2Data = historicalData.find(d => d.day === 2);
    const day2Stock = day2Data ? Object.values(day2Data.inventory[branchId] ?? {}).reduce((s, v) => s + v, 0) : 2550;
    
    const velocity = day2Stock - currentStock;
    const velocityPercent = (velocity / day2Stock) * 100;

    if (velocityPercent >= 20) {
      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: velocityPercent / 50,
        dataCompleteness: 1.0,
        persistence: 0.3,
        thresholdDistance: 0.5,
        evidenceConsistency: 0.7
      });

      anomalies.push({
        id: `ANM-STK-VEL-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'INVENTORY',
        detectorType: this.name,
        metric: 'Inventory Depletion Speed',
        observedValue: `${velocityPercent.toFixed(0)}% drop rate`,
        expectedValue: 'Normal replenishment flow',
        deviation: velocity,
        deviationPercent: -velocityPercent,
        severity: 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: ['E005'],
        evidence: `Abnormal depletion velocity: inventory levels dropping at ${velocityPercent.toFixed(1)}% per cycle due to missing deliveries.`
      });
    }

    return anomalies;
  }
}

// 5. Complaint Volume Detector
export class ComplaintVolumeDetector implements BaseDetector {
  id = 'DET-CMP-VOL';
  name = 'Complaint Volume Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    
    // Normal baseline complaints: 1-2 per day.
    const baselineComplaints = 1.5;
    const branchComplaints = dayData.complaints.filter(c => c.branchId === branchId);
    
    // Get complaints specifically registered today
    const todayComplaints = branchComplaints.filter(c => c.date === `Day ${dayData.day}`);
    
    if (todayComplaints.length >= 4) {
      const deviation = todayComplaints.length - baselineComplaints;
      const deviationPercent = (deviation / baselineComplaints) * 100;

      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: Math.min(1, deviationPercent / 300),
        dataCompleteness: 1.0,
        persistence: 0.5,
        thresholdDistance: Math.min(1, (todayComplaints.length - 4) / 10),
        evidenceConsistency: 0.85
      });

      anomalies.push({
        id: `ANM-CMP-VOL-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'CUSTOMER',
        detectorType: this.name,
        metric: 'Daily Customer Complaints',
        observedValue: `${todayComplaints.length} cases`,
        expectedValue: `${baselineComplaints} cases (mean)`,
        deviation,
        deviationPercent,
        severity: todayComplaints.length >= 8 ? 'CRITICAL' : 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: dayData.day >= 6 ? ['E008'] : [],
        evidence: `Customer complaints spike: volume increased by ${deviationPercent.toFixed(0)}% compared to routine daily baseline.`
      });
    }

    return anomalies;
  }
}

// 6. Complaint Category Concentration Detector
export class ComplaintCategoryConcentrationDetector implements BaseDetector {
  id = 'DET-CMP-CONC';
  name = 'Complaint Category Concentration Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    const branchComplaints = dayData.complaints.filter(c => c.branchId === branchId);
    
    if (branchComplaints.length === 0) return [];

    const unavailableCount = branchComplaints.filter(c => c.category === 'PRODUCT_UNAVAILABLE').length;
    const concentrationPercent = (unavailableCount / branchComplaints.length) * 100;

    // Flag warning if a single category concentration exceeds 40%
    if (concentrationPercent >= 40) {
      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: concentrationPercent / 100,
        dataCompleteness: 1.0,
        persistence: 0.6,
        thresholdDistance: (concentrationPercent - 40) / 60,
        evidenceConsistency: 0.9
      });

      anomalies.push({
        id: `ANM-CMP-CONC-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'CUSTOMER',
        detectorType: this.name,
        metric: 'Category Concentration Rate',
        observedValue: `${concentrationPercent.toFixed(1)}% PRODUCT_UNAVAILABLE`,
        expectedValue: 'Uniform distribution across categories',
        deviation: unavailableCount,
        deviationPercent: concentrationPercent,
        severity: 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: dayData.day >= 6 ? ['E008'] : [],
        evidence: `Anomalous category concentration: complaints focus heavily on out-of-stock products (${concentrationPercent.toFixed(1)}% of total complaints).`
      });
    }

    return anomalies;
  }
}

// 7. Sentiment Detector
export class SentimentDetector implements BaseDetector {
  id = 'DET-CUST-SENT';
  name = 'Customer Sentiment Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    const sentiment = dayData.branches[branchId]?.customerSentiment ?? 88;
    const baseline = 88;

    if (sentiment <= 60) {
      const deviation = sentiment - baseline;
      const deviationPercent = (deviation / baseline) * 100;

      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: Math.min(1, Math.abs(deviationPercent) / 60),
        dataCompleteness: 1.0,
        persistence: dayData.day >= 6 ? 0.7 : 0.4,
        thresholdDistance: Math.min(1, (60 - sentiment) / 30),
        evidenceConsistency: 0.8
      });

      anomalies.push({
        id: `ANM-CUST-SENT-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'CUSTOMER',
        detectorType: this.name,
        metric: 'Customer Sentiment Score',
        observedValue: `${sentiment}%`,
        expectedValue: `${baseline}%`,
        deviation,
        deviationPercent,
        severity: sentiment <= 45 ? 'CRITICAL' : 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: dayData.day >= 6 ? ['E008'] : [],
        evidence: `Customer sentiment score dropped by ${Math.abs(deviationPercent).toFixed(1)}% below operational baseline.`
      });
    }

    return anomalies;
  }
}

// 8. Supplier Delivery Delay Detector
export class SupplierDeliveryDelayDetector implements BaseDetector {
  id = 'DET-SUP-DELAY';
  name = 'Supplier Delivery Delay Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';

    // Day 3 onwards Apex Distributors has delayed shipment
    if (dayData.day >= 3) {
      const delayHours = 52; // Delayed by 52 hours
      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: 1.0, // Delay is complete
        dataCompleteness: 1.0,
        persistence: 0.9,
        thresholdDistance: 1.0,
        evidenceConsistency: 0.8
      });

      anomalies.push({
        id: `ANM-SUP-DELAY-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'SUPPLIER',
        detectorType: this.name,
        metric: 'Supplier Delivery Delay Time',
        observedValue: `${delayHours} hours`,
        expectedValue: '0 hours (On Schedule)',
        deviation: delayHours,
        deviationPercent: 100, // Binary delay flag
        severity: 'CRITICAL',
        confidence,
        status: 'DETECTED',
        relatedEventIds: ['E004'],
        evidence: `Supplier Apex shipment #TRK-8812 delayed by 52 hours. Expected replenishment window missed.`
      });
    }

    return anomalies;
  }
}

// 9. Supplier Reliability Detector
export class SupplierReliabilityDetector implements BaseDetector {
  id = 'DET-SUP-RELI';
  name = 'Supplier Reliability Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const supplierId = 'SUP-001'; // Apex
    const reliability = dayData.suppliers[supplierId] ?? 95;
    const baseline = 95;

    if (reliability <= 70) {
      const deviation = reliability - baseline;
      const deviationPercent = (deviation / baseline) * 100;

      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: Math.min(1, Math.abs(deviationPercent) / 60),
        dataCompleteness: 1.0,
        persistence: dayData.day >= 5 ? 0.8 : 0.4,
        thresholdDistance: (70 - reliability) / 32,
        evidenceConsistency: 0.8
      });

      anomalies.push({
        id: `ANM-SUP-RELI-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId: 'HYD-001',
        signalType: 'SUPPLIER',
        detectorType: this.name,
        metric: 'Supplier Reliability Rating',
        observedValue: `${reliability}%`,
        expectedValue: `${baseline}%`,
        deviation,
        deviationPercent,
        severity: reliability <= 40 ? 'CRITICAL' : 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: ['E004'],
        evidence: `Supplier Apex reliability rating dropped to ${reliability}%, breaching safety thresholds due to unfulfilled shipments.`
      });
    }

    return anomalies;
  }
}

// 10. Workforce Capacity Detector
export class WorkforceCapacityDetector implements BaseDetector {
  id = 'DET-WF-CAP';
  name = 'Workforce Capacity Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    const present = dayData.attendance[branchId]?.presentCount ?? 42;
    const total = dayData.attendance[branchId]?.totalCount ?? 42;
    
    // Day 5 onwards, 2 staff absent
    if (dayData.day >= 5 && present < total) {
      const absentCount = total - present;
      const absentPercent = (absentCount / total) * 100;

      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: absentPercent / 20,
        dataCompleteness: 1.0,
        persistence: 0.8,
        thresholdDistance: 0.6,
        evidenceConsistency: 0.7
      });

      anomalies.push({
        id: `ANM-WF-CAP-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'WORKFORCE',
        detectorType: this.name,
        metric: 'Absent Staff Count',
        observedValue: `${absentCount} logistics coordinators absent`,
        expectedValue: '0 staff absent',
        deviation: absentCount,
        deviationPercent: -absentPercent,
        severity: 'WARNING',
        confidence,
        status: 'DETECTED',
        relatedEventIds: ['E007'],
        evidence: `Workforce warning: ${absentCount} key inventory staff absent at Hyderabad. Loading bay operations restricted.`
      });
    }

    return anomalies;
  }
}

// 11. Financial Exposure Detector
export class FinancialExposureDetector implements BaseDetector {
  id = 'DET-FIN-EXP';
  name = 'Financial Exposure Detector';

  detect(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const branchId = 'HYD-001';
    
    if (dayData.day < 3) return []; // Loss starts Day 4 (Day 3 delay impact)

    // Calculate revenue exposure close to ₹7.1L using baseline, decline and projection logic.
    // Daily loss = baseline - actual revenue
    const baseline = 400000;
    
    // Calculate cumulative loss so far (Days 3 to current day)
    let cumulativeLoss = 0;
    historicalData.forEach(d => {
      if (d.day >= 3) {
        const actual = d.branches[branchId]?.revenue ?? baseline;
        cumulativeLoss += (baseline - actual);
      }
    });

    const currentRevenue = dayData.branches[branchId]?.revenue ?? baseline;
    const currentDailyLoss = baseline - currentRevenue;
    
    // Projection of future loss based on remaining supplier delay hours
    // Apex S1 delay: 52 hours. Expected transit lag + safety buffer = 2.82 days
    const projectedRestockDays = 2.82;
    const projectedFutureLoss = currentDailyLoss * projectedRestockDays;
    
    const calculatedExposure = cumulativeLoss + projectedFutureLoss;

    // Trigger warning if exposure exceeds ₹1,00,000
    if (calculatedExposure >= 100000) {
      let severity: AnomalySeverity = 'WARNING';
      if (calculatedExposure >= 500000) severity = 'CRITICAL';
      else if (calculatedExposure >= 250000) severity = 'MEDIUM'; // (High/Medium)

      const confidence = confidenceUtils.calculateConfidence({
        deviationMagnitude: Math.min(1.0, calculatedExposure / 800000),
        dataCompleteness: 1.0,
        persistence: dayData.day >= 5 ? 0.8 : 0.4,
        thresholdDistance: Math.min(1.0, (calculatedExposure - 100000) / 600000),
        evidenceConsistency: 0.9
      });

      anomalies.push({
        id: `ANM-FIN-EXP-${dayData.day}`,
        timestamp: `Day ${dayData.day}, 09:00 AM`,
        branchId,
        signalType: 'FINANCE',
        detectorType: this.name,
        metric: 'Estimated Crisis Financial Exposure',
        observedValue: `₹${(calculatedExposure / 100000).toFixed(2)}L`,
        expectedValue: '₹0.00L (No Risk)',
        deviation: calculatedExposure,
        deviationPercent: (calculatedExposure / baseline) * 100,
        severity,
        confidence,
        status: 'DETECTED',
        relatedEventIds: [],
        evidence: `Calculated financial threat: cumulative losses + logistics replenishment recovery window projects an exposure of ₹${(calculatedExposure / 100000).toFixed(2)}L.`
      });
    }

    return anomalies;
  }
}

// Detector Registry
export class DetectorRegistry {
  private detectors: BaseDetector[] = [];

  constructor() {
    this.detectors.push(new RevenueDeviationDetector());
    this.detectors.push(new SustainedRevenueTrendDetector());
    this.detectors.push(new CriticalStockDetector());
    this.detectors.push(new StockDepletionVelocityDetector());
    this.detectors.push(new ComplaintVolumeDetector());
    this.detectors.push(new ComplaintCategoryConcentrationDetector());
    this.detectors.push(new SentimentDetector());
    this.detectors.push(new SupplierDeliveryDelayDetector());
    this.detectors.push(new SupplierReliabilityDetector());
    this.detectors.push(new WorkforceCapacityDetector());
    this.detectors.push(new FinancialExposureDetector());
  }

  public runAll(dayData: DayData, historicalData: DayData[]): Anomaly[] {
    const allAnomalies: Anomaly[] = [];
    this.detectors.forEach(detector => {
      try {
        const detected = detector.detect(dayData, historicalData);
        allAnomalies.push(...detected);
      } catch (err) {
        console.error(`Error running detector ${detector.id}:`, err);
      }
    });
    return allAnomalies;
  }
}
