import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  TrendingUp,
  GitCompare,
  BarChart3,
  AlertTriangle,
  Cpu,
  Info,
  LogOut,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Historical Demand', path: '/historical', icon: History },
  { name: 'Generate Forecast', path: '/forecast', icon: TrendingUp },
  { name: 'Forecast vs Actual', path: '/comparison', icon: GitCompare },
  { name: 'Model Performance', path: '/performance', icon: BarChart3 },
  { name: 'Anomaly Alerts', path: '/anomalies', icon: AlertTriangle },
  { name: 'Model Information', path: '/model-info', icon: Cpu },
  { name: 'About Project', path: '/about', icon: Info },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0e0f12] border-r border-[#24262d] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#24262d]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold shadow-sm">
                <Activity className="w-5 h-5 text-zinc-950" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                  EnergyForecaster
                </h1>
                <span className="text-[10px] text-zinc-400 font-mono tracking-wider block">
                  OPSD GERMANY
                </span>
              </div>
            </div>
            <span className="bg-zinc-800 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700">
              v2.1
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-[#24262d] space-y-3">
          {/* OPSD Data Badge */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-mono font-semibold text-zinc-200 tracking-wider">
                OPSD ACTUAL DATA
              </div>
              <div className="text-[10px] text-zinc-400 truncate font-mono">
                GERMANY (2015–2020)
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-zinc-200 shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-200 truncate">
                  {user?.name || 'Demo Analyst'}
                </div>
                <div className="text-[10px] text-zinc-400 truncate font-mono">
                  {user?.email || 'demo@example.com'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
