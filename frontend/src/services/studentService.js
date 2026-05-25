/**
 * Student CRUD service — wraps all /api/students/ endpoints.
 */

import api from './api';

// GET /api/students/?search=query
export const getStudents = (search = '') =>
  api.get('/students/', { params: search ? { search } : {} });

// POST /api/students/
export const createStudent = (data) => api.post('/students/', data);

// PUT /api/students/<id>/
export const updateStudent = (id, data) => api.put(`/students/${id}/`, data);

// DELETE /api/students/<id>/
export const deleteStudent = (id) => api.delete(`/students/${id}/`);
