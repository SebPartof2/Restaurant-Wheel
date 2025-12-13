// Users management page

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';
import type { User } from '../../types';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [showProvisionalForm, setShowProvisionalForm] = useState(false);
  const [provisionalEmail, setProvisionalEmail] = useState('');
  const [provisionalName, setProvisionalName] = useState('');
  const toast = useToast();

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

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.addToWhitelist({ email: newEmail });
      toast.success('Email added to whitelist');
      setNewEmail('');
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to add to whitelist');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const { user } = await api.updateUser(editingUser.id, {
        name: editName || undefined,
        email: editEmail,
      });

      setUsers(users.map(u => u.id === user.id ? user : u));
      toast.success('User updated successfully');
      handleCancelEdit();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProvisionalUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      const { user } = await api.createProvisionalUser({
        email: provisionalEmail,
        name: provisionalName || undefined,
      });

      setUsers([user, ...users]);
      toast.success('Provisional user created successfully');
      setProvisionalEmail('');
      setProvisionalName('');
      setShowProvisionalForm(false);
    } catch (error) {
      toast.error('Failed to create provisional user');
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users and whitelist</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowProvisionalForm(!showProvisionalForm);
                setShowAddForm(false);
              }}
              className="btn btn-primary"
            >
              {showProvisionalForm ? 'Cancel' : '+ Create Provisional User'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowProvisionalForm(false);
              }}
              className="btn btn-secondary"
            >
              {showAddForm ? 'Cancel' : '+ Add to Whitelist'}
            </button>
            <Link to="/admin/pending" className="btn btn-secondary">
              Back to Admin →
            </Link>
          </div>
        </div>

        {showProvisionalForm && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Provisional User</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create a provisional user with an email. A 5-character signup code will be generated that they must use during signup.
            </p>
            <form onSubmit={handleCreateProvisionalUser} className="space-y-3">
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={provisionalEmail}
                  onChange={(e) => setProvisionalEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Name (optional)</label>
                <input
                  type="text"
                  value={provisionalName}
                  onChange={(e) => setProvisionalName(e.target.value)}
                  placeholder="User's name"
                  className="input"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Provisional User'}
              </button>
            </form>
          </div>
        )}

        {showAddForm && (
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Email to Whitelist</h2>
            <form onSubmit={handleAddToWhitelist} className="flex gap-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                className="input flex-1"
                required
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-2">
              Note: In this demo, whitelisted emails need to be added to the config file on the backend.
            </p>
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Signup Code</th>
                  <th className="text-left py-3 px-4">Whitelisted</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.name || '-'}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.is_admin ? (
                        <span className="badge badge-active">Admin</span>
                      ) : (
                        <span className="badge badge-pending">User</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.is_provisional ? (
                        <span className="badge badge-upcoming">Provisional</span>
                      ) : (
                        <span className="badge badge-visited">Active</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.signup_code ? (
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-bold">
                          {user.signup_code}
                        </code>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {user.is_whitelisted ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="btn btn-secondary text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input"
                    placeholder="User's name"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input"
                    required
                  />
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
