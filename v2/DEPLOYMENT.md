# The Wheel v2 - Production Deployment Guide

This guide covers deploying The Wheel v2 with S-Auth OAuth2 authentication to production.

## Prerequisites

Before deploying, ensure you have:

- [x] Cloudflare account with Workers, D1, and R2 access
- [x] Wrangler CLI installed: `npm install -g wrangler`
- [x] Authenticated with Wrangler: `wrangler login`
- [x] S-Auth client credentials (client ID)
- [x] Domain configured in Cloudflare DNS

## Deployment Checklist

### Phase 1: S-Auth Configuration

**1.1 Register Application with S-Auth**

Contact your S-Auth administrator to register The Wheel:

```
Application Name: The Wheel
Client ID: <request from S-Auth admin>
Redirect URI: https://wheel.sebbyk.net/api/auth/oauth/callback
Grant Types: authorization_code, refresh_token
Response Types: code
PKCE: Required (S256)
Scopes: openid, profile, email
```

Save the **Client ID** you receive - you'll need it in step 2.2.

### Phase 2: Backend Deployment

**2.1 Create Production D1 Database**

```bash
cd v2/backend

# Create database
wrangler d1 create restaurant-wheel-db-v2

# Copy the database_id from output
# Update wrangler.toml with the database_id
```

**2.2 Update Production Configuration**

