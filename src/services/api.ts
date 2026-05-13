const BASE_URL = 'https://cv-api-uleg.onrender.com';

export const api = {
  async register(username: string, password: string) {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'Error al registrar usuario');
    }
    return res.json();
  },

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'Credenciales incorrectas');
    }
    return res.json();
  },

  async getApiKey(username: string, password: string): Promise<{ api_key: string }> {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);

    const res = await fetch(`${BASE_URL}/api/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'No se pudo obtener la API Key');
    }
      
    return res.json();
  },

  async createApiKey(username: string, password: string): Promise<{ created: boolean; api_key: string }> {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const res = await fetch(`${BASE_URL}/api/create/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'No se pudo crear la API Key');
    }
    return res.json();
  },

  async getDashboard(token: string): Promise<{ data: [number, string, number][] }> {
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'Error al cargar el dashboard');
    }
    return res.json();
  },

  async getDocuments(apiKey: string): Promise<{ result: { documents: string[][] } }> {
    const res = await fetch(`${BASE_URL}/api/curriculum/documents`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'No hay documentos generados');
    }
    return res.json();
  },

  async evaluateCV(apiKey: string, content: string) {
    const res = await fetch(`${BASE_URL}/api/curriculum`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'Error al evaluar el CV');
    }
    return res.json();
  },

  async generateQuiz(apiKey: string, content: string, requirements: string) {
    const res = await fetch(`${BASE_URL}/api/curriculum/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ content, requirements }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.detail || 'Error al generar el quiz');
    }
    return res.json();
  },
};