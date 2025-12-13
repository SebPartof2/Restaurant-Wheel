// Upcoming restaurants page

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import type { Restaurant } from '../../types';

export function UpcomingPage() {
  const [upcoming, setUpcoming] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForReservation, setSelectedForReservation] = useState<Restaurant | null>(null);
  const [reservationDatetime, setReservationDatetime] = useState('');
  const [selectedForVisit, setSelectedForVisit] = useState<Restaurant | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const { restaurants } = await api.getRestaurants('upcoming');
      setUpcoming(restaurants);
    } catch (error) {
      toast.error('Failed to load upcoming restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReservationModal = (restaurant: Restaurant) => {
    setSelectedForReservation(restaurant);
    // Pre-fill with existing reservation if available
    if (restaurant.reservation_datetime) {
      // Convert from SQLite format "2024-12-13 19:30:00" to datetime-local format "2024-12-13T19:30"
      setReservationDatetime(restaurant.reservation_datetime.replace(' ', 'T').substring(0, 16));
    } else {
      setReservationDatetime('');
    }
  };

  const handleSaveReservation = async () => {
    if (!selectedForReservation || !reservationDatetime) return;

    setSaving(true);
    try {
      // Convert from datetime-local format "2024-12-13T19:30" to SQLite format "2024-12-13 19:30:00"
      const sqliteFormat = reservationDatetime.replace('T', ' ') + ':00';
      await api.updateRestaurant(selectedForReservation.id, {
        reservation_datetime: sqliteFormat,
      });
      toast.success('Reservation date saved!');
      setSelectedForReservation(null);
      setReservationDatetime('');
      loadUpcoming();
    } catch (error) {
      toast.error('Failed to save reservation');
    } finally {
      setSaving(false);
    }
  };

  const handleClearReservation = async () => {
    if (!selectedForReservation) return;

    setSaving(true);
    try {
      await api.updateRestaurant(selectedForReservation.id, {
        reservation_datetime: undefined,
      });
      toast.success('Reservation cleared!');
      setSelectedForReservation(null);
      setReservationDatetime('');
      loadUpcoming();
    } catch (error) {
      toast.error('Failed to clear reservation');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenVisitModal = (restaurant: Restaurant) => {
    setSelectedForVisit(restaurant);
    // Default to today's date
    const today = new Date().toISOString().substring(0, 10);
    setVisitDate(today);
  };

  const handleMarkVisited = async () => {
    if (!selectedForVisit || !visitDate) return;

    setSaving(true);
    try {
      // Convert date "2024-12-13" to SQLite datetime format "2024-12-13 00:00:00"
      const sqliteFormat = visitDate + ' 00:00:00';
      await api.updateRestaurant(selectedForVisit.id, {
        state: 'visited',
        visited_at: sqliteFormat,
      });
      toast.success('Restaurant marked as visited!');
      setSelectedForVisit(null);
      setVisitDate('');
      loadUpcoming();
    } catch (error) {
      toast.error('Failed to mark as visited');
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
            <h1 className="text-3xl font-bold text-gray-900">Upcoming Restaurants</h1>
            <p className="text-gray-600 mt-1">Restaurants selected by the wheel, awaiting visit</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/pending" className="btn btn-secondary">
              Pending →
            </Link>
            <Link to="/admin/visited" className="btn btn-secondary">
              Visited →
            </Link>
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No upcoming restaurants</p>
            <Link to="/wheel" className="btn btn-primary">
              Spin the Wheel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((restaurant) => (
              <div key={restaurant.id} className="card hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{restaurant.address}</p>

                {restaurant.reservation_datetime && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Reservation:</p>
                    <p className="text-sm font-bold text-blue-900">
                      {new Date(restaurant.reservation_datetime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleOpenReservationModal(restaurant)}
                    className="btn btn-secondary w-full text-sm"
                  >
                    {restaurant.reservation_datetime ? 'Edit Reservation' : 'Set Reservation'}
                  </button>
                  <button
                    onClick={() => handleOpenVisitModal(restaurant)}
                    className="btn btn-primary w-full text-sm"
                  >
                    Mark as Visited
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Modal */}
        {selectedForReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Set Reservation: {selectedForReservation.name}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">Reservation Date & Time</label>
                  <input
                    type="datetime-local"
                    value={reservationDatetime}
                    onChange={(e) => setReservationDatetime(e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Select when you have a reservation at this restaurant
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveReservation}
                    disabled={saving || !reservationDatetime}
                    className="btn btn-primary flex-1"
                  >
                    {saving ? 'Saving...' : 'Save Reservation'}
                  </button>
                  {selectedForReservation.reservation_datetime && (
                    <button
                      onClick={handleClearReservation}
                      disabled={saving}
                      className="btn btn-secondary"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedForReservation(null)}
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

        {/* Mark Visited Modal */}
        {selectedForVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Mark as Visited: {selectedForVisit.name}
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
                    onClick={handleMarkVisited}
                    disabled={saving || !visitDate}
                    className="btn btn-primary flex-1"
                  >
                    {saving ? 'Saving...' : 'Mark as Visited'}
                  </button>
                  <button
                    onClick={() => setSelectedForVisit(null)}
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
