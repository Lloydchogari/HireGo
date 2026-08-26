import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();

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
                onClick={() => {
                  logout();
                  navigate('/home');
                }}
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
    </header>
  );
}