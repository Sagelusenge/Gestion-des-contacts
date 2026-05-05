import apiClient from './api';

export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken })
};

export const pasteurService = {
  list: (params) => apiClient.get('/pasteurs', { params }),
  getById: (id) => apiClient.get(`/pasteurs/${id}`),
  create: (data) => apiClient.post('/pasteurs', data),
  update: (id, data) => apiClient.put(`/pasteurs/${id}`, data),
  delete: (id) => apiClient.delete(`/pasteurs/${id}`)
};

export const geographieService = {
  getPostes: (params) => apiClient.get('/geographie/postes', { params }),
  getSections: (params) => apiClient.get('/geographie/sections', { params }),
  getParoisses: (params) => apiClient.get('/geographie/paroisses', { params })
};

export const mouvementService = {
  list: (params) => apiClient.get('/mouvements', { params }),
  create: (data) => apiClient.post('/mouvements', data),
  getAlertes: (params) => apiClient.get('/mouvements/alertes', { params })
};

export const dashboardService = {
  getStatistiques: () => apiClient.get('/dashboard/statistiques'),
  getGeographie: () => apiClient.get('/dashboard/geographie')
};

export const auditService = {
  list: (params) => apiClient.get('/audit', { params })
};

export const messageService = {
  getAudiences: () => apiClient.get('/messages/audiences'),
  list: () => apiClient.get('/messages'),
  inbox: (params) => apiClient.get('/messages/inbox', { params }),
  send: (data) => apiClient.post('/messages', data)
};
