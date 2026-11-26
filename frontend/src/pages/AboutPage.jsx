import React from 'react';
import {
  Info,
  CheckCircle2,
  Code2,
  Server,
  Layers,
  Activity,
  ArrowRight,
  Database,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. Project Title & Mission */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#24262d]">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100">
            <Info className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              About Energy Demand Forecasting Tool
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Academic Semester OJT Project • Advanced Data Science & Full-Stack Systems
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <h4 className="font-semibold text-zinc-200 mb-2 font-mono flex items-center gap-1.5">
              <span>The Industry Challenge</span>
            </h4>
            <p className="text-zinc-400">
              Electric utility operators and grid dispatchers must balance supply and demand continuously.
              Demand fluctuates across overlapping signals: hourly daily cycles, weekday-vs-weekend work patterns,
              seasonal weather shifts, and macroeconomic growth trends. Manual forecasting risks costly over-generation
              or grid instability during peak demand spikes.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <h4 className="font-semibold text-zinc-200 mb-2 font-mono flex items-center gap-1.5">
              <span>Our Applied Solution</span>
            </h4>
            <p className="text-zinc-400">
              An interactive, end-to-end full-stack analytics platform that ingests time-series demand data,
              fits decomposable Generalized Additive Models (GAM via Prophet), computes rigorously backtested
              accuracy benchmarks (MAE, RMSE, MAPE) without lookahead bias, and alerts grid controllers to
              abnormal demand spikes and drops.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Project Objectives Checklist */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-4 pb-2 border-b border-[#24262d]">
          Key Functional Deliverables & Rubric Objectives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {[
            'Interactive historical electricity demand visualization with date filtering',
            'Configurable daily and weekly forecast generation with 95% uncertainty intervals',
            'Direct forecast vs actual evaluation with residual deviation tracking',
            'Rigorous 70/30 chronological train/test split preserving temporal integrity',
            'MAE, RMSE, and safe non-zero MAPE metrics benchmarked against seasonal-naive baseline',
            'Automated anomaly detection classifying demand spikes and drops with severity grading',
            'Model introspection reporting hyperparameters, changepoints, and runtime telemetry',
            'Full-stack architecture coupling React frontend and FastAPI backend via Axios',
          ].map((obj, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
              <CheckCircle2 className="w-4 h-4 text-zinc-100 shrink-0 mt-0.5" />
              <span className="text-zinc-300">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. System Architecture Diagram */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-4 pb-2 border-b border-[#24262d]">
          Full-Stack Application Architecture
        </h3>

        <div className="p-6 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs overflow-x-auto text-zinc-300 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 font-bold text-zinc-100 text-center">
              React 19 SPA (Vite + Tailwind CSS v4 + Recharts)
              <div className="text-[10px] text-zinc-400 font-normal">Monochrome Dark UI • Dynamic Routing • Shared State</div>
            </div>

            <div className="text-zinc-500 flex flex-col items-center">
              <span>↓</span>
              <span className="text-[10px]">Axios HTTP API Requests (Bearer Token / JSON Payloads)</span>
              <span>↓</span>
            </div>

            <div className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 font-bold text-zinc-100 text-center">
              FastAPI RESTful Backend (/api/v1)
              <div className="text-[10px] text-zinc-400 font-normal">Pydantic Schemas • CORS Middleware • Unified Error Handlers</div>
            </div>

            <div className="text-zinc-500 flex flex-col items-center">
              <span>↓</span>
              <span className="text-[10px]">Asynchronous Service Delegation</span>
              <span>↓</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-center">
              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Data & Anomaly Service</div>
                <div className="text-[10px] text-zinc-400">Statistical Thresholding</div>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Prophet Engine</div>
                <div className="text-[10px] text-zinc-400">GAM + Fallback Forecaster</div>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/80 border border-zinc-800">
                <div className="font-semibold text-zinc-200">Evaluation Service</div>
                <div className="text-[10px] text-zinc-400">70/30 Split • MAE / RMSE</div>
              </div>
            </div>

            <div className="text-zinc-500 flex flex-col items-center pt-1">
              <span>↓</span>
              <span className="text-[10px]">Open Power System Data (OPSD) Historical Ingestion (Germany Grid, 2,100 Daily Observations, 2015–2020)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Technology Stack Specification */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-4 pb-2 border-b border-[#24262d]">
          Strict Technology Stack Alignment
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#24262d] text-zinc-400">
                <th className="py-2.5 px-3">Layer</th>
                <th className="py-2.5 px-3">Selected Technology</th>
                <th className="py-2.5 px-3">Role & Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#24262d]/50 text-zinc-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Frontend Framework</td>
                <td className="py-2.5 px-3">React 19 + Vite</td>
                <td className="py-2.5 px-3 text-zinc-400">Component architecture, declarative rendering, client-side routing</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Styling & Theme</td>
                <td className="py-2.5 px-3">Tailwind CSS v4</td>
                <td className="py-2.5 px-3 text-zinc-400">Dark theme with monochrome high-contrast design system</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">HTTP Client</td>
                <td className="py-2.5 px-3">Axios</td>
                <td className="py-2.5 px-3 text-zinc-400">Centralized client instance, interceptors, error extraction</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Data Visualization</td>
                <td className="py-2.5 px-3">Recharts</td>
                <td className="py-2.5 px-3 text-zinc-400">Interactive line charts, confidence interval envelopes, error bars</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Backend API</td>
                <td className="py-2.5 px-3">FastAPI + Uvicorn</td>
                <td className="py-2.5 px-3 text-zinc-400">High-performance async Python web framework with auto OpenAPI docs</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Data Processing</td>
                <td className="py-2.5 px-3">pandas + numpy</td>
                <td className="py-2.5 px-3 text-zinc-400">Time-series data manipulation, statistical aggregations, vector math</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Forecasting Engine</td>
                <td className="py-2.5 px-3">Prophet (Trained on 2,100 OPSD Observations)</td>
                <td className="py-2.5 px-3 text-zinc-400">Additive regression modeling with automatic changepoint flexibility</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-zinc-200">Automated Testing</td>
                <td className="py-2.5 px-3">pytest + FastAPI TestClient</td>
                <td className="py-2.5 px-3 text-zinc-400">59 comprehensive backend unit and integration test assertions across 4 suites</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Data Governance & Operational Scope */}
      <div className="bg-[#121316] border border-[#24262d] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-100 mb-3 pb-2 border-b border-[#24262d]">
          Data Governance & Operational Scope
        </h3>

        <div className="space-y-3 text-xs font-mono text-zinc-400 leading-relaxed">
          <p>
            <strong className="text-zinc-200">Historical Dataset:</strong> This application operates on real
            historical electricity load telemetry from the <span className="text-zinc-100 font-bold">Open Power System Data (OPSD)</span> platform
            for the Germany transmission grid (<code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">DE_load_actual_entsoe_transparency</code>),
            spanning 2,100 daily observations from January 1, 2015 to September 30, 2020.
          </p>
          <p>
            <strong className="text-zinc-200">Forecasting Boundaries:</strong> Historical observations conclude on September 30, 2020.
            All forward projections generated by Prophet represent out-of-sample historical extrapolations from this cutoff date,
            rather than live 2026 grid load measurements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
