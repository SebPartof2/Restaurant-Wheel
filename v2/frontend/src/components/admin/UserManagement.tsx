import { useState, useEffect } from 'react';
import type { User } from '../../../../shared/types';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const response = await fetch('/api/admin/users/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add to whitelist');
      }

      setNewEmail('');
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/whitelist?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove from whitelist');
      }

      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Management</h1>

        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add to Whitelist */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add Email to Whitelist</h2>
          <form onSubmit={handleAddToWhitelist} className="flex gap-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@example.com"
              className="glass-input flex-1 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-navy-900"
              required
            />
            <button
              type="submit"
              disabled={isAdding}
              className="bg-navy-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add to Whitelist'}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-2">
            Users will be able to sign in with S-Auth once their email is whitelisted.
          </p>
        </div>

        {/* Users Table */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">All Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">OAuth Subject</th>
                  <th className="text-left py-3 px-4">Access Level</th>
                  <th className="text-left py-3 px-4">Last Login</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/10">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.given_name && user.family_name
                        ? `${user.given_name} ${user.family_name}`
                        : user.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {user.oauth_subject || '-'}
                      </code>
                    </td>
                    <td className="py-3 px-4">{user.access_level || '-'}</td>
                    <td className="py-3 px-4">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {user.is_admin && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            Admin
                          </span>
                        )}
                        {user.is_whitelisted && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Whitelisted
                          </span>
                        )}
                        {user.is_provisional && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Provisional
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_whitelisted && !user.is_admin && (
                        <button
                          onClick={() => handleRemoveFromWhitelist(user.email)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
