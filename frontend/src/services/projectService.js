import api from './api';

const projectService = {
  getAll: () => api.get('/projects').then(r => r.data),
  getById: (id) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data) => api.post('/projects', data).then(r => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/projects/${id}`).then(r => r.data),
  getStats: (id) => api.get(`/projects/${id}/stats`).then(r => r.data),
};

export default projectService;
