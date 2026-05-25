/**
 * Reset Password Page
 * Reads uid + token from URL params, lets user set a new password.
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const BG_STYLE = {
  backgroundImage: `url('https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1600&auto=format&fit=crop')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid   = searchParams.get('uid')   || '';
  const token = searchParams.get('token') || '';

  const [form, setForm]       = useState({ password: '', password2: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  // Invalid link guard
  if (!uid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 text-sm mb-6">This link is missing required parameters.</p>
          <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (form.password.length < 6)       errs.password  = 'Password must be at least 6 characters.';
    if (form.password !== form.password2) errs.password2 = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await axios.post(`${API}/reset-password/`, {
        uid, token,
        password:  form.password,
        password2: form.password2,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed. The link may have expired.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">

        {done ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
            <p className="text-gray-500 text-sm mb-1">Your password has been updated successfully.</p>
            <p className="text-gray-400 text-xs">Redirecting to login in 3 seconds...</p>
            <Link to="/login" className="inline-block mt-4 text-indigo-600 font-semibold hover:underline text-sm">
              Go to Login →
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
              <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account.</p>
            </div>

            {/* General error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* New password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input name="password" type="password" value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input name="password2" type="password" value={form.password2} onChange={handleChange}
                    placeholder="Repeat new password"
                    className={`w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${errors.password2 ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
              </div>

              {/* Password strength hint */}
              {form.password && (
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= i * 3
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Resetting...</>
                ) : 'Reset Password'}
              </button>
            </form>

            <div className="border-t border-gray-200 mt-6 pt-5 text-center">
              <Link to="/login" className="text-sm text-indigo-600 font-medium hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
