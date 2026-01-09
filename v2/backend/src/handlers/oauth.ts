import type { Context } from 'hono';
import { OAuthService } from '../services/oauth-service';
import type { OAuth2LoginResponse } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle OAuth2 login initiation
 * Generates PKCE parameters and redirects to S-Auth
 *
 * GET /auth/login
 */
export async function handleOAuthLogin(c: Context) {
  const db = c.env.DB;
  const oauthService = new OAuthService(db, c.env);

  try {
    // Generate PKCE parameters
    const { codeVerifier, codeChallenge } = await oauthService.generatePKCE();
    const state = oauthService.generateState();

    // Store PKCE verifier and state in a temporary session
    // We'll use KV store or cookie for this
    const pkceSessionId = uuidv4();

    // Store in cookie (expires in 10 minutes)
    c.header(
      'Set-Cookie',
      `pkce_session=${pkceSessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
    );

    // Store PKCE data in KV (if available) or encode in state parameter
    // For now, we'll encode it in a signed cookie
    const pkceData = JSON.stringify({ codeVerifier, state });
    c.header(
      'Set-Cookie',
      `pkce_data=${encodeURIComponent(pkceData)}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
      { append: true }
    );

    // Build authorization URL
    const authorizationUrl = oauthService.buildAuthorizationUrl(codeChallenge, state);

    // Return authorization URL (frontend will redirect)
    return c.json<OAuth2LoginResponse>({
      authorization_url: authorizationUrl,
      state: state,
    });
  } catch (error: any) {
    console.error('OAuth login error:', error);
    return c.json({ error: 'Failed to initiate OAuth login', details: error.message }, 500);
  }
}

/**
 * Handle OAuth2 callback from S-Auth
 * Exchanges authorization code for tokens, fetches user info, syncs to DB, creates session
 *
 * GET /auth/callback?code=...&state=...
 */
export async function handleOAuthCallback(c: Context) {
  const db = c.env.DB;
  const oauthService = new OAuthService(db, c.env);

  try {
    // Get callback parameters
    const code = c.req.query('code');
    const returnedState = c.req.query('state');
    const error = c.req.query('error');
    const errorDescription = c.req.query('error_description');

    // Check for OAuth error
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return c.redirect(`${c.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !returnedState) {
      return c.json({ error: 'Missing code or state parameter' }, 400);
    }

    // Retrieve PKCE data from cookie
    const cookies = c.req.header('Cookie') || '';
    const pkceDataMatch = cookies.match(/pkce_data=([^;]+)/);

    if (!pkceDataMatch) {
      return c.json({ error: 'PKCE session expired or missing' }, 400);
    }

    const pkceData = JSON.parse(decodeURIComponent(pkceDataMatch[1]));
    const { codeVerifier, state } = pkceData;

    // Verify state parameter (CSRF protection)
    if (returnedState !== state) {
      return c.json({ error: 'Invalid state parameter' }, 400);
    }

    // Exchange authorization code for tokens
    const tokens = await oauthService.exchangeCodeForTokens(code, codeVerifier);

    // Fetch user info from S-Auth
    const userInfo = await oauthService.fetchUserInfo(tokens.access_token);

    // Sync user to local database
    const user = await oauthService.syncUser(userInfo);

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db
      .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .bind(sessionId, user.id, expiresAt.toISOString())
      .run();

    // Clear PKCE cookies
    c.header('Set-Cookie', 'pkce_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');
    c.header(
      'Set-Cookie',
      'pkce_data=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/',
      { append: true }
    );

    // Set session cookie
    c.header(
      'Set-Cookie',
      `wheel_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`,
      { append: true }
    );

    // Optionally store refresh token securely (in KV or encrypted cookie)
    if (tokens.refresh_token) {
      // For now, we'll skip refresh token storage
      // In production, store in KV: await c.env.KV.put(`refresh_token:${user.id}`, tokens.refresh_token)
    }

    // Redirect to frontend
    const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:5173';
    return c.redirect(`${frontendUrl}/`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    const frontendUrl = c.env.FRONTEND_URL || 'http://localhost:5173';
    return c.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Handle OAuth2 logout
 * Clears session and optionally revokes tokens
 *
 * POST /auth/logout
 */
export async function handleOAuthLogout(c: Context) {
  const db = c.env.DB;

  try {
    // Get session from cookie
    const cookies = c.req.header('Cookie') || '';
    const sessionMatch = cookies.match(/wheel_session=([^;]+)/);

    if (sessionMatch) {
      const sessionId = sessionMatch[1];

      // Delete session from database
      await db
        .prepare('DELETE FROM sessions WHERE id = ?')
        .bind(sessionId)
        .run();
    }

    // Clear session cookie
    c.header('Set-Cookie', 'wheel_session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');

    // Note: S-Auth may not support token revocation endpoint
    // If it does, we would call it here with the refresh token

    return c.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed', details: error.message }, 500);
  }
}

/**
 * Get current user info (useful for frontend to check auth status)
 *
 * GET /auth/me
 */
export async function handleGetCurrentUser(c: Context) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  return c.json({ user });
}

/**
 * Refresh access token (if needed in the future)
 * For now, we rely on session-based auth after initial OAuth login
 *
 * POST /auth/refresh
 */
export async function handleRefreshToken(c: Context) {
  const db = c.env.DB;
  const oauthService = new OAuthService(db, c.env);

  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Not authenticated' }, 401);
    }

    // Get refresh token from KV or request body
    const body = await c.req.json();
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      return c.json({ error: 'Missing refresh token' }, 400);
    }

    // Refresh access token
    const tokens = await oauthService.refreshAccessToken(refreshToken);

    // Return new tokens (frontend can store access_token if needed)
    return c.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return c.json({ error: 'Token refresh failed', details: error.message }, 500);
  }
}
