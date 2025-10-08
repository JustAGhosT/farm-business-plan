# Database Setup

This directory contains the database schema, migrations, and seed data for the Farm Business Plan application.

## Structure

```
db/
├── schema.sql              # Complete database schema
├── migrations/             # Database migration files
│   └── 001_initial_schema.sql
└── seeds/                  # Seed data files
    └── 001_crop_templates.sql
```

## Database Setup Instructions

### Option 1: Netlify DB (Recommended for Netlify Deployments)

Netlify DB is a serverless PostgreSQL database powered by Neon, with automatic provisioning and configuration.

**Prerequisites:**
- Netlify account
- Netlify CLI installed: `npm install -g netlify-cli`
- Site deployed to Netlify (or in development)

**Setup Steps:**

1. **Initialize Netlify DB:**
   ```bash
   # From your project root
   npx netlify db init
   
   # Or if you have Netlify CLI globally installed
   netlify db init
   ```
   
   This will:
   - Create a Neon PostgreSQL database
   - Set up connection pooling
   - Configure environment variables automatically:
     - `DATABASE_URL`: Direct connection
     - `DATABASE_URL_POOLER`: Pooled connection (recommended for serverless)

2. **Install the Netlify Neon package** (already included in dependencies):
   ```bash
   npm install @netlify/neon
   ```

3. **Get your database connection URL:**
   ```bash
   # View environment variables
   netlify env:list
   
   # Get DATABASE_URL
   netlify env:get DATABASE_URL
   ```

4. **Apply database schema:**
   ```bash
   # Set the DATABASE_URL from Netlify
   export DATABASE_URL=$(netlify env:get DATABASE_URL)
   
   # Apply schema
   psql $DATABASE_URL -f db/schema.sql
   ```

5. **Run migrations:**
   ```bash
   # Run migrations in order
   psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
   ```

6. **Seed database (optional):**
   ```bash
   psql $DATABASE_URL -f db/seeds/001_crop_templates.sql
   ```

**Important Notes:**
- Environment variables are automatically injected in Netlify Functions
- Use `DATABASE_URL_POOLER` in production for better performance
- Database credentials are managed by Netlify (no manual configuration needed)
- Free tier includes 0.5 GB storage and 256 MB RAM

### Option 2: Local PostgreSQL Setup

For local development or self-hosted deployments:

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS with Homebrew
   brew install postgresql
   ```

2. **Create Database**
   ```bash
   createdb farm_business_plan
   ```

3. **Run Schema**
   ```bash
   psql -U your_username -d farm_business_plan -f db/schema.sql
   ```

4. **Run Migrations** (in order)
   ```bash
   psql -U your_username -d farm_business_plan -f db/migrations/001_initial_schema.sql
   ```

5. **Seed Database** (optional)
   ```bash
   psql -U your_username -d farm_business_plan -f db/seeds/001_crop_templates.sql
   ```

## Environment Variables

### For Netlify DB

When using Netlify DB, these are automatically set:
- `DATABASE_URL`: Direct connection to Neon PostgreSQL
- `DATABASE_URL_POOLER`: Pooled connection (recommended for serverless functions)

No manual configuration needed - these are injected automatically in:
- Netlify Functions (serverless API routes)
- Build environment
- Deploy previews

### For Local Development

Set these environment variables for database connection:

```bash
# .env.local (create this file in project root)
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"
```

### For External PostgreSQL

If using an external PostgreSQL provider (Heroku, AWS RDS, etc.):

```bash
# Add to Netlify environment variables
# Dashboard → Site Settings → Environment Variables
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# For staging/production in GitHub Actions
# Add as GitHub secrets:
DATABASE_URL="postgresql://..."              # Staging
DATABASE_URL_PRODUCTION="postgresql://..."   # Production
```

## Using Database in API Routes

The application includes example API routes that demonstrate database connectivity.

### Example: Database Test Endpoint

See `app/api/db-test/route.ts` for a complete example of using PostgreSQL with connection pooling.

**Key Points:**

1. **Use Connection Pooling**: For serverless functions, use `pg.Pool` instead of direct connections
   ```typescript
   import { Pool } from 'pg'
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL,
     ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
   })
   ```

2. **Prefer DATABASE_URL_POOLER**: In production (Netlify), use `DATABASE_URL_POOLER` for better performance
   - Handles connection management automatically
   - Reduces cold start times
   - Better suited for serverless environments

3. **Handle Errors Gracefully**: Always wrap database calls in try-catch blocks
   ```typescript
   try {
     const result = await pool.query('SELECT * FROM table')
     return NextResponse.json({ success: true, data: result.rows })
   } catch (error) {
     console.error('Database error:', error)
     return NextResponse.json({ success: false, error: error.message }, { status: 500 })
   }
   ```

4. **Test Database Connectivity**:
   ```bash
   # Local development
   npm run dev
   curl http://localhost:3000/api/db-test
   
   # Production
   curl https://your-site.netlify.app/api/db-test
   ```

### Required Packages

- `pg`: PostgreSQL client for Node.js (already in dependencies)
- `@types/pg`: TypeScript types for pg (in devDependencies)
- `@netlify/neon`: Netlify DB integration (in dependencies)

### Best Practices

- **Close connections in long-running apps**: For non-serverless environments, call `pool.end()`
- **Use parameterized queries**: Prevent SQL injection
  ```typescript
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
  ```
- **Handle connection errors**: Implement retry logic for transient failures
- **Monitor connection pool**: Track active connections in production



## Migration Strategy

### Creating New Migrations

1. Create a new file in `db/migrations/` with format: `XXX_description.sql`
2. Wrap changes in BEGIN/COMMIT transaction
3. Use `IF NOT EXISTS` for idempotent operations
4. Document the migration purpose at the top

Example:
```sql
-- Migration: 002_add_user_authentication
-- Description: Adds user authentication tables
-- Created: 2025-01-07

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
```

### Running Migrations

Migrations should be run in sequential order. The GitHub Actions workflow `database-deploy.yml` will automatically run migrations when changes are pushed to the main branch.

For manual migration:
```bash
psql -U username -d dbname -f db/migrations/XXX_migration_name.sql
```

## Database Tables

### Core Tables

- **farm_plans**: Main farm planning data
- **climate_data**: Climate information for farm locations
- **crop_plans**: Individual crop planning within a farm
- **financial_data**: Financial projections and analysis
- **tasks**: Task management for farm operations
- **crop_templates**: Reusable crop templates
- **ai_recommendations**: AI-generated recommendations

### Views

- **farm_plan_summary**: Aggregated farm plan data with financials
- **active_tasks**: Currently active tasks across all farms

## Backup and Restore

### Backup Database
```bash
pg_dump farm_business_plan > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
psql farm_business_plan < backup_file.sql
```

## Connection from Application

Example connection using Node.js:

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

## Development vs Production

- **Development**: Use local PostgreSQL instance
- **Staging**: Use managed PostgreSQL (e.g., Heroku Postgres, AWS RDS)
- **Production**: Use managed PostgreSQL with automatic backups

## Notes

- All tables use UUID for primary keys
- Timestamps include timezone information
- Soft deletes are not implemented (use status fields instead)
- Foreign key constraints use CASCADE for related deletions
- All monetary values use DECIMAL type for precision
