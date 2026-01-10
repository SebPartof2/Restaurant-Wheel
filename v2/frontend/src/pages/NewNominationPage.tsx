import { useNavigate } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { NominationForm } from '../components/restaurant/NominationForm';
import { useCreateRestaurant } from '../hooks/useCreateRestaurant';
import { useState } from 'react';

export function NewNominationPage() {
  const navigate = useNavigate();
  const createRestaurant = useCreateRestaurant();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    name: string;
    address: string;
    is_fast_food: boolean;
    menu_link?: string;
    photo_link?: string;
  }) => {
    try {
      setError(null);
      await createRestaurant.mutateAsync(data);

      // Show success and redirect
      navigate('/nominations', {
        state: { message: 'Restaurant nominated successfully! It will appear once approved by an admin.' }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit nomination');
    }
  };

  const handleCancel = () => {
    navigate('/nominations');
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900">Nominate a Restaurant</h1>
        <p className="text-gray-600 mt-1">
          Suggest a new restaurant to add to the wheel
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold text-navy-900 mb-2">How it works:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-navy-900 font-bold">1.</span>
            <span>Fill out the form below with the restaurant details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy-900 font-bold">2.</span>
            <span>Your nomination will be reviewed by an admin</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy-900 font-bold">3.</span>
            <span>Once approved, the restaurant will be added to the active pool</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-navy-900 font-bold">4.</span>
            <span>It can then be selected by spinning the wheel!</span>
          </li>
        </ul>
      </div>

      {/* Nomination Form */}
      <div className="glass-card p-8 max-w-2xl">
        <NominationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createRestaurant.isPending}
        />
      </div>
    </Layout>
  );
}
