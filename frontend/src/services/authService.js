/**
 * Authentication service — login, register, logout helpers.
 */

import api from './api';

export const login = async (identifier, password) => {
  const response = await api.post('/login/', { identifier, password });
  const { access, refresh, username } = response.data;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('username', username);
  return response.data;
};

export const register = async (username, email, password, password2) => {
  const response = await api.post('/register/', { username, email, password, password2 });
  // Don't auto-login — redirect to login page after registration
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
};

export const isAuthenticated = () => !!localStorage.getItem('access_token');

export const getUsername = () => localStorage.getItem('username') || '';
