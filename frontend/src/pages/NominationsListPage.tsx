// Nominations list page

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import type { Restaurant, RestaurantState } from '../types';

export function NominationsListPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RestaurantState | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editIsFastFood, setEditIsFastFood] = useState(false);
  const [editMenuLink, setEditMenuLink] = useState('');
  const [editPhotoLink, setEditPhotoLink] = useState('');
  const [editState, setEditState] = useState<RestaurantState>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, [filter]);

  const loadRestaurants = async () => {
    try {
      const filterState = filter === 'all' ? undefined : filter;
      const { restaurants } = await api.getRestaurants(filterState);

      // Sort: first by status (pending, upcoming, active, visited), then alphabetically
      const statusOrder: Record<RestaurantState, number> = {
        pending: 1,
        upcoming: 2,
        active: 3,
        visited: 4,
      };

      const sorted = restaurants.sort((a, b) => {
        const statusDiff = statusOrder[a.state] - statusOrder[b.state];
        if (statusDiff !== 0) return statusDiff;
        return a.name.localeCompare(b.name);
      });

      setRestaurants(sorted);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setEditName(restaurant.name);
    setEditAddress(restaurant.address);
    setEditIsFastFood(restaurant.is_fast_food);
    setEditMenuLink(restaurant.menu_link || '');
    setEditPhotoLink(restaurant.photo_link || '');
    setEditState(restaurant.state);
  };

  const handleCancelEdit = () => {
    setEditingRestaurant(null);
    setEditName('');
    setEditAddress('');
    setEditIsFastFood(false);
    setEditMenuLink('');
    setEditPhotoLink('');
    setEditState('pending');
  };

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;

    setSaving(true);
    try {
      const { restaurant } = await api.updateRestaurant(editingRestaurant.id, {
        name: editName,
        address: editAddress,
        is_fast_food: editIsFastFood,
        menu_link: editMenuLink || undefined,
        photo_link: editPhotoLink || undefined,
        state: editState,
      });

      setRestaurants(restaurants.map(r => r.id === restaurant.id ? restaurant : r));
      toast.success('Restaurant updated successfully');
      handleCancelEdit();
    } catch (error) {
      toast.error('Failed to update restaurant');
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
            <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
            <p className="text-gray-600 mt-1">Browse all restaurant nominations</p>
          </div>
          <Link to="/nominations/new" className="btn btn-primary">
            + Nominate Restaurant
          </Link>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('visited')}
            className={`btn ${filter === 'visited' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Visited
          </button>
        </div>

        {/* Restaurant Grid */}
        {restaurants.filter((r) => {
          const search = searchTerm.toLowerCase();
          return r.name.toLowerCase().includes(search) || r.address.toLowerCase().includes(search);
        }).length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No restaurants found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.filter((r) => {
              const search = searchTerm.toLowerCase();
              return r.name.toLowerCase().includes(search) || r.address.toLowerCase().includes(search);
            }).map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isAdmin={user?.is_admin}
                onEdit={handleEditRestaurant}
              />
            ))}
          </div>
        )}

        {/* Edit Restaurant Modal */}
        {editingRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Restaurant</h2>
              <form onSubmit={handleSaveRestaurant} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsFastFood"
                    checked={editIsFastFood}
                    onChange={(e) => setEditIsFastFood(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="editIsFastFood" className="text-sm text-gray-700">
                    Fast Food
                  </label>
                </div>

                <div>
                  <label className="label">Menu Link (optional)</label>
                  <input
                    type="url"
                    value={editMenuLink}
                    onChange={(e) => setEditMenuLink(e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="label">Photo Link (optional)</label>
                  <input
                    type="url"
                    value={editPhotoLink}
                    onChange={(e) => setEditPhotoLink(e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value as RestaurantState)}
                    className="input"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="visited">Visited</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-secondary"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
