// Main App component with routing

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ToastContainer } from './components/shared/Toast';
import { useToast } from './hooks/useToast';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { NominationsListPage } from './pages/NominationsListPage';
import { NominationFormPage } from './pages/NominationFormPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { WheelPage } from './pages/WheelPage';
import { PendingNominationsPage } from './pages/admin/PendingNominationsPage';
import { UpcomingPage } from './pages/admin/UpcomingPage';
import { VisitedPage } from './pages/admin/VisitedPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AdminNominatePage } from './pages/admin/AdminNominatePage';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Route guards
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.is_admin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function AppRoutes() {
  const toast = useToast();

  return (
    <>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Restaurant routes */}
        <Route
          path="/nominations"
          element={
            <PrivateRoute>
              <NominationsListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/nominations/new"
          element={
            <PrivateRoute>
              <NominationFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/nominations/:id"
          element={
            <PrivateRoute>
              <RestaurantDetailPage />
            </PrivateRoute>
          }
        />

        {/* Wheel route */}
        <Route
          path="/wheel"
          element={
            <AdminRoute>
              <WheelPage />
            </AdminRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/pending"
          element={
            <AdminRoute>
              <PendingNominationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/upcoming"
          element={
            <AdminRoute>
              <UpcomingPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/visited"
          element={
            <AdminRoute>
              <VisitedPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/nominate"
          element={
            <AdminRoute>
              <AdminNominatePage />
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
