const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://gestionannuaire-3a46.onrender.com/api';

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
  getUsers: (token) => request('/auth/users', { token }),
  createUser: (token, data) => request('/auth/users', { token, method: 'POST', body: data }),
  getGrades: (token) => request('/grades', { token }),
  createGrade: (token, data) => request('/grades', { token, method: 'POST', body: data }),
  updateGrade: (token, id, data) => request(`/grades/${id}`, { token, method: 'PUT', body: data }),
  deleteGrade: (token, id) => request(`/grades/${id}`, { token, method: 'DELETE' }),
  getPastors: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/pastors?${query.toString()}`, { token });
  },
  searchPastors: (token, params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/pastors/search?${query.toString()}`, { token });
  },
  createPastor: (token, data) => request('/pastors', { token, method: 'POST', body: data }),
  updatePastor: (token, id, data) => request(`/pastors/${id}`, { token, method: 'PUT', body: data }),
  deletePastor: (token, id) => request(`/pastors/${id}`, { token, method: 'DELETE' }),
  getPostes: (token) => request('/postes', { token }),
  createPoste: (token, data) => request('/postes', { token, method: 'POST', body: data }),
  updatePoste: (token, id, data) => request(`/postes/${id}`, { token, method: 'PUT', body: data }),
  deletePoste: (token, id) => request(`/postes/${id}`, { token, method: 'DELETE' })
};
