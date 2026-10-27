import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = 'Bearer ' + t;
  return c;
});
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && localStorage.getItem('token')) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(e);
});
export const errMsg = (e) => e.response?.data?.message || (e.request ? 'Cannot reach the server. Is the backend running?' : e.message);
export default api;
