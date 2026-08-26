import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DriverSignup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', phone: '', whatsapp: '', email: '', city: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-hero">
        <div className="signup-hero-title">List your truck</div>
      </div>

      <div className="signup-card-wrap">
        <div className="signup-card">
          <p className="subtitle">Create a free driver account to start posting your truck for hire.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Full name</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  required
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="e.g. Tinashe Moyo"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Phone number</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  required
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+263 7X XXX XXXX"
                />
              </div>
            </div>

            <div className="login-field">
              <label>WhatsApp number (if different)</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  value={form.whatsapp}
                  onChange={update('whatsapp')}
                  placeholder="Leave blank to use phone number"
                />
              </div>
            </div>

            <div className="login-field">
              <label>City</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  value={form.city}
                  onChange={update('city')}
                  placeholder="e.g. Harare"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Email (optional)</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <input
                  className="login-input has-toggle"
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="field-hint">At least 6 characters.</div>
            </div>

            <button className="login-submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="signup-link">
            Already have an account? <Link to="/driver/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}