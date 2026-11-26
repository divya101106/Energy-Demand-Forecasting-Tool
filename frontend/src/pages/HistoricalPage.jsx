import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState, EmptyState } from '../components/StateFeedback';
import { dataAPI } from '../services/api';

const HistoricalPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [observations, setObservations] = useState([]);
  const [stats, setStats] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const fetchHistorical = async (start = null, end = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataAPI.getHistorical(start, end);
      setObservations(data.observations || []);
      setStats(data.stats || null);
      setCurrentPage(1);

      // If initial fetch, set inputs to dataset boundaries
      if (!start && !end && data.stats) {
        setStartDate(data.stats.start_date);
        setEndDate(data.stats.end_date);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve historical observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorical();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchHistorical(startDate, endDate);
  };

  const handleResetFilter = () => {
    fetchHistorical(null, null);
  };

  const handleQuickPreset = (days) => {
    if (!observations.length && !stats) return;
    const lastDateStr = stats?.end_date || '2020-09-30';
    const last = new Date(lastDateStr);
    const start = new Date(last);
    start.setDate(start.getDate() - days);

    const sStr = start.toISOString().split('T')[0];
    const eStr = lastDateStr;
    setStartDate(sStr);
    setEndDate(eStr);
    fetchHistorical(sStr, eStr);
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (!observations.length) return;

    const headers = ['Date', 'Demand_MW', 'Trend_MW', 'Weekly_Seasonality_MW', 'Yearly_Seasonality_MW', 'Is_Anomaly', 'Anomaly_Type'];
    const rows = observations.map((o) => [
      o.date,
      o.demand,
      o.trend,
      o.weekly_seasonality,
      o.yearly_seasonality,
      o.is_anomaly ? 'TRUE' : 'FALSE',
      o.anomaly_type || 'None',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opsd_germany_demand_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered observations by search
  const filteredObservations = observations.filter((o) =>
    searchTerm ? o.date.includes(searchTerm) : true
  );

  // Pagination slice
  const totalPages = Math.ceil(filteredObservations.length / rowsPerPage) || 1;
  const paginatedRows = filteredObservations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Page Header & Filter Controls */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24262d]">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Historical Demand Explorer</h2>
            <p className="text-xs text-zinc-400 font-mono">
              OPSD Germany electricity demand observation registry (DE_load_actual_entsoe_transparency)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={!observations.length}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-mono rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <form onSubmit={handleApplyFilter} className="pt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-colors"
          >
            Apply Range
          </button>

          <button
            type="button"
            onClick={handleResetFilter}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-lg transition-colors border border-zinc-800"
          >
            Full Year
          </button>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-zinc-500 font-mono">Presets:</span>
            {[
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
              { label: '180D', days: 180 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleQuickPreset(p.days)}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono border border-zinc-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {loading && <LoadingState message="Querying OPSD historical series..." />}
      {error && <ErrorState message={error} onRetry={() => fetchHistorical(startDate, endDate)} />}

      {!loading && !error && observations.length === 0 && (
        <EmptyState
          title="No observations in selected date range"
          message="Adjust the start and end dates or click 'Reset' to restore all 2,100 OPSD records."
        />
      )}

      {!loading && !error && observations.length > 0 && stats && (
        <>
          {/* Summary Statistics (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="Average Demand"
              value={stats.average_demand.toLocaleString()}
              unit="MW"
              subtitle="Daily mean"
              icon={Activity}
            />
            <MetricCard
              title="Min Demand"
              value={stats.min_demand.toLocaleString()}
              unit="MW"
              subtitle={stats.lowest_demand_date}
              icon={TrendingDown}
            />
            <MetricCard
              title="Max Demand"
              value={stats.max_demand.toLocaleString()}
              unit="MW"
              subtitle={stats.highest_demand_date}
              icon={TrendingUp}
            />
            <MetricCard
              title="Std Deviation"
              value={stats.std_demand.toLocaleString()}
              unit="MW"
              subtitle="Demand variance"
              icon={Layers}
            />
            <MetricCard
              title="Peak Date"
              value={stats.highest_demand_date.slice(5)}
              subtitle={stats.highest_demand_date}
              badge="Max Load"
            />
            <MetricCard
              title="Trough Date"
              value={stats.lowest_demand_date.slice(5)}
              subtitle={stats.lowest_demand_date}
              badge="Min Load"
            />
          </div>

          {/* Interactive Historical Chart */}
          <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Historical Demand Trend ({stats.start_date} to {stats.end_date})
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {stats.total_observations} OPSD daily observations plotted
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={observations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#24262d" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis
                    stroke="#71717a"
                    tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }}
                    domain={['dataMin - 1500', 'dataMax + 1500']}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18191e',
                      borderColor: '#2e303a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(value) => [`${value.toLocaleString()} MW`, 'Actual Demand']}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="#ffffff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Observations Table */}
          <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Observations Registry</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Showing {filteredObservations.length} observations
                </p>
              </div>

              {/* Table search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by date (YYYY-MM-DD)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#24262d] text-zinc-400">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Demand (MW)</th>
                    <th className="py-2.5 px-3">Trend Component</th>
                    <th className="py-2.5 px-3">Weekly Seasonality</th>
                    <th className="py-2.5 px-3">Yearly Seasonality</th>
                    <th className="py-2.5 px-3 text-right">Anomaly Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24262d]/50 text-zinc-300">
                  {paginatedRows.map((row) => (
                    <tr key={row.date} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-zinc-200">{row.date}</td>
                      <td className="py-2.5 px-3 text-zinc-100 font-bold">
                        {row.demand.toLocaleString()} MW
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">{row.trend} MW</td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {row.weekly_seasonality > 0 ? `+${row.weekly_seasonality}` : row.weekly_seasonality} MW
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400">
                        {row.yearly_seasonality > 0 ? `+${row.yearly_seasonality}` : row.yearly_seasonality} MW
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.is_anomaly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {row.anomaly_type || 'Anomaly'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#24262d] text-xs font-mono">
              <span className="text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalPage;
