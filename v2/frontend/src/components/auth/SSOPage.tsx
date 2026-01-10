import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

/**
 * SSO Auto-Login Page
 * When accessed, automatically initiates the OAuth login flow
 * If already authenticated, redirects to home
 */
export function SSOPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      // Already logged in, redirect to home
      navigate('/', { replace: true });
    } else {
      // Not logged in, initiate OAuth flow
      login();
    }
  }, [isAuthenticated, isLoading, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-amber-50">
      <div className="glass-card p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
