import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import WarRoom from './pages/WarRoom';
import Incidents from './pages/Incidents';
import BusinessSignals from './pages/BusinessSignals';
import PolicyAutonomy from './pages/PolicyAutonomy';
import HowItThinks from './pages/HowItThinks';

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-slate-950 font-sans overflow-hidden text-slate-100">
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Main Panel Viewport */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Routes>
              <Route path="/" element={<CommandCenter />} />
              <Route path="/war-room" element={<WarRoom />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/signals" element={<BusinessSignals />} />
              <Route path="/policy" element={<PolicyAutonomy />} />
              <Route path="/how-it-thinks" element={<HowItThinks />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SimulationProvider>
  );
};

export default App;
