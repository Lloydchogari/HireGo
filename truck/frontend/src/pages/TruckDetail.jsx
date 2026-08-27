import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, BadgeCheck } from 'lucide-react';
import { api, TRUCK_TYPES } from '../api';

function typeLabel(value) {
  return TRUCK_TYPES.find((t) => t.value === value)?.label || value;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// Truncates long descriptions with "..." and a Read more / Show less toggle.
function ExpandableText({ text, limit = 160 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > limit;
  const shown = expanded || !isLong ? text : `${text.slice(0, limit).trimEnd()}...`;

  return (
    <p style={{ margin: 0 }}>
      {shown}
      {isLong ? (
        <React.Fragment>
          {' '}
          <button type="button" className="read-more-btn" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        </React.Fragment>
      ) : null}
    </p>
  );
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

  const callHref = truck ? `tel:${truck.driver_phone}` : '';
  const whatsappHref = truck
    ? `https://wa.me/${(truck.driver_whatsapp || truck.driver_phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hi, I'm interested in hiring your ${truck.title} (found on Truck Hire ZW).`
      )}`
    : '';

  const handleCallClick = () => {
    handleContact('call');
    window.location.href = callHref;
  };

  const handleWhatsappClick = () => {
    handleContact('whatsapp');
    window.open(whatsappHref, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <div className="container"><div className="loading">Loading listing...</div></div>;
  if (error) return <div className="container"><div className="form-error">{error}</div></div>;
  if (!truck) return null;

  return (
    <div style={{ paddingBottom: 48 }}>
      <div className="detail-hero">
        {truck.photo_url ? (
          <img src={truck.photo_url} alt={truck.title} />
        ) : (
          <div className="detail-hero-noimage">No Photo</div>
        )}

        {/* <Link to="/home" className="detail-back-btn" aria-label="Back to search">
          <ArrowLeft size={18} />
        </Link> */}

        <div className="detail-hero-topinfo">
          <div className="detail-hero-left">
            <div className="eyebrow-label"></div>
            <div className="owner-row">
              <span className="owner-avatar">{initials(truck.driver_name)}</span>
              <span className="owner-name">
                {truck.driver_name}
                {truck.is_phone_verified ? <BadgeCheck size={14} className="verified-icon" /> : null}
              </span>
            </div>
          </div>

          <span className="pill pill-red">{typeLabel(truck.truck_type)}</span>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '18px 0 4px' }}>{truck.title}</h1>
        <div className="detail-location">
          <MapPin size={15} />
          {truck.location}
        </div>

        {truck.price_guide ? (
          <p style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>{truck.price_guide}</p>
        ) : null}

        {truck.description ? (
          <React.Fragment>
            <h2 className="section-title">About this truck</h2>
            <ExpandableText text={truck.description} limit={160} />
          </React.Fragment>
        ) : null}

        <div className="contact-row">
          <button type="button" className="btn btn-primary btn-block" onClick={handleCallClick}>
            <Phone size={16} />
            {' '}Call {truck.driver_name ? truck.driver_name.split(' ')[0] : ''}
          </button>

          <button type="button" className="btn btn-whatsapp btn-block" onClick={handleWhatsappClick}>
            <MessageCircle size={16} />
            {' '}WhatsApp
          </button>
        </div>

        <p className="info-note">
          This app connects you with the driver. Price, availability and payment are agreed directly between you and the driver.
        </p>
      </div>
    </div>
  );
}