import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register:  (data)     => api.post('/auth/register', data).then((r) => r.data),
  login:     (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  getMe:     ()         => api.get('/auth/me').then((r) => r.data),
  updateMe:  (data)     => api.put('/auth/me', data).then((r) => r.data),
};

export const taskApi = {
  getAll:        ()         => api.get('/tasks').then((r) => r.data),
  getTrash:      ()         => api.get('/tasks/trash').then((r) => r.data),
  create:        (data)     => api.post('/tasks', data).then((r) => r.data),
  update:        (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  remove:        (id)       => api.delete(`/tasks/${id}`).then((r) => r.data),
  restore:       (id)       => api.patch(`/tasks/${id}/restore`).then((r) => r.data),
  permanentDelete:(id)      => api.delete(`/tasks/${id}/permanent`).then((r) => r.data),
  toggleDone:    (id)       => api.patch(`/tasks/${id}/toggle`).then((r) => r.data),
  addComment:    (id, body) => api.post(`/tasks/${id}/comments`, { body }).then((r) => r.data),
  reorder:       (updates)  => api.post('/tasks/reorder', { updates }).then((r) => r.data),
};

export const aiApi = {
  suggest:      (title, notes) => api.post('/ai/suggest', { title, notes }).then((r) => r.data),
  subtasks:     (title, notes) => api.post('/ai/subtasks', { title, notes }).then((r) => r.data),
  misclassify:  (title, notes, currentQuadrant) => api.post('/ai/misclassify', { title, notes, currentQuadrant }).then((r) => r.data),
};

export const authApiExtra = {
  forgotPassword: (email)           => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword:  (token, password) => api.post('/auth/reset-password', { token, password }).then((r) => r.data),
};

export default api;
