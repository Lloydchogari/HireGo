import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Splash from './pages/Splash';
import Home from './pages/Home';
import TruckDetail from './pages/TruckDetail';
import DriverLogin from './pages/DriverLogin';
import DriverSignup from './pages/DriverSignup';
import DriverDashboard from './pages/DriverDashboard';
import CreateListing from './pages/CreateListing';

export default function App() {
  const location = useLocation();
  const isSplash = location.pathname === '/';

  return (
    <>
      {!isSplash && <Navbar />}
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/trucks/:id" element={<TruckDetail />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/signup" element={<DriverSignup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/new"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/edit/:id"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
      </Routes>
      {!isSplash && (
        <footer className="site-footer">
          <div className="container">
            HireGo.zw@2026.Connecting truck owners with the people who need them.
          </div>
        </footer>
      )}
    </>
  );
}
