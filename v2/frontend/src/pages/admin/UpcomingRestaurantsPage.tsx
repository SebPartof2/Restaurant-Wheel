import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useConfirmUpcoming, useMarkVisited } from '../../hooks/useUpdateRestaurant';
import { Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

export function UpcomingRestaurantsPage() {
  const { data, isLoading, error } = useRestaurants({ state: 'upcoming', sort: 'date' });
  const confirmUpcoming = useConfirmUpcoming();
  const markVisited = useMarkVisited();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState('');

  const handleEditReservation = (id: number, currentDate: string | null) => {
    setEditingId(id);
    if (currentDate) {
      // Convert ISO string to datetime-local format
      const date = new Date(currentDate);
      const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEditingDate(formatted);
    } else {
      setEditingDate('');
    }
  };

  const handleSaveReservation = async (id: number) => {
    if (!editingDate) {
      alert('Please select a date and time');
      return;
    }

    try {
      await confirmUpcoming.mutateAsync({
        id,
        reservation_datetime: new Date(editingDate).toISOString(),
      });
      setEditingId(null);
      setEditingDate('');
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingDate('');
  };

  const handleMarkVisited = async (id: number, name: string) => {
    const visitDate = prompt(`Enter visit date for "${name}" (leave empty for today):`);
    if (visitDate === null) return; // User cancelled

    try {
      const dateToUse = visitDate.trim() || new Date().toISOString();
      await markVisited.mutateAsync({
        id,
        visit_date: dateToUse,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to mark as visited');
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Upcoming Restaurants</h1>
        <p className="text-lg text-gray-600">Manage reservations and mark as visited</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading upcoming restaurants...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load upcoming restaurants</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.restaurants.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Upcoming Visits</h2>
          <p className="text-gray-600 mb-6">Spin the wheel to select your next restaurant!</p>
          <Link
            to="/wheel"
            className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors"
          >
            Go to Wheel
          </Link>
        </div>
      )}

      {/* Upcoming Restaurants Table */}
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
                    Reservation
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">
                    Nominator
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
                      {!!restaurant.is_fast_food && (
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Fast Food
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">
                      {restaurant.address}
                    </td>
                    <td className="py-4 px-4">
                      {editingId === restaurant.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
                          />
                          <button
                            onClick={() => handleSaveReservation(restaurant.id!)}
                            disabled={confirmUpcoming.isPending}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-2 rounded-lg glass-button font-medium hover:bg-white/40 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {restaurant.reservation_datetime
                              ? new Date(restaurant.reservation_datetime).toLocaleString()
                              : 'Not set'}
                          </span>
                          <button
                            onClick={() =>
                              handleEditReservation(restaurant.id!, restaurant.reservation_datetime)
                            }
                            className="ml-2 text-sm text-navy-900 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {restaurant.nominated_by?.name || restaurant.nominated_by?.email || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleMarkVisited(restaurant.id!, restaurant.name)}
                        disabled={markVisited.isPending}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Visited
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {data.restaurants.length} upcoming visit{data.restaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
