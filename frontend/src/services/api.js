const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { token, method = 'GET', body } = {}) {
  const headers = {
    Accept: 'application/json'
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Erreur reseau.');
  }

  return payload;
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getPublicAppreciations: () => request('/appreciations/public'),
  getAppreciations: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/appreciations?${query.toString()}`, { token });
  },
  createAppreciation: (token, data) => request('/appreciations', { token, method: 'POST', body: data }),
  updateAppreciationStatus: (token, id, status) => request(`/appreciations/${id}/status`, { token, method: 'PATCH', body: { status } }),
  getGrades: (token) => request('/grades', { token }),
  createGrade: (token, data) => request('/grades', { token, method: 'POST', body: data }),
  updateGrade: (token, id, data) => request(`/grades/${id}`, { token, method: 'PUT', body: data }),
  deleteGrade: (token, id) => request(`/grades/${id}`, { token, method: 'DELETE' }),
  getFonctions: (token) => request('/grades', { token }),
  createFonction: (token, data) => request('/grades', { token, method: 'POST', body: data }),
  updateFonction: (token, id, data) => request(`/grades/${id}`, { token, method: 'PUT', body: data }),
  deleteFonction: (token, id) => request(`/grades/${id}`, { token, method: 'DELETE' }),
  getPastors: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/pastors?${query.toString()}`, { token });
  },
  searchPastors: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/pastors/search?${query.toString()}`, { token });
  },
  createPastor: (token, data) => request('/pastors', { token, method: 'POST', body: data }),
  importPastors: (token, rows) => request('/pastors/import', { token, method: 'POST', body: { rows } }),
  updatePastor: (token, id, data) => request(`/pastors/${id}`, { token, method: 'PUT', body: data }),
  deletePastor: (token, id) => request(`/pastors/${id}`, { token, method: 'DELETE' }),
  getWhatsappStatus: (token) => request('/broadcasts/whatsapp/status', { token }),
  sendWhatsappBroadcast: (token, data) => request('/broadcasts/whatsapp', { token, method: 'POST', body: data }),
  getPayments: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/payments?${query.toString()}`, { token });
  },
  createPayment: (token, data) => request('/payments', { token, method: 'POST', body: data }),
  updatePaymentStatus: (token, id, status) => request(`/payments/${id}/status`, { token, method: 'PATCH', body: { status } }),
  getPostes: (token) => request('/postes', { token }),
  createPoste: (token, data) => request('/postes', { token, method: 'POST', body: data }),
  updatePoste: (token, id, data) => request(`/postes/${id}`, { token, method: 'PUT', body: data }),
  deletePoste: (token, id) => request(`/postes/${id}`, { token, method: 'DELETE' })
};
