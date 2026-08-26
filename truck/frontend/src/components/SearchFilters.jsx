import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchFilters({ filters, onChange }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const update = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div>
      <div className="search-row">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search trucks e.g. '1 tonne', 'tipper'..."
            value={filters.q || ''}
            onChange={update('q')}
          />
        </div>
        <button
          type="button"
          className={`filter-toggle${panelOpen ? ' active' : ''}`}
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Filters"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {panelOpen && (
        <div className="filter-panel">
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. Harare"
              value={filters.location || ''}
              onChange={update('location')}
            />
          </div>
          <div className="field">
            <label>Min tonnes</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 1"
              value={filters.minCapacity || ''}
              onChange={update('minCapacity')}
            />
          </div>
          <div className="field">
            <label>Max tonnes</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 10"
              value={filters.maxCapacity || ''}
              onChange={update('maxCapacity')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
