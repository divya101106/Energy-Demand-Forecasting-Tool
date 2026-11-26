import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoricalPage from './pages/HistoricalPage';
import ForecastPage from './pages/ForecastPage';
import ComparisonPage from './pages/ComparisonPage';
import PerformancePage from './pages/PerformancePage';
import AnomaliesPage from './pages/AnomaliesPage';
import ModelInfoPage from './pages/ModelInfoPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/historical" element={<HistoricalPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/anomalies" element={<AnomaliesPage />} />
              <Route path="/model-info" element={<ModelInfoPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
