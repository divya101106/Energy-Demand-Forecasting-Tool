import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Server,
  Settings2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { LoadingState, ErrorState } from '../components/StateFeedback';
import { modelAPI } from '../services/api';

const ModelInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const fetchModelInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelAPI.getModelInfo();
      setInfo(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve model configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  if (loading) return <LoadingState message="Inspecting model metadata and architecture..." />;
  if (error) return <ErrorState message={error} onRetry={fetchModelInfo} />;
  if (!info) return null;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#24262d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100">
              <Cpu className="w-5 h-5 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Model Architecture & Telemetry Specs
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {info.model_name} • Release Version {info.model_version} • Runtime: {info.system_info?.runtime_environment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium border flex items-center gap-2 ${
                info.is_fallback
                  ? 'bg-zinc-900 text-zinc-300 border-zinc-800'
                  : 'bg-zinc-800 text-zinc-100 border-zinc-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-zinc-300"></span>
              {info.forecasting_mode}
            </span>
          </div>
        </div>

        <p className="pt-4 text-xs text-zinc-400 font-mono leading-relaxed">
          {info.forecasting_algorithm}
        </p>
      </div>

      {/* 2. Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Hyperparameter Configuration */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#24262d]">
            <Settings2 className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">
              Model Decomposed Parameters
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-200 font-semibold block">Weekly Seasonality:</span>
              <p className="text-zinc-400">{info.seasonality_configuration?.weekly_seasonality}</p>
              <span className="text-zinc-500 text-[11px]">Prior Scale: {info.seasonality_configuration?.prior_scale}</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-200 font-semibold block">Annual Seasonality:</span>
              <p className="text-zinc-400">{info.seasonality_configuration?.yearly_seasonality}</p>
              <span className="text-zinc-500 text-[11px]">Mode: {info.seasonality_configuration?.mode}</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-200 font-semibold block">Trend Changepoint Detection:</span>
              <p className="text-zinc-400">
                {info.changepoint_configuration?.n_changepoints} changepoints across first {info.changepoint_configuration?.changepoint_range * 100}% of historical observations.
              </p>
              <span className="text-zinc-500 text-[11px]">
                Supported flexibility scales: Conservative (0.01), Balanced (0.05), Flexible (0.15)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <span className="text-zinc-200 font-semibold block">Holiday Effects Calendar:</span>
              <p className="text-zinc-400">{info.holiday_configuration?.country_calendar}</p>
              <span className="text-zinc-500 text-[11px]">Window Adjustment: {info.holiday_configuration?.impact_window}</span>
            </div>
          </div>
        </div>

        {/* Dataset Schema & Generation Metadata */}
        <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#24262d]">
            <Database className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-zinc-100">
              OPSD Historical Dataset Metadata
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1">Total Observations:</span>
                <span className="text-zinc-100 font-bold text-sm">
                  {info.dataset_info?.number_of_observations} Days
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-1">Time Granularity:</span>
                <span className="text-zinc-100 font-bold text-sm">
                  {info.dataset_info?.time_interval}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Date Coverage:</span>
                <span className="text-zinc-200 font-semibold">
                  {info.dataset_info?.start_date} to {info.dataset_info?.end_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Demonstration Unit:</span>
                <span className="text-zinc-200 font-semibold">{info.dataset_info?.demonstration_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Baseline Grid Load:</span>
                <span className="text-zinc-200 font-semibold">{info.dataset_info?.baseline_demand_mw?.toLocaleString()} MW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Target Column:</span>
                <span className="text-zinc-200 font-semibold">{info.dataset_info?.target_column || 'DE_load_actual_entsoe_transparency'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 leading-relaxed text-zinc-300">
              <span className="text-zinc-100 font-semibold block mb-1">Dataset Origin & Provenance:</span>
              {info.dataset_info?.data_provenance}
            </div>
          </div>
        </div>
      </div>

      {/* 3. System & API Health Telemetry */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#24262d] mb-4">
          <Server className="w-4 h-4 text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Runtime System Status & Health Telemetry
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block mb-1">Backend Service:</span>
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200" />
              <span>{info.system_info?.backend_status}</span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block mb-1">API Health:</span>
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-200" />
              <span>{info.system_info?.api_health}</span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block mb-1">Prophet Engine:</span>
            <span className="text-zinc-200 font-bold">
              {info.system_info?.prophet_installed ? 'Installed & Operational' : 'Not Installed (Fallback Active)'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-500 block mb-1">Active Engine:</span>
            <span className="text-zinc-200 font-bold">{info.forecasting_mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPage;
