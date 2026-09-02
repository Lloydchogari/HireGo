import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, TRUCK_TYPES } from '../api';
import TruckCard from '../components/TruckCard';
import SearchFilters from '../components/SearchFilters';

const CATEGORIES = [{ value: '', label: 'All' }, ...TRUCK_TYPES];

export default function Home() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '', type: '', location: '', minCapacity: '', maxCapacity: '',
  });
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrucks = useCallback((f) => {
    setLoading(true);
    setError('');
    api
      .listTrucks(f)
      .then((data) => setTrucks(data.trucks))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Keep the search box in sync with ?q= in the URL even when Home is
  // already mounted (e.g. a search triggered from the navbar while already
  // on this page doesn't remount the component, only updates the URL).
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setFilters((f) => (f.q === q ? f : { ...f, q }));
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTrucks(filters), 350);
    return () => clearTimeout(timeout);
  }, [filters, fetchTrucks]);

  return (
    <div>
      <div className="home-hero-blue">
        <div className="container">
          <div className="landing-head">
            <div className="eyebrow">Find a truck near you</div>
            <h1>What are you moving today?</h1>
          </div>

          <SearchFilters filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div className="container">
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
      </div>
    </div>
  );
}