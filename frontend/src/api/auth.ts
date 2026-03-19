import axios from 'axios';

// Usa axios direto (sem o interceptor) para o login, pois ainda não tem token
const baseApi = axios.create({ baseURL: '/api' });

export interface AuthUser {
  id: number;
  nome: string;
  username: string;
  role: 'admin' | 'user';
}

export interface UserRecord extends AuthUser {
  ativo: number;
  data_criacao: string;
}

export async function loginApi(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await baseApi.post('/auth/login', { username, password });
  return res.data;
}

export async function fetchMe(): Promise<AuthUser> {
  const token = localStorage.getItem('auth_token');
  const res = await baseApi.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

import api from './client';

export async function fetchUsers(): Promise<UserRecord[]> {
  const res = await api.get('/users');
  return res.data;
}

export async function createUser(data: { nome: string; username: string; password: string; role: 'admin' | 'user' }): Promise<UserRecord> {
  const res = await api.post('/users', data);
  return res.data;
}

export async function updateUser(id: number, data: { nome?: string; username?: string; password?: string; role?: 'admin' | 'user' }): Promise<UserRecord> {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function toggleUserAtivo(id: number): Promise<{ id: number; ativo: number }> {
  const res = await api.patch(`/users/${id}/ativo`);
  return res.data;
}
