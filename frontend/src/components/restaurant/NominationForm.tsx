// Nomination form component

import React, { useState } from 'react';
import type { CreateRestaurantRequest } from '../../types';

interface NominationFormProps {
  onSubmit: (data: CreateRestaurantRequest) => Promise<void>;
  onCancel: () => void;
}

export function NominationForm({ onSubmit, onCancel }: NominationFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isFastFood, setIsFastFood] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name,
        address,
        is_fast_food: isFastFood,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label">Restaurant Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="e.g., Luigi's Italian Kitchen"
          required
        />
      </div>

      <div>
        <label className="label">Address *</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input"
          placeholder="e.g., 123 Main St, City, State"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isFastFood"
          checked={isFastFood}
          onChange={(e) => setIsFastFood(e.target.checked)}
          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="isFastFood" className="text-sm text-gray-700">
          This is a fast food restaurant
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary flex-1"
        >
          {loading ? 'Submitting...' : 'Submit Nomination'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
