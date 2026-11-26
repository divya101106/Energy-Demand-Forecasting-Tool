import React from 'react';
import { Database } from 'lucide-react';

const DemoDisclaimerBanner = () => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 mb-6 flex items-start gap-3 text-xs text-zinc-300">
      <Database className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold text-zinc-200 uppercase tracking-wider mr-2 font-mono">
          OPSD Historical Dataset (Germany):
        </span>
        <span>
          Operating on real Open Power System Data (OPSD) ENTSO-E transparency load observations (2015-01-01 to 2020-09-30, 2,100 days).
          Model forecasts project out-of-sample forward from the September 2020 cutoff date.
        </span>
      </div>
    </div>
  );
};

export default DemoDisclaimerBanner;
