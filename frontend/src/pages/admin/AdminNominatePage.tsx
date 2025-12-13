// Admin nominate page - create nominations on behalf of users

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import type { User } from '../../types';

export function AdminNominatePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isFastFood, setIsFastFood] = useState(false);
  const [menuLink, setMenuLink] = useState('');
  const [photoLink, setPhotoLink] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { users } = await api.getUsers();
      setUsers(users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    setSubmitting(true);
    try {
      await api.createRestaurant({
        name,
        address,
        is_fast_food: isFastFood,
        menu_link: menuLink || undefined,
        photo_link: photoLink || undefined,
        nominated_by_user_id: parseInt(selectedUserId),
      });

      toast.success('Restaurant nominated successfully!');
      navigate('/nominations');
    } catch (error) {
      toast.error('Failed to create nomination');
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nominate for User</h1>
          <p className="text-gray-600 mt-1">Create a restaurant nomination on behalf of a family member</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Nominating For *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input"
                required
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Restaurant Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Joe's Pizza"
                required
              />
            </div>

            <div>
              <label className="label">Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
                placeholder="123 Main St, City, State"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFastFood"
                checked={isFastFood}
                onChange={(e) => setIsFastFood(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="isFastFood" className="text-sm text-gray-700">
                Fast Food
              </label>
            </div>

            <div>
              <label className="label">Menu Link (optional)</label>
              <input
                type="url"
                value={menuLink}
                onChange={(e) => setMenuLink(e.target.value)}
                className="input"
                placeholder="https://example.com/menu"
              />
            </div>

            <div>
              <label className="label">Photo Link (optional)</label>
              <input
                type="url"
                value={photoLink}
                onChange={(e) => setPhotoLink(e.target.value)}
                className="input"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate('/nominations')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Nomination'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
