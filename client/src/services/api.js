import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const taskApi = {
  getAll:       ()         => api.get('/tasks').then((r) => r.data),
  create:       (data)     => api.post('/tasks', data).then((r) => r.data),
  update:       (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data),
  remove:       (id)       => api.delete(`/tasks/${id}`).then((r) => r.data),
  toggleDone:   (id)       => api.patch(`/tasks/${id}/toggle`).then((r) => r.data),
};

export const aiApi = {
  suggest: (title, notes) => api.post('/ai/suggest', { title, notes }).then((r) => r.data),
};

export default api;
