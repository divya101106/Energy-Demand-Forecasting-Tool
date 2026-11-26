import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('energy_forecast_token');
    const savedUser = localStorage.getItem('energy_forecast_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('energy_forecast_token');
        localStorage.removeItem('energy_forecast_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('energy_forecast_token', data.token);
      localStorage.setItem('energy_forecast_user', JSON.stringify(data.user));
      return data;
    }
    throw new Error('Authentication failed');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('energy_forecast_token');
      localStorage.removeItem('energy_forecast_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
