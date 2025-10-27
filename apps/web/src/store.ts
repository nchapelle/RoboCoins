import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    orgId: localStorage.getItem('orgId') || ''
  }),
  actions: {
    setAuth(token: string, orgId: string) {
      this.token = token;
      this.orgId = orgId;
      localStorage.setItem('token', token);
      localStorage.setItem('orgId', orgId);
    },
    logout() {
      this.token = '';
      this.orgId = '';
      localStorage.clear();
    }
  }
});

export function api(token?: string) {
  const inst = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return inst;
}