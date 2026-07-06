import { BRANCHES, PRODUCTS, SUPPLIERS } from './businessData';
import { 
  Branch, Product, Supplier, SalesRecord, InventoryRecord, 
  SupplierDelivery, CustomerComplaint, WorkforceAttendance, 
  BusinessEvent, Incident, SignalStream, EventType
} from '../types/business';

// Daily baseline revenue
export const REVENUE_BASELINES: Record<string, number> = {
  'HYD-001': 400000,
  'VIJ-001': 310000,
  'WAR-001': 240000,
  'GNT-001': 220000,
};

// Target top sellers that will go out of stock in Hyderabad
const HYD_OUT_OF_STOCK_PRODUCTS = [
  'P001', // Nectar Fresh Apple Juice (Beverages, Top Seller)
  'P003', // Organic Masala Chai Blend (Beverages, Top Seller)
  'P005', // Roasted Almond Cold Brew (Beverages, Top Seller)
  'P007', // Pure Cow Milk 1L (Dairy, Top Seller)
  'P008', // Salted Butter Premium (Dairy, Top Seller)
  'P010', // Artisanal Cheddar Cheese (Dairy, Top Seller)
  'P011', // Fresh Paneer Block 200g (Dairy, Top Seller)
  'P026', // Citrus Liquid Detergent 2L (Household, Top Seller)
];

export interface DayData {
  day: number;
  isAuthorized: boolean;
  selectedStrategy: string | null;
  businessHealth: number;
  branches: Record<string, {
    healthScore: number;
    revenue: number;
    revenueDecline: number;
    inventoryHealth: number;
    customerSentiment: number;
    workforceAttendance: number;
    topSellerAvailability: number;
    revenueExposure: number;
  }>;
  inventory: Record<string, Record<string, number>>; // branchId -> productId -> stockLevel
  suppliers: Record<string, number>; // supplierId -> reliability
  complaints: CustomerComplaint[];
  attendance: Record<string, WorkforceAttendance>;
  events: BusinessEvent[];
  incident: Incident;
}

