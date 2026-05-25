import { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Navbar from '../components/Navbar';
import StudentTable from '../components/StudentTable';
import StudentModal from '../components/StudentModal';
import {
  getStudents, createStudent, updateStudent, deleteStudent,
} from '../services/studentService';
import { getUsername } from '../services/authService';

// Stat card component
const StatCard = ({ icon, label, value, color, sub }) => (
  <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-xl shadow-sm`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const HomePage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const username = getUsername();

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Export current student list to Excel (.xlsx)
  const exportToExcel = () => {
    if (students.length === 0) return;
    const rows = students.map((s, i) => ({
      '#': i + 1,
      'Name': s.name,
      'Age': s.age,
      'Email': s.email,
      'Course': s.course,
      'Joined': new Date(s.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    // Column widths
    ws['!cols'] = [{ wch: 4 }, { wch: 22 }, { wch: 6 }, { wch: 28 }, { wch: 22 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showSuccess(`Exported ${students.length} students to Excel.`);
  };

  const fetchStudents = useCallback(async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudents(query);
      setStudents(res.data.results ?? res.data);
    } catch {
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchStudents(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchStudents]);

  // Derived stats
  const stats = useMemo(() => {
    const courses = [...new Set(students.map((s) => s.course))];
    const avgAge = students.length
      ? Math.round(students.reduce((a, s) => a + s.age, 0) / students.length)
      : 0;
    return { total: students.length, courses: courses.length, avgAge };
  }, [students]);

  const handleSubmit = async (formData) => {
    if (editData) {
      await updateStudent(editData.id, formData);
      showSuccess(`${formData.name} updated successfully.`);
    } else {
      await createStudent(formData);
      showSuccess(`${formData.name} added successfully.`);
    }
    fetchStudents(search);
  };

  const handleEdit = (student) => { setEditData(student); setModalOpen(true); };
  const handleAdd  = () => { setEditData(null); setModalOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteStudent(deleteTarget.id);
      showSuccess(`${deleteTarget.name} removed from database.`);
      setDeleteTarget(null);
      fetchStudents(search);
    } catch {
      setError('Failed to delete student.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -right-16 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {username}!</h1>
              <p className="text-indigo-200 text-sm mt-1">
                Manage your students — all changes sync instantly to MySQL.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={exportToExcel}
                disabled={students.length === 0}
                className="bg-white/20 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/30 active:scale-95 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Excel
              </button>
              <button
                onClick={handleAdd}
                className="bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 active:scale-95 transition shadow flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          } label="Total Students" value={stats.total} color="bg-indigo-100" sub="in database" />
          <StatCard icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          } label="Courses" value={stats.courses} color="bg-purple-100" sub="unique courses" />
          <StatCard icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          } label="Average Age" value={stats.avgAge || '—'} color="bg-emerald-100" sub="across all students" />
        </div>

        {/* Search + table card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800">Student Records</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, course..."
                className="w-full border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50 focus:bg-white transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Table */}
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading students...</p>
              </div>
            ) : (
              <StudentTable students={students} onEdit={handleEdit} onDelete={setDeleteTarget} />
            )}
          </div>
        </div>
      </main>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          style={{ animation: 'slideUp 0.3s ease-out' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Add / Edit Modal */}
      <StudentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editData={editData}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
            style={{ animation: 'modalIn 0.2s ease-out' }}>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Student?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-semibold text-gray-700">{deleteTarget.name}</span> will be
              permanently removed from the MySQL database. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-2.5 text-sm rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleteLoading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</>
                  : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
