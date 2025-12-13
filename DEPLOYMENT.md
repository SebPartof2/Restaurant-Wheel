# Deployment Guide for The Wheel

## Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Logged into Wrangler (`wrangler login`)

## Step 1: Configure Admin Emails

Edit [backend/src/config.ts](backend/src/config.ts:5-8) and add your admin email addresses:

```typescript
adminEmails: [
  'your-admin@email.com',
  'another-admin@email.com',
],
```

Also add emails to the whitelist:

```typescript
emailWhitelist: [
  'your-admin@email.com',
  'user1@email.com',
  'user2@email.com',
],
```

## Step 2: Create Cloudflare D1 Database

```bash
cd backend
wrangler d1 create restaurant-wheel-db
```

Copy the database ID from the output and paste it into [backend/wrangler.toml](backend/wrangler.toml:13) under `database_id`.

## Step 3: Run Database Migrations

The migration scripts will run all migration files in sequence (0001 through 0007).

**For production:**
```bash
cd backend
npm run migrate:prod
```

**For local development:**
```bash
cd backend
npm run migrate:local
```

**Note:** If you're upgrading an existing deployment, migrations are designed to be idempotent where possible. However, migration 0007 modifies the visits table to remove rating constraints, which requires recreating the table.

## Step 4: Deploy Backend (Cloudflare Workers)

```bash
cd backend
npm install
npm run deploy
```

Note the deployed worker URL (e.g., `https://restaurant-wheel-api.your-subdomain.workers.dev`).

## Step 5: Configure Frontend

Create [frontend/.env.production](frontend/.env.production):

```
VITE_API_URL=https://restaurant-wheel-api.your-subdomain.workers.dev/api
```

## Step 6: Deploy Frontend (Cloudflare Pages)

### Option A: Via CLI

```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name=restaurant-wheel
```

### Option B: Via Cloudflare Dashboard

1. Go to Cloudflare Dashboard → Pages
2. Create a new project
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`
5. Add environment variable: `VITE_API_URL` = `https://restaurant-wheel-api.your-subdomain.workers.dev/api`
6. Deploy!

## Step 7: Update CORS Settings

Update [backend/wrangler.toml](backend/wrangler.toml:13-15) with your frontend URL:

```toml
[vars]
ENVIRONMENT = "production"
FRONTEND_URL = "https://restaurant-wheel.pages.dev"  # Replace with your actual frontend URL
```

**Important:** Make sure to replace `https://restaurant-wheel.pages.dev` with your actual Cloudflare Pages URL.

Redeploy the backend:

```bash
cd backend
npm run deploy
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run migrate:local
npm run dev
```

Backend runs at `http://localhost:8787`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Features Overview

### Restaurant States
- **Pending**: Newly nominated restaurants awaiting admin approval
- **Active**: Approved restaurants available for the wheel
- **Upcoming**: Selected restaurant with optional reservation date/time
- **Visited**: Completed visits with ratings

### User Management
- **Email Whitelist**: Control who can sign up
- **Provisional Users**: Invite users via signup codes (created by admins)
- **Admin Users**: Can approve/reject nominations and manage all restaurants

### Rating System
- Accepts any positive number (decimals allowed, no upper limit)
- Displayed with "/ 10" as reference scale for consistency
- Shows who gave each rating
- Automatic average calculation per restaurant

### Visibility
- Every restaurant shows who nominated it
- All ratings show the user's name or email
- Reservation dates displayed for upcoming restaurants
- Visit history tracking

## Testing the Deployment

1. Visit your frontend URL
2. Sign up with a whitelisted email
3. Login
4. Create a restaurant nomination
5. As an admin, approve it
6. Spin the wheel!
7. Mark as visited and add ratings

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in `wrangler.toml` matches your actual frontend URL
- Redeploy backend after changing CORS settings

### Database Connection Issues
- Verify database ID in `wrangler.toml` is correct
- Run migrations: `npm run migrate:prod`
- Check Cloudflare dashboard for D1 database status

### Authentication Issues
- Check admin emails are correctly configured in `backend/src/config.ts`
- Verify email whitelist includes your test accounts
- Session cookies must be enabled in browser

### 404 Errors on Frontend Routes
- Cloudflare Pages should automatically handle SPA routing
- If not, add a `_redirects` file: `/* /index.html 200`

## Environment Variables Summary

### Backend (wrangler.toml)
- `ENVIRONMENT` - "production" or "development"
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.production)
- `VITE_API_URL` - Backend API URL

## Security Checklist

- [ ] Admin emails configured in `config.ts`
- [ ] Email whitelist configured
- [ ] Strong passwords enforced (min 8 characters)
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] CORS properly configured
- [ ] Database backups enabled (Cloudflare D1 automatic backups)

## Monitoring

Check Cloudflare Dashboard for:
- Worker analytics and logs
- D1 database usage
- Pages deployment status and analytics
- Error rates and performance metrics

## Cost Estimates (Cloudflare Free Tier)

- **Workers**: 100,000 requests/day (FREE)
- **D1 Database**: 5 GB storage, 5 million reads/day (FREE)
- **Pages**: Unlimited requests, 500 builds/month (FREE)

Perfect for a family app!

## Support

If you encounter issues:
1. Check Cloudflare Dashboard logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Ensure database migrations ran successfully
