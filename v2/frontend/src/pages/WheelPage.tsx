import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { SpinningWheel } from '../components/wheel/SpinningWheel';
import { WheelResult } from '../components/wheel/WheelResult';
import { useActiveRestaurants } from '../hooks/useWheel';
import { useSpinWheel } from '../hooks/useWheel';
import { useConfirmUpcoming } from '../hooks/useUpdateRestaurant';
import type { Restaurant } from '../../../shared/types';

export function WheelPage() {
  const [excludeFastFood, setExcludeFastFood] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: activeData, isLoading } = useActiveRestaurants(excludeFastFood);
  const spinWheel = useSpinWheel();
  const confirmUpcoming = useConfirmUpcoming();

  const activeRestaurants = activeData?.restaurants || [];
  const canSpin = activeRestaurants.length >= 2 && !isSpinning;

  const handleSpin = async () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setShowResult(false);

    try {
      const result = await spinWheel.mutateAsync(excludeFastFood);
      setSelectedRestaurant(result.restaurant);
    } catch (error: any) {
      alert(error.message || 'Failed to spin the wheel');
      setIsSpinning(false);
    }
  };

  const handleSpinComplete = () => {
    setShowResult(true);
    setIsSpinning(false);
  };

  const handleConfirm = async () => {
    if (!selectedRestaurant?.id) return;

    try {
      // In a real implementation, you might want to prompt for reservation date/time
      // For now, we'll just move it to upcoming without a specific reservation
      await confirmUpcoming.mutateAsync({
        id: selectedRestaurant.id,
        reservation_datetime: new Date().toISOString(),
      });

      setShowResult(false);
      setSelectedRestaurant(null);
    } catch (error: any) {
      alert(error.message || 'Failed to confirm selection');
    }
  };

  const handleCancel = () => {
    setShowResult(false);
    setSelectedRestaurant(null);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">The Wheel</h1>
        <p className="text-lg text-gray-600">
          Let fate decide your next dining destination!
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      )}

      {/* Error State - Not Enough Restaurants */}
      {!isLoading && activeRestaurants.length < 2 && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Not Enough Restaurants</h2>
          <p className="text-gray-600 mb-6">
            You need at least 2 active restaurants to spin the wheel.
            {excludeFastFood && ' Try including fast food restaurants.'}
          </p>
          <p className="text-gray-600">
            Current active restaurants: <span className="font-bold">{activeRestaurants.length}</span>
          </p>
        </div>
      )}

      {/* Wheel Interface */}
      {!isLoading && activeRestaurants.length >= 2 && (
        <div className="space-y-8">
          {/* Controls */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Fast Food Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeFastFood}
                  onChange={(e) => setExcludeFastFood(e.target.checked)}
                  disabled={isSpinning}
                  className="w-5 h-5 rounded border-gray-300 text-navy-900 focus:ring-navy-900 disabled:opacity-50"
                />
                <span className="text-lg font-medium text-navy-900">
                  Exclude Fast Food
                </span>
              </label>

              {/* Spin Button */}
              <button
                onClick={handleSpin}
                disabled={!canSpin}
                className="bg-navy-900 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL! 🎰'}
              </button>
            </div>

            {/* Info Text */}
            <div className="mt-4 text-center text-sm text-gray-600">
              {isSpinning ? (
                <p className="animate-pulse">The wheel is spinning...</p>
              ) : (
                <p>
                  {activeRestaurants.length} restaurant{activeRestaurants.length !== 1 ? 's' : ''} ready to go!
                </p>
              )}
            </div>
          </div>

          {/* The Wheel */}
          <div className="glass-card p-8">
            <SpinningWheel
              restaurants={activeRestaurants}
              isSpinning={isSpinning}
              selectedRestaurant={selectedRestaurant}
              onSpinComplete={handleSpinComplete}
            />
          </div>

          {/* Instructions */}
          {!isSpinning && (
            <div className="glass-card p-6">
              <h3 className="font-bold text-lg mb-3 text-navy-900">How It Works</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">1.</span>
                  <span>Click "SPIN THE WHEEL" to randomly select a restaurant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">2.</span>
                  <span>Watch the wheel spin and land on your dining destiny</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">3.</span>
                  <span>Confirm to move the restaurant to "Upcoming" or spin again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">4.</span>
                  <span>Once confirmed, the restaurant is removed from the active pool</span>
                </li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Result Modal */}
      {showResult && selectedRestaurant && (
        <WheelResult
          restaurant={selectedRestaurant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isConfirming={confirmUpcoming.isPending}
        />
      )}
    </Layout>
  );
}
