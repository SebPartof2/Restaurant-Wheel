// Dashboard page

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { Restaurant } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Restaurant[]>([]);
  const [myNominations, setMyNominations] = useState<Restaurant[]>([]);
  const [overallAverage, setOverallAverage] = useState<number>(0);
  const [ratedCount, setRatedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [upcomingRes, allRestaurantsRes, statsRes] = await Promise.all([
        api.getRestaurants('upcoming'),
        api.getRestaurants(),
        api.getOverallStats(),
      ]);

      setUpcoming(upcomingRes.restaurants);
      // Filter my nominations
      setMyNominations(
        allRestaurantsRes.restaurants.filter((r) => r.nominated_by_user_id === user?.id)
      );
      setOverallAverage(statsRes.overall_average_rating);
      setRatedCount(statsRes.rated_restaurant_count);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-gray-600">Manage your restaurant nominations and see what's upcoming</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Restaurant */}
          {upcoming.length > 0 && (
            <div className="card bg-blue-50 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Upcoming Visit</h2>
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900">{upcoming[0].name}</h3>
                <p className="text-gray-600 mt-1">{upcoming[0].address}</p>
                {upcoming[0].reservation_datetime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Reservation:</p>
                    <p className="text-sm font-bold text-blue-900">
                      {new Date(upcoming[0].reservation_datetime).toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
                {upcoming[0].menu_link && (
                  <a
                    href={upcoming[0].menu_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    View Menu →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Overall Average Rating */}
          {ratedCount > 0 && (
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⭐ Overall Average Rating</h2>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-yellow-500 text-4xl">★</span>
                  <span className="text-4xl font-bold text-gray-900">{overallAverage.toFixed(1)}</span>
                  <span className="text-2xl text-gray-500">/ 10</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Across {ratedCount} rated {ratedCount === 1 ? 'restaurant' : 'restaurants'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/nominations/new"
            className="card hover:shadow-lg transition cursor-pointer bg-primary text-white"
          >
            <div className="text-3xl mb-2">➕</div>
            <h3 className="font-bold">Nominate Restaurant</h3>
            <p className="text-sm text-white/80 mt-1">Add a new restaurant to the pool</p>
          </Link>

          <Link
            to="/nominations"
            className="card hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-bold">View All Restaurants</h3>
            <p className="text-sm text-gray-600 mt-1">See the complete list</p>
          </Link>

          {user?.is_admin && (
            <Link
              to="/wheel"
              className="card hover:shadow-lg transition cursor-pointer bg-green-500 text-white"
            >
              <div className="text-3xl mb-2">🎡</div>
              <h3 className="font-bold">Spin the Wheel</h3>
              <p className="text-sm text-white/80 mt-1">Pick the next restaurant!</p>
            </Link>
          )}
        </div>

        {/* My Nominations */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Nominations</h2>
          {myNominations.length === 0 ? (
            <p className="text-gray-600">You haven't nominated any restaurants yet.</p>
          ) : (
            <div className="space-y-3">
              {myNominations.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.address}</p>
                  </div>
                  <span className={`badge badge-${restaurant.state}`}>
                    {restaurant.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
