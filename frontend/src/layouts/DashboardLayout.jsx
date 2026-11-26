import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import DemoDisclaimerBanner from '../components/DemoDisclaimerBanner';

const PAGE_TITLES = {
  '/dashboard': 'Executive Overview',
  '/historical': 'Historical Demand Analysis',
  '/forecast': 'Generate Energy Forecast',
  '/comparison': 'Forecast vs Actual Evaluation',
  '/performance': 'Model Performance & Benchmarking',
  '/anomalies': 'Demand Anomaly Detection',
  '/model-info': 'Model & System Architecture',
  '/about': 'About Project & Methodology',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content shifted left margin on desktop for fixed sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <DemoDisclaimerBanner />
          <Outlet />
        </main>

        <footer className="border-t border-[#24262d] py-4 px-6 text-center text-xs text-zinc-500 font-mono">
          <span>Energy Demand Forecasting Tool • Semester OJT Demonstration • OPSD Germany Grid Dataset (2015–2020)</span>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
