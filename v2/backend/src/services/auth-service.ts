// Authentication service

import type { User, AuthResponse } from '../../../shared/types';
import { DatabaseService } from './db';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateSessionId, getSessionExpiry, toSQLiteDateTime } from '../utils/session';
import { isValidEmail, isValidPassword, sanitizeString } from '../utils/validation';
import { isAdminEmail, isWhitelistedEmail, config } from '../config';

export class AuthService {
  constructor(private db: DatabaseService) {}

  /**
   * Register a new user with signup code
   */
  async signup(signupCode: string, email: string, password: string, name?: string): Promise<AuthResponse> {
    signupCode = sanitizeString(signupCode).toUpperCase();
    email = sanitizeString(email).toLowerCase();
    const userName = name ? sanitizeString(name) : null;

    // Validate input
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidPassword(password, config.password.minLength)) {
      throw new Error(`Password must be at least ${config.password.minLength} characters`);
    }

    // Find provisional user with this signup code
    const provisionalUser = await this.db.queryOne<User>(
      'SELECT * FROM users WHERE signup_code = ? AND is_provisional = 1',
      [signupCode]
    );

    if (!provisionalUser) {
      throw new Error('Invalid signup code');
    }

    // Verify email matches the provisional user's email
    if (provisionalUser.email.toLowerCase() !== email) {
      throw new Error('Email does not match the signup code. Please use the correct email address.');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Activate the provisional user
    await this.db.run(
      'UPDATE users SET password_hash = ?, name = COALESCE(?, name), is_provisional = 0, signup_code = NULL WHERE id = ?',
      [passwordHash, userName, provisionalUser.id]
    );

    const userId = provisionalUser.id;
    const isAdmin = provisionalUser.is_admin;

    // Create session
    const sessionId = generateSessionId();
    const expiryDate = getSessionExpiry(config.session.expiryDays);

    await this.db.insert(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, userId, toSQLiteDateTime(expiryDate)]
    );

    // Return user and session
    const user: User = {
      id: userId,
      email,
      name: userName || undefined,
      is_admin: isAdmin,
      is_whitelisted: true,
      is_provisional: false,
      created_at: new Date().toISOString(),
    };

    return {
      user,
      session_id: sessionId,
    };
  }

  /**
   * Login a user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    email = sanitizeString(email).toLowerCase();

    // Find user
    const user = await this.db.queryOne<User & { password_hash: string }>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Prevent provisional users from logging in
    if (user.is_provisional) {
      throw new Error('Please complete your signup using the signup code provided');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const sessionId = generateSessionId();
    const expiryDate = getSessionExpiry(config.session.expiryDays);

    await this.db.insert(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, user.id, toSQLiteDateTime(expiryDate)]
    );

    // Return user and session (without password hash)
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      session_id: sessionId,
    };
  }

  /**
   * Logout a user (delete session)
   */
  async logout(sessionId: string): Promise<void> {
    await this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  /**
   * Validate a session and return user
   */
  async validateSession(sessionId: string): Promise<User | null> {
    const result = await this.db.queryOne<User>(
      `SELECT u.id, u.email, u.name, u.is_admin, u.is_whitelisted, u.is_provisional, u.created_at
       FROM users u
       JOIN sessions s ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
      [sessionId]
    );

    return result;
  }

  /**
   * Clean up expired sessions
   */
  async cleanExpiredSessions(): Promise<number> {
    return await this.db.run(
      "DELETE FROM sessions WHERE expires_at <= datetime('now')"
    );
  }
}
