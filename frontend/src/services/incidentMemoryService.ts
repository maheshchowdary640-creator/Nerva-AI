import { IncidentMemoryRecord } from '../types/execution';
import { SentinelIncident } from '../types/sentinel';

// Pre-seeded historical incidents to verify similarity retrieval
const SEEDED_HISTORICAL_MEMORIES: IncidentMemoryRecord[] = [
  {
    id: 'MEM-2024-01',
    incidentId: 'INC-1082',
    incidentType: 'SUPPLIER_DELAY_INVENTORY',
    affectedSignalDomains: ['INVENTORY', 'FINANCE'],
    branchId: 'VIJ-001',
    rootCauseSignature: 'apex-logistics-strike-delay',
    evidenceSignature: 'stockout-recurrent-availability-drop',
    strategyType: 'INTER_BRANCH_TRANSFER',
    strategyFeatures: ['surplus-routing', 'low-risk', 'direct-transport'],
    executionOutcome: 'SUCCESSFUL_MITIGATION',
    recoveryMetrics: {
      inventoryHealth: 92,
      topSellerAvailability: 100,
      customerSentiment: 78,
      revenueDecline: 4,
      operationalRiskScore: 12,
      revenueExposure: 0
    },
    predictionAccuracy: 96,
    createdAt: '2024-11-12T14:30:00Z'
  },
  {
    id: 'MEM-2025-03',
    incidentId: 'INC-1840',
    incidentType: 'VENDOR_EQUIPMENT_FAILURE',
    affectedSignalDomains: ['INVENTORY', 'CUSTOMER'],
    branchId: 'WAR-001',
    rootCauseSignature: 'cooling-system-breakdown',
    evidenceSignature: 'dairy-stockout-complaints-spike',
    strategyType: 'EMERGENCY_PROCUREMENT',
    strategyFeatures: ['spot-buy', 'premium-markup', 'rush-courier'],
    executionOutcome: 'SUCCESSFUL_MITIGATION',
    recoveryMetrics: {
      inventoryHealth: 88,
      topSellerAvailability: 100,
      customerSentiment: 72,
      revenueDecline: 8,
      operationalRiskScore: 25,
      revenueExposure: 0
    },
    predictionAccuracy: 91,
    createdAt: '2025-03-24T09:15:00Z'
  }
];

let memoryStorageFallback: IncidentMemoryRecord[] = [...SEEDED_HISTORICAL_MEMORIES];

export const incidentMemoryService = {
  getIncidentMemories(): IncidentMemoryRecord[] {
    if (typeof localStorage === 'undefined') {
      return memoryStorageFallback;
    }
    const saved = localStorage.getItem('nerva_incident_memories');
    if (!saved) {
      localStorage.setItem('nerva_incident_memories', JSON.stringify(SEEDED_HISTORICAL_MEMORIES));
      return SEEDED_HISTORICAL_MEMORIES;
    }
    return JSON.parse(saved);
  },

  createMemoryFromResolvedIncident(
    incident: SentinelIncident,
    executionPlanId: string,
    accuracy: number,
    finalMetrics: any
  ): IncidentMemoryRecord {
    const memories = this.getIncidentMemories();
    
    const newRecord: IncidentMemoryRecord = {
      id: `MEM-${Date.now()}`,
      incidentId: incident.id,
      incidentType: 'SUPPLIER_DELAY_INVENTORY', // Derived classification
      affectedSignalDomains: ['INVENTORY', 'FINANCE', 'CUSTOMER'],
      branchId: incident.affectedBranches[0] || 'HYD-001',
      rootCauseSignature: 'apex-distributors-delay-escalation-failure',
      evidenceSignature: 'hyd-dairy-beverages-stockout',
      strategyType: 'INTER_BRANCH_TRANSFER',
      strategyFeatures: ['vij-surplus-routing', 'safety-margin-audit'],
      executionOutcome: 'SUCCESSFUL_MITIGATION',
      recoveryMetrics: finalMetrics,
      predictionAccuracy: accuracy,
      createdAt: new Date().toISOString()
    };

    memories.push(newRecord);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nerva_incident_memories', JSON.stringify(memories));
    } else {
      memoryStorageFallback = memories;
    }
    return newRecord;
  },

  findSimilarIncidents(activeIncident: SentinelIncident): (IncidentMemoryRecord & { similarityScore: number })[] {
    const memories = this.getIncidentMemories();
    
    // TODO: Integrate semantic vector embeddings database here.
    // Boundary: Retrieve vector vectors from Pinecone/Milvus database and compute Cosine similarity
    // e.g. similarity = cosineSimilarity(embedding(activeIncident), embedding(historicalRecord))

    const scored = memories.map(mem => {
      let score = 0;

      // 1. Check Incident Type classification match (weight: 35%)
      if (mem.incidentType === 'SUPPLIER_DELAY_INVENTORY') {
        score += 35;
      } else if (mem.incidentType === 'VENDOR_EQUIPMENT_FAILURE') {
        score += 15;
      }

      // 2. Check Signal Stream domains match (weight: 25%)
      const overlapDomains = mem.affectedSignalDomains.filter(d => 
        ['INVENTORY', 'FINANCE', 'CUSTOMER'].includes(d)
      );
      score += overlapDomains.length * 8; // e.g. 3 domains = 24%

      // 3. Check Strategy Type match (weight: 20%)
      if (mem.strategyType === 'INTER_BRANCH_TRANSFER') {
        score += 20;
      } else if (mem.strategyType === 'EMERGENCY_PROCUREMENT') {
        score += 10;
      }

      // 4. Anomaly signature overlap (weight: 20%)
      const activeBranch = activeIncident.affectedBranches[0] || 'HYD-001';
      if (mem.branchId === activeBranch) {
        score += 15;
      } else {
        score += 5;
      }

      // Cap similarity rating between 0 and 100
      const finalScore = Math.min(100, Math.max(0, score));

      return {
        ...mem,
        similarityScore: finalScore
      };
    });

    // Rank from highest similarity score down
    return scored.sort((a, b) => b.similarityScore - a.similarityScore);
  },

  clearDemoIncidentMemories(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nerva_incident_memories', JSON.stringify(SEEDED_HISTORICAL_MEMORIES));
    } else {
      memoryStorageFallback = [...SEEDED_HISTORICAL_MEMORIES];
    }
  }
};
export default incidentMemoryService;
