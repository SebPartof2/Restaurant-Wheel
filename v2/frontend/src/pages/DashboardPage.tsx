import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="glass-nav fixed top-0 left-0 right-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-navy-900">The Wheel v2</h1>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.given_name || user?.name || user?.email}!
            </span>
            {user?.is_admin && (
              <a
                href="/admin/users"
                className="glass-button px-4 py-2 rounded-lg font-medium"
              >
                Admin
              </a>
            )}
            <button
              onClick={logout}
              className="bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mt-24">
        {/* Hero Section */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to The Wheel v2</h2>
          <p className="text-lg text-gray-600 mb-6">
            A modern restaurant selection system with S-Auth OAuth2 authentication, glassmorphism design, and photo gallery capabilities.
          </p>
          <div className="flex gap-4">
            <button className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors">
              Spin the Wheel
            </button>
            <button className="glass-button px-6 py-3 rounded-lg font-medium">
              Browse Restaurants
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="glass-card p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Your Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Name:</span>
              <p className="font-medium">
                {user?.given_name && user?.family_name
                  ? `${user.given_name} ${user.family_name}`
                  : user?.name || 'Not set'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">OAuth Subject:</span>
              <p className="font-mono text-sm">{user?.oauth_subject || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Access Level:</span>
              <p className="font-medium">{user?.access_level || 'user'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Role:</span>
              <p className="font-medium">{user?.is_admin ? 'Administrator' : 'User'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Last Login:</span>
              <p className="font-medium">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Total Restaurants</div>
            <div className="text-3xl font-bold text-navy-900">0</div>
            <div className="text-xs text-gray-500 mt-2">Fresh start</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Average Rating</div>
            <div className="text-3xl font-bold text-navy-900">-</div>
            <div className="text-xs text-gray-500 mt-2">No ratings yet</div>
          </div>
          <div className="glass-card p-6">
            <div className="text-sm text-gray-600 mb-2">Restaurants Visited</div>
            <div className="text-3xl font-bold text-navy-900">0</div>
            <div className="text-xs text-gray-500 mt-2">Let's get started!</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="glass-card p-8">
          <h3 className="text-2xl font-bold mb-6">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-lg mb-2">🔐 S-Auth OAuth2</h4>
              <p className="text-gray-600">
                Secure authentication using S-Auth with PKCE flow for SPAs.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">✨ Glassmorphism Design</h4>
              <p className="text-gray-600">
                Modern frosted glass effects with backdrop blur and smooth animations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">📸 Multi-Photo Support</h4>
              <p className="text-gray-600">
                Upload multiple photos per restaurant with attribution and gallery view.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">☁️ Cloudflare Stack</h4>
              <p className="text-gray-600">
                Built on Workers, D1 database, and R2 storage with CDN delivery.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
