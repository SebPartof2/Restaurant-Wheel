import { Layout } from '../../components/layout/Layout';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useApproveRestaurant, useRejectRestaurant } from '../../hooks/useUpdateRestaurant';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

export function PendingNominationsPage() {
  const { data, isLoading, error } = useRestaurants({ state: 'pending', sort: 'date' });
  const approveRestaurant = useApproveRestaurant();
  const rejectRestaurant = useRejectRestaurant();

  const handleApprove = async (id: number, name: string) => {
    if (!confirm(`Approve "${name}" and add it to the active pool?`)) return;

    try {
      await approveRestaurant.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Failed to approve restaurant');
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Reject and delete "${name}"? This action cannot be undone.`)) return;

    try {
      await rejectRestaurant.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Failed to reject restaurant');
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Pending Nominations</h1>
        <p className="text-lg text-gray-600">Review and approve restaurant nominations</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending nominations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load pending nominations</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.restaurants.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">All Caught Up!</h2>
          <p className="text-gray-600">No pending nominations to review</p>
        </div>
      )}

      {/* Pending Restaurants Table */}
      {!isLoading && !error && data && data.restaurants.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900/10">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Restaurant
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Address
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Nominator
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Submitted
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="border-t border-gray-200 hover:bg-white/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        to={`/nominations/${restaurant.id}`}
                        className="font-semibold text-navy-900 hover:underline"
                      >
                        {restaurant.name}
                      </Link>
                      {restaurant.menu_link && (
                        <a
                          href={restaurant.menu_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-navy-900 hover:text-navy-700"
                          title="View Menu"
                        >
                          <ExternalLink className="w-4 h-4 inline" />
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">
                      {restaurant.address}
                    </td>
                    <td className="py-4 px-4">
                      {!!restaurant.is_fast_food ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Fast Food
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Sit-down
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {restaurant.nominated_by?.name || restaurant.nominated_by?.email || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(restaurant.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(restaurant.id!, restaurant.name)}
                          disabled={approveRestaurant.isPending}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(restaurant.id!, restaurant.name)}
                          disabled={rejectRestaurant.isPending}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {data.restaurants.length} pending nomination{data.restaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
