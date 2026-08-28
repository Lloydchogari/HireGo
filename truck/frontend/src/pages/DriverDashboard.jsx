import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, TRUCK_TYPES } from '../api';
import PasswordConfirmModal from '../components/PasswordConfirmModal';

function typeLabel(value) {
  return TRUCK_TYPES.find((t) => t.value === value)?.label || value;
}

export default function DriverDashboard() {
  const { token, driver } = useAuth();
  const [stats, setStats] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showListings, setShowListings] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.dashboard(token), api.myTrucks(token)])
      .then(([statsData, trucksData]) => {
        setStats(statsData);
        setTrucks(trucksData.trucks);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirmed = async () => {
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await api.deleteTruck(id, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (truck) => {
    try {
      await api.updateTruck(truck.id, { status: truck.status === 'active' ? 'paused' : 'active' }, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading your dashboard...</div></div>;
  if (error) return <div className="container"><div className="form-error">{error}</div></div>;

  const activeListings = trucks.filter((t) => t.status === 'active').length;

  return (
    <div className="container" style={{ paddingBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: 0 }}>Welcome, {driver?.full_name?.split(' ')[0]}</h1>
          <p style={{ color: 'var(--color-gray-600)', margin: '4px 0 0' }}>Manage your truck listings below.</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/dashboard/new" className="btn btn-accent btn-compact">+ Post a truck</Link>
          <button type="button" className="btn btn-outline btn-compact" onClick={() => setShowListings((v) => !v)}>
            {showListings ? 'Hide Listings' : 'Manage Listings'}
          </button>
        </div>
      </div>

      {stats?.subscriptionStatus === 'trial' && (
        <div className="subscription-banner">
          You're on a free trial. Paid plans (from $2/month, with a featured "Top of search" boost option) are coming soon.
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-box">
          <div className="value">{stats?.totalListings ?? 0}</div>
          <div className="label">Listings</div>
        </div>
        <div className="stat-box">
          <div className="value">{activeListings}</div>
          <div className="label">Active listings</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats?.totalViews ?? 0}</div>
          <div className="label">Total views</div>
        </div>
        <div className="stat-box">
          <div className="value">{stats?.totalContacts ?? 0}</div>
          <div className="label">Calls + WhatsApp</div>
        </div>
      </div>

      {showListings ? (
        <div className="listings-panel">
          <h2 className="section-title">Your listings</h2>

          {trucks.length === 0 ? (
            <div className="empty-state">
              <h3>No listings yet</h3>
              <p>Post your first truck so customers can find and contact you.</p>
            </div>
          ) : null}

          {trucks.map((truck) => (
            <div className="listing-row" key={truck.id}>
              <div>
                <span className="pill">{typeLabel(truck.truck_type)}</span>
                <div style={{ fontWeight: 700, marginTop: 6 }}>{truck.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {truck.location} &middot; {truck.status === 'active' ? 'Active' : 'Paused'} &middot; {truck.view_count} views &middot; {truck.contact_count} contacts
                </div>
              </div>
              <div className="listing-row-actions">
                <button className="btn btn-outline btn-compact" onClick={() => handleToggleStatus(truck)}>
                  {truck.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <Link to={`/dashboard/edit/${truck.id}`} className="btn btn-outline btn-compact">Edit</Link>
                <button className="btn btn-delete btn-compact" onClick={() => setPendingDeleteId(truck.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <PasswordConfirmModal
        open={pendingDeleteId !== null}
        title="Confirm password"
        message="Enter your password to delete this listing. This cannot be undone."
        confirmLabel="Delete listing"
        danger
        onClose={() => setPendingDeleteId(null)}
        onConfirmed={handleDeleteConfirmed}
      />
    </div>
  );
}