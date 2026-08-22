const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://odoo-nmit-hackathon.onrender.com';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL.replace(/\/+$/, '') + '/api/v1';
  }

  getToken() {
    return localStorage.getItem('dayflow_token') || null;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('dayflow_token', token);
    } else {
      localStorage.removeItem('dayflow_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.getHeaders(options.headers || {});

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // If unauthorized, clear invalid token
        console.warn('Unauthorized request - session may be expired.');
        // Don't auto-redirect immediately if on signin/signup page
        if (!window.location.pathname.includes('/sign')) {
          // Token is invalid/expired
          // localStorage.removeItem('dayflow_token');
        }
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorDetail =
          (data && typeof data === 'object' && (data.detail || data.message || data.error)) ||
          response.statusText ||
          `HTTP Error ${response.status}`;
        const error = new Error(typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail));
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Request Failed [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  get(endpoint, headers) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body, headers) {
    return this.request(endpoint, { method: 'POST', body, headers });
  }

  put(endpoint, body, headers) {
    return this.request(endpoint, { method: 'PUT', body, headers });
  }

  delete(endpoint, headers) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
