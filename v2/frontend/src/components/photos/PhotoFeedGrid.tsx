import type { RestaurantPhoto } from '../../../../shared/types';
import { PhotoFeedItem } from './PhotoFeedItem';

interface PhotoFeedGridProps {
  photos: RestaurantPhoto[];
  restaurantNames: Record<number, string>;
  onPhotoClick: (photo: RestaurantPhoto, index: number) => void;
}

export function PhotoFeedGrid({ photos, restaurantNames, onPhotoClick }: PhotoFeedGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Photos Yet</h3>
        <p className="text-gray-600">Upload photos to restaurants to see them here!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo, index) => (
        <PhotoFeedItem
          key={photo.id}
          photo={photo}
          restaurantName={restaurantNames[photo.restaurant_id]}
          onClick={() => onPhotoClick(photo, index)}
        />
      ))}
    </div>
  );
}
