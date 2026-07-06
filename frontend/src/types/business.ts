export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  employeeCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'Beverages' | 'Dairy' | 'Snacks' | 'Personal Care' | 'Household' | 'Packaged Foods';
  price: number;
  cost: number;
  isTopSeller: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  categoryServed: string;
  reliability: number; // 0 - 100
}

export interface SalesRecord {
  date: string;
  branchId: string;
  productId: string;
  unitsSold: number;
  revenue: number;
}

export interface InventoryRecord {
  branchId: string;
  productId: string;
  stockLevel: number;
  reorderPoint: number;
  capacity: number;
}

export interface SupplierDelivery {
  id: string;
  supplierId: string;
  branchId: string;
  scheduledDate: string;
  actualDate: string | null;
  delayHours: number;
  status: 'PENDING' | 'DELIVERED' | 'DELAYED';
  unitsScheduled: number;
  productCategory: string;
}

export interface CustomerComplaint {
  id: string;
  branchId: string;
  date: string;
  category: 'PRODUCT_UNAVAILABLE' | 'PRICING_ISSUE' | 'STAFF_BEHAVIOR' | 'QUALITY_ISSUE' | 'OTHER';
  description: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface WorkforceAttendance {
  branchId: string;
  date: string;
  presentCount: number;
  totalCount: number;
  absentRoles: string[];
}

export type EventType = 
  | 'INFO' 
  | 'WARNING' 
  | 'CRITICAL' 
  | 'SUPPLIER_DELIVERY_DELAYED' 
  | 'CRITICAL_STOCK_LEVEL' 
  | 'PRODUCT_OUT_OF_STOCK' 
  | 'WORKFORCE_CAPACITY_RISK'
  | 'COMPLAINT_SPIKE'
  | 'REVENUE_DROP';

export interface BusinessEvent {
  id: string;
  timestamp: string;
  day: number;
  branchId: string;
  type: EventType;
  title: string;
  message: string;
  stream: 'SALES' | 'INVENTORY' | 'CUSTOMER' | 'SUPPLIER' | 'WORKFORCE' | 'FINANCE';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Incident {
  id: string;
  title: string;
  code: string;
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVING' | 'RESOLVED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  revenueAtRisk: number;
  impactDecline: number;
  aiConfidence: number;
  detectedAt: string;
  description: string;
  rootCause: string[];
  affectedBranches: string[];
}

export interface SignalStream {
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  healthScore: number;
  eventsProcessed: number;
  anomaliesOrWarnings: number;
  lastUpdated: string;
}
