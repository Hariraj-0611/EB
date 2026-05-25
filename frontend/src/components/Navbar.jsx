import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUsername } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const username = getUsername();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = username ? username.slice(0, 2).toUpperCase() : 'U';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 21H3a12.083 12.083 0 012.84-10.422L12 14z" />
          </svg>
        </div>
        <div>
          <span className="text-base font-bold text-gray-800 tracking-tight">Student</span>
          <span className="text-base font-bold text-indigo-600 tracking-tight"> Manager</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <span className="hidden sm:block text-sm text-gray-500">
          Hello, <span className="font-semibold text-gray-700">{username}</span>
        </span>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow hover:shadow-md transition"
        >
          {initials}
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-semibold text-gray-700 truncate">{username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
