// Wheel page

import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { SpinningWheel } from '../components/wheel/SpinningWheel';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import type { Restaurant } from '../types';

export function WheelPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [excludeFastFood, setExcludeFastFood] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadActiveRestaurants();
  }, [excludeFastFood]);

  const loadActiveRestaurants = async () => {
    try {
      const { restaurants } = await api.getActiveRestaurants(excludeFastFood);
      setRestaurants(restaurants);
    } catch (error) {
      toast.error('Failed to load active restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    if (restaurants.length === 0) {
      toast.error('No restaurants available to spin!');
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setSelectedRestaurant(null);
    setIsConfirmed(false);

    try {
      const { restaurant } = await api.spinWheel({ exclude_fast_food: excludeFastFood });
      setSelectedRestaurant(restaurant);

      // Show result after animation (4 seconds)
      setTimeout(() => {
        setShowResult(true);
        setIsSpinning(false);
        toast.success(`Selected: ${restaurant.name}!`);
      }, 4000);
    } catch (error) {
      toast.error('Failed to spin wheel');
      setIsSpinning(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedRestaurant) return;

    setConfirming(true);
    try {
      await api.confirmRestaurantUpcoming(selectedRestaurant.id);
      setIsConfirmed(true);
      toast.success('Restaurant moved to upcoming!');
      await loadActiveRestaurants(); // Reload to remove from active list
    } catch (error) {
      toast.error('Failed to confirm selection');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelSelection = () => {
    setShowResult(false);
    setSelectedRestaurant(null);
    setIsConfirmed(false);
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎡 The Wheel</h1>
          <p className="text-gray-600">Spin the wheel to pick your next restaurant!</p>
        </div>

        {/* Controls */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="excludeFastFood"
                checked={excludeFastFood}
                onChange={(e) => setExcludeFastFood(e.target.checked)}
                disabled={isSpinning}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="excludeFastFood" className="text-sm text-gray-700">
                Exclude Fast Food
              </label>
            </div>

            <div className="text-sm text-gray-600">
              {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} available
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || restaurants.length === 0}
            className="btn btn-primary w-full text-lg py-4"
          >
            {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
          </button>
        </div>

        {/* Wheel */}
        <div className="card">
          <SpinningWheel
            restaurants={restaurants}
            isSpinning={isSpinning}
            selectedRestaurant={selectedRestaurant}
          />
        </div>

        {/* Result */}
        {showResult && selectedRestaurant && (
          <div className={`card ${isConfirmed ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isConfirmed ? '✅ Confirmed!' : '🎉 Winner!'}
              </h2>
              <h3 className="text-3xl font-bold text-primary mb-2">{selectedRestaurant.name}</h3>
              <p className="text-gray-600 mb-4">{selectedRestaurant.address}</p>

              {isConfirmed ? (
                <div className="space-y-4">
                  <p className="text-green-700 font-medium">
                    This restaurant has been moved to "Upcoming" status!
                  </p>
                  <div className="flex gap-3 justify-center">
                    {selectedRestaurant.menu_link && (
                      <a
                        href={selectedRestaurant.menu_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View Menu
                      </a>
                    )}
                    <button
                      onClick={handleSpin}
                      className="btn btn-primary"
                    >
                      Spin Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-blue-700">
                    Confirm this selection to move it to "Upcoming" status, or cancel to spin again.
                  </p>
                  <div className="flex gap-3 justify-center">
                    {selectedRestaurant.menu_link && (
                      <a
                        href={selectedRestaurant.menu_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        View Menu
                      </a>
                    )}
                    <button
                      onClick={handleCancelSelection}
                      className="btn btn-secondary"
                      disabled={confirming}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSelection}
                      className="btn btn-primary"
                      disabled={confirming}
                    >
                      {confirming ? 'Confirming...' : 'Confirm Selection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
