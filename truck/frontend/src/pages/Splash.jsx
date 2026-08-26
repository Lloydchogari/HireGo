import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function TruckScene() {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="500" fill="#F2F2F2" />
      <circle cx="320" cy="90" r="46" fill="none" stroke="#B0B0B0" strokeWidth="3" />
      <rect x="20" y="230" width="34" height="120" fill="#E4E4E4" />
      <rect x="64" y="200" width="26" height="150" fill="#E4E4E4" />
      <rect x="320" y="210" width="30" height="140" fill="#E4E4E4" />
      <rect x="360" y="250" width="24" height="100" fill="#E4E4E4" />
      <rect x="0" y="350" width="400" height="150" fill="#121212" />
      <g stroke="#FFFFFF" strokeWidth="6" strokeDasharray="26 22">
        <line x1="0" y1="425" x2="400" y2="425" />
      </g>
      <g>
        <rect x="60" y="255" width="150" height="95" rx="4" fill="#121212" />
        <path d="M210 300 h55 l30 35 v20 h-85 z" fill="#121212" />
        <path d="M222 308 h35 l16 20 h-51 z" fill="#F2F2F2" />
        <circle cx="105" cy="358" r="24" fill="#121212" />
        <circle cx="105" cy="358" r="9" fill="#F2F2F2" />
        <circle cx="245" cy="358" r="24" fill="#121212" />
        <circle cx="245" cy="358" r="9" fill="#F2F2F2" />
        <rect x="85" y="345" width="180" height="10" fill="#121212" />
      </g>
    </svg>
  );
}

export default function Splash() {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="splash">
      <div className="splash-visual">
        {!imageFailed ? (
          <>
            <img
              src="/truck.jpg"
              alt="Truck available for hire"
              className="splash-photo"
              onError={() => setImageFailed(true)}
            />
            <div className="splash-photo-overlay" />
          </>
        ) : (
          <TruckScene />
        )}
      </div>
      <div className="splash-sheet">
        <div className="eyebrow">Truck Hire ZW</div>
        <h1>Move anything.<br />Hire a truck in minutes.</h1>
        <p>
          Browse pickups and lorries listed by owners near you, then connect
          directly; no waiting, no calling around.
        </p>
        <button className="btn" onClick={() => navigate('/home')}>
          Get Started
        </button>
      </div>
    </div>
  );
}