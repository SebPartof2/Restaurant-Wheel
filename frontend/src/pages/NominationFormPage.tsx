// Nomination form page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { NominationForm } from '../components/restaurant/NominationForm';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';

export function NominationFormPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (data: any) => {
    try {
      await api.createRestaurant(data);
      toast.success('Restaurant nominated successfully!');
      navigate('/nominations');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create nomination');
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/nominations');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nominate a Restaurant</h1>
          <p className="text-gray-600 mt-2">
            Submit a restaurant for the family to consider. Admins will review and approve it.
          </p>
        </div>

        <div className="card">
          <NominationForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </div>
    </Layout>
  );
}
