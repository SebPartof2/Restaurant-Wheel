import { useState } from 'react';
import { Link } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { RestaurantFilters } from '../components/restaurant/RestaurantFilters';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { useRestaurants } from '../hooks/useRestaurants';

export function NominationsPage() {
  const [filters, setFilters] = useState<{
    state?: 'pending' | 'active' | 'upcoming' | 'visited';
    search?: string;
    sort?: 'date' | 'rating' | 'name';
  }>({ sort: 'name' });

  const { data, isLoading, error } = useRestaurants(filters);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Restaurants</h1>
          <p className="text-gray-600 mt-1">
            Browse and nominate restaurants for the wheel
          </p>
        </div>
        <Link
          to="/nominations/new"
          className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors"
        >
          Nominate Restaurant
        </Link>
      </div>

      {/* Filters */}
      <RestaurantFilters onFilterChange={handleFilterChange} />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-card p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load restaurants</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.restaurants.length === 0 && (
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No restaurants found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.state || filters.search
              ? 'Try adjusting your filters'
              : 'Be the first to nominate a restaurant!'}
          </p>
          {!filters.state && !filters.search && (
            <Link
              to="/nominations/new"
              className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors"
            >
              Nominate Restaurant
            </Link>
          )}
        </div>
      )}

      {/* Restaurant Grid */}
      {!isLoading && !error && data && data.restaurants.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {data.restaurants.length} restaurant{data.restaurants.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/nominations/${restaurant.id}`}>
                <RestaurantCard restaurant={restaurant} />
              </Link>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
