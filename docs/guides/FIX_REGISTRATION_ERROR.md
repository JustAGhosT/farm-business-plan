# Fix for Registration 500 Error

## Problem Description

When trying to register a new user, you may encounter:

- **500 Internal Server Error** from `/api/auth/register`
- **TypeError: Cannot read properties of undefined (reading 'toLowerCase')** in browser console

## Root Causes

1. **Missing Users Table**: The authentication migration wasn't run, so the `users` table doesn't exist
2. **KeyboardShortcuts Bug**: Event handler didn't guard against `undefined` event.key values

## Solutions Applied

### 1. Fixed KeyboardShortcuts Component ✅

Added safety checks to prevent undefined event.key errors:

```typescript
// Before (could crash)
const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

// After (safe)
if (!event.key) return
const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
```

### 2. Created Authentication Migration ✅

Created `db/migrations/002_add_authentication.sql` with:

- Users table schema
- Email index for fast lookups
- owner_id foreign key in farm_plans
- Triggers for updated_at timestamps

### 3. Updated Database Schema ✅

Updated `db/schema.sql` to include users table for fresh installations.

## How to Fix Your Installation

### Quick Fix (Recommended)

If you already have a database running, just apply the authentication migration:

```bash
# 1. Set your database URL
export DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"

# 2. Apply the authentication migration
psql $DATABASE_URL -f db/migrations/002_add_authentication.sql

# 3. Verify it worked
npm run db:test
```

### Fresh Installation

For new setups:

```bash
# 1. Create database
createdb farm_business_plan

# 2. Apply complete schema
psql -d farm_business_plan -f db/schema.sql

# 3. Apply migrations (optional, schema already includes everything)
psql -d farm_business_plan -f db/migrations/001_initial_schema.sql
psql -d farm_business_plan -f db/migrations/002_add_authentication.sql
psql -d farm_business_plan -f db/migrations/003_add_calculator_results.sql

# 4. Test connection
npm run db:test
```

### Using Netlify DB

```bash
# 1. Initialize Netlify DB
netlify db init

# 2. Get connection string
export DATABASE_URL=$(netlify env:get DATABASE_URL)

# 3. Apply schema
psql $DATABASE_URL -f db/schema.sql

# 4. Apply migrations
psql $DATABASE_URL -f db/migrations/002_add_authentication.sql
psql $DATABASE_URL -f db/migrations/003_add_calculator_results.sql
```

## Verification Steps

### 1. Test Database Connection

```bash
npm run db:test
```

Expected output:

```
🔍 Testing database connection...

Testing connection to: postgresql://****@localhost:5432/farm_business_plan
✅ Database connected successfully!
📊 PostgreSQL version: PostgreSQL 14.x

Checking required tables...
  ✅ users
  ✅ farm_plans
  ✅ crop_plans
  ✅ tasks
  ✅ climate_data

👥 Users table exists with 0 user(s)

✅ Database setup looks good!
```

### 2. Test Registration

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/auth/register

3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123

4. Click "Create Account"

5. You should be redirected to the sign-in page with a success message

### 3. Verify User Was Created

```bash
psql $DATABASE_URL -c "SELECT id, name, email, role, created_at FROM users;"
```

## Troubleshooting

### Error: "relation 'users' does not exist"

**Problem**: The migration wasn't applied.

**Solution**:

```bash
psql $DATABASE_URL -f db/migrations/002_add_authentication.sql
```

### Error: "Database connection failed"

**Problem**: DATABASE_URL not set or PostgreSQL not running.

**Solution**:

1. Check `.env.local` has DATABASE_URL
2. Verify PostgreSQL is running: `pg_isready`
3. Test connection manually: `psql $DATABASE_URL -c "SELECT 1"`

### Error: "NEXTAUTH_SECRET is not set"

**Problem**: Missing NextAuth configuration.

**Solution**:
Add to `.env.local`:

```env
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### Still getting TypeError in console

**Problem**: Old build cached in browser.

**Solution**:

1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Restart development server
4. Clear Next.js cache: `rm -rf .next`

## Environment Variables Checklist

Make sure `.env.local` contains:

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"

# NextAuth (Required)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
# GITHUB_ID="your-github-client-id"
# GITHUB_SECRET="your-github-client-secret"
# GOOGLE_ID="your-google-client-id"
# GOOGLE_SECRET="your-google-client-secret"
```

## What Changed in This Fix

### Files Modified:

- ✅ `components/KeyboardShortcuts.tsx` - Added event.key safety checks
- ✅ `db/schema.sql` - Added users table
- ✅ `db/README.md` - Updated migration instructions

### Files Created:

- ✅ `db/migrations/002_add_authentication.sql` - Authentication migration
- ✅ `SETUP_DATABASE.md` - Quick setup guide
- ✅ `scripts/test-db-connection.js` - Database test utility
- ✅ `FIX_REGISTRATION_ERROR.md` - This file

### Dependencies Added:

- ✅ `dotenv` (dev dependency for test script)

## Need More Help?

1. Check `AUTHENTICATION.md` for detailed authentication setup
2. Check `SETUP_DATABASE.md` for database setup instructions
3. Check `db/README.md` for database migration guidelines
4. Run `npm run db:test` to diagnose connection issues
5. Check server logs for specific error messages

## Prevention for Future Installations

To avoid this issue in the future:

1. Always run all migrations in order after setting up the database
2. Use the database test script before starting development: `npm run db:test`
3. Keep `.env.local` up to date with all required variables
4. Follow the setup guide in `QUICKSTART.md`

---

**Status**: ✅ Fixed in this PR

**Testing**: All changes have been tested and verified to work correctly.
