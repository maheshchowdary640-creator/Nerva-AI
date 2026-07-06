import { DayData, REVENUE_BASELINES } from './simulationService';
import { CustomerComplaint } from '../types/business';

export const metricsService = {
  // Daily branch revenue
  getDailyBranchRevenue(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.revenue || 0;
  },

  // Revenue baseline
  getRevenueBaseline(branchId: string): number {
    return REVENUE_BASELINES[branchId] || 0;
  },

  // Revenue deviation percentage
  getRevenueDeviationPercentage(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.revenueDecline || 0;
  },

  // Inventory health score
  getInventoryHealthScore(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.inventoryHealth || 0;
  },

  // Top-seller availability
  getTopSellerAvailability(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.topSellerAvailability || 0;
  },

  // Complaint volume
  getComplaintVolume(dayData: DayData, branchId?: string): number {
    if (branchId) {
      return dayData.complaints.filter(c => c.branchId === branchId).length;
    }
    return dayData.complaints.length;
  },

  // Complaint category distribution
  getComplaintCategoryDistribution(dayData: DayData, branchId?: string): Record<string, number> {
    const branchComplaints = branchId 
      ? dayData.complaints.filter(c => c.branchId === branchId)
      : dayData.complaints;
    
    const distribution: Record<string, number> = {
      PRODUCT_UNAVAILABLE: 0,
      PRICING_ISSUE: 0,
      STAFF_BEHAVIOR: 0,
      QUALITY_ISSUE: 0,
      OTHER: 0
    };

    if (branchComplaints.length === 0) return distribution;

    branchComplaints.forEach(c => {
      if (distribution[c.category] !== undefined) {
        distribution[c.category]++;
      } else {
        distribution['OTHER']++;
      }
    });

    return distribution;
  },

  // Sentiment score
  getSentimentScore(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.customerSentiment || 0;
  },

  // Supplier reliability
  getSupplierReliability(dayData: DayData, supplierId: string): number {
    return dayData.suppliers[supplierId] || 0;
  },

  // Workforce attendance rate
  getWorkforceAttendanceRate(dayData: DayData, branchId: string): number {
    return dayData.branches[branchId]?.workforceAttendance || 0;
  },

  // Business-wide health score
  getBusinessWideHealthScore(dayData: DayData): number {
    return dayData.businessHealth;
  },

  // Estimated revenue exposure (revenue at risk)
  getEstimatedRevenueExposure(dayData: DayData, branchId?: string): number {
    if (branchId) {
      return dayData.branches[branchId]?.revenueExposure || 0;
    }
    // Total exposure across all branches
    return Object.values(dayData.branches).reduce((sum, b) => sum + b.revenueExposure, 0);
  }
};
