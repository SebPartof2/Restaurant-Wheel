# V1 to V2 Migration

This directory contains the migration scripts to migrate data from The Wheel v1 to v2.

## Overview

The migration process:
1. Exports all users, restaurants, and visits from v1 D1 database
2. Imports data into v2 D1 database with new schema
3. Creates legacy photo entries for existing photo URLs
4. Validates that all data was migrated successfully

## Prerequisites

- Access to both v1 and v2 Cloudflare D1 databases
- Wrangler CLI installed and configured
- Node.js and npm installed

## Migration Steps

### 1. Backup V1 Database

First, create a backup of your v1 production database:

```bash
# Export v1 database
wrangler d1 export restaurant-wheel-db --remote > v1-backup.sql

# Save this file in a safe location
```

### 2. Set Up V2 Database

Create and initialize the v2 database:

```bash
cd ../backend

# Create v2 D1 database (if not exists)
wrangler d1 create restaurant-wheel-db-v2

# Update wrangler.toml with the new database_id

# Run migrations
wrangler d1 migrations apply restaurant-wheel-db-v2 --remote
```

### 3. Run Migration Script

For Cloudflare D1, you have two options:

#### Option A: Using Wrangler D1 Execute (Recommended)

```bash
# Export v1 data to SQL
wrangler d1 export restaurant-wheel-db --remote > v1-data.sql

# Manually transform the data (remove photo_link from restaurants, add legacy_photo_urls)
# Then import into v2
wrangler d1 execute restaurant-wheel-db-v2 --remote --file=v2-data.sql
```

#### Option B: Using API/Worker

Deploy a temporary migration worker that:
1. Reads from v1 D1 database
2. Writes to v2 D1 database
3. Handles legacy photos

### 4. Validate Migration

After migration, validate the data:

```bash
# Count records in v1
wrangler d1 execute restaurant-wheel-db --remote --command="SELECT COUNT(*) FROM users"
wrangler d1 execute restaurant-wheel-db --remote --command="SELECT COUNT(*) FROM restaurants"
wrangler d1 execute restaurant-wheel-db --remote --command="SELECT COUNT(*) FROM visits"

# Count records in v2 (should match)
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM users"
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM restaurants"
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM visits"

# Check legacy photos
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM restaurant_photos WHERE r2_key LIKE 'legacy/%'"
wrangler d1 execute restaurant-wheel-db-v2 --remote --command="SELECT COUNT(*) FROM legacy_photo_urls"
```

### 5. Test V2 Application

Before switching production traffic:

1. Deploy v2 to a staging URL
2. Test all critical flows:
   - User login
   - View restaurants with photos
   - Upload new photos
   - Wheel spinning
   - Rating submission
3. Verify legacy photos display correctly

### 6. Production Cutover

When ready:

1. Schedule maintenance window
2. Stop accepting writes to v1 (read-only mode if possible)
3. Re-run migration to catch any new data
4. Deploy v2 frontend
5. Update DNS to point to v2
6. Monitor for errors

## Rollback Plan

If issues are found after cutover:

```bash
# Revert DNS to v1
# V1 database is unchanged and can continue serving traffic

# Investigate issues in v2
# Fix and re-deploy

# When ready, try cutover again
```

## Legacy Photo Handling

V1 photos stored as external URLs are preserved in two tables:

1. `restaurant_photos` - Contains entry with `r2_key = 'legacy/{restaurant_id}'`
2. `legacy_photo_urls` - Stores the original external URL

Frontend checks for the `legacy/` prefix and fetches the URL from `legacy_photo_urls`.

Users can upload new photos to replace legacy ones over time.

## Troubleshooting

### Missing Records

If record counts don't match:
- Check for foreign key constraint errors
- Verify all v1 users were migrated before restaurants
- Check migration logs for specific errors

### Photo URLs Not Working

- Verify `legacy_photo_urls` table has entries
- Check that frontend is handling legacy photos correctly
- Ensure external URLs are still accessible

### Performance Issues

If migration is slow:
- Process in batches (100-1000 records at a time)
- Use transactions for atomicity
- Consider using D1's batch insert API

## Notes

- Sessions table is NOT migrated (users will need to log in again)
- Password hashes ARE migrated (users keep their passwords)
- All timestamps are preserved from v1
- Restaurant IDs remain the same
- User IDs remain the same

## Support

If you encounter issues during migration:
1. Check the migration logs
2. Verify database schema matches expectations
3. Test locally with a copy of production data first
4. Keep v1 database intact until v2 is fully validated
