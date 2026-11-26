import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid demonstration credentials. Try demo@example.com / demo123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle monochrome ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 font-bold mb-3 shadow-md">
            <Activity className="w-6 h-6 text-zinc-950" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Energy Demand Forecasting Tool
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Time-Series Analytics & Grid Anomaly Monitoring
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            <span>OPSD DATA — GERMANY GRID (2015–2020)</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#121316] border border-[#24262d] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-zinc-100">Sign in to Console</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter demonstration credentials to access the forecasting dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-900/60 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow hover:shadow-zinc-700/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-6 pt-5 border-t border-[#24262d]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400 font-mono text-[11px]">Demo Credentials:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-mono text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                Auto-fill Demo Credentials
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
              <div>Email: <span className="text-zinc-200">demo@example.com</span></div>
              <div>Password: <span className="text-zinc-200">demo123</span></div>
            </div>
          </div>
        </div>

        {/* Disclaimer footer */}
        <p className="mt-6 text-center text-[11px] text-zinc-500 max-w-sm mx-auto">
          Academic semester demonstration application. Evaluates real Open Power System Data (OPSD) Germany electricity demand with Prophet.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
