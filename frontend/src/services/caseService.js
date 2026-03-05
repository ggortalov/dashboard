import api from './api';

const caseService = {
  getBySection: (sid) => api.get(`/sections/${sid}/cases`).then(r => r.data),
  getBySuite: (sid) => api.get(`/suites/${sid}/cases`).then(r => r.data),
  getById: (id) => api.get(`/cases/${id}`).then(r => r.data),
  create: (data) => api.post('/cases', data).then(r => r.data),
  update: (id, data) => api.put(`/cases/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/cases/${id}`).then(r => r.data),
};

export default caseService;
