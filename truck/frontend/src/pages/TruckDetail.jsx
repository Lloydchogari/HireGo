import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { api, TRUCK_TYPES } from '../api';

function typeLabel(value) {
  return TRUCK_TYPES.find((t) => t.value === value)?.label || value;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export default function TruckDetail() {
  const { id } = useParams();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getTruck(id)
      .then((data) => setTruck(data.truck))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = (type) => {
    api.logContact(id, type).catch(() => {}); // fire-and-forget, never blocks the action
  };

  const callHref = truck ? `tel:${truck.driver_phone}` : '#';
  const whatsappHref = truck
    ? `https://wa.me/${(truck.driver_whatsapp || truck.driver_phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in hiring your ${truck.title} (found on Truck Hire ZW).`
      )}`
    : '#';

  if (loading) return <div className="container"><div className="loading">Loading listing...</div></div>;
  if (error) return <div className="container"><div className="form-error">{error}</div></div>;
  if (!truck) return null;

  return (
    <div className="container" style={{ maxWidth: 640, paddingBottom: 48 }}>
      <p style={{ marginTop: 20 }}>
        <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to search
        </Link>
      </p>

      <div className="detail-photo">
        {truck.photo_url ? <img src={truck.photo_url} alt={truck.title} /> : 'No Photo'}
      </div>

      <span className="pill">{typeLabel(truck.truck_type)}</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '10px 0 4px' }}>{truck.title}</h1>
      <div className="detail-location">
        <MapPin size={15} />
        {truck.location}
      </div>

      {truck.price_guide && (
        <p style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>{truck.price_guide}</p>
      )}

      {truck.description && (
        <>
          <h2 className="section-title">About this truck</h2>
          <p>{truck.description}</p>
        </>
      )}

      <h2 className="section-title">Owner / driver</h2>
      <div className="detail-owner-row">
        <span className="owner-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
          {initials(truck.driver_name)}
        </span>
        <div>
          {truck.driver_name}
          {truck.is_phone_verified && <span className="pill" style={{ marginLeft: 8 }}>Verified</span>}
        </div>
      </div>

      <div className="contact-row">
        <a href={callHref} className="btn btn-primary" onClick={() => handleContact('call')}>
          <Phone size={16} /> Call {truck.driver_name?.split(' ')[0]}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          onClick={() => handleContact('whatsapp')}
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-grey-600)' }}>
        Truck Hire ZW connects you with the driver. Price, availability and payment are agreed directly between you and the driver.
      </p>
    </div>
  );
}
