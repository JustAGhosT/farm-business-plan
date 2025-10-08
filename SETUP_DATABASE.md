# Database Setup Quick Guide

## ⚠️ Important: Authentication Setup Required

If you're experiencing a **500 error during registration**, it means the authentication tables haven't been set up yet. Follow these steps:

## Quick Setup (For Existing Installations)

If you already have a database with the base schema, run only the authentication migration:

```bash
# Set your database URL
export DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"

# Run the authentication migration
psql $DATABASE_URL -f db/migrations/002_add_authentication.sql
```

## Fresh Installation

For new database setups, use the complete schema:

```bash
# Create database
createdb farm_business_plan

# Run complete schema (includes authentication)
psql -d farm_business_plan -f db/schema.sql

# Run any additional migrations
psql -d farm_business_plan -f db/migrations/001_initial_schema.sql
psql -d farm_business_plan -f db/migrations/002_add_authentication.sql
psql -d farm_business_plan -f db/migrations/003_add_calculator_results.sql
```

## Netlify DB Setup

If using Netlify DB:

```bash
# Initialize Netlify DB
netlify db init

# Get database URL
export DATABASE_URL=$(netlify env:get DATABASE_URL)

# Run schema and migrations
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/migrations/002_add_authentication.sql
psql $DATABASE_URL -f db/migrations/003_add_calculator_results.sql
```

## Verify Setup

Test that the users table exists:

```bash
psql $DATABASE_URL -c "\d users"
```

You should see the users table structure. If successful, registration should now work!

## What Was Fixed

1. **Added users table** - Required for authentication
2. **Fixed KeyboardShortcuts** - Prevented undefined event.key errors
3. **Updated schema.sql** - Includes users table for new installations

## Troubleshooting

### Still getting 500 errors?

1. Check database connection:
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

2. Verify users table exists:
   ```bash
   psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_name = 'users';"
   ```

3. Check application logs for specific errors

### Environment Variables

Make sure these are set in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```
