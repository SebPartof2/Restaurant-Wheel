import { useState } from 'react';
import type { Restaurant } from '../../../../shared/types';

interface NominationFormProps {
  onSubmit: (data: {
    name: string;
    address: string;
    is_fast_food: boolean;
    menu_link?: string;
    photo_link?: string;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<Restaurant>;
  submitLabel?: string;
}

export function NominationForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData,
  submitLabel = 'Submit Nomination',
}: NominationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    is_fast_food: initialData?.is_fast_food || false,
    menu_link: initialData?.menu_link || '',
    photo_link: initialData?.photo_link || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.menu_link && !isValidUrl(formData.menu_link)) {
      newErrors.menu_link = 'Please enter a valid URL';
    }

    if (formData.photo_link && !isValidUrl(formData.photo_link)) {
      newErrors.photo_link = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      address: formData.address.trim(),
      is_fast_food: formData.is_fast_food,
      menu_link: formData.menu_link.trim() || undefined,
      photo_link: formData.photo_link.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restaurant Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Restaurant Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
          placeholder="Enter restaurant name"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
          placeholder="Enter full address"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      {/* Fast Food Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_fast_food}
            onChange={(e) => setFormData({ ...formData, is_fast_food: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
          />
          <span className="text-sm font-semibold text-gray-700">
            This is a fast food restaurant
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Fast food restaurants can be excluded from wheel spins
        </p>
      </div>

      {/* Menu Link (Optional) */}
      <div>
        <label htmlFor="menu_link" className="block text-sm font-semibold text-gray-700 mb-2">
          Menu Link (Optional)
        </label>
        <input
          type="url"
          id="menu_link"
          value={formData.menu_link}
          onChange={(e) => setFormData({ ...formData, menu_link: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.menu_link ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
          placeholder="https://example.com/menu"
        />
        {errors.menu_link && (
          <p className="text-red-500 text-sm mt-1">{errors.menu_link}</p>
        )}
      </div>

      {/* Photo Link (Optional) */}
      <div>
        <label htmlFor="photo_link" className="block text-sm font-semibold text-gray-700 mb-2">
          Photo Link (Optional)
        </label>
        <input
          type="url"
          id="photo_link"
          value={formData.photo_link}
          onChange={(e) => setFormData({ ...formData, photo_link: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.photo_link ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
          placeholder="https://example.com/photo.jpg"
        />
        {errors.photo_link && (
          <p className="text-red-500 text-sm mt-1">{errors.photo_link}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 glass-button rounded-lg font-medium hover:bg-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
