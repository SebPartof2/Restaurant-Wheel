// Restaurant detail page

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { api } from '../services/api';
import type { Restaurant, Visit } from '../types';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (restaurantId: number) => {
    try {
      const [restaurantRes, visitsRes] = await Promise.all([
        api.getRestaurant(restaurantId),
        api.getVisits(restaurantId),
      ]);

      setRestaurant(restaurantRes.restaurant);
      setVisits(visitsRes.visits);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
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

  if (!restaurant) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Restaurant not found.</p>
          <button onClick={() => navigate('/nominations')} className="btn btn-primary mt-4">
            Back to Restaurants
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/nominations')}
          className="text-primary hover:underline"
        >
          ← Back to Restaurants
        </button>

        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                <span className={`badge badge-${restaurant.state}`}>
                  {restaurant.state}
                </span>
              </div>
              <p className="text-gray-600">{restaurant.address}</p>
            </div>

            {restaurant.is_fast_food && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-medium">
                Fast Food
              </span>
            )}
          </div>

          {restaurant.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="text-2xl font-bold">{restaurant.average_rating.toFixed(1)}</span>
              <span className="text-gray-500">/ 10</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            {restaurant.menu_link && (
              <a
                href={restaurant.menu_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-center"
              >
                View Menu
              </a>
            )}
            {restaurant.photo_link && (
              <a
                href={restaurant.photo_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-center"
              >
                View Photo
              </a>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Visit History</h2>
            {visits.length === 0 ? (
              <p className="text-gray-600">No visits yet.</p>
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">User #{visit.user_id}</p>
                      <p className="text-sm text-gray-600">
                        {visit.attended ? 'Attended' : 'Did not attend'}
                      </p>
                    </div>
                    {visit.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{visit.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
