# OAuth2 Setup Guide - S-Auth Integration

This document explains how to configure and use S-Auth OAuth2 authentication in The Wheel v2.

## Overview

The Wheel v2 uses **S-Auth** (https://auth.sebbyk.net) as its OAuth2 provider with the following features:

- **Authorization Code + PKCE flow** for secure SPA authentication
- **Email whitelisting** for access control
- **Automatic user sync** from S-Auth on login
- **Backward compatibility** with legacy password-based auth (during transition)

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend   │         │   S-Auth    │
│  (React)    │         │  (Workers)  │         │  Provider   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │  1. Click Login       │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │  2. Authorization URL │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │  3. Redirect to S-Auth with PKCE               │
       ├───────────────────────────────────────────────>│
       │                       │                        │
       │  4. User authenticates                         │
       │                       │                        │
       │  5. Redirect with code                         │
       │<───────────────────────────────────────────────┤
       │                       │                        │
       │  6. Send code to backend                       │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │  7. Exchange code      │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │  8. Tokens + UserInfo  │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │  9. Sync user to DB    │
       │                       │  10. Create session    │
       │                       │                        │
       │  11. Redirect to home │                        │
       │<──────────────────────┤                        │
       │                       │                        │
```

## Setup Instructions

### 1. Register Application with S-Auth

Contact your S-Auth administrator to register The Wheel application:

- **Application Name**: The Wheel
- **Client ID**: Request a client ID (e.g., `wheel-restaurant-app`)
- **Redirect URI**: `https://wheel.sebbyboe.online/api/auth/oauth/callback`
- **Grant Types**: `authorization_code`, `refresh_token`
- **Response Types**: `code`
- **PKCE**: Required (S256)
- **Scopes**: `openid`, `profile`, `email`

### 2. Configure Backend Environment Variables

Update [v2/backend/wrangler.toml](v2/backend/wrangler.toml) with your OAuth2 credentials:

```toml
[vars]
# OAuth2 configuration (S-Auth)
OAUTH_AUTHORIZATION_ENDPOINT = "https://auth.sebbyk.net/authorize"
OAUTH_TOKEN_ENDPOINT = "https://auth.sebbyk.net/token"
OAUTH_USERINFO_ENDPOINT = "https://auth.sebbyk.net/userinfo"
OAUTH_CLIENT_ID = "your-client-id-here"
OAUTH_REDIRECT_URI = "https://wheel.sebbyboe.online/api/auth/oauth/callback"
```

For local development, create a `.dev.vars` file:

```bash
OAUTH_CLIENT_ID=your-client-id-here
OAUTH_REDIRECT_URI=http://localhost:8787/api/auth/oauth/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Migration

Apply the OAuth2 migration to add required database fields:

```bash
cd v2/backend
wrangler d1 migrations apply restaurant-wheel-db-v2 --remote
```

This creates the following fields in the `users` table:
- `oauth_provider` - OAuth provider name (default: 'sauth')
- `oauth_subject` - Subject identifier from S-Auth (e.g., 'JD-7392')
- `given_name` - First name from S-Auth
- `family_name` - Last name from S-Auth
- `access_level` - Permission level from S-Auth
- `last_login` - Last OAuth login timestamp

### 4. Deploy Backend

```bash
cd v2/backend
wrangler deploy
```

### 5. Configure Frontend

The frontend is already configured to use the OAuth2 client. No additional configuration needed.

## User Whitelist Management

### Add User to Whitelist (Admin Only)

**Via API:**
```bash
curl -X POST https://wheel.sebbyboe.online/api/admin/users/whitelist \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}' \
  --cookie "wheel_session=your-session-id"
```

**Via Admin UI:**
1. Navigate to `/admin/users`
2. Enter email in "Add to Whitelist" form
3. Click "Add to Whitelist"

This creates a placeholder user that will be populated with S-Auth data on first login.

### Remove User from Whitelist (Admin Only)

**Via API:**
```bash
curl -X DELETE "https://wheel.sebbyboe.online/api/admin/users/whitelist?email=user@example.com" \
  --cookie "wheel_session=your-session-id"
```

**Via Admin UI:**
1. Navigate to `/admin/users`
2. Click "Remove" next to the user's email

## API Endpoints

### OAuth2 Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/oauth/login` | Initiate OAuth2 login (returns authorization URL) |
| `GET` | `/api/auth/oauth/callback` | Handle OAuth2 callback (backend only) |
| `POST` | `/api/auth/oauth/logout` | Logout and clear session |
| `GET` | `/api/auth/oauth/me` | Get current authenticated user |
| `POST` | `/api/auth/oauth/refresh` | Refresh access token (if needed) |

### Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/users/whitelist` | Add email to whitelist |
| `DELETE` | `/api/admin/users/whitelist?email=...` | Remove email from whitelist |
| `GET` | `/api/admin/users` | Get all users |

## Frontend Usage

### Use AuthContext

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.given_name || user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Sign in with S-Auth</button>
      )}
    </div>
  );
}
```

### Protected Routes

```typescript
import { ProtectedRoute } from './components/auth/ProtectedRoute';

<Route
  path="/admin"
  element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Security Features

### PKCE (Proof Key for Code Exchange)

The implementation uses **S256** PKCE to prevent authorization code interception attacks:

1. Frontend generates random `code_verifier` (43-128 chars)
2. Computes `code_challenge = Base64URL(SHA256(code_verifier))`
3. Sends `code_challenge` with authorization request
4. Backend verifies by hashing `code_verifier` during token exchange

