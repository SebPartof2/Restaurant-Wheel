import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAllPhotos } from '../hooks/usePhotos';
import { useRestaurants } from '../hooks/useRestaurants';
import { PhotoFeedGrid } from '../components/photos/PhotoFeedGrid';
import { PhotoFeedModal } from '../components/photos/PhotoFeedModal';
import type { RestaurantPhoto } from '../../../shared/types';

export function PhotoFeedPage() {
  const [sort, setSort] = useState<'recent' | 'restaurant'>('recent');
  const [filterRestaurantId, setFilterRestaurantId] = useState<number | undefined>(undefined);
  const [selectedPhoto, setSelectedPhoto] = useState<RestaurantPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: photosData, isLoading: photosLoading } = useAllPhotos({
    sort,
    restaurant_id: filterRestaurantId,
  });

  const { data: restaurantsData } = useRestaurants({});

  const photos = photosData?.photos || [];
  const restaurants = restaurantsData?.restaurants || [];

  const handlePhotoClick = (photo: RestaurantPhoto, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        handleCloseModal();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedIndex, photos.length]);

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Photo Feed</h1>
        <p className="text-lg text-gray-600">
          Explore photos from all restaurants in one place
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sort */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'restaurant')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
            >
              <option value="recent">Most Recent</option>
              <option value="restaurant">By Restaurant</option>
            </select>
          </div>

          {/* Filter by Restaurant */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Restaurant
            </label>
            <select
              value={filterRestaurantId || ''}
              onChange={(e) =>
                setFilterRestaurantId(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900"
            >
              <option value="">All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter */}
          {filterRestaurantId && (
            <div className="flex items-end">
              <button
                onClick={() => setFilterRestaurantId(undefined)}
                className="px-4 py-2 rounded-lg glass-button font-medium hover:bg-white/40 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {photosLoading ? (
            'Loading photos...'
          ) : (
            <>
              {photos.length} photo{photos.length !== 1 ? 's' : ''} found
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {photosLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      )}

      {/* Photo Grid */}
      {!photosLoading && (
        <div className="glass-card p-8">
          <PhotoFeedGrid photos={photos} onPhotoClick={handlePhotoClick} />
        </div>
      )}

      {/* Photo Modal */}
      <PhotoFeedModal
        photo={selectedPhoto}
        photos={photos}
        currentIndex={selectedIndex}
        open={isModalOpen}
        onClose={handleCloseModal}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </Layout>
  );
}
