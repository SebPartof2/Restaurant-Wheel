// Spinning wheel component using Canvas

import React, { useRef, useEffect, useState } from 'react';
import type { Restaurant } from '../../types';

interface SpinningWheelProps {
  restaurants: Restaurant[];
  isSpinning: boolean;
  selectedRestaurant: Restaurant | null;
}

const COLORS = [
  '#1e3a8a', // Navy blue
  '#3b82f6', // Light blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

export function SpinningWheel({ restaurants, isSpinning, selectedRestaurant }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, restaurants]);

  useEffect(() => {
    if (isSpinning && selectedRestaurant) {
      startSpinAnimation(selectedRestaurant);
    }
  }, [isSpinning, selectedRestaurant]);

  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (restaurants.length === 0) {
      ctx.font = '20px Inter, sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      ctx.fillText('No restaurants available', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / restaurants.length;

    // Draw segments
    restaurants.forEach((restaurant, index) => {
      const startAngle = currentRotation + index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      const text = restaurant.name.length > 20 ? restaurant.name.substring(0, 20) + '...' : restaurant.name;
      ctx.fillText(text, radius - 10, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer (triangle at top)
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 40);
    ctx.lineTo(centerX + 15, 40);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const startSpinAnimation = (winner: Restaurant) => {
    const winnerIndex = restaurants.findIndex((r) => r.id === winner.id);
    if (winnerIndex === -1) return;

    const sliceAngle = (2 * Math.PI) / restaurants.length;
    const targetAngle = -(winnerIndex * sliceAngle + sliceAngle / 2);

    // Add multiple full rotations (3-5) for effect
    const fullRotations = 3 + Math.random() * 2;
    const totalRotation = fullRotations * 2 * Math.PI + targetAngle;

    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentRotation = startRotation + totalRotation * easeProgress;
      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full"
      />
    </div>
  );
}
