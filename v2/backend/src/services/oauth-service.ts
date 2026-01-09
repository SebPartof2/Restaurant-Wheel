import type { D1Database } from '@cloudflare/workers-types';
import type { OAuth2TokenResponse, OAuth2UserInfo, User } from '../../../shared/types';

interface OAuthConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

export class OAuthService {
  private db: D1Database;
  private config: OAuthConfig;

  constructor(db: D1Database, env: Record<string, string>) {
    this.db = db;
    this.config = {
      authorizationEndpoint: env.OAUTH_AUTHORIZATION_ENDPOINT || 'https://auth.sebbyk.net/authorize',
      tokenEndpoint: env.OAUTH_TOKEN_ENDPOINT || 'https://auth.sebbyk.net/token',
      userInfoEndpoint: env.OAUTH_USERINFO_ENDPOINT || 'https://auth.sebbyk.net/userinfo',
      clientId: env.OAUTH_CLIENT_ID || '',
      redirectUri: env.OAUTH_REDIRECT_URI || '',
      scopes: ['openid', 'profile', 'email'],
    };
  }

  /**
   * Generate PKCE code verifier and challenge
   * Code verifier: 43-128 character random string
   * Code challenge: Base64URL(SHA256(code_verifier))
   */
  async generatePKCE(): Promise<PKCEPair> {
    // Generate random code verifier (43-128 chars)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = this.base64URLEncode(array);

    // Generate code challenge: SHA256(code_verifier)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = this.base64URLEncode(new Uint8Array(hash));

    return { codeVerifier, codeChallenge };
  }

  /**
   * Base64URL encoding (RFC 7636)
   */
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate random state parameter for CSRF protection
   */
  generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Build authorization URL with PKCE
   */
  buildAuthorizationUrl(codeChallenge: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, codeVerifier: string): Promise<OAuth2TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      code_verifier: codeVerifier,
    });

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${response.status} - ${error}`);
    }

    return await response.json<OAuth2TokenResponse>();
  }

  /**
   * Fetch user info from S-Auth
   */
  async fetchUserInfo(accessToken: string): Promise<OAuth2UserInfo> {
    const response = await fetch(this.config.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`UserInfo fetch failed: ${response.status} - ${error}`);
    }

    return await response.json<OAuth2UserInfo>();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuth2TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    });

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${error}`);
    }

    return await response.json<OAuth2TokenResponse>();
  }

  /**
   * Sync user from S-Auth to local database
   * Creates new user if email is whitelisted, or updates existing user
   */
  async syncUser(userInfo: OAuth2UserInfo): Promise<User> {
    // Check if user already exists by oauth_subject
    const existingBySubject = await this.db
      .prepare('SELECT * FROM users WHERE oauth_subject = ?')
      .bind(userInfo.sub)
      .first<User>();

    if (existingBySubject) {
      // Update existing user
      await this.db
        .prepare(`
          UPDATE users
          SET email = ?,
              given_name = ?,
              family_name = ?,
              name = ?,
              access_level = ?,
              last_login = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          userInfo.email,
          userInfo.given_name || null,
          userInfo.family_name || null,
          userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || null,
          userInfo.access_level || 'user',
          existingBySubject.id
        )
        .run();

      return await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(existingBySubject.id)
        .first<User>() as User;
    }

    // Check if user exists by email
    const existingByEmail = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(userInfo.email)
      .first<User>();

    if (existingByEmail) {
      // User exists but hasn't logged in with OAuth yet - update with OAuth info
      await this.db
        .prepare(`
          UPDATE users
          SET oauth_provider = 'sauth',
              oauth_subject = ?,
              given_name = ?,
              family_name = ?,
              name = ?,
              access_level = ?,
              last_login = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        .bind(
          userInfo.sub,
          userInfo.given_name || null,
          userInfo.family_name || null,
          userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || null,
          userInfo.access_level || 'user',
          existingByEmail.id
        )
        .run();

      return await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(existingByEmail.id)
        .first<User>() as User;
    }

    // Check if email is whitelisted
    const whitelisted = await this.db
      .prepare('SELECT * FROM users WHERE email = ? AND is_whitelisted = 1')
      .bind(userInfo.email)
      .first();

    if (!whitelisted) {
      throw new Error('Email not whitelisted. Please contact an administrator.');
    }

    // Create new user
    const result = await this.db
      .prepare(`
        INSERT INTO users (
          email,
          name,
          given_name,
          family_name,
          oauth_provider,
          oauth_subject,
          access_level,
          is_admin,
          is_whitelisted,
          is_provisional,
          last_login
        ) VALUES (?, ?, ?, ?, 'sauth', ?, ?, 0, 1, 0, CURRENT_TIMESTAMP)
      `)
      .bind(
        userInfo.email,
        userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || null,
        userInfo.given_name || null,
        userInfo.family_name || null,
        userInfo.sub,
        userInfo.access_level || 'user'
      )
      .run();

    const userId = result.meta.last_row_id;

    return await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first<User>() as User;
  }

  /**
   * Check if email is whitelisted
   */
  async isEmailWhitelisted(email: string): Promise<boolean> {
    const result = await this.db
      .prepare('SELECT id FROM users WHERE email = ? AND is_whitelisted = 1')
      .bind(email)
      .first();

    return result !== null;
  }

  /**
   * Add email to whitelist (admin only)
   */
  async addToWhitelist(email: string): Promise<void> {
    // Check if user already exists
    const existing = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      // Just update whitelist status
      await this.db
        .prepare('UPDATE users SET is_whitelisted = 1 WHERE email = ?')
        .bind(email)
        .run();
    } else {
      // Create placeholder user (will be filled in on first OAuth login)
      await this.db
        .prepare(`
          INSERT INTO users (email, is_whitelisted, is_admin, is_provisional)
          VALUES (?, 1, 0, 0)
        `)
        .bind(email)
        .run();
    }
  }

  /**
   * Remove email from whitelist (admin only)
   */
  async removeFromWhitelist(email: string): Promise<void> {
    await this.db
      .prepare('UPDATE users SET is_whitelisted = 0 WHERE email = ?')
      .bind(email)
      .run();
  }
}
