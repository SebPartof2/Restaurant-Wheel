// Pending nominations approval page

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import type { Restaurant } from '../../types';

export function PendingNominationsPage() {
  const [pending, setPending] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const { nominations } = await api.getPendingNominations();

      // Sort alphabetically by name
      const sorted = nominations.sort((a, b) => a.name.localeCompare(b.name));

      setPending(sorted);
    } catch (error) {
      toast.error('Failed to load pending nominations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveRestaurant(id);
      toast.success('Restaurant approved!');
      loadPending();
    } catch (error) {
      toast.error('Failed to approve restaurant');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this nomination?')) return;

    try {
      await api.rejectRestaurant(id);
      toast.success('Restaurant rejected');
      loadPending();
    } catch (error) {
      toast.error('Failed to reject restaurant');
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
            <h1 className="text-3xl font-bold text-gray-900">Pending Nominations</h1>
            <p className="text-gray-600 mt-1">Review and approve restaurant nominations</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/upcoming" className="btn btn-secondary">
              Upcoming →
            </Link>
            <Link to="/admin/users" className="btn btn-secondary">
              Users →
            </Link>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No pending nominations</p>
            <Link to="/nominations" className="btn btn-primary">
              View All Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pending.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                showActions
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
