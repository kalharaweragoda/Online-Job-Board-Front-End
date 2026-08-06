import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE,
});

// Attach access token to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  me: () => client.get('/auth/me/'),
};

export const jobAPI = {
  list: (params) => client.get('/jobs/', { params }),
  dashboard: () => client.get('/jobs/dashboard/'),
  create: (data) => client.post('/jobs/create/', data),
  update: (id, data) => client.patch(`/jobs/${id}/`, data),
};

export const applicationAPI = {
  apply: (data) => client.post('/applications/', data),
  mine: () => client.get('/applications/me/'),
  forJob: (jobId) => client.get(`/applications/job/${jobId}/`),
  updateStatus: (id, status) => client.patch(`/applications/${id}/status/`, { status }),
};

export const categoryAPI = {
  list: () => client.get('/categories/'),
};

export const companyAPI = {
  create: (data) => client.post('/companies/', data),
  me: () => client.get('/companies/me/'),
};

export default client;