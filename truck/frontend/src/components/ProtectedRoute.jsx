import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps driver-only pages (dashboard, create listing, etc).
// Customers browsing/hiring trucks never hit this - only drivers need accounts.
export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!token) return <Navigate to="/driver/login" replace />;

  return children;
}
