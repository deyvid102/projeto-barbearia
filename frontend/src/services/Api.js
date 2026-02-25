const BASE_URL = 'http://localhost:3000';

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) {
      // Criamos um erro customizado que carrega o status (ex: 404)
      const error = new Error(`erro ${res.status}`);
      error.status = res.status; 
      throw error;
    }
    return res.json();
  },
  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = new Error(`erro ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
  patch: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const txt = await res.text();
      const error = new Error(txt);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const txt = await res.text();
      const error = new Error(txt);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = new Error(`erro ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return res.json();
  }
};