import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  ShieldAlert, Filter, Calendar, Search, AlertCircle, 
  CheckCircle2, ArrowRight 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import IncidentCard from '../components/IncidentCard';

interface DemoIncident {
  id: string;
  title: string;
  code: string;
  status: 'DETECTED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVING' | 'RESOLVED' | 'STRATEGY_RECOMMENDED' | 'AWAITING_POLICY_CHECK';
  severity: 'low' | 'medium' | 'high' | 'critical';
  revenueAtRisk: number;
  impactDecline: number;
  detectedAt: string;
  description: string;
  stream: string;
  branch: string;
}

export const Incidents: React.FC = () => {
  const { dayData, activeIncident, investigationState } = useSimulation();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Static list of demo incidents
  const demoIncidents: DemoIncident[] = [];

  if (activeIncident) {
    demoIncidents.push({
      id: activeIncident.id,
      title: activeIncident.title,
      code: activeIncident.code,
      status: activeIncident.status,
      severity: activeIncident.severity,
      revenueAtRisk: activeIncident.estimatedExposure,
      impactDecline: activeIncident.impactDecline,
      detectedAt: activeIncident.detectedAt,
      description: activeIncident.description,
      stream: 'FINANCE',
      branch: 'HYD-001'
    });
  }

  // Push other demo incidents
  demoIncidents.push(
    {
      id: 'INC-1988',
      title: 'Guntur Logistics Truck Breakdown',
      code: 'NRV-1988',
      status: 'RESOLVED',
      severity: 'medium',
      revenueAtRisk: 12000,
      impactDecline: 2,
      detectedAt: 'Day 1, 04:30 AM',
      description: 'Logistics transport truck carrying household cleaning products encountered a mechanical failure on Route 9. Auto-routing dispatch triggered replacement transit within 3 hours.',
      stream: 'SUPPLIER',
      branch: 'GNT-001'
    },
    {
      id: 'INC-2012',
      title: 'Vijayawada Multi-Counter Peak Delay',
      code: 'NRV-2012',
      status: 'RESOLVED',
      severity: 'low',
      revenueAtRisk: 8500,
      impactDecline: 1,
      detectedAt: 'Day 2, 06:15 PM',
      description: 'Point-of-Sale database synchronization latency caused customer queues to exceed 8-person safety thresholds. AI routing agent adjusted thread pooling to resolve transaction backlog.',
      stream: 'SALES',
      branch: 'VIJ-001'
    },
    {
      id: 'INC-2042',
      title: 'Vijayawada Excess Stock Capacity Warning',
      code: 'NRV-2042',
      status: 'INVESTIGATING',
      severity: 'medium',
      revenueAtRisk: 34000,
      impactDecline: 0,
      detectedAt: 'Day 4, 11:22 AM',
      description: 'Vijayawada warehouse space allocation exceeded threshold due to high supplier arrivals. Auto-escalation is modeling stock re-routing to neighbor branches.',
      stream: 'INVENTORY',
      branch: 'VIJ-001'
    },
    {
      id: 'INC-2043',
      title: 'Warangal Workforce Capacity Shortage',
      code: 'NRV-2043',
      status: 'RESOLVED',
      severity: 'low',
      revenueAtRisk: 4200,
      impactDecline: 1,
      detectedAt: 'Day 5, 08:00 AM',
      description: 'Routine attendance check flagged a 15% workforce shortage in Warangal floor staff. Reallocated part-time shifts dynamically to balance billing desk operations.',
      stream: 'WORKFORCE',
      branch: 'WAR-001'
    }
  );

  // Active means anything that is not RESOLVED
  const getFilteredIncidents = () => {
    // Only show incidents that are already "detected" based on the current day
    const visibleIncidents = demoIncidents.filter(inc => {
      const detectedDay = parseInt(inc.detectedAt.replace('Day ', ''));
      return detectedDay <= dayData.day;
    });

    return visibleIncidents.filter(inc => {
      const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'ALL') return true;
      if (filter === 'CRITICAL') return inc.severity === 'critical';
      if (filter === 'ACTIVE') return inc.status !== 'RESOLVED';
      if (filter === 'RESOLVED') return inc.status === 'RESOLVED';
      return true;
    });
  };

  const filteredList = getFilteredIncidents();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="Crisis Incidents Log" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-900/60 backdrop-blur-md">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search incidents by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 text-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-500 mr-2 hidden sm:block" />
            {(['ALL', 'CRITICAL', 'ACTIVE', 'RESOLVED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border cursor-pointer ${
                  filter === tab
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/10'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-850 text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Grid */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
            Displaying {filteredList.length} incident records
          </div>

          {filteredList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredList.map(inc => (
                <IncidentCard
                  key={inc.id}
                  id={inc.id}
                  title={inc.title}
                  code={inc.code}
                  status={inc.status}
                  severity={inc.severity}
                  revenueAtRisk={inc.revenueAtRisk}
                  impactDecline={inc.impactDecline}
                  detectedAt={inc.detectedAt}
                  description={inc.description}
                  showButton={inc.code === 'NRV-2041'}
                  investigationStatus={inc.code === 'NRV-2041' ? investigationState.status : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/20 border border-slate-900 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-slate-500" />
              <h4 className="font-bold text-white text-sm">No Matching Records</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                No incidents were found matching the selected search query and category filters.
              </p>
            </div>
          )}
        </div>
        
        {/* Architecture Integration Hint Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/20 text-[10px] text-slate-500 leading-normal space-y-1">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Incident Log Integration Blueprint
          </p>
          <p>
            {/* TODO: Connect database queries to fetch dynamic incidents list in backend/routes/incidents.js */}
            TODO: Query relational database schemas to fetch live incident entries. Setup Webhooks to auto-create incidents from external supply chain management and sales tracking web servers.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Incidents;
