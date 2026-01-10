import { useEffect, useState } from 'react';
import type { Restaurant } from '../../../../shared/types';

interface SpinningWheelProps {
  restaurants: Restaurant[];
  isSpinning: boolean;
  selectedRestaurant: Restaurant | null;
  onSpinComplete?: () => void;
}

export function SpinningWheel({
  restaurants,
  isSpinning,
  selectedRestaurant,
  onSpinComplete,
}: SpinningWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isSpinning && selectedRestaurant) {
      // Calculate which segment the selected restaurant is in
      const selectedIndex = restaurants.findIndex((r) => r.id === selectedRestaurant.id);
      const segmentAngle = 360 / restaurants.length;

      // Calculate target rotation to land on selected restaurant
      // We want the pointer (at top) to land in the middle of the selected segment
      const targetAngle = selectedIndex * segmentAngle + segmentAngle / 2;

      // Add multiple full rotations for drama (5-7 full spins)
      const fullRotations = 5 + Math.floor(Math.random() * 3);
      const totalRotation = fullRotations * 360 + (360 - targetAngle);

      setRotation(totalRotation);

      // Trigger completion callback after animation
      const timer = setTimeout(() => {
        onSpinComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSpinning, selectedRestaurant, restaurants, onSpinComplete]);

  if (restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No restaurants available</p>
      </div>
    );
  }

  const segmentAngle = 360 / restaurants.length;
  const radius = 180;
  const centerX = 200;
  const centerY = 200;

  // Generate wheel segments
  const segments = restaurants.map((restaurant, index) => {
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // Alternate colors for visual distinction
    const colors = [
      '#1e3a8a', // navy-900
      '#3b82f6', // blue-500
      '#60a5fa', // blue-400
      '#93c5fd', // blue-300
    ];
    const color = colors[index % colors.length];

    // Calculate text position (middle of segment)
    const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);
    const textRotation = index * segmentAngle + segmentAngle / 2;

    return (
      <g key={restaurant.id}>
        <path d={pathData} fill={color} stroke="white" strokeWidth="2" />
        <text
          x={textX}
          y={textY}
          fill="white"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(${textRotation}, ${textX}, ${textY})`}
          className="pointer-events-none"
        >
          {restaurant.name.length > 20
            ? restaurant.name.substring(0, 17) + '...'
            : restaurant.name}
        </text>
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center">
      {/* Pointer at top */}
      <div className="relative">
        <svg width="40" height="30" className="mb-2">
          <polygon points="20,30 0,0 40,0" fill="#ef4444" />
        </svg>
      </div>

      {/* Wheel */}
      <div className="relative">
        <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
          <g
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {segments}
          </g>
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="20" fill="white" stroke="#1e3a8a" strokeWidth="3" />
          <circle cx={centerX} cy={centerY} r="10" fill="#1e3a8a" />
        </svg>
      </div>

      {/* Restaurant count */}
      <p className="text-sm text-gray-600 mt-4">
        {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} in the wheel
      </p>
    </div>
  );
}