### State Parameter

A random `state` parameter is used for CSRF protection:
- Generated on login initiation
- Stored in secure cookie
- Verified on callback

### Secure Cookies

Session cookies are configured with:
- `HttpOnly` - Prevents XSS access
- `Secure` - HTTPS only
- `SameSite=Lax` - CSRF protection
- 7-day expiration

## User Data Synchronization

On every OAuth2 login, user data is synced from S-Auth:

```typescript
// Data fetched from S-Auth UserInfo endpoint
{
  "sub": "JD-7392",                    // Unique subject ID
  "email": "john.doe@example.com",
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "access_level": "user"               // Custom S-Auth field
}

// Synced to local database
{
  oauth_provider: 'sauth',
  oauth_subject: 'JD-7392',
  email: 'john.doe@example.com',
  given_name: 'John',
  family_name: 'Doe',
  name: 'John Doe',
  access_level: 'user',
  last_login: '2025-01-08T12:34:56Z'
}
```

## Migration from Password-Based Auth

### Gradual Migration Strategy

1. **OAuth2 fields added** to users table (migration 0010)
2. **Legacy password auth still works** (`password_hash` kept)
3. **Existing users** updated with OAuth info on first S-Auth login
4. **New users** created via whitelist + OAuth only

### Future Cleanup

After all users have migrated to OAuth2:

```sql
-- Remove deprecated fields
ALTER TABLE users DROP COLUMN password_hash;
ALTER TABLE users DROP COLUMN is_provisional;
ALTER TABLE users DROP COLUMN signup_code;
```

## Troubleshooting

### "Email not whitelisted" Error

**Problem:** User tries to log in but gets "Email not whitelisted" error.

**Solution:** Admin must add the email to whitelist:
```bash
curl -X POST /api/admin/users/whitelist \
  -d '{"email": "user@example.com"}'
```

### PKCE Session Expired

**Problem:** "PKCE session expired or missing" on callback.

**Solution:**
- PKCE cookies expire after 10 minutes
- User must complete OAuth flow within that time
- Try logging in again

### Invalid State Parameter

**Problem:** "Invalid state parameter" error.

**Solution:**
- This is a CSRF protection mechanism
- Ensure cookies are enabled
- Check that frontend and backend domains match
- Try clearing cookies and logging in again

### Backend Cannot Reach S-Auth

**Problem:** Token exchange fails with network error.

**Solution:**
- Verify S-Auth endpoints are correct in `wrangler.toml`
- Check that Cloudflare Workers can access external URLs
- Test endpoints manually: `curl https://auth.sebbyk.net/.well-known/openid-configuration`

## Testing

### Manual Testing Checklist

- [ ] Click "Sign in with S-Auth" → Redirects to S-Auth
- [ ] Enter credentials on S-Auth → Redirects back to app
- [ ] Session cookie set → User logged in
- [ ] User info synced to database
- [ ] Logout clears session
- [ ] Non-whitelisted email → Error message
- [ ] Admin can add email to whitelist
- [ ] Whitelisted user can log in
- [ ] Admin can remove from whitelist
- [ ] OAuth user info displayed in admin panel

### Automated Testing

```bash
# Test authorization URL generation
curl http://localhost:8787/api/auth/oauth/login

# Test callback (requires valid code + state)
curl "http://localhost:8787/api/auth/oauth/callback?code=abc123&state=xyz789"

# Test get current user
curl http://localhost:8787/api/auth/oauth/me \
  --cookie "wheel_session=your-session-id"
```

## Files Modified/Created

### Backend
- ✅ `v2/backend/migrations/0010_oauth2_migration.sql` - Database schema
- ✅ `v2/backend/src/services/oauth-service.ts` - OAuth2 logic
- ✅ `v2/backend/src/handlers/oauth.ts` - OAuth2 handlers
- ✅ `v2/backend/src/handlers/admin.ts` - Whitelist management
- ✅ `v2/backend/src/router.ts` - OAuth2 routes
- ✅ `v2/backend/wrangler.toml` - OAuth2 config

### Frontend
- ✅ `v2/frontend/src/services/oauth-client.ts` - OAuth2 client
- ✅ `v2/frontend/src/contexts/AuthContext.tsx` - Auth state management
- ✅ `v2/frontend/src/components/auth/LoginPage.tsx` - Login UI
- ✅ `v2/frontend/src/components/auth/CallbackPage.tsx` - Callback handler
- ✅ `v2/frontend/src/components/auth/ProtectedRoute.tsx` - Route protection
- ✅ `v2/frontend/src/components/admin/UserManagement.tsx` - User admin UI

### Shared
- ✅ `v2/shared/types.ts` - OAuth2 types

## Resources

- **S-Auth Documentation**: https://auth.sebbyk.net/docs
- **OAuth2 RFC 6749**: https://tools.ietf.org/html/rfc6749
- **PKCE RFC 7636**: https://tools.ietf.org/html/rfc7636
- **OpenID Connect**: https://openid.net/connect/

## Support

For S-Auth configuration or issues:
- Contact your S-Auth administrator
- Check S-Auth status: https://status.sebbyk.net (if available)

For application issues:
- Check Cloudflare Workers logs: `wrangler tail`
- Review browser console for frontend errors
- Verify database with: `wrangler d1 execute restaurant-wheel-db-v2 --command="SELECT * FROM users LIMIT 5"`
