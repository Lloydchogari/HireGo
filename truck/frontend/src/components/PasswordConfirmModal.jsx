import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

// Reusable modal that re-checks the current driver's password before a
// sensitive action (logging out, deleting a listing). Verification happens
// server-side via /auth/verify-password - this component never decides on
// its own whether a password is correct.
export default function PasswordConfirmModal({
  open,
  title = 'Confirm password',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onClose,
  onConfirmed,
}) {
  const { token } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setPassword('');
    setShowPassword(false);
    setError('');
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.verifyPassword(password, token);
      setPassword('');
      setShowPassword(false);
      setSubmitting(false);
      onConfirmed();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={resetAndClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {message ? <p className="modal-message">{message}</p> : null}

        {error ? <p className="login-error">{error}</p> : null}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <input
                className="login-input has-toggle"
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline btn-compact" onClick={resetAndClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={danger ? 'btn btn-delete btn-compact' : 'btn btn-primary btn-compact'}
              disabled={submitting}
            >
              {submitting ? 'Checking...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}