// Visited restaurants page with rating functionality

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import type { Restaurant, User } from '../../types';

export function VisitedPage() {
  const [visited, setVisited] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [ratings, setRatings] = useState<{ [userId: number]: string }>({});
  const [editingVisitDate, setEditingVisitDate] = useState<Restaurant | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsRes, usersRes] = await Promise.all([
        api.getRestaurants('visited'),
        api.getUsers(),
      ]);

      setVisited(restaurantsRes.restaurants);
      setUsers(usersRes.users);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRatingForm = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedUsers([]);
    setRatings({});
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSetRating = (userId: number, rating: string) => {
    setRatings((prev) => ({ ...prev, [userId]: rating }));
  };

  const handleSubmitRatings = async () => {
    if (!selectedRestaurant) return;

    // Validate that all selected users have ratings
    for (const userId of selectedUsers) {
      const ratingStr = ratings[userId];
      if (!ratingStr || ratingStr.trim() === '') {
        toast.error('Please enter a rating for all selected users');
        return;
      }
    }

    // Validate and parse ratings
    const parsedRatings: { [userId: number]: number } = {};
    for (const userId of selectedUsers) {
      const ratingStr = ratings[userId];
      const rating = parseFloat(ratingStr);
      if (isNaN(rating)) {
        toast.error('Please enter valid numeric ratings');
        return;
      }
      if (rating < 1 || rating > 10) {
        toast.error('Ratings must be between 1 and 10');
        return;
      }
      parsedRatings[userId] = rating;
    }

    try {
      // Mark attendance
      if (selectedUsers.length > 0) {
        await api.markAttendance(selectedRestaurant.id, { user_ids: selectedUsers });
      }

      // Submit ratings
      for (const userId of selectedUsers) {
        await api.submitRating(selectedRestaurant.id, {
          user_id: userId,
          rating: parsedRatings[userId],
        });
      }

      toast.success('Ratings submitted successfully!');
      setSelectedRestaurant(null);
      loadData();
    } catch (error) {
      console.error('Rating submission error:', error);
      const message = error instanceof Error ? error.message : 'Failed to submit ratings';
      toast.error(message);
    }
  };

  const handleOpenEditVisitDate = (restaurant: Restaurant) => {
    setEditingVisitDate(restaurant);
    // Pre-fill with existing visit date, extract just the date part
    if (restaurant.visited_at) {
      setVisitDate(restaurant.visited_at.substring(0, 10));
    } else {
      setVisitDate(new Date().toISOString().substring(0, 10));
    }
  };

  const handleSaveVisitDate = async () => {
    if (!editingVisitDate || !visitDate) return;

    setSaving(true);
    try {
      // Convert date "2024-12-13" to SQLite datetime format "2024-12-13 00:00:00"
      const sqliteFormat = visitDate + ' 00:00:00';
      await api.updateRestaurant(editingVisitDate.id, {
        visited_at: sqliteFormat,
      });
      toast.success('Visit date updated!');
      setEditingVisitDate(null);
      setVisitDate('');
      loadData();
    } catch (error) {
      toast.error('Failed to update visit date');
    } finally {
      setSaving(false);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visited Restaurants</h1>
            <p className="text-gray-600 mt-1">Add ratings for restaurants you've visited</p>
          </div>
          <Link to="/admin/upcoming" className="btn btn-secondary">
            Upcoming →
          </Link>
        </div>

        {visited.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No visited restaurants yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visited.map((restaurant) => (
              <div key={restaurant.id} className="card hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{restaurant.address}</p>

                {restaurant.visited_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-green-600 font-medium mb-1">Visited on:</p>
                    <p className="text-sm font-bold text-green-900">
                      {new Date(restaurant.visited_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {restaurant.average_rating > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{restaurant.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">/ 10</span>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenEditVisitDate(restaurant)}
                    className="btn btn-secondary w-full text-sm"
                  >
                    Edit Visit Date
                  </button>
                  <button
                    onClick={() => handleOpenRatingForm(restaurant)}
                    className="btn btn-primary w-full text-sm"
                  >
                    Add Ratings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Form Modal */}
        {selectedRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Add Ratings: {selectedRestaurant.name}
              </h2>

              <div className="space-y-4">
                <p className="text-gray-600">Select who attended and rate their experience:</p>

                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`user-${user.id}`} className="font-medium text-gray-900">
                        {user.name || user.email}
                      </label>
                    </div>

                    {selectedUsers.includes(user.id) && (
                      <div className="ml-7 flex items-center gap-3">
                        <label htmlFor={`rating-${user.id}`} className="text-sm text-gray-600">
                          Rating (1-10):
                        </label>
                        <input
                          id={`rating-${user.id}`}
                          type="number"
                          min="1"
                          max="10"
                          step="0.1"
                          value={ratings[user.id] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Remove rating if field is cleared
                              setRatings((prev) => {
                                const newRatings = { ...prev };
                                delete newRatings[user.id];
                                return newRatings;
                              });
                            } else {
                              // Store the raw string value to preserve decimal input
                              handleSetRating(user.id, value);
                            }
                          }}
                          className="input w-24"
                          placeholder="e.g., 7.5"
                        />
                        <span className="text-yellow-500 text-2xl">★</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmitRatings}
                  disabled={selectedUsers.length === 0}
                  className="btn btn-primary flex-1"
                >
                  Submit Ratings
                </button>
                <button onClick={() => setSelectedRestaurant(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Visit Date Modal */}
        {editingVisitDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Edit Visit Date: {editingVisitDate.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    When did you visit this restaurant?
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveVisitDate}
                    disabled={saving || !visitDate}
                    className="btn btn-primary flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Visit Date'}
                  </button>
                  <button
                    onClick={() => setEditingVisitDate(null)}
                    disabled={saving}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
