import { attachAuthToken, handleApiError } from './interceptors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const USE_MOCK = import.meta.env.VITE_ENABLE_MOCK_API !== 'false';

class ApiClient {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint: string, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<any> {
    if (USE_MOCK) {
      return null;
    }

    const url = `${this.baseUrl}${endpoint}`;
    const initialConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    const config = attachAuthToken(initialConfig);

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const error: any = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }

  get(endpoint: string, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint: string, body?: any, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint: string, body?: any, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint: string, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<any> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(BASE_URL);
