import { Link } from 'react-router';
import type { RestaurantPhoto } from '../../../../shared/types';

interface PhotoFeedItemProps {
  photo: RestaurantPhoto;
  restaurantName?: string;
  onClick: () => void;
}

export function PhotoFeedItem({ photo, restaurantName, onClick }: PhotoFeedItemProps) {
  return (
    <div
      className="glass-card-hover cursor-pointer overflow-hidden group"
    >
      <div className="aspect-square bg-gray-200 overflow-hidden" onClick={onClick}>
        <img
          src={photo.original_url}
          alt={photo.caption || 'Restaurant photo'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <div className="mb-2">
          <Link
            to={`/restaurants/${photo.restaurant_id}`}
            className="font-semibold text-navy-900 truncate hover:underline"
          >
            {restaurantName || `Restaurant #${photo.restaurant_id}`}
          </Link>
        </div>

        {photo.caption && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {photo.caption}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            By {photo.uploaded_by?.name || photo.uploaded_by?.email || 'Unknown'}
          </span>
          <span>•</span>
          <span>
            {new Date(photo.created_at!).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
