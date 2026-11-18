import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicpulse_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on landing page, only if accessing protected routes
      if (window.location.pathname.includes('/command-center')) {
        localStorage.removeItem('civicpulse_token');
        localStorage.removeItem('civicpulse_user');
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth APIs ──────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; ward?: string; phone?: string }) =>
    apiClient.post('/auth/register', data),
  getMe: () =>
    apiClient.get('/auth/me')
};

// ── Incident APIs ──────────────────────────────────────────────
export const incidentApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get('/incidents', { params }),
  getById: (id: string) =>
    apiClient.get(`/incidents/${id}`),
  create: (formData: FormData) =>
    apiClient.post('/incidents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id: string, data: { status?: string; priority?: string; assigned_dept?: string; remark?: string }) =>
    apiClient.patch(`/incidents/${id}`, data),
  getMyIncidents: () =>
    apiClient.get('/incidents/my/list')
};

// ── Dashboard APIs ─────────────────────────────────────────────
export const dashboardApi = {
  getKPIs: () =>
    apiClient.get('/dashboard/kpis'),
  getAnalytics: () =>
    apiClient.get('/dashboard/analytics')
};

// ── Map APIs ───────────────────────────────────────────────────
export const mapApi = {
  getGeoJSON: (params?: Record<string, any>) =>
    apiClient.get('/map/incidents', { params }),
  getHotspots: () =>
    apiClient.get('/map/hotspots'),
  getNearby: (lat: number, lng: number, radius?: number, category?: string) =>
    apiClient.get('/map/nearby', { params: { lat, lng, radius, category } })
};

// ── Evidence APIs ──────────────────────────────────────────────
export const evidenceApi = {
  upload: (incidentId: string, formData: FormData) =>
    apiClient.post(`/evidence/${incidentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  list: (incidentId: string) =>
    apiClient.get(`/evidence/${incidentId}`)
};

// ── Feedback APIs ──────────────────────────────────────────────
export const feedbackApi = {
  submit: (incidentId: string, data: { rating?: number; feedback_text?: string; is_satisfied?: boolean; challenge_flag?: boolean; challenge_reason?: string }) =>
    apiClient.post(`/feedback/${incidentId}`, data),
  list: (incidentId: string) =>
    apiClient.get(`/feedback/${incidentId}`)
};

// ── Direct AI Client (for real-time triage preview) ────────────
export const aiApi = {
  quickAnalyze: (formData: FormData) =>
    axios.post(`${AI_BASE}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};
