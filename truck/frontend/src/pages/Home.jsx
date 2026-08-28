import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, TRUCK_TYPES } from '../api';
import { useAuth } from '../context/AuthContext';
import TruckCard from '../components/TruckCard';
import SearchFilters from '../components/SearchFilters';
import PasswordConfirmModal from '../components/PasswordConfirmModal';

const CATEGORIES = [{ value: '', label: 'All' }, ...TRUCK_TYPES];

export default function Home() {
  const { driver, logout } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ q: '', type: '', location: '', minCapacity: '', maxCapacity: '' });
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const fetchTrucks = useCallback((f) => {
    setLoading(true);
    setError('');
    api
      .listTrucks(f)
      .then((data) => setTrucks(data.trucks))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTrucks({});
  }, [fetchTrucks]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTrucks(filters), 350);
    return () => clearTimeout(timeout);
  }, [filters, fetchTrucks]);

  const handleLogoutConfirmed = () => {
    setConfirmingLogout(false);
    logout();
    navigate('/home');
  };

  return (
    <div className="container">
      <div className="landing-head">
        <div className="eyebrow">Find a truck near you</div>
        <h1>What are you moving today?</h1>

        <div className="hero-actions">
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
        </div>
      </div>

      <SearchFilters filters={filters} onChange={setFilters} />

      <div className="category-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`category-chip${filters.type === cat.value ? ' active' : ''}`}
            onClick={() => setFilters({ ...filters, type: cat.value })}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && <div className="loading">Loading trucks...</div>}
      {error && <div className="form-error">{error}</div>}

      {!loading && !error && trucks.length === 0 && (
        <div className="empty-state">
          <h3>No trucks match your search</h3>
          <p>Try a different truck type or location.</p>
        </div>
      )}

      {!loading && trucks.length > 0 && (
        <div className="truck-list">
          {trucks.map((truck) => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}

      <PasswordConfirmModal
        open={confirmingLogout}
        title="Confirm password"
        message="Enter your password to log out."
        confirmLabel="Log out"
        onClose={() => setConfirmingLogout(false)}
        onConfirmed={handleLogoutConfirmed}
      />
    </div>
  );
}