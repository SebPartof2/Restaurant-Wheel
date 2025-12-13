// Restaurant card component

import React from 'react';
import { Link } from 'react-router-dom';
import type { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  showActions?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onMarkVisited?: (id: number) => void;
  onEdit?: (restaurant: Restaurant) => void;
  isAdmin?: boolean;
}

const getBadgeContent = (state: string) => {
  switch (state) {
    case 'pending':
      return '⏳ Pending';
    case 'active':
      return '✓ Active';
    case 'upcoming':
      return '📅 Upcoming';
    case 'visited':
      return '✔ Visited';
    default:
      return state;
  }
};

export function RestaurantCard({
  restaurant,
  showActions,
  onApprove,
  onReject,
  onMarkVisited,
  onEdit,
  isAdmin,
}: RestaurantCardProps) {
  return (
    <div className="card hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
            {restaurant.is_fast_food && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Fast Food
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{restaurant.address}</p>
        </div>
        <span className={`badge badge-${restaurant.state}`}>
          {getBadgeContent(restaurant.state)}
        </span>
      </div>

      {restaurant.state === 'upcoming' && restaurant.reservation_datetime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <p className="text-xs text-blue-600 font-medium">Reservation:</p>
          <p className="text-xs font-bold text-blue-900">
            {new Date(restaurant.reservation_datetime).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}

      {restaurant.state === 'visited' && restaurant.visited_at && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
          <p className="text-xs text-green-600 font-medium">Visited:</p>
          <p className="text-xs font-bold text-green-900">
            {new Date(restaurant.visited_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      )}

      {restaurant.average_rating > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{restaurant.average_rating.toFixed(1)}</span>
          <span className="text-gray-500 text-sm">/ 10</span>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {restaurant.menu_link && (
          <a
            href={restaurant.menu_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Menu →
          </a>
        )}

        {restaurant.photo_link && (
          <a
            href={restaurant.photo_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Photo →
          </a>
        )}

        <Link
          to={`/nominations/${restaurant.id}`}
          className="text-primary hover:underline text-sm ml-auto"
        >
          Details →
        </Link>
      </div>

      {isAdmin && onEdit && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => onEdit(restaurant)}
            className="btn btn-secondary text-sm w-full"
          >
            Edit Restaurant
          </button>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          {restaurant.state === 'pending' && onApprove && onReject && (
            <>
              <button
                onClick={() => onApprove(restaurant.id)}
                className="btn btn-primary text-sm flex-1"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(restaurant.id)}
                className="btn btn-danger text-sm flex-1"
              >
                Reject
              </button>
            </>
          )}

          {restaurant.state === 'upcoming' && onMarkVisited && (
            <button
              onClick={() => onMarkVisited(restaurant.id)}
              className="btn btn-primary text-sm w-full"
            >
              Mark as Visited
            </button>
          )}
        </div>
      )}
    </div>
  );
}
