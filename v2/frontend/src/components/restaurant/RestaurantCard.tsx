import { Star, MapPin, Calendar } from 'lucide-react';
import type { Restaurant } from '../../../../shared/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  const getStateBadgeClass = (state: string) => {
    switch (state) {
      case 'pending':
        return 'bg-yellow-500/90 text-white';
      case 'active':
        return 'bg-green-500/90 text-white';
      case 'upcoming':
        return 'bg-blue-500/90 text-white';
      case 'visited':
        return 'bg-purple-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  return (
    <div
      className="glass-card-hover overflow-hidden cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {/* Photo Hero */}
      <div className="relative aspect-video bg-gradient-to-br from-navy-900 to-navy-800">
        {restaurant.primary_photo ? (
          <img
            src={restaurant.primary_photo.thumbnail_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <h3 className="text-white text-xl md:text-2xl font-bold text-center line-clamp-3">
              {restaurant.name}
            </h3>
          </div>
        )}

        {/* State Badge */}
        <div className="absolute top-2 right-2">
          <span className={`${getStateBadgeClass(restaurant.state)} px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm`}>
            {restaurant.state.charAt(0).toUpperCase() + restaurant.state.slice(1)}
          </span>
        </div>

        {/* Fast Food Badge */}
        {!!restaurant.is_fast_food && (
          <div className="absolute top-2 left-2">
            <span className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
              Fast Food
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg leading-tight mb-2">{restaurant.name}</h3>

        <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{restaurant.address}</span>
        </div>

        {restaurant.average_rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{restaurant.average_rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">/ 10</span>
          </div>
        )}

        {restaurant.reservation_datetime && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(restaurant.reservation_datetime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-3">
          Nominated by {restaurant.nominated_by?.name || 'User'}
        </p>
      </div>
    </div>
  );
}
