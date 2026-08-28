import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordConfirmModal from './PasswordConfirmModal';

export default function Navbar() {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogoutConfirmed = () => {
    setConfirmingLogout(false);
    logout();
    navigate('/home');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/home" className="brand">
          <span className="brand-name">Hirego</span>
        </Link>

        <nav className="nav-links nav-links-desktop">
          {driver ? (
            <>
              <Link to="/dashboard" className="btn btn-nav btn-nav-grey btn-sm">Dashboard</Link>
              <button
                className="btn btn-nav btn-nav-white btn-sm"
                onClick={() => setConfirmingLogout(true)}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/driver/login" className="btn btn-nav btn-nav-grey btn-sm">Driver Login</Link>
              <Link to="/driver/signup" className="btn btn-nav btn-nav-white btn-sm">List Your Truck</Link>
            </>
          )}
        </nav>
      </div>

      <PasswordConfirmModal
        open={confirmingLogout}
        title="Confirm password"
        message="Enter your password to log out."
        confirmLabel="Log out"
        onClose={() => setConfirmingLogout(false)}
        onConfirmed={handleLogoutConfirmed}
      />
    </header>
  );
}