export class SimulationEngine {
  public static getSimulationData(
    day: number, 
    isAuthorized: boolean, 
    selectedStrategy: string | null
  ): DayData {
    // 1. Initialize suppliers reliability
    const suppliersReliability: Record<string, number> = {};
    SUPPLIERS.forEach(s => {
      suppliersReliability[s.id] = s.reliability;
    });

    // In Hyderabad, supplier SUP-001 (Apex) reliability drops starting on Day 3
    if (day >= 3) {
      if (day === 3) suppliersReliability['SUP-001'] = 82;
      else if (day === 4) suppliersReliability['SUP-001'] = 68;
      else if (day === 5) suppliersReliability['SUP-001'] = 52;
      else if (day === 6) suppliersReliability['SUP-001'] = 44;
      else suppliersReliability['SUP-001'] = 38; // Day 7: 38% reliability
    }

    // 2. Initialize inventory levels
    const inventory: Record<string, Record<string, number>> = {};
    BRANCHES.forEach(b => {
      inventory[b.id] = {};
      PRODUCTS.forEach(p => {
        if (b.id === 'VIJ-001') {
          // Vijayawada Central always has abundant stock (to satisfy 600-unit transfer)
          inventory[b.id][p.id] = p.isTopSeller ? 140 : 100;
        } else if (b.id === 'HYD-001') {
          // Hyderabad inventory progression
          if (day <= 2) {
            inventory[b.id][p.id] = p.isTopSeller ? 95 : 75;
          } else if (day === 3) {
            // Supplier delay event, stocks start decreasing
            inventory[b.id][p.id] = p.isTopSeller ? 70 : 65;
          } else if (day === 4) {
            // Stock falling further
            const isTarget = HYD_OUT_OF_STOCK_PRODUCTS.includes(p.id);
            inventory[b.id][p.id] = isTarget ? 24 : (p.isTopSeller ? 55 : 50);
          } else if (day === 5) {
            // Crisis hits: 8 top sellers critically low or out of stock
            const isTarget = HYD_OUT_OF_STOCK_PRODUCTS.includes(p.id);
            if (isTarget) {
              // Mark some 0, some 1, some 2 to represent critically low or out of stock
              if (p.id === 'P007' || p.id === 'P011') {
                inventory[b.id][p.id] = 1; // Critically low
              } else {
                inventory[b.id][p.id] = 0; // Out of stock
              }
            } else {
              inventory[b.id][p.id] = p.isTopSeller ? 45 : 40;
            }
          } else if (day === 6) {
            // stock out spreads
            const isTarget = HYD_OUT_OF_STOCK_PRODUCTS.includes(p.id);
            if (isTarget) {
              inventory[b.id][p.id] = 0;
            } else {
              inventory[b.id][p.id] = p.isTopSeller ? 35 : 35;
            }
          } else {
            // Day 7
            const isTarget = HYD_OUT_OF_STOCK_PRODUCTS.includes(p.id);
            if (isTarget) {
              // If authorized & strategy is Inter-branch stock transfer, show recovery on Day 7!
              if (isAuthorized && selectedStrategy === 'B') {
                inventory[b.id][p.id] = 75; // Recovered stock!
              } else {
                inventory[b.id][p.id] = 0; // Still out of stock
              }
            } else {
              inventory[b.id][p.id] = p.isTopSeller ? 30 : 30;
            }
          }
        } else {
          // Other branches
          inventory[b.id][p.id] = p.isTopSeller ? 80 : 60;
        }
      });
    });

    // 3. Customer Complaints
    const complaints: CustomerComplaint[] = [];
    // Generate complaints based on day
    const createComplaint = (id: string, branchId: string, dayNum: number, cat: CustomerComplaint['category'], desc: string, sent: CustomerComplaint['sentiment']): CustomerComplaint => ({
      id,
      branchId,
      date: `Day ${dayNum}`,
      category: cat,
      description: desc,
      sentiment: sent
    });

    // Add baseline complaints
    complaints.push(createComplaint('C001', 'HYD-001', 1, 'QUALITY_ISSUE', 'Paneer package seal was slightly broken.', 'NEGATIVE'));
    complaints.push(createComplaint('C002', 'VIJ-001', 2, 'PRICING_ISSUE', 'Price tag difference on oats.', 'NEGATIVE'));
    complaints.push(createComplaint('C003', 'WAR-001', 2, 'STAFF_BEHAVIOR', 'Billing counter queue was slow.', 'NEUTRAL'));

    if (day >= 4) {
      complaints.push(createComplaint('C004', 'HYD-001', 4, 'PRODUCT_UNAVAILABLE', 'Could not find Nectar Fresh Apple Juice.', 'NEGATIVE'));
    }
    if (day >= 5) {
      complaints.push(createComplaint('C005', 'HYD-001', 5, 'PRODUCT_UNAVAILABLE', 'Greek Yogurt and Pure Cow Milk shelves are completely empty.', 'NEGATIVE'));
      complaints.push(createComplaint('C006', 'HYD-001', 5, 'QUALITY_ISSUE', 'Vegetables did not look fresh.', 'NEGATIVE'));
    }
    if (day >= 6) {
      // Day 6 complaints spike.
      // Total complaints for Hyderabad on Day 6: 12.
      // Around 48% (which is about 6 out of 12 or 13) should be PRODUCT_UNAVAILABLE.
      complaints.push(createComplaint('C007', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'Salted Butter is out of stock. Visited twice this week.', 'NEGATIVE'));
      complaints.push(createComplaint('C008', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'Fresh Paneer is out of stock. Unacceptable!', 'NEGATIVE'));
      complaints.push(createComplaint('C009', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'No cold brew coffee available on shelves.', 'NEGATIVE'));
      complaints.push(createComplaint('C010', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'Basmati rice premium brand not in stock.', 'NEGATIVE'));
      complaints.push(createComplaint('C011', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'Could not purchase Citrus Liquid Detergent. Empty racks.', 'NEGATIVE'));
      complaints.push(createComplaint('C012', 'HYD-001', 6, 'PRODUCT_UNAVAILABLE', 'Fresh milk is out of stock again.', 'NEGATIVE'));
      complaints.push(createComplaint('C013', 'HYD-001', 6, 'STAFF_BEHAVIOR', 'Staff was unhelpful when asked about restock timeline.', 'NEGATIVE'));
      complaints.push(createComplaint('C014', 'HYD-001', 6, 'OTHER', 'Self-checkout machines were not working.', 'NEUTRAL'));
      complaints.push(createComplaint('C015', 'HYD-001', 6, 'PRICING_ISSUE', 'Discounts not applied automatically at counter.', 'NEGATIVE'));
      complaints.push(createComplaint('C016', 'HYD-001', 6, 'QUALITY_ISSUE', 'Spiced Potato Wafers pack crushed.', 'NEGATIVE'));
    }
    if (day >= 7) {
      if (!(isAuthorized && selectedStrategy === 'B')) {
        complaints.push(createComplaint('C017', 'HYD-001', 7, 'PRODUCT_UNAVAILABLE', 'Disappointed. Half of my grocery list is out of stock.', 'NEGATIVE'));
        complaints.push(createComplaint('C018', 'HYD-001', 7, 'PRODUCT_UNAVAILABLE', 'Artisanal Cheddar Cheese shelf is empty.', 'NEGATIVE'));
        complaints.push(createComplaint('C019', 'HYD-001', 7, 'PRODUCT_UNAVAILABLE', 'Still no Apple Juice in stock. What is going on?', 'NEGATIVE'));
      } else {
        // If authorized, we have restocking complaints resolved!
        complaints.push(createComplaint('C017', 'HYD-001', 7, 'OTHER', 'Checkout lines are long but moving.', 'NEUTRAL'));
      }
    }

    // 4. Workforce Attendance
    const attendance: Record<string, WorkforceAttendance> = {};
    BRANCHES.forEach(b => {
      let presentCount = b.employeeCount;
      let absentRoles: string[] = [];
      
      if (b.id === 'HYD-001' && day >= 5) {
        // 2 logistics employee absent starting Day 5
        presentCount = b.employeeCount - 2;
        absentRoles = ['Logistics Coordinator', 'Inventory Manager'];
      }
      
      attendance[b.id] = {
        branchId: b.id,
        date: `Day ${day}`,
        presentCount,
        totalCount: b.employeeCount,
        absentRoles,
      };
    });

    // 5. Daily branch stats calculation (health, revenue, sentiment)
    const branchStats: Record<string, any> = {};
    BRANCHES.forEach(b => {
      const baseline = REVENUE_BASELINES[b.id];
      let revenue = baseline;
      let inventoryHealth = 85;
      let customerSentiment = 88;
      let topSellerAvail = 100;
      let workforceAttendanceRate = (attendance[b.id].presentCount / attendance[b.id].totalCount) * 100;

      if (b.id === 'HYD-001') {
        // Daily revenue progression for Hyderabad
        if (day === 1) {
          revenue = 402300;
          inventoryHealth = 88;
          customerSentiment = 89;
          topSellerAvail = 100;
        } else if (day === 2) {
          revenue = 398700;
          inventoryHealth = 86;
          customerSentiment = 88;
          topSellerAvail = 100;
        } else if (day === 3) {
          revenue = 395000;
          inventoryHealth = 75;
          customerSentiment = 85;
          topSellerAvail = 100;
        } else if (day === 4) {
          revenue = 380000;
          inventoryHealth = 55;
          customerSentiment = 78;
          topSellerAvail = 80;
        } else if (day === 5) {
          revenue = 340000;
          inventoryHealth = 38;
          customerSentiment = 60;
          topSellerAvail = 46.7; // 7/15 top sellers available
        } else if (day === 6) {
          revenue = 310000;
          inventoryHealth = 30;
          customerSentiment = 45;
          topSellerAvail = 46.7;
        } else {
          // Day 7
          if (isAuthorized && selectedStrategy === 'B') {
            // MITIGATION EFFECT: Revenue recovers slightly, inventory health recovers
            revenue = 385000; 
            inventoryHealth = 78;
            customerSentiment = 75;
            topSellerAvail = 100; // Refilled from Vijayawada
          } else {
            revenue = 260000; // -35% decline from 400000 baseline
            inventoryHealth = 28; // around 28%
            customerSentiment = 42; // around 42%
            topSellerAvail = 46.7;
          }
        }
      } else if (b.id === 'VIJ-001') {
        // Vijayawada
        if (isAuthorized && selectedStrategy === 'B' && day >= 7) {
          // If transfer made from Vijayawada on Day 7, Vijayawada stock is slightly lower but still healthy
          inventoryHealth = 74; 
          revenue = 308000; // minor logistics redirect impact
        } else {
          inventoryHealth = 84;
          revenue = 305000 + (day % 3) * 5000;
        }
      } else {
        // Others
        inventoryHealth = 82 + (day % 2) * 3;
        revenue = baseline + (day % 4) * 4000 - 6000;
      }

      const revenueDecline = ((revenue - baseline) / baseline) * 100;
      
      // Calculate health score of branch
      let healthScore = 95;
      if (b.id === 'HYD-001') {
        if (isAuthorized && selectedStrategy === 'B' && day >= 7) {
          healthScore = 88;
        } else {
          healthScore = 95 - (day > 2 ? (day - 2) * 9 : 0);
          if (day === 7) healthScore = 52; // Hyderabad Health drops to 52%
        }
      } else {
        healthScore = 92 + (day % 2);
      }

      branchStats[b.id] = {
        healthScore,
        revenue,
        revenueDecline,
        inventoryHealth,
        customerSentiment,
        workforceAttendance: workforceAttendanceRate,
        topSellerAvailability: topSellerAvail,
        revenueExposure: b.id === 'HYD-001' && day >= 3 ? (day - 2) * 142000 : 0, // Cumulative exposure
      };
    });

    // 6. Cumulative revenue exposure for Hyderabad on Day 7: around 7.1L (₹7,10,000)
    if (day >= 7 && branchStats['HYD-001']) {
      if (!(isAuthorized && selectedStrategy === 'B')) {
        branchStats['HYD-001'].revenueExposure = 710000;
      } else {
        branchStats['HYD-001'].revenueExposure = 426000; // Reduced risk
      }
    }

    // 7. Calculate Business-Wide Health Score
    // Baseline is 95%. Drops to around 82% on Day 7
    let businessHealth = 95;
    if (day === 1) businessHealth = 95;
    else if (day === 2) businessHealth = 94;
    else if (day === 3) businessHealth = 91;
    else if (day === 4) businessHealth = 87;
    else if (day === 5) businessHealth = 85;
    else if (day === 6) businessHealth = 83;
    else {
      // Day 7
      if (isAuthorized && selectedStrategy === 'B') {
        businessHealth = 89; // Recovered
      } else {
        businessHealth = 82; // around 82%
      }
    }

    // 8. Generate Business Events up to the current day
    const events: BusinessEvent[] = [];
    const addEvent = (id: string, d: number, bId: string, type: EventType, title: string, msg: string, stream: BusinessEvent['stream'], sev: BusinessEvent['severity']) => {
      events.unshift({
        id,
        timestamp: `Day ${d}, 09:00 AM`,
        day: d,
        branchId: bId,
        type,
        title,
        message: msg,
        stream,
        severity: sev
      });
    };

    // Day 1
    addEvent('E001', 1, 'ALL', 'INFO', 'System Active', 'NERVA Business Autonomy Level 4 initialized across all branches.', 'FINANCE', 'low');
    addEvent('E002', 1, 'HYD-001', 'INFO', 'Delivery Completed', 'Supplier S002 (Krishna Agro) delivered 450 units of snacks.', 'SUPPLIER', 'low');
    
    // Day 2
    if (day >= 2) {
      addEvent('E003', 2, 'VIJ-001', 'INFO', 'Sales Volume High', 'Vijayawada Central reports record sales of multigrain cookies.', 'SALES', 'low');
    }
    
    // Day 3
    if (day >= 3) {
      addEvent(
        'E004', 3, 'HYD-001', 'SUPPLIER_DELIVERY_DELAYED', 
        'Apex Delivery Delayed', 
        'Apex Distributors (SUP-001) shipment #TRK-8812 (Dairy/Beverages replenishment) delayed by 52 hours.', 
        'SUPPLIER', 'high'
      );
    }

    // Day 4
    if (day >= 4) {
      addEvent(
        'E005', 4, 'HYD-001', 'WARNING', 
        'Stock Level Dropping', 
        'Hyderabad inventory safety margin compromised. Dairy and Beverages stock levels falling below reorder threshold (30%).', 
        'INVENTORY', 'medium'
      );
    }

    // Day 5
    if (day >= 5) {
      addEvent(
        'E006', 5, 'HYD-001', 'CRITICAL_STOCK_LEVEL', 
        'Critical Stock Levels', 
        '8 key products (including fresh milk, paneer, apple juice) in Hyderabad are critically low or out of stock.', 
        'INVENTORY', 'critical'
      );
      addEvent(
        'E007', 5, 'HYD-001', 'WORKFORCE_CAPACITY_RISK', 
        'Workforce Staff Shortage', 
        '2 inventory coordinators absent at Hyderabad warehouse. Loading operations capacity reduced by 30%.', 
        'WORKFORCE', 'medium'
      );
    }

    // Day 6
    if (day >= 6) {
      addEvent(
        'E008', 6, 'HYD-001', 'COMPLAINT_SPIKE', 
        'Customer Complaints Spike', 
        'Hyderabad customer complaints spiked by 180%. 48% of issues cite PRODUCT_UNAVAILABLE. Sentiment score at 45%.', 
        'CUSTOMER', 'high'
      );
    }

    // Day 7
    if (day >= 7) {
      if (isAuthorized && selectedStrategy === 'B') {
        addEvent(
          'E009_ACT', 7, 'HYD-001', 'INFO', 
          'AI Stock Re-routing Authorized', 
          'AI Execution Agent completed transfer of 600 units of Beverages and Dairy products from Vijayawada Central.', 
          'INVENTORY', 'low'
        );
        addEvent(
          'E010_ACT', 7, 'HYD-001', 'INFO', 
          'Operational Recovery', 
          'Hyderabad stock levels replenished to 78%. Customer sentiment recovering.', 
          'SALES', 'low'
        );
      } else {
        addEvent(
          'E009', 7, 'HYD-001', 'REVENUE_DROP', 
          'Revenue Decline Triggered', 
          'Hyderabad daily revenue declined by 35% (₹2,60,000 vs baseline of ₹4,00,000). Revenue risk estimated at ₹7.1L.', 
          'FINANCE', 'critical'
        );
      }
    }

    // 9. Incident NRV-2041 status
    let incidentStatus: Incident['status'] = 'DETECTED';
    if (day >= 3 && day < 5) incidentStatus = 'INVESTIGATING';
    else if (day >= 5 && day < 7) incidentStatus = 'MITIGATING';
    else if (day >= 7) {
      incidentStatus = isAuthorized ? 'RESOLVED' : 'MITIGATING';
    }

    const incident: Incident = {
      id: 'INC-2041',
      title: 'Hyderabad Branch Revenue Decline',
      code: 'NRV-2041',
      status: incidentStatus,
      severity: 'critical',
      revenueAtRisk: isAuthorized ? 426000 : 710000, // around 7.1L
      impactDecline: 35, // 35% revenue decline
      aiConfidence: 91, // 91% AI confidence
      detectedAt: 'Day 3, 09:12 AM',
      description: 'Systemic supply chain breakdown starting from primary supplier delivery delay, culminating in empty shelves of top-selling products and a subsequent drop in footfall, complaints surge, and revenue loss at the Hyderabad branch.',
      rootCause: [
        'Supplier delivery delay (Apex Distributors delayed 52 hrs)',
        'Replenishment stock not received at Madhapur warehouse',
        'Inventory escalation policy failed due to staff shortage (2 absent)',
        '8 out of 15 top-selling beverages & dairy products stockout',
        'Customer complaints spike (48% PRODUCT_UNAVAILABLE)',
        'Hyderabad Branch revenue drops 35% on Day 7'
      ],
      affectedBranches: ['HYD-001']
    };

    return {
      day,
      isAuthorized,
      selectedStrategy,
      businessHealth,
      branches: branchStats,
      inventory,
      suppliers: suppliersReliability,
      complaints: complaints.filter(c => {
        const cDay = parseInt(c.date.replace('Day ', ''));
        return cDay <= day;
      }),
      attendance,
      events: events.filter(e => e.day <= day),
      incident,
    };
  }
}
