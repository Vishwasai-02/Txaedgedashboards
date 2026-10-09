export function attachAuthToken(config: any): any {
  const token = localStorage.getItem('taxedge_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
}

export function handleApiError(error: any): Promise<never> {
  if (error?.status === 401) {
    localStorage.removeItem('taxedge_token');
    localStorage.removeItem('taxedge_user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
}
