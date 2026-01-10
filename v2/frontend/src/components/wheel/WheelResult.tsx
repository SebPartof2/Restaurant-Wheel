import { Link } from 'react-router';
import type { Restaurant } from '../../../../shared/types';

interface WheelResultProps {
  restaurant: Restaurant;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
}

export function WheelResult({ restaurant, onConfirm, onCancel, isConfirming }: WheelResultProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 max-w-2xl w-full animate-scale-in">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-navy-900 mb-2">We Have a Winner!</h2>
          <p className="text-gray-600">The wheel has spoken...</p>
        </div>

        {/* Restaurant Info */}
        <div className="glass-card p-6 mb-6 bg-gradient-to-br from-blue-50 to-white">
          <h3 className="text-4xl font-bold text-navy-900 mb-4 text-center">
            {restaurant.name}
          </h3>
          <p className="text-lg text-gray-700 text-center mb-4">{restaurant.address}</p>

          <div className="flex items-center justify-center gap-4 mb-4">
            {restaurant.is_fast_food && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Fast Food
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Nominated by {restaurant.nominated_by?.name || 'Unknown'}
            </span>
          </div>

          {restaurant.menu_link && (
            <div className="text-center">
              <a
                href={restaurant.menu_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-navy-900 hover:underline font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                View Menu
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 bg-navy-900 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? 'Confirming...' : "Let's Go! 🎊"}
          </button>
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 glass-button px-6 py-4 rounded-lg font-bold text-lg hover:bg-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Spin Again
          </button>
        </div>

        {/* Quick Link to Details */}
        <div className="text-center mt-4">
          <Link
            to={`/nominations/${restaurant.id}`}
            className="text-sm text-navy-900 hover:underline"
          >
            View Full Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
