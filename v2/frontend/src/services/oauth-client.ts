import type { OAuth2LoginResponse, User } from '../../../shared/types';

/**
 * OAuth2 Client with PKCE support for S-Auth integration
 */
export class OAuth2Client {
  private apiUrl: string;

  constructor(apiUrl: string = '/api') {
    this.apiUrl = apiUrl;
  }

  // Note: PKCE is handled by the backend

  /**
   * Initiate OAuth2 login flow
   * Redirects browser to S-Auth authorization endpoint
   */
  async login(): Promise<void> {
    try {
      // Call backend to get authorization URL
      const response = await fetch(`${this.apiUrl}/auth/oauth/login`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth login');
      }

      const data: OAuth2LoginResponse = await response.json();

      // Redirect to S-Auth
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth2 callback (called on callback page)
   * This is handled by the backend, but we provide this for context
   */
  async handleCallback(_code: string, _state: string): Promise<void> {
    // The backend handles the callback via GET /auth/oauth/callback
    // After successful authentication, backend redirects to frontend home page
    // with session cookie set

    // Check if we're authenticated
    const user = await this.getCurrentUser();
    if (user) {
      console.log('Successfully authenticated:', user);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/oauth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/auth/oauth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear any local storage if needed
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

// Export singleton instance
export const oauth2Client = new OAuth2Client();
