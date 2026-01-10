import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { useRestaurantStats } from '../hooks/useRestaurants';
import { useRestaurants } from '../hooks/useRestaurants';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useRestaurantStats();
  const { data: upcomingData } = useRestaurants({ state: 'upcoming', limit: 1 });
  const { data: myNominations } = useRestaurants({ limit: 5 });

  const upcomingRestaurant = upcomingData?.restaurants[0];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="glass-card p-8 mb-8">
        <h2 className="text-4xl font-bold mb-4">
          Welcome back, {user?.given_name || user?.name || 'there'}!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Ready to discover your next dining adventure?
        </p>
        <div className="flex flex-wrap gap-4">
          {user?.is_admin && (
            <Link
              to="/wheel"
              className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Spin the Wheel
            </Link>
          )}
          <Link
            to="/nominations"
            className="glass-button px-6 py-3 rounded-lg font-medium hover:bg-white/40 transition-colors"
          >
            Browse Restaurants
          </Link>
          <Link
            to="/nominations/new"
            className="glass-button px-6 py-3 rounded-lg font-medium hover:bg-white/40 transition-colors"
          >
            Nominate Restaurant
          </Link>
        </div>
      </div>

      {/* Upcoming Highlight */}
      {upcomingRestaurant && (
        <div className="glass-card p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-navy-900">
            Next Restaurant Visit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h4 className="text-3xl font-bold text-navy-900 mb-2">
                {upcomingRestaurant.name}
              </h4>
              <p className="text-lg text-gray-600 mb-4">
                {upcomingRestaurant.address}
              </p>
              {upcomingRestaurant.reservation_datetime && (
                <div className="flex items-center gap-2 text-navy-900 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {new Date(upcomingRestaurant.reservation_datetime).toLocaleString()}
                  </span>
                </div>
              )}
              <Link
                to={`/nominations/${upcomingRestaurant.id}`}
                className="inline-block bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors"
              >
                View Details
              </Link>
            </div>
            <div className="glass-card p-6 bg-blue-50/50">
              <p className="text-sm text-gray-600 mb-2">
                Nominated by {upcomingRestaurant.nominated_by?.name || upcomingRestaurant.nominated_by?.email}
              </p>
              {upcomingRestaurant.menu_link && (
                <a
                  href={upcomingRestaurant.menu_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 hover:underline text-sm"
                >
                  View Menu →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="text-sm text-gray-600 mb-2">Total Restaurants</div>
          {statsLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-3xl font-bold text-navy-900">
                {stats?.total_restaurants || 0}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stats?.total_restaurants === 0 ? 'Start nominating!' : 'And counting...'}
              </div>
            </>
          )}
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-gray-600 mb-2">Average Rating</div>
          {statsLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-3xl font-bold text-navy-900">
                {stats?.average_rating ? stats.average_rating.toFixed(1) : '-'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stats?.average_rating ? 'Out of 10' : 'No ratings yet'}
              </div>
            </>
          )}
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-gray-600 mb-2">Restaurants Visited</div>
          {statsLoading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <div className="text-3xl font-bold text-navy-900">
                {stats?.visited_count || 0}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {stats?.visited_count === 0 ? "Let's get started!" : 'Delicious memories'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* My Nominations */}
      {myNominations && myNominations.restaurants.length > 0 && (
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-navy-900">Recent Restaurants</h3>
            <Link
              to="/nominations"
              className="text-navy-900 hover:underline font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myNominations.restaurants.slice(0, 3).map((restaurant) => (
              <Link key={restaurant.id} to={`/nominations/${restaurant.id}`}>
                <RestaurantCard restaurant={restaurant} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold mb-6">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/statistics"
            className="glass-button p-6 rounded-lg hover:bg-white/40 transition-colors text-left"
          >
            <h4 className="font-bold text-lg mb-2 text-navy-900">📊 Statistics</h4>
            <p className="text-gray-600">
              View comprehensive statistics, leaderboards, and ratings
            </p>
          </Link>
          <Link
            to="/photos"
            className="glass-button p-6 rounded-lg hover:bg-white/40 transition-colors text-left"
          >
            <h4 className="font-bold text-lg mb-2 text-navy-900">📸 Photo Feed</h4>
            <p className="text-gray-600">
              Browse photos from all restaurants in one place
            </p>
          </Link>
          {user?.is_admin && (
            <>
              <Link
                to="/admin/pending"
                className="glass-button p-6 rounded-lg hover:bg-white/40 transition-colors text-left"
              >
                <h4 className="font-bold text-lg mb-2 text-navy-900">⏳ Pending Approvals</h4>
                <p className="text-gray-600">
                  Review and approve pending restaurant nominations
                </p>
              </Link>
              <Link
                to="/admin/users"
                className="glass-button p-6 rounded-lg hover:bg-white/40 transition-colors text-left"
              >
                <h4 className="font-bold text-lg mb-2 text-navy-900">👥 User Management</h4>
                <p className="text-gray-600">
                  Manage users, permissions, and whitelist
                </p>
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
