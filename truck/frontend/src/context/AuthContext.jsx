import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('th_token'));
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me(token)
      .then((data) => setDriver(data.driver))
      .catch(() => {
        // token expired/invalid
        localStorage.removeItem('th_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (phone, password) => {
    const data = await api.login({ phone, password });
    localStorage.setItem('th_token', data.token);
    setToken(data.token);
    setDriver(data.driver);
    return data.driver;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem('th_token', data.token);
    setToken(data.token);
    setDriver(data.driver);
    return data.driver;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('th_token');
    setToken(null);
    setDriver(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, driver, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
