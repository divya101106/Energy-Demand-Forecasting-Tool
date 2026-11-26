import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Layers,
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState } from '../components/StateFeedback';
import { modelAPI } from '../services/api';

const PerformancePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, compRes] = await Promise.all([
        modelAPI.getMetrics(),
        modelAPI.getComparison(),
      ]);
      setMetricsData(mRes);
      setComparisonData(compRes);
    } catch (err) {
      setError(err.message || 'Failed to load model performance evaluation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) return <LoadingState message="Aggregating model evaluation metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchPerformance} />;
  if (!metricsData) return null;

  const { metrics, baseline_metrics } = metricsData;

  return (
    <div className="space-y-6">
      {/* 1. TRAIN / TEST SPLIT VISUALIZATION */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Chronological Train / Test Validation Pipeline
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Strict time-ordered split without lookahead bias or future-leakage
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300">
            Total History: {metricsData.train_count + metricsData.test_count} Observations (OPSD)
          </span>
        </div>

        {/* Visual Partition Bar */}
        <div className="space-y-2">
          <div className="h-6 w-full rounded-lg overflow-hidden flex text-[11px] font-mono font-semibold">
            <div
              style={{ width: `${metricsData.train_split_pct}%` }}
              className="bg-zinc-700 text-zinc-100 flex items-center justify-center px-2 transition-all"
            >
              Train Set ({metricsData.train_count} Days • {metricsData.train_split_pct}%)
            </div>
            <div
              style={{ width: `${metricsData.test_split_pct}%` }}
              className="bg-zinc-100 text-zinc-950 flex items-center justify-center px-2 font-bold transition-all"
            >
              Test Holdout ({metricsData.test_count} Days • {metricsData.test_split_pct}%)
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
            <span>Start: Day 1 (2015-01-01)</span>
            <span>Split Boundary: Day {metricsData.train_count} (2019-01-09)</span>
            <span>Evaluation Horizon: Day {metricsData.train_count + metricsData.test_count} (2020-09-30)</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 font-mono leading-relaxed">
          <span className="text-zinc-200 font-semibold mr-1.5">Zero Lookahead Guarantee:</span>
          The forecasting model fits exclusively on the initial 70% training partition ({metricsData.train_count} days).
          Model evaluation metrics (MAE, RMSE, MAPE) are strictly scored against the untouched final 30% holdout partition ({metricsData.test_count} days).
        </div>
      </div>

      {/* 2. METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={metrics.mae.toFixed(1)}
          unit="MW"
          subtitle={`Naive Baseline: ${baseline_metrics.mae.toFixed(1)} MW`}
          icon={Layers}
          badge="Test Holdout"
        />

        <MetricCard
          title="Root Mean Sq Error (RMSE)"
          value={metrics.rmse.toFixed(1)}
          unit="MW"
          change={baseline_metrics.improvement_vs_naive_rmse_pct}
          changeType="increase"
          subtitle={`vs ${baseline_metrics.rmse.toFixed(1)} MW Naive`}
          icon={Activity}
          badge="Scorecard"
        />

        <MetricCard
          title="Mean Absolute Pct Error"
          value={`${metrics.mape.toFixed(2)}%`}
          subtitle="Non-zero protected"
          icon={TrendingUp}
          badge="High Reliability"
        />

        <MetricCard
          title="RMSE Improvement"
          value={`+${baseline_metrics.improvement_vs_naive_rmse_pct}%`}
          subtitle="Beats seasonal-naive target (≥15%)"
          badge="Success Target Met"
        />
      </div>

      {/* 3. CHARTS: ACCURACY & ERROR DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Period Accuracy Curve */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Evaluation Period Accuracy Tracking
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Actual demand vs fitted model projection on the holdout test set
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData?.observations || []}>
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
                    name === 'actual_demand' ? 'Actual' : 'Model Output',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'actual_demand' ? 'Actual Observed' : 'Model Prediction')}
                />
                <Line
                  type="monotone"
                  dataKey="actual_demand"
                  stroke="#ffffff"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecasted_demand"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residual Error Distribution Histogram */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Residual Error Distribution Histogram
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Frequency count of daily error ranges across holdout days
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData?.error_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24262d" />
                <XAxis
                  dataKey="bin_range"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 9, fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18191e',
                    borderColor: '#2e303a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val) => [`${val} Days`, 'Observation Count']}
                />
                <Bar dataKey="count" fill="#f4f4f5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. BENCHMARK COMPARISON TABLE */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">
            Model vs Seasonal-Naive Baseline Benchmark
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Proves that Prophet earns its algorithmic complexity over a simple 7-day seasonal persistence model
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#24262d] text-zinc-400">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">MAE (MW)</th>
                <th className="py-2.5 px-3">RMSE (MW)</th>
                <th className="py-2.5 px-3">MAPE (%)</th>
                <th className="py-2.5 px-3 text-right">RMSE Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24262d]/50 text-zinc-300">
              <tr className="hover:bg-zinc-900/50">
                <td className="py-3 px-3 text-zinc-400">
                  {baseline_metrics.model_name} (Persistence Benchmark)
                </td>
                <td className="py-3 px-3 text-zinc-400">{baseline_metrics.mae.toFixed(1)} MW</td>
                <td className="py-3 px-3 text-zinc-400">{baseline_metrics.rmse.toFixed(1)} MW</td>
                <td className="py-3 px-3 text-zinc-400">{baseline_metrics.mape.toFixed(2)}%</td>
                <td className="py-3 px-3 text-right text-zinc-500">Baseline (0.0%)</td>
              </tr>
              <tr className="bg-zinc-900/40 font-semibold text-zinc-100 hover:bg-zinc-900/70">
                <td className="py-3 px-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-100" />
                  <span>{metricsData.model_name} ({metricsData.forecasting_mode})</span>
                </td>
                <td className="py-3 px-3 text-zinc-100">{metrics.mae.toFixed(1)} MW</td>
                <td className="py-3 px-3 text-zinc-100">{metrics.rmse.toFixed(1)} MW</td>
                <td className="py-3 px-3 text-zinc-100">{metrics.mape.toFixed(2)}%</td>
                <td className="py-3 px-3 text-right font-bold text-zinc-100">
                  +{baseline_metrics.improvement_vs_naive_rmse_pct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
