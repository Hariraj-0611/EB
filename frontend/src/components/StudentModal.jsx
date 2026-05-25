import { useState, useEffect } from 'react';

const EMPTY_FORM = { name: '', age: '', email: '', course: '' };

const COURSES = [
  'Computer Science', 'Information Technology', 'Software Engineering',
  'Data Science', 'Cybersecurity', 'Business Administration',
  'Mechanical Engineering', 'Electrical Engineering', 'Medicine', 'Law',
];

const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder, onKeyDown, icon }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition
          ${error ? 'border-red-300 bg-red-50 focus:ring-red-300' : 'border-gray-200 bg-gray-50 focus:ring-indigo-300 focus:bg-white'}`}
      />
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// Reusable SVG icons
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconAge = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconEmail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconBook = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const StudentModal = ({ isOpen, onClose, onSubmit, editData }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({ name: editData.name, age: editData.age, email: editData.email, course: editData.course });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'At least 2 characters required.';
    if (!form.age || isNaN(form.age) || form.age < 1 || form.age > 120) errs.age = 'Enter a valid age (1–120).';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.course.trim()) errs.course = 'Course is required.';
    return errs;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'age') value = value.replace(/\D/g, '');
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      await onSubmit({ ...form, age: Number(form.age) });
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const mapped = {};
        Object.keys(data).forEach((k) => { mapped[k] = Array.isArray(data[k]) ? data[k][0] : data[k]; });
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ animation: 'modalIn 0.2s ease-out' }}>

        {/* Header */}
        <div className={`px-6 py-5 ${editData ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {editData ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{editData ? 'Edit Student' : 'Add New Student'}</h2>
                <p className="text-white/70 text-xs">{editData ? `Editing ${editData.name}` : 'Fill in the details below'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition text-xl font-light">
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <InputField label="Full Name" icon={<IconUser />} name="name" value={form.name}
                onChange={handleChange} error={errors.name} placeholder="e.g. John Doe" />
            </div>
            <InputField label="Age" icon={<IconAge />} name="age" type="text"
              value={form.age} onChange={handleChange} error={errors.age} placeholder="e.g. 20"
              onKeyDown={(e) => {
                const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
                if (allowed.includes(e.key)) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
              }}
            />
            <InputField label="Email" icon={<IconEmail />} name="email" type="email" value={form.email}
              onChange={handleChange} error={errors.email} placeholder="john@email.com" />
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Course</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><IconBook /></span>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Type or select a course"
                list="course-list"
                className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition
                  ${errors.course ? 'border-red-300 bg-red-50 focus:ring-red-300' : 'border-gray-200 bg-gray-50 focus:ring-indigo-300 focus:bg-white'}`}
              />
            </div>
            <datalist id="course-list">
              {COURSES.map((c) => <option key={c} value={c} />)}
            </datalist>
            {errors.course && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.course}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`px-6 py-2.5 text-sm rounded-xl text-white font-semibold transition disabled:opacity-60 flex items-center gap-2
                ${editData ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                           : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                : editData ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StudentModal;
