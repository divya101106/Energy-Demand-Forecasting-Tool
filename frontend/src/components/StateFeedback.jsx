import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading energy analytics data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#121316] border border-[#24262d] rounded-xl my-4">
      <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mb-3" />
      <p className="text-sm text-zinc-400 font-mono">{message}</p>
      <span className="text-xs text-zinc-600 mt-1">Retrieving OPSD time-series observations</span>
    </div>
  );
};

export const ErrorState = ({ message = 'Failed to load data', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-950/20 border border-red-900/40 rounded-xl my-4">
      <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-800/50 flex items-center justify-center text-red-300 mb-3">
        !
      </div>
      <h4 className="text-sm font-semibold text-zinc-200 mb-1">API Communication Error</h4>
      <p className="text-xs text-zinc-400 max-w-md mb-4 font-mono">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs rounded-lg transition-colors"
        >
          Retry Request
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ title = 'No data available', message = 'No observations found matching the selected criteria.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#121316] border border-[#24262d] rounded-xl my-4">
      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 font-mono">
        ∅
      </div>
      <h4 className="text-sm font-semibold text-zinc-300 mb-1">{title}</h4>
      <p className="text-xs text-zinc-500 max-w-sm">{message}</p>
    </div>
  );
};
