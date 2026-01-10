import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { CallbackPage } from './components/auth/CallbackPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { NominationsPage } from './pages/NominationsPage';
import { NewNominationPage } from './pages/NewNominationPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { UserManagement } from './components/admin/UserManagement';

// Placeholder pages (to be implemented in future phases)
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen p-8">
      <div className="glass-card p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600">This page is coming soon in Phase 2-7 of the implementation.</p>
      </div>
    </div>
  );
}

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Restaurant routes */}
            <Route
              path="/nominations"
              element={
                <ProtectedRoute>
                  <NominationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nominations/new"
              element={
                <ProtectedRoute>
                  <NewNominationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nominations/:id"
              element={
                <ProtectedRoute>
                  <RestaurantDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Wheel route (admin only) */}
            <Route
              path="/wheel"
              element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage title="The Wheel" />
                </ProtectedRoute>
              }
            />

            {/* Statistics route */}
            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Statistics" />
                </ProtectedRoute>
              }
            />

            {/* Photo Feed route */}
            <Route
              path="/photos"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Photo Feed" />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/pending"
              element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage title="Pending Nominations" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upcoming"
              element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage title="Upcoming Restaurants" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visited"
              element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage title="Visited Restaurants" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/nominate"
              element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage title="Admin Nominate" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
