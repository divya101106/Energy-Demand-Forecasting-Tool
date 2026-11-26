import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState } from '../components/StateFeedback';
import { modelAPI } from '../services/api';

const ComparisonPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelAPI.getComparison();
      setComparisonData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch comparison observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  if (loading) return <LoadingState message="Computing actual vs forecasted residual vectors..." />;
  if (error) return <ErrorState message={error} onRetry={fetchComparison} />;
  if (!comparisonData) return null;

  const { observations, metrics, error_summary, interpretation } = comparisonData;

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#24262d]">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Forecast vs Actual Evaluation
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Evaluated strictly across the 30% holdout test partition ({observations[0]?.date} to{' '}
              {observations[observations.length - 1]?.date})
            </p>
          </div>
          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-mono text-zinc-300">
            {observations.length} Test Days Analyzed
          </span>
        </div>

        {/* Dynamic Interpretation Box */}
        <div className="mt-4 p-3.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span>Automated Residual Analysis</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-400 leading-relaxed font-mono">
            {interpretation.map((statement, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-zinc-500">•</span>
                <span>{statement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Comparison Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Mean Absolute Error (MAE)"
          value={metrics.mae.toFixed(1)}
          unit="MW"
          subtitle="Mean magnitude of error"
          icon={Layers}
        />

        <MetricCard
          title="Root Mean Sq Error (RMSE)"
          value={metrics.rmse.toFixed(1)}
          unit="MW"
          subtitle="Penalizes large variance"
          icon={Activity}
        />

        <MetricCard
          title="Mean Absolute Pct Error"
          value={`${metrics.mape.toFixed(2)}%`}
          subtitle="Safe percentage error"
          icon={TrendingUp}
          badge="High Precision"
        />

        <MetricCard
          title="Largest Absolute Error"
          value={error_summary.largest_absolute_error.toLocaleString()}
          unit="MW"
          subtitle="Peak residual anomaly"
          badge="Max Deviation"
        />
      </div>

      {/* Chart 1: Actual Demand vs Forecasted Demand */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Actual Demand vs Model Forecast (Holdout Period)
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Solid white: Actual observed load | Dashed silver: Model forecast
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
                formatter={(val, name) => [
                  `${val.toLocaleString()} MW`,
                  name === 'actual_demand' ? 'Actual Load' : 'Forecast Projection',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(val) =>
                  val === 'actual_demand' ? 'Actual Demand (MW)' : 'Forecasted Demand (MW)'
                }
              />
              <Line
                type="monotone"
                dataKey="actual_demand"
                name="actual_demand"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#ffffff' }}
              />
              <Line
                type="monotone"
                dataKey="forecasted_demand"
                name="forecasted_demand"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 4, fill: '#a1a1aa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Residual Error Over Time (Actual - Forecast) */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Residual Error Over Time (Error = Actual − Forecast)
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Positive: Under-prediction (Actual &gt; Forecast) | Negative: Over-prediction (Actual &lt; Forecast)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-400">
              Over-prediction days: <strong className="text-zinc-200">{error_summary.over_prediction_days}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Under-prediction days: <strong className="text-zinc-200">{error_summary.under_prediction_days}</strong>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={observations}>
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
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
              />
              <ReferenceLine y={0} stroke="#71717a" strokeWidth={1.5} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18191e',
                  borderColor: '#2e303a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(val) => [`${val > 0 ? '+' : ''}${val.toLocaleString()} MW`, 'Residual Error']}
              />
              <Bar dataKey="error" fill="#d4d4d8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
