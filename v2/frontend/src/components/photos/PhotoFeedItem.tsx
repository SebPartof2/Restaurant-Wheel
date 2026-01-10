import type { RestaurantPhoto } from '../../../../shared/types';

interface PhotoFeedItemProps {
  photo: RestaurantPhoto;
  onClick: () => void;
}

export function PhotoFeedItem({ photo, onClick }: PhotoFeedItemProps) {
  return (
    <div
      onClick={onClick}
      className="glass-card-hover cursor-pointer overflow-hidden group"
    >
      <div className="aspect-square bg-gray-200 overflow-hidden">
        <img
          src={photo.thumbnail_url || photo.original_url}
          alt={photo.caption || 'Restaurant photo'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-navy-900 truncate">
            Restaurant #{photo.restaurant_id}
          </h3>
          {photo.is_primary && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Primary
            </span>
          )}
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
