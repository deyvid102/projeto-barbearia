const BASE_URL = 'http://localhost:3000';

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    return handleResponse(res);
  },

  post: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  patch: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};

async function handleResponse(res) {
  let data;
  const contentType = res.headers.get("content-type");
  
  try {
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
      // Tentativa de parse manual caso o JSON venha mal formatado do backend
      if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
        try { data = JSON.parse(data); } catch (e) { /* mantém como texto */ }
      }
    }
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || `Erro ${res.status}`);
    error.status = res.status;
    error.response = { data: data || { message: 'Erro interno no servidor' } };
    throw error;
  }

  return data;
}