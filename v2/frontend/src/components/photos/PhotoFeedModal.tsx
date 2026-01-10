import type { RestaurantPhoto } from '../../../../shared/types';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';

interface PhotoFeedModalProps {
  photo: RestaurantPhoto | null;
  photos: RestaurantPhoto[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function PhotoFeedModal({
  photo,
  photos,
  currentIndex,
  open,
  onClose,
  onPrevious,
  onNext,
}: PhotoFeedModalProps) {
  if (!open || !photo) return null;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous Button */}
      {hasPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Photo Content */}
      <div className="max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <img
            src={photo.original_url}
            alt={photo.caption || 'Restaurant photo'}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>

        {/* Photo Info */}
        <div className="glass-card p-6 bg-white/10 backdrop-blur-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link
                to={`/nominations/${photo.restaurant_id}`}
                onClick={onClose}
                className="text-xl font-bold text-white hover:underline flex items-center gap-2"
              >
                View Restaurant
                <ExternalLink className="w-4 h-4" />
              </Link>
              {photo.caption && (
                <p className="text-gray-200 mt-1">{photo.caption}</p>
              )}
            </div>
            {photo.is_primary && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                Primary
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>
              Uploaded by {photo.uploaded_by?.name || photo.uploaded_by?.email || 'Unknown'}
            </span>
            <span>•</span>
            <span>
              {new Date(photo.created_at!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Navigation Counter */}
          <div className="mt-4 text-center text-sm text-gray-400">
            Photo {currentIndex + 1} of {photos.length}
          </div>
        </div>
      </div>
    </div>
  );
}
