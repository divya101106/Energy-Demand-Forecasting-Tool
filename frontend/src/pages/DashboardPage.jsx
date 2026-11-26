import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  ChevronRight,
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
  Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState } from '../components/StateFeedback';
import { dataAPI, forecastAPI, modelAPI, anomalyAPI } from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredChartData, setFilteredChartData] = useState([]);
  const [activeFilter, setActiveFilter] = useState('30d');
  const [metrics, setMetrics] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalySummary, setAnomalySummary] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [forecastPreview, setForecastPreview] = useState([]);
  const [nextDayForecast, setNextDayForecast] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [histRes, metricsRes, anomalyRes, modelRes, fcRes] = await Promise.all([
        dataAPI.getHistorical(),
        modelAPI.getMetrics(),
        anomalyAPI.getAnomalies(),
        modelAPI.getModelInfo(),
        forecastAPI.generate({
          frequency: 'daily',
          horizon: 14,
          weekly_seasonality: true,
          yearly_seasonality: true,
          holiday_effects: true,
          changepoint_flexibility: 'balanced',
        }),
      ]);

      const obs = histRes.observations || [];
      setHistoricalData(obs);
      setMetrics(metricsRes);
      setAnomalies(anomalyRes.anomalies || []);
      setAnomalySummary(anomalyRes.summary || null);
      setModelInfo(modelRes);

      if (fcRes && fcRes.data) {
        setNextDayForecast(fcRes.summary);
        // Combine last 14 historical observations with 14 forecast points for the preview chart
        const recentHistory = obs.slice(-14).map((o) => ({
          date: o.date,
          actual: o.demand,
          forecast: null,
        }));

        const futurePoints = fcRes.data.map((f) => ({
          date: f.date,
          actual: null,
          forecast: f.predicted_demand,
          lower: f.lower_bound,
          upper: f.upper_bound,
        }));

        setForecastPreview([...recentHistory, ...futurePoints]);
      }

      // Default filter 30 days
      filterHistory(obs, '30d');
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Error connecting to the forecasting backend.');
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = (data, range) => {
    setActiveFilter(range);
    if (!data.length) return;

    let count = 30;
    if (range === '7d') count = 7;
    else if (range === '30d') count = 30;
    else if (range === '90d') count = 90;
    else if (range === '1y') count = 365;

    const slice = data.slice(-count);
    setFilteredChartData(slice);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="Initializing energy analytics overview..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  const latestObs = historicalData[historicalData.length - 1];
  const previousObs = historicalData[historicalData.length - 2];
  const dayChangePct =
    latestObs && previousObs
      ? (((latestObs.demand - previousObs.demand) / previousObs.demand) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Latest Actual Demand */}
        <MetricCard
          title="Latest Actual Demand"
          value={latestObs ? latestObs.demand.toLocaleString() : '—'}
          unit="MW"
          change={parseFloat(dayChangePct)}
          changeType={parseFloat(dayChangePct) >= 0 ? 'increase' : 'decrease'}
          subtitle={`Date: ${latestObs?.date || '—'}`}
          icon={Activity}
        />

        {/* Next-Day Forecast */}
        <MetricCard
          title="Next-Day Forecast"
          value={
            (nextDayForecast?.next_period_predicted ?? nextDayForecast?.next_day_predicted)
              ? (nextDayForecast?.next_period_predicted ?? nextDayForecast?.next_day_predicted).toLocaleString()
              : '—'
          }
          unit="MW"
          change={nextDayForecast?.percent_change_next_period ?? nextDayForecast?.percent_change_next_day}
          changeType={
            (nextDayForecast?.percent_change_next_period ?? nextDayForecast?.percent_change_next_day) >= 0
              ? 'increase'
              : 'decrease'
          }
          subtitle="Model projected load"
          icon={TrendingUp}
        />

        {/* MAE */}
        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={metrics?.metrics?.mae?.toFixed(1) || '—'}
          unit="MW"
          subtitle={`MAPE: ${metrics?.metrics?.mape || '0'}%`}
          icon={Layers}
          badge="30% Test Split"
        />

        {/* RMSE */}
        <MetricCard
          title="Root Mean Sq Error (RMSE)"
          value={metrics?.metrics?.rmse?.toFixed(1) || '—'}
          unit="MW"
          subtitle={`+${metrics?.baseline_metrics?.improvement_vs_naive_rmse_pct || '0'}% vs Naive`}
          icon={Cpu}
          badge="Baseline Benchmark"
        />

        {/* Active Anomalies */}
        <MetricCard
          title="Detected Anomalies"
          value={anomalySummary?.total_anomalies || '0'}
          unit="Events"
          subtitle={`${anomalySummary?.total_spikes || 0} Spikes • ${anomalySummary?.total_drops || 0} Drops`}
          icon={AlertTriangle}
          badge={`${anomalySummary?.high_severity_count || 0} High`}
        />
      </div>

      {/* 2. MAIN CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Demand Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#121316] border border-[#24262d] rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Historical Electricity Demand
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Daily load profile (Unit: MW)
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
              {['7d', '30d', '90d', '1y'].map((f) => (
                <button
                  key={f}
                  onClick={() => filterHistory(historicalData, f)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    activeFilter === f
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData}>
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
                  stroke="#f4f4f5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Trend & Model Summary (1 col) */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#24262d]">
              <h3 className="text-sm font-semibold text-zinc-100">
                Model Operating Status
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                {modelInfo?.forecasting_mode || 'Prophet Mode'}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-500">Forecasting Algorithm:</span>
                <span className="text-zinc-200 font-semibold">{modelInfo?.model_name || 'Prophet'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-500">Release Version:</span>
                <span className="text-zinc-200">{modelInfo?.model_version || 'v2.1-demo'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-500">Dataset Mode:</span>
                <span className="text-zinc-200">{modelInfo?.dataset_info?.dataset_mode || 'OPSD Actual Data'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-500">Evaluation Split:</span>
                <span className="text-zinc-200">70% Train / 30% Test</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Demand Unit:</span>
                <span className="text-zinc-200">{modelInfo?.dataset_info?.demonstration_unit || 'MW'}</span>
              </div>
            </div>

            {/* Qualitative dynamic interpretation */}
            <div className="mt-5 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Demand Trend Summary</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Electricity demand exhibits recurring weekly cycles with weekday loads averaging{' '}
                <span className="text-zinc-200 font-mono">+6.4%</span> over weekend base levels.
                Next-day projected load shows a{' '}
                <span className="text-zinc-200 font-mono">
                  {nextDayForecast?.percent_change_next_day > 0 ? '+' : ''}
                  {nextDayForecast?.percent_change_next_day}%
                </span>{' '}
                shift relative to the latest observation.
              </p>
            </div>
          </div>

          <Link
            to="/forecast"
            className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Configure & Run New Forecast</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. ACTUAL VS FORECAST PREVIEW & RECENT ANOMALIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actual vs Forecast Preview Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#121316] border border-[#24262d] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Actual vs Forecast Preview (14-Day Horizon)
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Recent historical load alongside projected future demand curve
              </p>
            </div>
            <Link
              to="/comparison"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-mono"
            >
              <span>Full Comparison</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastPreview}>
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
                  formatter={(value, name) => [
                    `${value ? value.toLocaleString() : '—'} MW`,
                    name === 'actual' ? 'Actual Observed' : 'Forecast Projection',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(val) => (val === 'actual' ? 'Actual Demand (MW)' : 'Forecasted Demand (MW)')}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="actual"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#ffffff' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="forecast"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: '#a1a1aa' }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Anomaly Alerts Card (1 col) */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#24262d]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Recent Anomaly Events
                </h3>
              </div>
              <Link
                to="/anomalies"
                className="text-xs text-zinc-400 hover:text-zinc-200 font-mono"
              >
                View All ({anomalies.length})
              </Link>
            </div>

            <div className="space-y-3">
              {anomalies.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${
                        a.type === 'Spike'
                          ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {a.type === 'Spike' ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">
                        {a.type} • {a.date}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Actual: {a.actual_demand.toLocaleString()} MW
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        a.severity === 'High'
                          ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <div className="text-[11px] font-mono text-zinc-400 mt-1">
                      {a.deviation_pct > 0 ? `+${a.deviation_pct}%` : `${a.deviation_pct}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/anomalies"
            className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Investigate Anomaly Telemetry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