Edit [v2/backend/wrangler.toml](v2/backend/wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "restaurant-wheel-db-v2"
database_id = "<paste-database-id-here>"

[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "wheel-restaurant-photos"
preview_bucket_name = "wheel-restaurant-photos-preview"

[vars]
ENVIRONMENT = "production"
FRONTEND_URL = "https://wheel.sebbyk.net"
R2_PUBLIC_URL = "https://wheel-cdn.sebbyk.net"

# OAuth2 configuration (S-Auth)
OAUTH_AUTHORIZATION_ENDPOINT = "https://auth.sebbyk.net/authorize"
OAUTH_TOKEN_ENDPOINT = "https://auth.sebbyk.net/token"
OAUTH_USERINFO_ENDPOINT = "https://auth.sebbyk.net/userinfo"
OAUTH_CLIENT_ID = "<paste-client-id-from-sauth>"
OAUTH_REDIRECT_URI = "https://wheel.sebbyk.net/api/auth/oauth/callback"
```

**2.3 Run Database Migrations**

```bash
# Run all migrations (including OAuth2 migration 0010)
wrangler d1 migrations apply restaurant-wheel-db-v2 --remote

# Verify migrations applied
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

Expected tables:
- users
- sessions
- restaurants
- visits
- restaurant_photos
- legacy_photo_urls

**2.4 Create R2 Bucket**

```bash
# Create bucket for photos
wrangler r2 bucket create wheel-restaurant-photos

# List buckets to verify
wrangler r2 bucket list
```

**2.5 Configure R2 Public Access**

1. Go to Cloudflare Dashboard → R2
2. Select `wheel-restaurant-photos` bucket
3. Settings → Public Access → **Enable**
4. Note the R2.dev URL (e.g., `https://pub-abc123.r2.dev`)

**2.6 Set Up Custom Domain for R2 (Recommended)**

1. In R2 bucket settings → Custom Domains
2. Add domain: `photos.wheel.sebbyboe.online`
3. Cloudflare will automatically configure DNS

Or manually add DNS record:
- Type: `CNAME`
- Name: `photos`
- Target: `<your-bucket>.r2.cloudflarestorage.com`
- Proxied: Yes

**2.7 Deploy Backend to Cloudflare Workers**

```bash
cd v2/backend

# Install dependencies
npm install

# Deploy to production
wrangler deploy

# Note the deployed URL (e.g., restaurant-wheel-api.your-subdomain.workers.dev)
```

**2.8 Test Backend Deployment**

```bash
# Health check
curl https://restaurant-wheel-api.your-subdomain.workers.dev/

# Should return: {"status":"ok","service":"restaurant-wheel-api"}

# Test OAuth login endpoint
curl https://restaurant-wheel-api.your-subdomain.workers.dev/api/auth/oauth/login

# Should return: {"authorization_url":"https://auth.sebbyk.net/authorize?...","state":"..."}
```

**2.9 Set Up Custom Domain for Backend (Optional)**

1. Cloudflare Dashboard → Workers & Pages → restaurant-wheel-api
2. Triggers → Custom Domains → Add Custom Domain
3. Enter: `api.wheel.sebbyboe.online`
4. Cloudflare configures DNS automatically

Update `wrangler.toml` and redeploy if using custom domain.

### Phase 3: Initial Admin Setup

**3.1 Create First Admin User**

```bash
# Add your admin email to whitelist
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="INSERT INTO users (email, is_admin, is_whitelisted, is_provisional) VALUES ('admin@sebbyboe.online', 1, 1, 0)"

# Verify
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT * FROM users WHERE is_admin = 1"
```

**Important:** This creates a placeholder user. They must log in via S-Auth to complete their account.

### Phase 4: Data Migration from V1 (If Applicable)

**4.1 Backup V1 Database**

```bash
# Export v1 database
wrangler d1 export restaurant-wheel-db --remote > v1-backup-$(date +%Y%m%d).sql

# Store backup securely
```

**4.2 Run Migration Script**

Follow instructions in [v2/migration/README.md](v2/migration/README.md):

```bash
# Review migration script
cat v2/migration/migrate-v1-to-v2.ts

# Customize for your v1/v2 database IDs
# Run migration (see migration README for details)
```

**4.3 Validate Migration**

```bash
# Compare record counts
wrangler d1 execute restaurant-wheel-db --remote \
  --command="SELECT COUNT(*) as v1_users FROM users"

wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT COUNT(*) as v2_users FROM users"

# Verify restaurants migrated
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT COUNT(*) FROM restaurants"

# Check legacy photos
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT COUNT(*) FROM legacy_photo_urls"
```

### Phase 5: Frontend Deployment

**5.1 Configure Frontend Environment**

Create `v2/frontend/.env.production`:

```bash
VITE_API_URL=https://restaurant-wheel-api.your-subdomain.workers.dev/api
# Or if using custom domain:
# VITE_API_URL=https://api.wheel.sebbyboe.online/api
```

**5.2 Build Frontend**

```bash
cd v2/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output will be in dist/ folder
```

**5.3 Deploy Frontend**

Choose one of the following:

**Option A: Cloudflare Pages (Recommended)**

```bash
# Install Wrangler Pages CLI
npm install -g wrangler

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=the-wheel

# Set up custom domain in Cloudflare Pages dashboard:
# Pages → the-wheel → Custom domains → Add domain: wheel.sebbyboe.online
```

**Option B: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure custom domain in Vercel dashboard
```

**Option C: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Configure custom domain in Netlify dashboard
```

**5.4 Configure CORS**

Update backend CORS to allow your frontend domain:

Edit `v2/backend/src/middleware/cors.ts` (if not already configured):

```typescript
const allowedOrigins = [
  'https://wheel.sebbyboe.online',
  'http://localhost:5173', // Keep for local dev
];
```

Redeploy backend:
```bash
cd v2/backend
wrangler deploy
```

### Phase 6: DNS Configuration

**6.1 Verify DNS Records**

Ensure the following DNS records exist in Cloudflare:

| Type | Name | Target | Proxied |
|------|------|--------|---------|
| CNAME | `wheel` | `the-wheel.pages.dev` (or your deployment) | Yes |
| CNAME | `api.wheel` | `restaurant-wheel-api.workers.dev` | Yes |
| CNAME | `photos.wheel` | `<bucket>.r2.cloudflarestorage.com` | Yes |

**6.2 Test Domain Resolution**

```bash
# Test frontend
curl -I https://wheel.sebbyboe.online

# Test backend
curl https://api.wheel.sebbyboe.online/
# Or: curl https://restaurant-wheel-api.your-subdomain.workers.dev/

# Test photos (after uploading one)
curl -I https://photos.wheel.sebbyboe.online/
```

### Phase 7: Security & SSL

**7.1 Enable SSL/TLS**

Cloudflare should automatically provision SSL certificates. Verify:

1. Cloudflare Dashboard → SSL/TLS
2. Encryption mode: **Full** or **Full (strict)**
3. Edge Certificates → Status: Active

**7.2 Enable Security Headers**

Backend already includes security headers. Verify in `v2/backend/src/middleware/cors.ts`.

**7.3 Configure Rate Limiting (Optional)**

```bash
# Cloudflare Dashboard → Security → WAF → Rate limiting rules
# Create rule: 100 requests per minute per IP
```

### Phase 8: Final Testing

**8.1 End-to-End OAuth Flow**

1. Navigate to `https://wheel.sebbyboe.online`
2. Click "Sign in with S-Auth"
3. Should redirect to S-Auth
4. Enter admin credentials (whitelisted email)
5. Should redirect back and be logged in
6. Verify user synced in database:
```bash
wrangler d1 execute restaurant-wheel-db-v2 --remote \
  --command="SELECT email, oauth_subject, given_name, family_name, last_login FROM users WHERE is_admin = 1"
```

**8.2 Test Core Features**

- [ ] Login with S-Auth works
- [ ] Admin can access admin panel
- [ ] Admin can add email to whitelist
- [ ] New user can log in after being whitelisted
- [ ] Restaurant nomination works
- [ ] Photo upload works (uploads to R2)
- [ ] Photo thumbnails display correctly
- [ ] Wheel spinning works
- [ ] Rating submission works
- [ ] Statistics page loads

**8.3 Test Photo Upload**

1. Log in as admin
2. Navigate to any restaurant
3. Upload a photo
4. Verify photo appears in gallery
5. Check R2 bucket:
```bash
wrangler r2 object get wheel-restaurant-photos restaurants/1/<filename> --file=test.jpg
```

**8.4 Browser Testing**

Test in multiple browsers:
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (desktop + iOS)
- [ ] Edge

### Phase 9: Monitoring & Logs

**9.1 Set Up Cloudflare Logs**

```bash
# Tail logs in real-time
wrangler tail

# Or for specific worker
wrangler tail restaurant-wheel-api
```

**9.2 Monitor Analytics**

1. Cloudflare Dashboard → Workers & Pages → restaurant-wheel-api → Metrics
2. Monitor: Requests, Errors, CPU time, Duration

**9.3 Set Up Alerts (Optional)**

Cloudflare Dashboard → Notifications:
- Worker errors exceed threshold
- D1 database usage
- R2 storage usage

### Phase 10: Post-Deployment

**10.1 Update Documentation**

Update the following with production URLs:
- README.md
- OAUTH2_SETUP.md
- Any API documentation

**10.2 Notify Users**

If migrating from v1:
- Send email to all users about new S-Auth login
- Provide instructions for whitelisted users
- Set deadline for migration

**10.3 Archive V1**

After successful v2 deployment and validation:

```bash
# Archive v1 code
cd ..
tar -czf restaurant-wheel-v1-backup-$(date +%Y%m%d).tar.gz backend/ frontend/

# Store backup securely
# Consider keeping v1 running for 1-2 weeks as fallback
```

## Rollback Procedure

If critical issues are found:

**Step 1: Revert DNS**
```bash
# Point wheel.sebbyboe.online back to v1 deployment
# In Cloudflare Dashboard → DNS
```

**Step 2: Restore V1 Database (if needed)**
```bash
# Restore from backup
wrangler d1 execute restaurant-wheel-db --remote --file=v1-backup.sql
```

**Step 3: Investigate Issues**
```bash
# Check logs
wrangler tail restaurant-wheel-api

# Check database
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT * FROM users LIMIT 5"
```

**Step 4: Fix and Redeploy**

Once issues are resolved, repeat deployment steps.

## Environment Variables Reference

### Backend (wrangler.toml)

```toml
ENVIRONMENT = "production"
FRONTEND_URL = "https://wheel.sebbyboe.online"
R2_PUBLIC_URL = "https://photos.wheel.sebbyboe.online"
OAUTH_AUTHORIZATION_ENDPOINT = "https://auth.sebbyk.net/authorize"
OAUTH_TOKEN_ENDPOINT = "https://auth.sebbyk.net/token"
OAUTH_USERINFO_ENDPOINT = "https://auth.sebbyk.net/userinfo"
OAUTH_CLIENT_ID = "<your-client-id>"
OAUTH_REDIRECT_URI = "https://wheel.sebbyboe.online/api/auth/oauth/callback"
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://api.wheel.sebbyboe.online/api
```

## Useful Commands

### Database Operations
```bash
# Execute SQL
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM users"

# Export database
wrangler d1 export restaurant-wheel-db-v2 --remote > backup.sql

# Import SQL file
wrangler d1 execute restaurant-wheel-db-v2 --remote --file=data.sql
```

### R2 Operations
```bash
# List buckets
wrangler r2 bucket list

# List objects in bucket
wrangler r2 object list wheel-restaurant-photos

# Download object
wrangler r2 object get wheel-restaurant-photos <key> --file=output.jpg

# Delete object
wrangler r2 object delete wheel-restaurant-photos <key>
```

### Worker Operations
```bash
# Deploy
wrangler deploy

# View logs
wrangler tail

# View worker details
wrangler whoami
```

## Troubleshooting

### Issue: OAuth Callback 404

**Problem:** `/api/auth/oauth/callback` returns 404

**Solution:**
1. Verify backend deployed: `wrangler deploy`
2. Check routes in router.ts include OAuth routes
3. Test endpoint: `curl https://your-worker.workers.dev/api/auth/oauth/callback`

### Issue: CORS Errors

**Problem:** Frontend can't reach backend

**Solution:**
1. Update CORS middleware with frontend URL
2. Redeploy backend: `wrangler deploy`
3. Check browser console for exact error

### Issue: Photos Not Loading

**Problem:** Uploaded photos return 404

**Solution:**
1. Verify R2 bucket public access enabled
2. Check R2_PUBLIC_URL in wrangler.toml
3. Test direct URL: `https://photos.wheel.sebbyboe.online/restaurants/1/test.jpg`
4. List objects: `wrangler r2 object list wheel-restaurant-photos`

### Issue: Database Migration Failed

**Problem:** Migration command errors

**Solution:**
1. Check D1 database exists: `wrangler d1 list`
2. Verify database_id in wrangler.toml
3. Run migrations one at a time:
```bash
wrangler d1 execute restaurant-wheel-db-v2 --remote --file=migrations/0001_initial.sql
```

## Support

- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare D1:** https://developers.cloudflare.com/d1/
- **Cloudflare R2:** https://developers.cloudflare.com/r2/
- **S-Auth Support:** Contact your S-Auth administrator

## Maintenance

### Weekly Tasks
- [ ] Review error logs: `wrangler tail`
- [ ] Check database size: Cloudflare Dashboard → D1
- [ ] Monitor R2 storage usage

### Monthly Tasks
- [ ] Review user list (remove inactive whitelisted emails if needed)
- [ ] Backup database: `wrangler d1 export`
- [ ] Review analytics for usage patterns

### As Needed
- [ ] Update dependencies: `npm update`
- [ ] Review and apply security patches
- [ ] Scale resources if usage increases

---

**Deployment completed!** 🚀

Your production deployment should now be live at:
- **Frontend:** https://wheel.sebbyboe.online
- **Backend API:** https://api.wheel.sebbyboe.online (or Workers URL)
- **Photos:** https://photos.wheel.sebbyboe.online
