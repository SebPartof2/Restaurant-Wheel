// Header component

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">🎡 The Wheel</div>
          </Link>

          {user && (
            <nav className="flex items-center space-x-6">
              <Link to="/dashboard" className="hover:text-gray-200 transition">
                Dashboard
              </Link>
              <Link to="/nominations" className="hover:text-gray-200 transition">
                Restaurants
              </Link>
              <Link to="/statistics" className="hover:text-gray-200 transition">
                Statistics
              </Link>

              {user.is_admin && (
                <>
                  <Link to="/wheel" className="hover:text-gray-200 transition">
                    Wheel
                  </Link>

                  {/* Admin Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                      className="hover:text-gray-200 transition flex items-center gap-1"
                    >
                      Admin
                      <span className={`text-xs transition-transform ${showAdminDropdown ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {showAdminDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                        <Link
                          to="/admin/pending"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setShowAdminDropdown(false)}
                        >
                          📋 Pending Nominations
                        </Link>
                        <Link
                          to="/admin/visited"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setShowAdminDropdown(false)}
                        >
                          ✔ Visited Restaurants
                        </Link>
                        <Link
                          to="/admin/nominate"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setShowAdminDropdown(false)}
                        >
                          ➕ Nominate for User
                        </Link>
                        <Link
                          to="/admin/users"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                          onClick={() => setShowAdminDropdown(false)}
                        >
                          👥 Manage Users
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center space-x-4 border-l border-white/30 pl-6">
                <span className="text-sm">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
