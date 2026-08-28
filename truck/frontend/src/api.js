const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.');
  }
  return data;
}

async function uploadFile(path, file, token) {
  const formData = new FormData();
  formData.append('photo', file);

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Could not upload that image. Please try again.');
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  verifyPassword: (password, token) => request('/auth/verify-password', { method: 'POST', body: { password }, token }),

  // Trucks (public)
  listTrucks: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/trucks${qs ? `?${qs}` : ''}`);
  },
  getTruck: (id) => request(`/trucks/${id}`),
  logContact: (id, type) => request(`/trucks/${id}/contact`, { method: 'POST', body: { type } }),

  // Trucks (driver only)
  myTrucks: (token) => request('/trucks/mine', { token }),
  createTruck: (payload, token) => request('/trucks', { method: 'POST', body: payload, token }),
  updateTruck: (id, payload, token) => request(`/trucks/${id}`, { method: 'PUT', body: payload, token }),
  deleteTruck: (id, token) => request(`/trucks/${id}`, { method: 'DELETE', token }),

  // Photo upload (driver only) - returns { url }
  uploadPhoto: (file, token) => uploadFile('/uploads/photo', file, token),

  // Driver dashboard
  dashboard: (token) => request('/drivers/dashboard', { token }),
};

export const TRUCK_TYPES = [
  { value: 'pickup', label: 'Pickup' },
  { value: '1_ton', label: '1 Tonne Truck' },
  { value: '3_ton', label: '3 Tonne Truck' },
  { value: '5_ton', label: '5 Tonne Truck' },
  { value: '7_ton', label: '7 Tonne Truck' },
  { value: '10_ton', label: '10 Tonne Truck' },
  { value: 'tipper', label: 'Tipper Truck' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'other', label: 'Other' },
];