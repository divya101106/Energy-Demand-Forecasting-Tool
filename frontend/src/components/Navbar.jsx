import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[#0e0f12]/90 backdrop-blur-md border-b border-[#24262d] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
            {title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span>Energy Analytics Platform</span>
            <span>/</span>
            <span className="text-zinc-400">{title}</span>
          </div>
        </div>
      </div>

      {/* Right meta indicators */}
      <div className="flex items-center gap-3">
        {/* Date */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{currentDate}</span>
        </div>

        {/* Dataset Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-300"></span>
          </span>
          <span className="hidden md:inline font-medium">OPSD GERMANY</span>
          <span className="md:hidden">OPSD</span>
        </div>

        {/* User initials pill */}
        <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center shadow-sm">
          {user?.name ? user.name[0] : 'D'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
