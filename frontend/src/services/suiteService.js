import api from './api';

const suiteService = {
  getByProject: (pid) => api.get(`/projects/${pid}/suites`).then(r => r.data),
  getById: (id) => api.get(`/suites/${id}`).then(r => r.data),
  create: (pid, data) => api.post(`/projects/${pid}/suites`, data).then(r => r.data),
  update: (id, data) => api.put(`/suites/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/suites/${id}`).then(r => r.data),
};

export default suiteService;
