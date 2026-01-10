import { Layout } from '../layout/Layout';
import { useUsers } from '../../hooks/useAdmin';
import { useAddToWhitelist, useRemoveFromWhitelist } from '../../hooks/useAdmin';
import { useState } from 'react';

export function UserManagement() {
  const { data: usersData, isLoading, error: loadError, refetch } = useUsers();
  const addToWhitelist = useAddToWhitelist();
  const removeFromWhitelist = useRemoveFromWhitelist();

  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const users = usersData?.users || [];

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      return;
    }

    try {
      setError(null);
      await addToWhitelist.mutateAsync(newEmail.trim());
      setNewEmail('');
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to add to whitelist');
    }
  };

  const handleRemoveFromWhitelist = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) {
      return;
    }

    try {
      setError(null);
      await removeFromWhitelist.mutateAsync(email);
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to remove from whitelist');
    }
  };

  return (
    <Layout>
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {!isLoading && (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-900 mb-8">User Management</h1>

          {(error || loadError) && (
            <div className="glass-card p-4 mb-6 bg-red-50 border-2 border-red-200">
              <p className="text-red-800 font-medium">{error || loadError?.message}</p>
            </div>
          )}

          {/* Add to Whitelist */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Add Email to Whitelist</h2>
            <form onSubmit={handleAddToWhitelist} className="flex gap-4">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={addToWhitelist.isPending}
                className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToWhitelist.isPending ? 'Adding...' : 'Add to Whitelist'}
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-3">
              Users will be able to sign in with S-Auth once their email is whitelisted.
            </p>
          </div>

          {/* Users Table */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">All Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-white/30">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">OAuth Subject</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Access Level</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-white/30 transition-colors">
                      <td className="py-4 px-4 text-sm">{user.email}</td>
                      <td className="py-4 px-4 text-sm">
                        {user.given_name && user.family_name
                          ? `${user.given_name} ${user.family_name}`
                          : user.name || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-navy-900/10 text-navy-900 px-2 py-1 rounded font-mono">
                          {user.oauth_subject || '-'}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-sm">{user.access_level || '-'}</td>
                      <td className="py-4 px-4 text-sm">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {user.is_admin && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                              Admin
                            </span>
                          )}
                          {user.is_whitelisted && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Whitelisted
                            </span>
                          )}
                          {user.is_provisional && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              Provisional
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.is_whitelisted && !user.is_admin && (
                          <button
                            onClick={() => handleRemoveFromWhitelist(user.email)}
                            disabled={removeFromWhitelist.isPending}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
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
      )}
    </Layout>
  );
}
