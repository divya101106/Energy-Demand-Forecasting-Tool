import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  CheckCircle,
  X,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StateFeedback';
import { anomalyAPI } from '../services/api';

const AnomaliesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anomalies, setAnomalies] = useState([]);
  const [summary, setSummary] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Modal detail
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const fetchAnomalies = async (type = typeFilter, sev = severityFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyAPI.getAnomalies(type, sev);
      setAnomalies(data.anomalies || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve detected anomalies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies('all', 'all');
  }, []);

  const handleTypeChange = (newType) => {
    setTypeFilter(newType);
    fetchAnomalies(newType, severityFilter);
  };

  const handleSeverityChange = (newSev) => {
    setSeverityFilter(newSev);
    fetchAnomalies(typeFilter, newSev);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY CARDS */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Total Anomalies"
            value={summary.total_anomalies}
            unit="Events"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Demand Spikes"
            value={summary.total_spikes}
            unit="Surges"
            subtitle="Cold snap / Heatwave"
            icon={ArrowUpRight}
          />
          <MetricCard
            title="Demand Drops"
            value={summary.total_drops}
            unit="Lulls"
            subtitle="Outage / Holiday"
            icon={ArrowDownRight}
          />
          <MetricCard
            title="High Severity"
            value={summary.high_severity_count}
            subtitle="Deviation > 22%"
            badge="Critical"
          />
          <MetricCard
            title="Medium Severity"
            value={summary.medium_severity_count}
            subtitle="Deviation 15% - 22%"
            badge="Moderate"
          />
          <MetricCard
            title="Low Severity"
            value={summary.low_severity_count}
            subtitle="Deviation 10% - 15%"
            badge="Advisory"
          />
        </div>
      )}

      {/* 2. FILTER CONTROLS */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24262d]">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Demand Anomaly Registry
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Algorithmic detection via Rolling Residual Deviation against dynamic baseline
            </p>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            Showing {anomalies.length} matching events
          </span>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-mono">
          {/* Anomaly Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Anomaly Type:</span>
            <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              {['all', 'Spike', 'Drop'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    typeFilter.toLowerCase() === t.toLowerCase()
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Severity:</span>
            <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              {['all', 'High', 'Medium', 'Low'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSeverityChange(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    severityFilter.toLowerCase() === s.toLowerCase()
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {s === 'all' ? 'All Severities' : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingState message="Scanning OPSD observations for residual anomalies..." />}
      {error && <ErrorState message={error} onRetry={() => fetchAnomalies()} />}

      {!loading && !error && anomalies.length === 0 && (
        <EmptyState
          title="No anomalies match filter criteria"
          message="Try setting Type and Severity filters back to 'All' to review all detected events."
        />
      )}

      {/* 3. ANOMALIES TABLE */}
      {!loading && !error && anomalies.length > 0 && (
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#24262d] text-zinc-400">
                  <th className="py-3 px-3">Alert ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Actual Load</th>
                  <th className="py-3 px-3">Expected Baseline</th>
                  <th className="py-3 px-3">Deviation (MW)</th>
                  <th className="py-3 px-3">Deviation (%)</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24262d]/50 text-zinc-300">
                {anomalies.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-zinc-200">{item.id}</td>
                    <td className="py-3 px-3 text-zinc-300">{item.date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.type === 'Spike'
                            ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {item.type === 'Spike' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-100">
                      {item.actual_demand.toLocaleString()} MW
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {item.expected_demand.toLocaleString()} MW
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-200">
                      {item.deviation_mw > 0 ? `+${item.deviation_mw.toLocaleString()}` : item.deviation_mw.toLocaleString()} MW
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          Math.abs(item.deviation_pct) >= 22
                            ? 'text-zinc-100 bg-zinc-800 border border-zinc-700'
                            : 'text-zinc-300'
                        }`}
                      >
                        {item.deviation_pct > 0 ? `+${item.deviation_pct}%` : `${item.deviation_pct}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          item.severity === 'High'
                            ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-bold'
                            : item.severity === 'Medium'
                            ? 'bg-zinc-900 text-zinc-300 border-zinc-800'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      <span className="text-[11px] font-mono">{item.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedAnomaly(item)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors border border-zinc-700 inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DETAIL MODAL */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121316] border border-[#2e303a] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#24262d] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-bold">
                  {selectedAnomaly.type === 'Spike' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Anomaly Event Diagnostics
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {selectedAnomaly.id} • {selectedAnomaly.date}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="text-zinc-500 hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">Actual Observed Demand:</span>
                  <span className="text-base font-bold text-zinc-100">
                    {selectedAnomaly.actual_demand.toLocaleString()} MW
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 block mb-1">Expected Baseline Demand:</span>
                  <span className="text-base font-bold text-zinc-300">
                    {selectedAnomaly.expected_demand.toLocaleString()} MW
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Net Deviation:</span>
                  <span className="text-zinc-200 font-bold">
                    {selectedAnomaly.deviation_mw > 0 ? `+${selectedAnomaly.deviation_mw}` : selectedAnomaly.deviation_mw} MW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Percentage Shift:</span>
                  <span className="text-zinc-200 font-bold">
                    {selectedAnomaly.deviation_pct > 0 ? `+${selectedAnomaly.deviation_pct}%` : `${selectedAnomaly.deviation_pct}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Severity Tier:</span>
                  <span className="text-zinc-200 font-semibold">{selectedAnomaly.severity} Severity</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Detection Algorithm:</span>
                  <span className="text-zinc-400 text-[11px]">{selectedAnomaly.detection_method}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 leading-relaxed text-zinc-300">
                <span className="text-zinc-100 font-semibold block mb-1">Incident Context:</span>
                {selectedAnomaly.description}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#24262d] flex justify-end gap-2">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-colors"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomaliesPage;
