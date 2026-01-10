import { useParams, useNavigate, Link } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { useRestaurant } from '../hooks/useRestaurant';
import { usePhotos } from '../hooks/usePhotos';
import { useAuth } from '../contexts/AuthContext';
import { PhotoGallery } from '../components/photos/PhotoGallery';
import { PhotoUploadDialog } from '../components/photos/PhotoUploadDialog';
import { useState } from 'react';
import {
  useApproveRestaurant,
  useRejectRestaurant,
  useConfirmUpcoming,
  useMarkVisited,
} from '../hooks/useUpdateRestaurant';

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const restaurantId = id ? parseInt(id, 10) : undefined;
  const { data: restaurantData, isLoading, error } = useRestaurant(restaurantId);
  const { data: photosData } = usePhotos(restaurantId);

  const approveRestaurant = useApproveRestaurant();
  const rejectRestaurant = useRejectRestaurant();
  const confirmUpcoming = useConfirmUpcoming();
  const markVisited = useMarkVisited();

  if (isLoading) {
    return (
      <Layout>
        <div className="glass-card p-8 animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </Layout>
    );
  }

  if (error || !restaurantData) {
    return (
      <Layout>
        <div className="glass-card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load restaurant</p>
          <p className="text-gray-600 mt-2">{error?.message || 'Restaurant not found'}</p>
          <Link
            to="/nominations"
            className="inline-block mt-4 text-navy-900 hover:underline"
          >
            Back to Restaurants
          </Link>
        </div>
      </Layout>
    );
  }

  const restaurant = restaurantData.restaurant;
  const photos = photosData?.photos || [];
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

  const getStateBadgeClass = (state: string) => {
    switch (state) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'visited':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!restaurant.id) return;
    try {
      await approveRestaurant.mutateAsync(restaurant.id);
    } catch (err: any) {
      alert(err.message || 'Failed to approve restaurant');
    }
  };

  const handleReject = async () => {
    if (!restaurant.id) return;
    if (!confirm('Are you sure you want to reject this nomination? This will delete the restaurant.')) {
      return;
    }
    try {
      await rejectRestaurant.mutateAsync(restaurant.id);
      navigate('/nominations');
    } catch (err: any) {
      alert(err.message || 'Failed to reject restaurant');
    }
  };

  const handleConfirmUpcoming = async () => {
    if (!restaurant.id) return;
    const datetime = prompt('Enter reservation date and time (YYYY-MM-DD HH:MM):');
    if (!datetime) return;

    try {
      await confirmUpcoming.mutateAsync({
        id: restaurant.id,
        reservation_datetime: datetime,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to confirm upcoming restaurant');
    }
  };

  const handleMarkVisited = async () => {
    if (!restaurant.id) return;
    const date = prompt('Enter visit date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!date) return;

    try {
      await markVisited.mutateAsync({
        id: restaurant.id,
        visit_date: date,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to mark as visited');
    }
  };

  return (
    <Layout>
      {/* Back Button */}
      <Link
        to="/nominations"
        className="inline-flex items-center gap-2 text-navy-900 hover:underline mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Restaurants
      </Link>

      {/* Hero Section */}
      <div className="glass-card p-8 mb-6">
        {primaryPhoto && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={primaryPhoto.original_url}
              alt={restaurant.name}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-2">{restaurant.name}</h1>
            <p className="text-lg text-gray-600">{restaurant.address}</p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateBadgeClass(restaurant.state)}`}>
              {restaurant.state.charAt(0).toUpperCase() + restaurant.state.slice(1)}
            </span>
            {!!restaurant.is_fast_food && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Fast Food
              </span>
            )}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {restaurant.nominated_by && (
            <div>
              <span className="text-sm text-gray-600">Nominated By:</span>
              <p className="font-medium">{restaurant.nominated_by.name || restaurant.nominated_by.email}</p>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-600">Added:</span>
            <p className="font-medium">{new Date(restaurant.created_at).toLocaleDateString()}</p>
          </div>
          {restaurant.average_rating > 0 && (
            <div>
              <span className="text-sm text-gray-600">Average Rating:</span>
              <p className="font-medium">{restaurant.average_rating.toFixed(2)} / 10</p>
            </div>
          )}
          {restaurant.state === 'visited' && restaurant.visited_at && (
            <div>
              <span className="text-sm text-gray-600">Visited:</span>
              <p className="font-medium">{new Date(restaurant.visited_at).toLocaleDateString()}</p>
            </div>
          )}
          {restaurant.state === 'upcoming' && restaurant.reservation_datetime && (
            <div>
              <span className="text-sm text-gray-600">Reservation:</span>
              <p className="font-medium">{new Date(restaurant.reservation_datetime).toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="flex gap-4 mt-6">
          {restaurant.menu_link && (
            <a
              href={restaurant.menu_link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-colors"
            >
              View Menu
            </a>
          )}
          {restaurant.photo_link && (
            <a
              href={restaurant.photo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-colors"
            >
              View Photos
            </a>
          )}
        </div>

        {/* Admin Actions */}
        {user?.is_admin && (
          <div className="mt-6 pt-6 border-t border-gray-300">
            <h3 className="font-semibold text-navy-900 mb-3">Admin Actions</h3>
            <div className="flex flex-wrap gap-3">
              {restaurant.state === 'pending' && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={approveRestaurant.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={rejectRestaurant.isPending}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
              {restaurant.state === 'active' && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  In Wheel Pool
                </span>
              )}
              {restaurant.state === 'upcoming' && (
                <>
                  <button
                    onClick={handleConfirmUpcoming}
                    disabled={confirmUpcoming.isPending}
                    className="glass-button px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-colors"
                  >
                    Update Reservation
                  </button>
                  <button
                    onClick={handleMarkVisited}
                    disabled={markVisited.isPending}
                    className="bg-navy-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50"
                  >
                    Mark as Visited
                  </button>
                </>
              )}
              {restaurant.state === 'visited' && (
                <Link
                  to={`/admin/visited`}
                  className="glass-button px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-colors"
                >
                  Manage Ratings & Attendance
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900">Photos</h2>
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="glass-button px-4 py-2 rounded-lg font-medium hover:bg-white/40 transition-colors"
          >
            Upload Photo
          </button>
        </div>

        {photos.length > 0 ? (
          <PhotoGallery photos={photos} restaurantName={restaurant.name} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No photos yet. Be the first to upload!</p>
          </div>
        )}
      </div>

      {/* Photo Upload Dialog */}
      <PhotoUploadDialog
        restaurantId={restaurant.id!}
        open={showPhotoUpload}
        onOpenChange={setShowPhotoUpload}
        onUploadComplete={() => {
          setShowPhotoUpload(false);
        }}
      />
    </Layout>
  );
}
