import { useState } from 'react';
import { useUsers } from '../../hooks/useAdmin';
import { useVisits } from '../../hooks/useVisits';
import { useMarkAttendance, useSubmitRating } from '../../hooks/useVisits';
import { Check, X, Save } from 'lucide-react';

interface RatingManagementProps {
  restaurantId: number;
  restaurantName: string;
}

export function RatingManagement({ restaurantId, restaurantName }: RatingManagementProps) {
  const { data: usersData } = useUsers();
  const { data: visitsData, refetch } = useVisits(restaurantId);
  const markAttendance = useMarkAttendance();
  const submitRating = useSubmitRating();

  const [ratings, setRatings] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const users = usersData?.users || [];
  const visits = visitsData?.visits || [];

  // Create a map of user visits
  const visitMap = new Map(visits.map((v) => [v.user_id, v]));

  const handleAttendanceToggle = async (userId: number) => {
    const visit = visitMap.get(userId);
    const newAttended = !visit?.attended;

    try {
      await markAttendance.mutateAsync({
        restaurantId,
        userId,
        attended: newAttended,
      });
      await refetch();
    } catch (error: any) {
      alert(error.message || 'Failed to update attendance');
    }
  };

  const handleRatingChange = (userId: number, value: string) => {
    setRatings({ ...ratings, [userId]: value });
  };

  const handleSaveRating = async (userId: number) => {
    const ratingValue = ratings[userId];
    if (!ratingValue) return;

    const numRating = parseFloat(ratingValue);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) {
      alert('Rating must be between 0 and 10');
      return;
    }

    setSaving(true);
    try {
      await submitRating.mutateAsync({
        restaurantId,
        userId,
        rating: numRating,
      });
      setRatings({ ...ratings, [userId]: '' });
      await refetch();
    } catch (error: any) {
      alert(error.message || 'Failed to save rating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-navy-900 mb-4">
        Rating & Attendance for {restaurantName}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Attended
              </th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">
                Current Rating
              </th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                New Rating
              </th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const visit = visitMap.get(user.id!);
              return (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-white/30">
                  <td className="py-3 px-2 text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => handleAttendanceToggle(user.id!)}
                      className={`p-2 rounded-lg transition-colors ${
                        visit?.attended
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={visit?.attended ? 'Mark as not attended' : 'Mark as attended'}
                    >
                      {visit?.attended ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-2 text-center text-sm text-gray-700">
                    {visit?.rating ? visit.rating.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={ratings[user.id!] || ''}
                      onChange={(e) => handleRatingChange(user.id!, e.target.value)}
                      placeholder="0.0 - 10.0"
                      className="w-32 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleSaveRating(user.id!)}
                      disabled={!ratings[user.id!] || saving}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
