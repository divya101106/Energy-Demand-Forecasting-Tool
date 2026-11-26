import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  Download,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState } from '../components/StateFeedback';
import { forecastAPI } from '../services/api';

const ForecastPage = () => {
  // Configuration options
  const [frequency, setFrequency] = useState('daily');
  const [horizon, setHorizon] = useState(30);
  const [weeklySeasonality, setWeeklySeasonality] = useState(true);
  const [yearlySeasonality, setYearlySeasonality] = useState(true);
  const [holidayEffects, setHolidayEffects] = useState(true);
  const [flexibility, setFlexibility] = useState('balanced');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastResult, setForecastResult] = useState(null);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await forecastAPI.generate({
        frequency,
        horizon: parseInt(horizon),
        weekly_seasonality: weeklySeasonality,
        yearly_seasonality: yearlySeasonality,
        holiday_effects: holidayEffects,
        changepoint_flexibility: flexibility,
      });
      setForecastResult(data);
    } catch (err) {
      setError(err.message || 'Forecast generation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Generate initial forecast on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // CSV Export for forecast
  const handleExportCSV = () => {
    if (!forecastResult || !forecastResult.data.length) return;

    const headers = ['Forecast_Date', 'Predicted_Demand_MW', 'Lower_Bound_MW', 'Upper_Bound_MW'];
    const rows = forecastResult.data.map((f) => [
      f.date,
      f.predicted_demand,
      f.lower_bound,
      f.upper_bound,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `energy_forecast_${frequency}_${horizon}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#24262d] mb-5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-zinc-300" />
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Forecast Configuration</h2>
              <p className="text-xs text-zinc-400 font-mono">
                Select horizon, frequency, and seasonality components
              </p>
            </div>
          </div>

          {forecastResult && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium border flex items-center gap-2 ${
                forecastResult.is_fallback
                  ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
                  : 'bg-zinc-800 text-zinc-100 border-zinc-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
              {forecastResult.forecasting_mode}
            </span>
          )}
        </div>

        {/* Fallback mode alert if active */}
        {forecastResult?.is_fallback && (
          <div className="mb-5 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-200 uppercase font-mono mr-1.5">
                Model Notice:
              </span>
              <span>{forecastResult.fallback_warning}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
              Forecast Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['daily', 'weekly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    frequency === f
                      ? 'bg-zinc-100 text-zinc-950 font-bold border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
              Horizon (Days)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[7, 14, 30, 60].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHorizon(h)}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    horizon === h
                      ? 'bg-zinc-100 text-zinc-950 font-bold border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {h}d
                </button>
              ))}
            </div>
          </div>

          {/* Flexibility */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2 font-mono">
              Changepoint Flexibility
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'conservative', label: 'Conserv.' },
                { id: 'balanced', label: 'Balanc.' },
                { id: 'flexible', label: 'Flexib.' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFlexibility(item.id)}
                  className={`py-1.5 text-[11px] font-mono rounded-lg border transition-all ${
                    flexibility === item.id
                      ? 'bg-zinc-100 text-zinc-950 font-bold border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing GAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>

          {/* Seasonality Toggles */}
          <div className="sm:col-span-2 lg:col-span-4 pt-3 border-t border-[#24262d] flex flex-wrap items-center gap-6 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={weeklySeasonality}
                onChange={(e) => setWeeklySeasonality(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-white focus:ring-0"
              />
              <span className="text-zinc-300 font-mono">Weekly Seasonality (7-day cycle)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={yearlySeasonality}
                onChange={(e) => setYearlySeasonality(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-white focus:ring-0"
              />
              <span className="text-zinc-300 font-mono">Yearly Seasonality (Annual cycle)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={holidayEffects}
                onChange={(e) => setHolidayEffects(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-white focus:ring-0"
              />
              <span className="text-zinc-300 font-mono">Holiday Curtailment Effects</span>
            </label>
          </div>
        </form>
      </div>

      {loading && <LoadingState message="Training Prophet model and evaluating uncertainty bounds..." />}
      {error && <ErrorState message={error} onRetry={handleGenerate} />}

      {/* Results Section */}
      {!loading && !error && forecastResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={forecastResult.forecast_frequency === 'weekly' ? 'Next-Week Forecast' : 'Next-Day Forecast'}
              value={
                (forecastResult.summary.next_period_predicted ?? forecastResult.summary.next_day_predicted)
                  ? (forecastResult.summary.next_period_predicted ?? forecastResult.summary.next_day_predicted).toLocaleString()
                  : '—'
              }
              unit="MW"
              change={forecastResult.summary.percent_change_next_period ?? forecastResult.summary.percent_change_next_day}
              changeType={
                (forecastResult.summary.percent_change_next_period ?? forecastResult.summary.percent_change_next_day) >= 0
                  ? 'increase'
                  : 'decrease'
              }
              subtitle="vs latest historical observation"
              icon={TrendingUp}
            />

            <MetricCard
              title="Average Projected Demand"
              value={forecastResult.summary.average_predicted_demand.toLocaleString()}
              unit="MW"
              subtitle={`Over ${forecastResult.horizon_days} day horizon`}
              icon={Layers}
            />

            <MetricCard
              title="Peak Forecasted Load"
              value={forecastResult.summary.peak_forecast_demand.toLocaleString()}
              unit="MW"
              subtitle="Maximum envelope"
              icon={Cpu}
              badge="Projected Peak"
            />

            <MetricCard
              title="Lowest Forecasted Load"
              value={forecastResult.summary.lowest_forecast_demand.toLocaleString()}
              unit="MW"
              subtitle="Minimum envelope"
              badge="Projected Base"
            />
          </div>

          {/* Forecast Chart */}
          <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Projected Demand Curve with 95% Confidence Bounds
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {forecastResult.model_name} ({forecastResult.model_version}) • {forecastResult.data.length} periods
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-mono rounded-lg flex items-center gap-2 self-start sm:self-auto transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Forecast CSV</span>
              </button>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastResult.data}>
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
                    formatter={(val, name) => [
                      `${val.toLocaleString()} MW`,
                      name === 'predicted_demand'
                        ? 'Predicted Load'
                        : name === 'upper_bound'
                        ? 'Upper Bound (95%)'
                        : 'Lower Bound (95%)',
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    formatter={(val) =>
                      val === 'predicted_demand'
                        ? 'Predicted Demand'
                        : val === 'upper_bound'
                        ? 'Upper Confidence Limit'
                        : 'Lower Confidence Limit'
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="#52525b"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ffffff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="#52525b"
                    strokeDasharray="2 2"
                    strokeWidth={1}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Data Table */}
          <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Forecast Point Projections</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Timestamped future values with uncertainty envelope (Unit: MW)
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Generated: {new Date(forecastResult.generated_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-[#121316] border-b border-[#24262d] text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Predicted Demand</th>
                    <th className="py-2.5 px-3">Lower Bound (95%)</th>
                    <th className="py-2.5 px-3">Upper Bound (95%)</th>
                    <th className="py-2.5 px-3 text-right">Confidence Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24262d]/50 text-zinc-300">
                  {forecastResult.data.map((row) => (
                    <tr key={row.date} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-zinc-200">{row.date}</td>
                      <td className="py-2 px-3 text-zinc-100 font-bold">
                        {row.predicted_demand.toLocaleString()} MW
                      </td>
                      <td className="py-2 px-3 text-zinc-400">
                        {row.lower_bound.toLocaleString()} MW
                      </td>
                      <td className="py-2 px-3 text-zinc-400">
                        {row.upper_bound.toLocaleString()} MW
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-500">
                        ±{Math.round((row.upper_bound - row.predicted_demand))} MW
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastPage;
