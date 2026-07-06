import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { metricsService } from '../services/metricsService';
import { 
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, 
  HelpCircle, ShieldCheck, MapPin, Package, Star 
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export const BusinessSignals: React.FC = () => {
  const { dayData, currentDay } = useSimulation();
  const [activeTab, setActiveTab] = useState<'REVENUE' | 'INVENTORY' | 'COMPLAINTS'>('REVENUE');

  // Compute metrics for branch listings
  const hydRevenue = metricsService.getDailyBranchRevenue(dayData, 'HYD-001');
  const vijRevenue = metricsService.getDailyBranchRevenue(dayData, 'VIJ-001');
  const warRevenue = metricsService.getDailyBranchRevenue(dayData, 'WAR-001');
  const gntRevenue = metricsService.getDailyBranchRevenue(dayData, 'GNT-001');

  const hydBaseline = metricsService.getRevenueBaseline('HYD-001');
  const hydDev = metricsService.getRevenueDeviationPercentage(dayData, 'HYD-001');
  
  const hydInvHealth = metricsService.getInventoryHealthScore(dayData, 'HYD-001');
  const vijInvHealth = metricsService.getInventoryHealthScore(dayData, 'VIJ-001');

  // Draw deterministic custom SVG curves representing Day 1 to 7 progress
  // Hyderabad Revenue Curve (day-by-day)
  // Day 1: 402k, Day 2: 398k, Day 3: 395k, Day 4: 380k, Day 5: 340k, Day 6: 310k, Day 7: 260k (or 385k if authorized)
  const hydRevenuePoints = dayData.isAuthorized 
    ? [402, 398, 395, 380, 340, 310, 385]
    : [402, 398, 395, 380, 340, 310, 260];

  // Scale data points to fit SVG viewbox of 140x50
  // X: 0 = Day 1, 23.3 = Day 2, 46.6 = Day 3, 70 = Day 4, 93.3 = Day 5, 116.6 = Day 6, 140 = Day 7
  // Y: Max 450 (mapped to 5), Min 200 (mapped to 45)
  const mapRevenueToY = (val: number) => {
    const minVal = 200;
    const maxVal = 450;
    const height = 40;
    return height - ((val - minVal) / (maxVal - minVal)) * height + 5;
  };

  const currentDayLimit = dayData.day; // Limit graph line to current simulation day
  
  const getLinePath = (points: number[]) => {
    let path = '';
    for (let i = 0; i < currentDayLimit; i++) {
      const x = i * 23.3;
      const y = mapRevenueToY(points[i]);
      if (i === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    }
    return path;
  };

  const getAreaPath = (points: number[]) => {
    const linePath = getLinePath(points);
    if (!linePath) return '';
    const lastX = (currentDayLimit - 1) * 23.3;
    return `${linePath} L ${lastX} 45 L 0 45 Z`;
  };

  // Apex Distributors reliability curve: Day 1-2: 95%, Day 3: 82%, Day 4: 68%, Day 5: 52%, Day 6: 44%, Day 7: 38%
  const apexReliabilityPoints = [95, 95, 82, 68, 52, 44, 38];
  const mapReliabilityToY = (val: number) => {
    return 45 - (val / 100) * 35;
  };

  const getReliabilityPath = () => {
    let path = '';
    for (let i = 0; i < currentDayLimit; i++) {
      const x = i * 23.3;
      const y = mapReliabilityToY(apexReliabilityPoints[i]);
      if (i === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    }
    return path;
  };

  // Complaint Categories
  const categoryDist = metricsService.getComplaintCategoryDistribution(dayData, 'HYD-001');

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 min-h-screen">
      {/* Background radial glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] glow-spot-1 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full blur-[180px] glow-spot-2 pointer-events-none" />

      <PageHeader title="Business Signals Analysis" />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Signal Tab Selector */}
        <div className="flex space-x-2 border-b border-slate-900 pb-1">
          {(['REVENUE', 'INVENTORY', 'COMPLAINTS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeTab === tab
                  ? 'border-violet-500 text-violet-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} Signals
            </button>
          ))}
        </div>

        {/* REVENUE Tab Content */}
        {activeTab === 'REVENUE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Trend chart */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Hyderabad Central Daily Revenue Trend (Day 1 - {currentDay})
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                    Projections vs baseline threshold (₹4,00,000)
                  </span>
                </div>
                {hydDev !== 0 && (
                  <span className={`flex items-center space-x-1 text-xs font-bold ${
                    hydDev >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {hydDev >= 0 ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
                    <span>{hydDev.toFixed(1)}%</span>
                  </span>
                )}
              </div>

              {/* SVG Line Graph */}
              <div className="h-64 w-full bg-slate-950/40 rounded-2xl border border-slate-900/60 p-4 relative flex flex-col justify-between">
                {/* Horizontal Baseline markers */}
                <div className="absolute left-0 right-0 top-1/5 border-t border-slate-900 border-dashed pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/5 border-t border-slate-900 border-dashed pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/5 border-t border-slate-900 border-dashed pointer-events-none" />
                <div className="absolute left-0 right-0 top-4/5 border-t border-slate-900 border-dashed pointer-events-none" />

                {/* SVG Drawing */}
                <svg viewBox="0 0 140 50" className="w-full h-full overflow-visible relative z-10">
                  {/* Baseline Threshold Line (₹400,000) */}
                  <line 
                    x1="0" y1={mapRevenueToY(400)} x2="140" y2={mapRevenueToY(400)} 
                    stroke="#475569" strokeWidth="0.75" strokeDasharray="2,2" 
                  />
                  
                  {/* Area fill */}
                  <path 
                    d={getAreaPath(hydRevenuePoints)} 
                    fill="url(#grad-rev)" 
                    stroke="none" 
                  />
                  
                  {/* Line path */}
                  <path 
                    d={getLinePath(hydRevenuePoints)} 
                    fill="none" 
                    stroke={hydDev >= 0 ? '#10b981' : '#f43f5e'} 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />

                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={hydDev >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={hydDev >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Dynamic point highlight */}
                  {currentDayLimit > 0 && (
                    <circle 
                      cx={(currentDayLimit - 1) * 23.3} 
                      cy={mapRevenueToY(hydRevenuePoints[currentDayLimit - 1])} 
                      r="2" 
                      fill={hydDev >= 0 ? '#10b981' : '#f43f5e'} 
                      stroke="white" 
                      strokeWidth="0.5" 
                    />
                  )}
                </svg>

                {/* Timeline X axis labels */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold px-1 select-none pt-2">
                  <span>Day 1</span>
                  <span>Day 2</span>
                  <span>Day 3</span>
                  <span>Day 4</span>
                  <span>Day 5</span>
                  <span>Day 6</span>
                  <span>Day 7</span>
                </div>
              </div>
            </div>

            {/* Branch Performance table */}
            <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Branch Performance Standings
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Daily net profit vs operational baseline
                </span>
              </div>

              <div className="space-y-3.5 mt-5">
                {[
                  { id: 'HYD-001', name: 'Hyderabad Central', rev: hydRevenue, dev: hydDev, health: metricsService.getInventoryHealthScore(dayData, 'HYD-001'), iconColor: 'text-violet-500' },
                  { id: 'VIJ-001', name: 'Vijayawada Central', rev: vijRevenue, dev: ((vijRevenue - 310000) / 310000) * 100, health: metricsService.getInventoryHealthScore(dayData, 'VIJ-001'), iconColor: 'text-indigo-400' },
                  { id: 'WAR-001', name: 'Warangal Central', rev: warRevenue, dev: ((warRevenue - 240000) / 240000) * 100, health: metricsService.getInventoryHealthScore(dayData, 'WAR-001'), iconColor: 'text-slate-400' },
                  { id: 'GNT-001', name: 'Guntur Central', rev: gntRevenue, dev: ((gntRevenue - 220000) / 220000) * 100, health: metricsService.getInventoryHealthScore(dayData, 'GNT-001'), iconColor: 'text-slate-400' },
                ].map(branch => (
                  <div key={branch.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className={`h-4.5 w-4.5 ${branch.iconColor}`} />
                      <div>
                        <h5 className="font-bold text-white text-xs leading-none">{branch.name}</h5>
                        <span className="text-[9px] text-slate-500 font-bold block mt-1.5 leading-none">{branch.id}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-200">₹{(branch.rev / 100000).toFixed(2)}L</div>
                      <div className={`text-[10px] font-bold mt-1.5 ${
                        branch.dev >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {branch.dev >= 0 ? '+' : ''}{branch.dev.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY Tab Content */}
        {activeTab === 'INVENTORY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Inventory depletion chart */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Hyderabad Top-Selling Shelf Depletion
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Stock levels of dairy & beverages supplied by Apex S1
                </span>
              </div>

              {/* Custom SVG Bar Chart comparing stock levels of top sellers */}
              <div className="h-64 bg-slate-950/40 rounded-2xl border border-slate-900/60 p-5 flex flex-col justify-between">
                <div className="grid grid-cols-8 gap-3 h-48 items-end relative">
                  {/* Reorder Safety line representation */}
                  <div className="absolute left-0 right-0 bottom-1/4 border-t border-slate-900 border-dashed pointer-events-none" />
                  <span className="absolute left-1 bottom-[27%] text-[7px] text-slate-600 font-bold tracking-widest uppercase">Safety Margin</span>

                  {[
                    { id: 'P001', label: 'Apple Juice', stock: dayData.inventory['HYD-001']?.['P001'] ?? 0, cap: 140 },
                    { id: 'P003', label: 'Chai Blend', stock: dayData.inventory['HYD-001']?.['P003'] ?? 0, cap: 120 },
                    { id: 'P005', label: 'Cold Brew', stock: dayData.inventory['HYD-001']?.['P005'] ?? 0, cap: 120 },
                    { id: 'P007', label: 'Cow Milk', stock: dayData.inventory['HYD-001']?.['P007'] ?? 0, cap: 160 },
                    { id: 'P008', label: 'Butter Prem', stock: dayData.inventory['HYD-001']?.['P008'] ?? 0, cap: 140 },
                    { id: 'P010', label: 'Cheese Art', stock: dayData.inventory['HYD-001']?.['P010'] ?? 0, cap: 110 },
                    { id: 'P011', label: 'Paneer 200g', stock: dayData.inventory['HYD-001']?.['P011'] ?? 0, cap: 130 },
                    { id: 'P026', label: 'Citrus Det.', stock: dayData.inventory['HYD-001']?.['P026'] ?? 0, cap: 150 },
                  ].map(item => {
                    const fillPct = (item.stock / item.cap) * 100;
                    return (
                      <div key={item.id} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-[8px] text-slate-400 font-bold group-hover:text-white mb-1.5 transition-colors">
                          {item.stock}
                        </div>
                        <div className="w-full bg-slate-900 rounded-lg h-36 relative overflow-hidden flex items-end">
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              item.stock <= 5 
                                ? 'bg-gradient-to-t from-rose-600 to-rose-400 animate-pulse' 
                                : 'bg-gradient-to-t from-violet-600 to-indigo-500'
                            }`}
                            style={{ height: `${Math.max(item.stock === 0 ? 0 : 5, fillPct)}%` }}
                          />
                        </div>
                        <span className="text-[8px] text-slate-500 font-bold mt-2 truncate w-full text-center group-hover:text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Affected Supplier Reliability details */}
            <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Supplier Reliability Metrics
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Apex S1 delivery delay & reliability tracker
                </span>
              </div>

              {/* SVG Reliability trend */}
              <div className="h-32 bg-slate-950/40 rounded-xl border border-slate-900 p-3 flex flex-col justify-between mt-4">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold">Apex S1 Reliability Curve</span>
                  <span className="text-rose-400 font-extrabold">{metricsService.getSupplierReliability(dayData, 'SUP-001')}%</span>
                </div>
                
                <svg viewBox="0 0 140 50" className="w-full h-16 overflow-visible">
                  <path 
                    d={getReliabilityPath()} 
                    fill="none" 
                    stroke="#f43f5e" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                  />
                  {currentDayLimit > 0 && (
                    <circle 
                      cx={(currentDayLimit - 1) * 23.3} 
                      cy={mapReliabilityToY(apexReliabilityPoints[currentDayLimit - 1])} 
                      r="1.5" 
                      fill="#f43f5e" 
                      stroke="white" 
                      strokeWidth="0.5" 
                    />
                  )}
                </svg>

                <div className="flex justify-between items-center text-[7px] text-slate-600 font-bold px-1 select-none">
                  <span>Day 1</span>
                  <span>Day 7</span>
                </div>
              </div>

              {/* Restocking information */}
              <div className="space-y-2.5 mt-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Apex Delivery Status:</span>
                  <strong className={dayData.day >= 3 ? 'text-rose-400' : 'text-emerald-400'}>
                    {dayData.day >= 3 ? '52h Delayed (Critical)' : 'On Schedule'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Vijayawada Excess Stock:</span>
                  <strong className="text-white">820 units available</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS Tab Content */}
        {activeTab === 'COMPLAINTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Complaints breakdown */}
            <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-900 space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Customer Complaint Categories (Day 6 - 7 crisis)
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Breakdown highlights that ~48% are PRODUCT_UNAVAILABLE issues
                </span>
              </div>

              <div className="h-64 bg-slate-950/40 rounded-2xl border border-slate-900/60 p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {[
                    { label: 'Product Unavailable', count: categoryDist.PRODUCT_UNAVAILABLE, pct: dayData.day >= 6 ? 48 : 0, color: 'bg-rose-500' },
                    { label: 'Quality Issue', count: categoryDist.QUALITY_ISSUE, pct: dayData.day >= 6 ? 24 : 60, color: 'bg-amber-500' },
                    { label: 'Pricing Issue', count: categoryDist.PRICING_ISSUE, pct: dayData.day >= 6 ? 16 : 20, color: 'bg-indigo-500' },
                    { label: 'Staff Behavior', count: categoryDist.STAFF_BEHAVIOR, pct: dayData.day >= 6 ? 8 : 10, color: 'bg-slate-700' },
                    { label: 'Other Reports', count: categoryDist.OTHER, pct: dayData.day >= 6 ? 4 : 10, color: 'bg-slate-800' }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-300">{cat.label} ({cat.count} cases)</span>
                        <span className="text-slate-400">{cat.pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className={`h-full ${cat.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${cat.pct}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Sentiment summary */}
            <div className="glass-card rounded-3xl p-6 border border-slate-900 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Customer Sentiment Analysis
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  Real-time sentiment score for Hyderabad Central
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-900 space-y-4 mt-5 flex-1 flex flex-col justify-center">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Customer Sentiment Score</span>
                  <span className={`text-5xl font-black tracking-tight ${
                    dayData.branches['HYD-001']?.customerSentiment >= 80 
                      ? 'text-emerald-400' 
                      : (dayData.branches['HYD-001']?.customerSentiment >= 60 ? 'text-amber-400' : 'text-rose-400 text-glow')
                  }`}>
                    {dayData.branches['HYD-001']?.customerSentiment}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      dayData.branches['HYD-001']?.customerSentiment >= 80 
                        ? 'bg-emerald-500' 
                        : (dayData.branches['HYD-001']?.customerSentiment >= 60 ? 'bg-amber-500' : 'bg-rose-500')
                    }`}
                    style={{ width: `${dayData.branches['HYD-001']?.customerSentiment}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  * Score drops from 89% normal to 42% on Day 7 due to stockouts of top-selling items.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Architecture Integration Hint Block */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/20 to-indigo-950/20 border border-violet-900/20 text-[10px] text-slate-500 leading-normal space-y-1">
          <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Signals Telemetry Integration Blueprint
          </p>
          <p>
            {/* TODO: Integrate Recharts or D3 dashboard widgets linked to backend/controllers/analyticsController.js */}
            TODO: Link charts directly to standard timeseries databases (e.g., InfluxDB, Prometheus). Integrate REST APIs to poll hourly data points dynamically rather than day-level mock indices.
          </p>
        </div>
      </div>
    </div>
  );
};
export default BusinessSignals;
