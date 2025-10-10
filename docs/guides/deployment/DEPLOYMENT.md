# Deployment Guide

This document describes the automated deployment workflows and manual deployment options for the Farm Business Plan application.

**🚀 Live Application:** [https://farmplan.netlify.app/](https://farmplan.netlify.app/)

## GitHub Actions Workflows

### Netlify Deployment

The application automatically deploys to Netlify as a **dynamic Next.js application** with API routes and serverless functions support.

**Workflow File:** `.github/workflows/netlify-deploy.yml`

**Triggers:**

- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Preview deployment with URL comment

**Setup Requirements:**

1. Create a Netlify account and site
2. **Unlink Continuous Deployment (Optional but Recommended):**
   - By default, Netlify automatically deploys on every push when linked to GitHub
   - To control deployments via GitHub Actions (e.g., only deploy after tests pass):
     - Go to Netlify Dashboard → Site Settings → Build & deploy
     - Under "Continuous Deployment", click "Stop builds"
     - This allows GitHub Actions to control when deployments happen
   - **Note**: Some UI features (like Node version selection) may not be available when the repo is unlinked
     - Use `.nvmrc` file or `NODE_VERSION` in `netlify.toml` to specify Node version
     - The current configuration uses `NODE_VERSION = "18"` in `netlify.toml`
3. **Enable Next.js Runtime** (Important!):
   - Netlify automatically detects Next.js and uses the `@netlify/plugin-nextjs` plugin
   - This enables serverless functions, API routes, and incremental static regeneration (ISR)
   - The `netlify.toml` file configures this automatically
4. Add GitHub repository secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token (also accepts `NETLIFY_DEPLOY_TOKEN` for backward compatibility)
     - Found at: Netlify Dashboard → User Settings → Applications → Personal access tokens
     - Create new token with full access permissions
   - `NETLIFY_SITE_ID`: Your Netlify site ID (API ID)
     - Found at: Netlify Dashboard → Your Site → Site Settings → Site details → API ID
     - **Note**: Use the API ID, not the site name
   - `DEPLOY_NETLIFY`: SSH deploy key for repository access (if using private repository)
     - Generate SSH key: `ssh-keygen -t ed25519 -C "netlify-deploy" -f ~/.ssh/deploy_netlify`
     - Add public key to: GitHub Repository → Settings → Deploy keys
     - Add private key to: GitHub Repository → Settings → Secrets and variables → Actions
     - **Name**: `DEPLOY_NETLIFY` (used by the workflow for checkout)

**Setting Up the Deploy Key (Deploy_Netlify):**

If you're experiencing deployment issues, particularly with private repositories, you may need to configure an SSH deploy key. The `DEPLOY_NETLIFY` secret contains the private key used by GitHub Actions to checkout your repository.

1. **Generate the SSH key pair**:

   ```bash
   ssh-keygen -t ed25519 -C "netlify-deploy" -f ~/.ssh/deploy_netlify
   # Press Enter to skip passphrase (required for CI/CD)
   ```

2. **Add the public key as a Deploy Key**:
   - Go to: GitHub Repository → Settings → Deploy keys → Add deploy key
   - Title: `Deploy_Netlify`
   - Key: Copy contents of `~/.ssh/deploy_netlify.pub`
   - ✅ Check "Allow write access" only if you need to push from CI (not needed for deploy)
   - Click "Add key"

3. **Add the private key as a Secret**:
   - Go to: GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
   - Name: `DEPLOY_NETLIFY`
   - Value: Copy the entire contents of `~/.ssh/deploy_netlify` (the private key)
   - Click "Add secret"

4. **Verify in the workflow**:
   - The workflow file uses this in the checkout step:
   ```yaml
   - name: Checkout code
     uses: actions/checkout@v4
     with:
       ssh-key: ${{ secrets.DEPLOY_NETLIFY }}
   ```

**When to Use Deploy Keys:**

- Private repositories that need custom checkout authentication
- When you want dedicated keys per repository for security
- When experiencing "Permission denied" or authentication errors during checkout
- As an alternative to using the default `GITHUB_TOKEN`

**Features:**

- Automatic dependency caching for faster builds
- Linting validation before deployment
- Build artifact uploads for debugging
- Serverless API routes support
- Next.js Runtime with ISR and SSR capabilities
- Deployment status comments on PRs

**Deployment URLs:**

- **Production**: [https://farmplan.netlify.app/](https://farmplan.netlify.app/)
- **Staging**: Automatically deployed from `develop` branch
- **Preview**: Unique URLs generated for each pull request

**API Routes:**
The application includes API routes that are deployed as serverless functions:

- `/api/health` - Health check endpoint
- `/api/crops` - Crop data API endpoint
- `/api/db-test` - Database connectivity test endpoint (requires database setup)
- Additional API routes can be added in the `app/api/` directory

### Database Deployment

The application supports database deployment with automated migrations using **Netlify DB** (powered by Neon PostgreSQL).

**Workflow File:** `.github/workflows/database-deploy.yml`

**Triggers:**

- Push to `main` with database file changes
- Manual workflow dispatch (for controlled deployments)

**Database Options:**

#### Option 1: Netlify DB (Recommended for Netlify Deployment)

Netlify DB provides a serverless PostgreSQL database powered by Neon, with automatic provisioning and environment variable setup.

**Setup Steps:**

1. **Enable Netlify DB for your site:**

   ```bash
   # Using Netlify CLI (requires Netlify account linked)
   npx netlify db init

   # This will:
   # - Create a Neon PostgreSQL database
   # - Set up connection pooling
   # - Automatically configure environment variables:
   #   - DATABASE_URL
   #   - DATABASE_URL_POOLER (for connection pooling)
   ```

2. **Install the Netlify Neon package** (already included):

   ```bash
   npm install @netlify/neon
   ```

   This package is included in dependencies and enables automatic database provisioning during build/deploy.

3. **Environment Variables** (automatically set by Netlify):
   - `DATABASE_URL`: Direct connection to Neon PostgreSQL
   - `DATABASE_URL_POOLER`: Pooled connection (recommended for serverless)

4. **Run migrations after database initialization:**
   ```bash
   # Connect to your database using the DATABASE_URL from Netlify
   # Apply schema and migrations
   psql $DATABASE_URL -f db/schema.sql
   psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
   ```

**Important Notes:**

- Database is automatically provisioned on first deploy after adding `@netlify/neon`
- Environment variables are injected automatically in serverless functions
- Use `DATABASE_URL_POOLER` in production for better performance
- Migrations should be run manually or via the database deployment workflow

#### Option 2: External PostgreSQL Database

You can also use an external PostgreSQL database (e.g., Heroku, AWS RDS, DigitalOcean).

**Setup Requirements:**

1. Set up PostgreSQL database (staging and production)
2. Add GitHub repository secrets:
   - `DATABASE_URL`: Staging database connection string
   - `DATABASE_URL_PRODUCTION`: Production database connection string
3. Add the same secrets to Netlify environment variables:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add `DATABASE_URL` with your production connection string

**Features:**

- Schema validation before migration
- Dry-run mode for testing
- Automatic backups before production deployments
- Database health checks after migration
- Optional seeding for staging environment

**Manual Trigger:**

```bash
# Via GitHub UI: Actions → Database Deployment → Run workflow
# Select environment: staging or production
```

## Manual Deployment

### Netlify Manual Deploy (Dynamic Next.js)

This application uses dynamic Next.js features (API routes, server-side rendering) and should be deployed to Netlify with the Next.js plugin:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the application
npm run build

# Deploy to Netlify (uses netlify.toml configuration)
netlify deploy --prod

# Or for preview deployment
netlify deploy
```

**Note:** The `@netlify/plugin-nextjs` automatically handles the `.next` directory and serverless functions. Do not use `--dir` flag as it may interfere with the plugin's operation.

### Static Site Export (Alternative - Limited Features)

If you want to deploy as a static site (no API routes, no SSR), you need to modify the configuration:

```bash
# 1. Update next.config.js to enable static export
# Add: output: 'export'

# 2. Build the application
npm run build

# 3. Deploy the 'out' directory
netlify deploy --prod --dir=out
```

**Warning:** Static export disables API routes and server-side features.

### Database Setup

```bash
# 1. Create database
createdb farm_business_plan

# 2. Apply schema
psql -U username -d farm_business_plan -f db/schema.sql

# 3. Run migrations (in order)
psql -U username -d farm_business_plan -f db/migrations/001_initial_schema.sql

# 4. Seed data (optional)
psql -U username -d farm_business_plan -f db/seeds/001_crop_templates.sql
```

## Environment Variables

### For Local Development

Create a `.env.local` file in the root directory (see `.env.example` for template):

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

### For Netlify Deployment

**Automatic Environment Variables (Netlify DB):**
When using Netlify DB, these are automatically set:

- `DATABASE_URL`: Direct connection to Neon PostgreSQL
- `DATABASE_URL_POOLER`: Pooled connection (recommended for serverless functions)

**Manual Environment Variables:**
Add these in Netlify Dashboard → Site Settings → Environment Variables:

- `DATABASE_URL`: Your database connection string (if not using Netlify DB)
- `NEXT_PUBLIC_API_URL`: Your production API URL (e.g., `https://farmplan.netlify.app`)

### For GitHub Actions

Required secrets in repository settings (Settings → Secrets and variables → Actions):

- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token (primary name used in workflow)
  - Alternative name: `NETLIFY_DEPLOY_TOKEN` (for backward compatibility)
- `NETLIFY_SITE_ID` - Your Netlify site API ID
- `DEPLOY_NETLIFY` - SSH deploy key (private key) for repository checkout (optional, for private repos)
- `DATABASE_URL` - Database connection string for staging (if using external database)
- `DATABASE_URL_PRODUCTION` - Database connection string for production (if using external database)

**Important Notes:**

- The workflow checks for `NETLIFY_AUTH_TOKEN` first
- Both `NETLIFY_AUTH_TOKEN` and `NETLIFY_DEPLOY_TOKEN` are accepted for backward compatibility
- When using Netlify DB, database environment variables are automatically injected
- API routes can access environment variables via `process.env.DATABASE_URL`

## Deployment Checklist

Before deploying to production:

### Pre-Deployment

- [ ] All tests pass locally (if tests exist)
- [ ] Linting passes with no errors (`npm run lint`)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] `.env.example` file is up to date

### GitHub Configuration

- [ ] Secrets added to GitHub repository (Settings → Secrets and variables → Actions)
  - [ ] `NETLIFY_AUTH_TOKEN` configured
  - [ ] `NETLIFY_SITE_ID` configured
  - [ ] `DEPLOY_NETLIFY` deploy key configured (if using private repo)
  - [ ] `DATABASE_URL` configured (if using external database)
  - [ ] `DATABASE_URL_PRODUCTION` configured (if using external database)
- [ ] Deploy key added to repository (Settings → Deploy keys) - if using private repo

### Netlify Configuration

- [ ] Netlify site created
- [ ] Netlify CLI installed locally (`npm install -g netlify-cli`)
- [ ] **Optional**: Continuous deployment unlinked (if using GitHub Actions for deployment control)
- [ ] Environment variables set in Netlify Dashboard (Site Settings → Environment Variables)
  - [ ] `DATABASE_URL` (if using external database)
  - [ ] `NEXT_PUBLIC_API_URL` (production API URL)
- [ ] Node version specified in `netlify.toml` or `.nvmrc`

### Database Setup (if using Netlify DB)

- [ ] Netlify DB initialized (`npx netlify db init`)
- [ ] `@netlify/neon` package installed (already in dependencies)
- [ ] Database schema applied (`psql $DATABASE_URL -f db/schema.sql`)
- [ ] Migrations run (`psql $DATABASE_URL -f db/migrations/*.sql`)
- [ ] Database connection tested

### Post-Deployment Verification

- [ ] Production site is accessible
- [ ] API routes are working (`/api/health`, `/api/crops`)
- [ ] Database connectivity verified (if using database)
- [ ] No console errors in browser
- [ ] Serverless functions deployed correctly
- [ ] Environment variables accessible in API routes
- [ ] Netlify Next.js Runtime enabled (automatic with `@netlify/plugin-nextjs`)
- [ ] API routes tested locally and in production
- [ ] Database backup created (if applicable)

## Rollback Procedures

### Application Rollback (Netlify)

1. Go to Netlify dashboard
2. Select your site
3. Navigate to "Deploys"
4. Find the previous working deployment
5. Click "Publish deploy"

### Database Rollback

1. Stop the application
2. Restore from backup:
   ```bash
   psql farm_business_plan < backup_file.sql
   ```
3. Restart the application

## Monitoring

### Application Monitoring

- **Netlify Dashboard**: Build logs, deployment status, analytics
- **GitHub Actions**: Workflow run history, artifacts

### Database Monitoring

- Check database health: Run queries on `farm_plan_summary` view
- Monitor connection pool usage
- Check slow query logs

## Troubleshooting

### Quick Fix: Common Issues

| Issue                                | Quick Solution                                                   |
| ------------------------------------ | ---------------------------------------------------------------- |
| Build fails in GitHub Actions        | ✅ Run `npm run build` locally to identify the issue             |
| Deployment fails                     | ✅ Check Netlify CLI authentication and site ID                  |
| API routes return 404                | ✅ Ensure Netlify Next.js Runtime is enabled                     |
| Functions timeout                    | ✅ Check Netlify function logs and increase timeout if needed    |
| CSS/JS files return MIME type errors | ✅ Ensure `@netlify/plugin-nextjs` is configured in netlify.toml |

### Build Failures

1. Check GitHub Actions logs
2. Verify all dependencies are in package.json
3. Ensure Node.js version matches (18.x)
4. Clear cache and rebuild

### Database Migration Failures

1. Check workflow logs for error messages
2. Verify database connection string
3. Test migration locally first
4. Ensure database user has required permissions
5. Check for conflicting schema changes

### Deployment Issues

1. **Verify Netlify Secrets**:
   - `NETLIFY_DEPLOY_TOKEN` - Your Netlify personal access token
   - `NETLIFY_SITE_ID` - Your Netlify site API ID
   - `DEPLOY_NETLIFY` - SSH deploy key (if using private repository)
2. **Check Deploy Key Configuration** (for private repositories):

   ```bash
   # Verify the deploy key is properly configured
   # The public key should be added to: Repository → Settings → Deploy keys
   # The private key should be in: Repository → Settings → Secrets → DEPLOY_NETLIFY

   # Test SSH access (locally)
   ssh -T git@github.com -i ~/.ssh/deploy_netlify
   ```

3. **Check Netlify CLI Authentication**:

   ```bash
   # Test your token locally
   export NETLIFY_AUTH_TOKEN="your-token-here"
   netlify sites:list

   # Test deployment (the CLI will use netlify.toml configuration)
   netlify deploy --message="Test deploy"
   ```

4. **Verify Next.js Runtime**:
   - Check that `netlify.toml` includes the `@netlify/plugin-nextjs` plugin
   - Netlify should automatically detect Next.js and enable the runtime
   - Review build logs to confirm Next.js Runtime is being used

5. **Team-Owned Sites**:
   - If your site is owned by a team, ensure your token is from a team member
   - The token must have permissions to deploy to team sites

6. **Deploy Key Permissions**:
   - Ensure the deploy key has read access to the repository
   - Check that "Allow write access" is NOT enabled (read-only is sufficient)
   - Verify the key hasn't expired or been revoked

### Static Asset MIME Type Issues

If you see errors like "Refused to apply style because its MIME type ('text/html') is not a supported stylesheet MIME type":

**Root Cause**: This occurs when CSS/JS files are returning HTML (typically 404 pages) instead of the actual files. Common with incorrect Netlify configuration.

**Solution**:

1. **Configure netlify.toml correctly**:

   ```toml
   [build]
     command = "npm run build"
     # Do NOT set publish directory - let the plugin handle it

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

   **Important**: When using `@netlify/plugin-nextjs`, do NOT specify a `publish` directory in netlify.toml. The plugin automatically handles the `.next` directory and static asset routing. Setting `publish = "."` or `publish = ".next"` can cause the error: "Your publish directory cannot be the same as the base directory of your site."

2. **Add explicit headers** (already configured in netlify.toml):

   ```toml
   [[headers]]
     for = "/_next/static/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"

   [[headers]]
     for = "/*.css"
     [headers.values]
       Content-Type = "text/css; charset=utf-8"
   ```

3. **Clear Netlify cache and redeploy**:

   ```bash
   # Via Netlify CLI
   netlify deploy --prod --build

   # Or via Netlify Dashboard
   # Site Settings → Build & deploy → Clear cache and deploy site
   ```

4. **Verify the fix**:
   - Check browser DevTools → Network tab
   - CSS files should return status 200 with Content-Type: text/css
   - Look for `/_next/static/css/*.css` files loading correctly

### API Route Issues

If API routes are not working after deployment:

1. **Verify API Routes Exist**:
   - Check that your API routes are in the `app/api/` directory
   - Each route should have a `route.ts` or `route.js` file

2. **Check Netlify Functions**:
   - Netlify converts Next.js API routes to serverless functions automatically
   - View function logs in Netlify Dashboard → Functions
   - Check for errors or timeouts in the function logs

3. **Test API Routes Locally**:

   ```bash
   npm run dev
   # Test: http://localhost:3000/api/health
   # Test: http://localhost:3000/api/crops
   ```

4. **Production Testing**:

   ```bash
   # Test production API endpoints
   curl https://your-site.netlify.app/api/health
   curl https://your-site.netlify.app/api/crops
   ```

5. **Check Netlify Next.js Runtime**:
   - Ensure `@netlify/plugin-nextjs` is listed in `netlify.toml`
   - Verify the plugin is active in Netlify Dashboard → Plugins

### Database Issues

**Problem: Database connection fails in serverless functions**

Solution:

1. Verify `DATABASE_URL` is set in Netlify environment variables
2. Use `DATABASE_URL_POOLER` for connection pooling in serverless context
3. Check connection string format:
   ```bash
   postgresql://username:password@host:5432/database_name
   ```

**Problem: Netlify DB not provisioning automatically**

Solution:

1. Ensure `@netlify/neon` is in `package.json` dependencies
2. Run `npx netlify db init` manually to provision the database
3. Check Netlify Dashboard → Integrations for Neon integration status
4. Verify you have the necessary permissions in your Netlify account

**Problem: Database migrations not running**

Solution:

1. Manually run migrations using the DATABASE_URL from Netlify:
   ```bash
   # Get the DATABASE_URL from Netlify Dashboard → Environment Variables
   export DATABASE_URL="postgresql://..."
   psql $DATABASE_URL -f db/schema.sql
   psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
   ```
2. Set up the database deployment workflow in GitHub Actions
3. Use Netlify CLI to run migrations:
   ```bash
   netlify env:get DATABASE_URL
   psql "$(netlify env:get DATABASE_URL)" -f db/schema.sql
   ```

**Problem: Connection pool exhausted**

Solution:

1. Use `DATABASE_URL_POOLER` instead of `DATABASE_URL` in API routes
2. Close database connections properly after each request
3. Implement connection pooling in your application code
4. Consider upgrading your Neon plan for more connections

**Problem: Cannot connect to database from local development**

Solution:

1. Ensure PostgreSQL is running locally
2. Verify `.env.local` has correct `DATABASE_URL`
3. Check if local database exists: `psql -l | grep farm_business_plan`
4. Create database if needed: `createdb farm_business_plan`
5. Apply schema: `psql farm_business_plan < db/schema.sql`

**Testing Database Connectivity:**

```bash
# Test connection with psql
psql $DATABASE_URL -c "SELECT version();"

# Test connection from Netlify CLI
netlify env:get DATABASE_URL
psql "$(netlify env:get DATABASE_URL)" -c "SELECT version();"

# Test from Node.js script
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()').then(res => console.log(res.rows[0])).catch(err => console.error(err));"
```

## Support

For deployment issues:

1. Check workflow logs in GitHub Actions
2. Review Netlify deployment logs
3. Consult database README: `db/README.md`
4. Open an issue in the repository
