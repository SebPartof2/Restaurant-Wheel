import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive(path)
        ? 'bg-navy-900 text-white'
        : 'text-navy-900 hover:bg-white/30'
    }`;

  const mobileNavLinkClass = (path: string) =>
    `block px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive(path)
        ? 'bg-navy-900 text-white'
        : 'text-navy-900 hover:bg-white/30'
    }`;

  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-navy-900 flex items-center gap-2">
          <span className="text-3xl">🎡</span>
          <span>The Wheel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className={navLinkClass('/')}>
            Dashboard
          </Link>
          <Link to="/nominations" className={navLinkClass('/nominations')}>
            Restaurants
          </Link>
          {!!user?.is_admin && (
            <Link to="/wheel" className={navLinkClass('/wheel')}>
              Wheel
            </Link>
          )}
          <Link to="/photos" className={navLinkClass('/photos')}>
            Photo Feed
          </Link>
          <Link to="/statistics" className={navLinkClass('/statistics')}>
            Statistics
          </Link>

          {/* Admin Dropdown */}
          {!!user?.is_admin && (
            <div className="relative">
              <button
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className="px-4 py-2 rounded-lg font-medium text-navy-900 hover:bg-white/30 transition-colors"
              >
                Admin
              </button>
              {adminDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAdminDropdownOpen(false)}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 glass-card p-2 z-20">
                    <Link
                      to="/admin/pending"
                      className={mobileNavLinkClass('/admin/pending')}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Pending Nominations
                    </Link>
                    <Link
                      to="/admin/upcoming"
                      className={mobileNavLinkClass('/admin/upcoming')}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Upcoming Visits
                    </Link>
                    <Link
                      to="/admin/visited"
                      className={mobileNavLinkClass('/admin/visited')}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Visited Restaurants
                    </Link>
                    <Link
                      to="/admin/nominate"
                      className={mobileNavLinkClass('/admin/nominate')}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Nominate (Admin)
                    </Link>
                    <Link
                      to="/admin/users"
                      className={mobileNavLinkClass('/admin/users')}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Manage Users
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* User Menu */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.given_name || user?.name || user?.email}
          </span>
          <button
            onClick={logout}
            className="bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-navy-900"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 glass-card p-4 space-y-2">
          <Link
            to="/"
            className={mobileNavLinkClass('/')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/nominations"
            className={mobileNavLinkClass('/nominations')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Restaurants
          </Link>
          {!!user?.is_admin && (
            <Link
              to="/wheel"
              className={mobileNavLinkClass('/wheel')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Wheel
            </Link>
          )}
          <Link
            to="/photos"
            className={mobileNavLinkClass('/photos')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Photo Feed
          </Link>
          <Link
            to="/statistics"
            className={mobileNavLinkClass('/statistics')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Statistics
          </Link>

          {/* Admin Section for Mobile */}
          {!!user?.is_admin && (
            <>
              <div className="border-t border-gray-300 my-2 pt-2">
                <div className="text-xs font-semibold text-gray-600 px-4 py-1">
                  ADMIN
                </div>
                <Link
                  to="/admin/pending"
                  className={mobileNavLinkClass('/admin/pending')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pending Nominations
                </Link>
                <Link
                  to="/admin/upcoming"
                  className={mobileNavLinkClass('/admin/upcoming')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upcoming Visits
                </Link>
                <Link
                  to="/admin/visited"
                  className={mobileNavLinkClass('/admin/visited')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Visited Restaurants
                </Link>
                <Link
                  to="/admin/nominate"
                  className={mobileNavLinkClass('/admin/nominate')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nominate (Admin)
                </Link>
                <Link
                  to="/admin/users"
                  className={mobileNavLinkClass('/admin/users')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Users
                </Link>
              </div>
            </>
          )}

          {/* User info and logout */}
          <div className="border-t border-gray-300 my-2 pt-2">
            <div className="px-4 py-2 text-sm text-gray-600">
              {user?.given_name || user?.name || user?.email}
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
