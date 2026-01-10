import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/layout/Layout';
import { useUsers } from '../../hooks/useAdmin';
import { useCreateRestaurantAsAdmin } from '../../hooks/useCreateRestaurant';

export function AdminNominatePage() {
  const navigate = useNavigate();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const createRestaurant = useCreateRestaurantAsAdmin();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    is_fast_food: false,
    menu_link: '',
    photo_link: '',
    nominated_by_user_id: '',
    bypass_approval: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.nominated_by_user_id) {
      newErrors.nominated_by_user_id = 'Please select a nominator';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createRestaurant.mutateAsync({
        name: formData.name.trim(),
        address: formData.address.trim(),
        is_fast_food: formData.is_fast_food,
        menu_link: formData.menu_link.trim() || undefined,
        photo_link: formData.photo_link.trim() || undefined,
        nominated_by_user_id: parseInt(formData.nominated_by_user_id),
        bypass_approval: formData.bypass_approval,
      });

      // Success - navigate to nominations page
      navigate('/nominations');
    } catch (error: any) {
      alert(error.message || 'Failed to create restaurant');
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Admin Nominate</h1>
        <p className="text-lg text-gray-600">Create a nomination on behalf of a user</p>
      </div>

      {/* Loading State */}
      {usersLoading && (
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Form */}
      {!usersLoading && (
        <div className="glass-card p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selector */}
            <div>
              <label htmlFor="user" className="block text-sm font-semibold text-gray-700 mb-2">
                Nominate on behalf of <span className="text-red-600">*</span>
              </label>
              <select
                id="user"
                value={formData.nominated_by_user_id}
                onChange={(e) =>
                  setFormData({ ...formData, nominated_by_user_id: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.nominated_by_user_id ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
                required
              >
                <option value="">Select a user...</option>
                {usersData?.users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
              {errors.nominated_by_user_id && (
                <p className="text-red-600 text-sm mt-1">{errors.nominated_by_user_id}</p>
              )}
            </div>

            {/* Restaurant Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
                placeholder="Enter restaurant name"
                required
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
                placeholder="Enter full address"
                required
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
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
                <div>
                  <span className="text-sm font-semibold text-gray-700">Fast Food Restaurant</span>
                  <p className="text-xs text-gray-500">
                    Check this if it's a quick-service or fast food establishment
                  </p>
                </div>
              </label>
            </div>

            {/* Menu Link */}
            <div>
              <label htmlFor="menu" className="block text-sm font-semibold text-gray-700 mb-2">
                Menu Link (Optional)
              </label>
              <input
                type="url"
                id="menu"
                value={formData.menu_link}
                onChange={(e) => setFormData({ ...formData, menu_link: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.menu_link ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
                placeholder="https://example.com/menu"
              />
              {errors.menu_link && <p className="text-red-600 text-sm mt-1">{errors.menu_link}</p>}
            </div>

            {/* Photo Link */}
            <div>
              <label htmlFor="photo" className="block text-sm font-semibold text-gray-700 mb-2">
                Photo Link (Optional)
              </label>
              <input
                type="url"
                id="photo"
                value={formData.photo_link}
                onChange={(e) => setFormData({ ...formData, photo_link: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.photo_link ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent`}
                placeholder="https://example.com/photo.jpg"
              />
              {errors.photo_link && (
                <p className="text-red-600 text-sm mt-1">{errors.photo_link}</p>
              )}
            </div>

            {/* Bypass Approval */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bypass_approval}
                  onChange={(e) =>
                    setFormData({ ...formData, bypass_approval: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700">
                    Bypass Approval (Set as Active)
                  </span>
                  <p className="text-xs text-gray-500">
                    Skip pending state and add directly to the active pool
                  </p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createRestaurant.isPending}
                className="flex-1 bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createRestaurant.isPending ? 'Creating...' : 'Create Nomination'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/nominations')}
                className="px-6 py-3 rounded-lg glass-button font-medium hover:bg-white/40 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
