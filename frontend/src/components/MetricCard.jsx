import React from 'react';

const MetricCard = ({ title, value, unit, change, changeType = 'neutral', subtitle, icon: Icon, badge }) => {
  return (
    <div className="bg-[#121316] border border-[#24262d] hover:border-[#383a45] rounded-xl p-5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-zinc-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        {change !== undefined && (
          <div
            className={`inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded text-[11px] font-medium border ${
              changeType === 'increase'
                ? 'bg-zinc-800/80 text-zinc-200 border-zinc-700'
                : changeType === 'decrease'
                ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            {change > 0 ? `+${change}%` : `${change}%`}
          </div>
        )}

        {subtitle && (
          <span className="text-zinc-500 truncate">{subtitle}</span>
        )}

        {badge && (
          <span className="bg-zinc-800 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
