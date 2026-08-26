import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Truck as TruckIcon } from 'lucide-react';
import { TRUCK_TYPES } from '../api';

function typeLabel(value) {
  return TRUCK_TYPES.find((t) => t.value === value)?.label || value;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function TruckCard({ truck }) {
  return (
    <Link to={`/trucks/${truck.id}`} className="truck-card">
      <div className="truck-card-photo">
        {truck.boosted_active && <span className="badge-boosted">Featured</span>}
        {truck.photo_url ? (
          <img src={truck.photo_url} alt={truck.title} />
        ) : (
          <TruckIcon size={30} strokeWidth={1.5} />
        )}
      </div>

      <div className="truck-card-body">
        <span className="pill">{typeLabel(truck.truck_type)}</span>
        <div className="truck-card-title">{truck.title}</div>
        <div className="truck-card-location">
          <MapPin size={14} />
          {truck.location}
        </div>
        <div className="truck-card-footer">
          <span className="hire-btn">Hire</span>
          <span className="owner-avatar" title={truck.driver_name}>
            {initials(truck.driver_name)}
          </span>
        </div>
      </div>
    </Link>
  );
}
