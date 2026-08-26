import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, TRUCK_TYPES } from '../api';

// Handles both "create new listing" and "edit listing" (if :id is present in the URL).
export default function CreateListing() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', truckType: '', capacityTonnes: '', description: '', location: '', priceGuide: '', photoUrl: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.getTruck(id).then((data) => {
      const t = data.truck;
      setForm({
        title: t.title || '',
        truckType: t.truck_type || '',
        capacityTonnes: t.capacity_tonnes || '',
        description: t.description || '',
        location: t.location || '',
        priceGuide: t.price_guide || '',
        photoUrl: t.photo_url || '',
      });
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Uploads the chosen photo immediately so the person sees it succeed/fail
  // right away, rather than only finding out when they submit the whole form.
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setUploadingPhoto(true);
    try {
      const { url } = await api.uploadPhoto(file, token);
      setForm((f) => ({ ...f, photoUrl: url }));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setUploadingPhoto(false);
      e.target.value = ''; // allow re-selecting the same file if they try again
    }
  };

  const removePhoto = () => setForm((f) => ({ ...f, photoUrl: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.updateTruck(id, form, token);
      } else {
        await api.createTruck(form, token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;

  return (
    <div className="create-listing-page">
      <div className="create-listing-hero">
        <div className="create-listing-hero-title">{isEdit ? 'Edit listing' : 'Post a truck'}</div>
      </div>

      <div className="create-listing-card-wrap">
        <div className="create-listing-card">
          <p className="subtitle">Fill in the details customers will see when they search.</p>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Listing title</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  required
                  value={form.title}
                  onChange={update('title')}
                  placeholder="e.g. Toyota Dyna 1 Tonne Truck"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Truck type</label>
              <div className="login-input-wrap">
                <select className="login-input" required value={form.truckType} onChange={update('truckType')}>
                  <option value="">Select a type</option>
                  {TRUCK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="login-field">
              <label>Capacity (tonnes)</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  type="number"
                  step="0.1"
                  value={form.capacityTonnes}
                  onChange={update('capacityTonnes')}
                  placeholder="e.g. 1"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Location</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  required
                  value={form.location}
                  onChange={update('location')}
                  placeholder="e.g. Harare CBD"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Price guide</label>
              <div className="login-input-wrap">
                <input
                  className="login-input"
                  value={form.priceGuide}
                  onChange={update('priceGuide')}
                  placeholder="e.g. From $30/load, negotiable"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Photo</label>

              {form.photoUrl ? (
                <div className="photo-preview">
                  <img src={form.photoUrl} alt="Truck preview" />
                  <button type="button" className="photo-remove" onClick={removePhoto} aria-label="Remove photo">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="photo-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploadingPhoto}
                    hidden
                  />
                  <ImagePlus size={22} />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Tap to choose a photo'}</span>
                </label>
              )}

              {photoError && <p className="login-error" style={{ marginTop: 8, marginBottom: 0 }}>{photoError}</p>}
              <div className="field-hint">JPG, PNG, WEBP or GIF, up to 5MB.</div>
            </div>

            <div className="login-field">
              <label>Description</label>
              <div className="login-input-wrap">
                <textarea
                  className="login-input login-textarea"
                  rows={4}
                  value={form.description}
                  onChange={update('description')}
                  placeholder="Anything customers should know, e.g. open or closed truck, driver included, etc."
                />
              </div>
            </div>

            <button className="login-submit" disabled={submitting || uploadingPhoto}>
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Post listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}