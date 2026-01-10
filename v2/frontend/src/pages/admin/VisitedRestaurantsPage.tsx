import { Layout } from '../../components/layout/Layout';
import { useRestaurants } from '../../hooks/useRestaurants';
import { Star, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

export function VisitedRestaurantsPage() {
  const { data, isLoading, error } = useRestaurants({ state: 'visited', sort: 'date' });

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Visited Restaurants</h1>
        <p className="text-lg text-gray-600">View and manage restaurant ratings</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visited restaurants...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load visited restaurants</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.restaurants.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Visited Restaurants Yet</h2>
          <p className="text-gray-600">Start spinning the wheel to visit restaurants!</p>
        </div>
      )}

      {/* Visited Restaurants Grid */}
      {!isLoading && !error && data && data.restaurants.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {data.restaurants.length} visited restaurant{data.restaurants.length !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/nominations/${restaurant.id}`}
                className="glass-card-hover p-6 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-navy-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                  </div>
                  {restaurant.menu_link && (
                    <a
                      href={restaurant.menu_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-navy-900 hover:text-navy-700"
                      title="View Menu"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <div>
                      <div className="font-semibold text-navy-900">
                        {restaurant.average_rating > 0
                          ? restaurant.average_rating.toFixed(1)
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Average Rating</div>
                    </div>
                  </div>

                  {/* Visit Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-semibold text-navy-900">
                        {restaurant.visited_at
                          ? new Date(restaurant.visited_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">Visit Date</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {!!restaurant.is_fast_food && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Fast Food
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      by {restaurant.nominated_by?.name || restaurant.nominated_by?.email || 'Unknown'}
                    </span>
                  </div>

                  <span className="text-sm text-navy-900 font-medium hover:underline">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
