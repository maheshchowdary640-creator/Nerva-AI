import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, ShieldAlert, Cpu, Network, Settings2, BarChart3, HelpCircle 
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const Sidebar: React.FC = () => {
  const { currentDay, aiStatus } = useSimulation();

  const links = [
    { to: '/', label: 'Command Center', icon: Activity },
    { to: '/war-room', label: 'AI War Room', icon: Cpu, badge: 'Active' },
    { to: '/incidents', label: 'Incidents', icon: ShieldAlert, count: 3 },
    { to: '/signals', label: 'Business Signals', icon: BarChart3 },
    { to: '/policy', label: 'Policy & Autonomy', icon: Settings2 },
    { to: '/how-it-thinks', label: 'How NERVA Thinks', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-900 flex flex-col h-screen sticky top-0 backdrop-blur-xl z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900/60 flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 relative overflow-hidden group">
          <Network className="h-5 w-5 text-white animate-pulse-slow relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-indigo-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wider leading-none text-base">
            NERVA AI
          </h1>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-1">
            System Autonomy
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-950/40 to-indigo-950/20 text-violet-400 border border-violet-500/20 shadow-md shadow-violet-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/20 border border-violet-500/30 text-violet-400 rounded-md animate-pulse">
                  {link.badge}
                </span>
              )}
              {link.count !== undefined && !link.badge && (
                <span className="h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                  {link.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-900/60 bg-slate-950/20">
        <div className="rounded-2xl bg-slate-900/50 border border-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              NERVA CORE
            </span>
            <span className="text-[9px] font-bold text-emerald-400 animate-pulse">ONLINE</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              EXPLANATION LAYER
            </span>
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
              aiStatus === 'AVAILABLE' 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                : 'bg-slate-950/50 border-slate-850 text-slate-500'
            }`}>
              {aiStatus === 'AVAILABLE' ? 'GEMINI ONLINE' : 'NOT CONFIGURED'}
            </span>
          </div>

          <div className="border-t border-slate-900/60 pt-2 space-y-2">
            <div>
              <div className="text-xs font-semibold text-slate-350">Level 4 Autonomy</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Controlled Autonomy</div>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: '80%' }} />
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-500">
              <span>System Clock</span>
              <span className="font-semibold text-slate-400">Day {currentDay} of 7</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
