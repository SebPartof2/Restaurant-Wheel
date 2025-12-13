// Statistics page

import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { api } from '../services/api';
import type { Statistics } from '../types';

export function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const { statistics } = await api.getStatistics();
      setStats(statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-red-600">{error || 'No statistics available'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of restaurant data</p>
        </div>

        {/* Restaurant Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalRestaurants}</p>
              <p className="text-sm text-gray-600 mt-1">Total Restaurants</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingRestaurants}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">{stats.activeRestaurants}</p>
              <p className="text-sm text-gray-600 mt-1">Active</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingRestaurants}</p>
              <p className="text-sm text-gray-600 mt-1">Upcoming</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.visitedRestaurants}</p>
              <p className="text-sm text-gray-600 mt-1">Visited</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.fastFoodCount}</p>
              <p className="text-sm text-gray-600 mt-1">Fast Food</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-indigo-600">{stats.nonFastFoodCount}</p>
              <p className="text-sm text-gray-600 mt-1">Non-Fast Food</p>
            </div>
          </div>
        </div>

        {/* Rating Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rating Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-bold text-yellow-500">
                  {stats.overallAverageRating > 0 ? stats.overallAverageRating.toFixed(1) : 'N/A'}
                </span>
                {stats.overallAverageRating > 0 && (
                  <span className="text-yellow-500 text-2xl">★</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Overall Average</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalRatingsGiven}</p>
              <p className="text-sm text-gray-600 mt-1">Total Ratings</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">{stats.ratedRestaurantCount}</p>
              <p className="text-sm text-gray-600 mt-1">Rated Restaurants</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-gray-500">{stats.unratedRestaurantCount}</p>
              <p className="text-sm text-gray-600 mt-1">Unrated Restaurants</p>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600 mt-1">Total Users</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.adminCount}</p>
              <p className="text-sm text-gray-600 mt-1">Admins</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.provisionalCount}</p>
              <p className="text-sm text-gray-600 mt-1">Provisional Users</p>
            </div>
          </div>
        </div>

        {/* Top Rated Restaurants */}
        {stats.topRatedRestaurants.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Rated Restaurants</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Restaurant
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Rating
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        # Ratings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.topRatedRestaurants.map((restaurant, index) => (
                      <tr key={restaurant.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{restaurant.name}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-bold">{restaurant.average_rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">/ 10</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {restaurant.rating_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Most Active Nominators */}
        {stats.mostActiveNominators.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Active Nominators</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nominations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.mostActiveNominators.map((nominator, index) => (
                      <tr key={nominator.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {nominator.name || nominator.email}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-primary">{nominator.nomination_count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Most Active Raters */}
        {stats.mostActiveRaters.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Active Raters</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ratings Given
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.mostActiveRaters.map((rater, index) => (
                      <tr key={rater.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {rater.name || rater.email}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-primary">{rater.rating_count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
