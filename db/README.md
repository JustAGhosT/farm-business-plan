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

### PostgreSQL Setup

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

Set these environment variables for database connection:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"
DATABASE_URL_PRODUCTION="postgresql://username:password@host:5432/farm_business_plan_prod"
```

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
