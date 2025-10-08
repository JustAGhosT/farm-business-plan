# Quick Start Guide: Netlify Deployment with Database

This guide helps you quickly set up and deploy the Farm Business Plan application to Netlify with full database support.

## Prerequisites

- GitHub account
- Netlify account (free tier is sufficient)
- Node.js 18+ installed locally
- Git installed locally

## Step 1: Fork/Clone Repository

```bash
# Clone the repository
git clone https://github.com/JustAGhosT/farm-business-plan.git
cd farm-business-plan

# Install dependencies
npm install
```

## Step 2: Local Development Setup

### Option A: Without Database (Basic Setup)

```bash
# Run development server
npm run dev

# Open http://localhost:3000
# API routes /api/health and /api/crops will work
# /api/db-test will show connection error (expected without database)
```

### Option B: With Local Database

```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create database
createdb farm_business_plan

# Apply schema
psql farm_business_plan < db/schema.sql

# Create .env.local file
echo 'DATABASE_URL="postgresql://localhost:5432/farm_business_plan"' > .env.local

# Run development server
npm run dev

# Test database: http://localhost:3000/api/db-test
```

## Step 3: Deploy to Netlify

### Quick Deploy (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Netlify will auto-detect Next.js settings
   - Click "Deploy site"

3. **Optional: Unlink Continuous Deployment** (to use GitHub Actions):
   - Site Settings → Build & deploy → Stop builds
   - This allows GitHub Actions to control deployments

### Configure GitHub Actions Deployment

1. **Get Netlify credentials**:
   - **Auth Token**: Netlify Dashboard → User Settings → Applications → Personal access tokens → New access token
   - **Site ID**: Your Site → Site Settings → Site details → API ID

2. **Add GitHub secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions → New repository secret
   - Add:
     - Name: `NETLIFY_AUTH_TOKEN`, Value: [your token]
     - Name: `NETLIFY_SITE_ID`, Value: [your site ID]

3. **Deploy**:
   ```bash
   # Push to main branch triggers production deployment
   git push origin main
   
   # Push to develop branch triggers staging deployment
   git push origin develop
   ```

## Step 4: Set Up Database (Optional)

### Option A: Netlify DB (Recommended - Easiest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Initialize database
netlify db init

# Get database URL
netlify env:get DATABASE_URL

# Apply schema
export DATABASE_URL=$(netlify env:get DATABASE_URL)
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/migrations/001_initial_schema.sql

# Test: Visit https://your-site.netlify.app/api/db-test
```

### Option B: External PostgreSQL Provider

1. **Create PostgreSQL database** (Heroku, AWS RDS, DigitalOcean, etc.)

2. **Add to Netlify environment variables**:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add: `DATABASE_URL` = `postgresql://user:pass@host:5432/dbname`

3. **Apply schema**:
   ```bash
   psql your-database-url -f db/schema.sql
   psql your-database-url -f db/migrations/001_initial_schema.sql
   ```

4. **Test**: Visit `https://your-site.netlify.app/api/db-test`

## Step 5: Verify Deployment

### Check Application

- ✅ Visit your site URL
- ✅ Test API routes:
  - `https://your-site.netlify.app/api/health` (should return OK)
  - `https://your-site.netlify.app/api/crops` (should return crop data)
  - `https://your-site.netlify.app/api/db-test` (if database configured)

### Check Netlify Dashboard

- ✅ Build logs show successful deployment
- ✅ Functions are deployed (check Functions tab)
- ✅ Environment variables are set (if using database)

### Check GitHub Actions

- ✅ Workflow runs successfully
- ✅ Deployment completes without errors

## Troubleshooting

### Build Fails

```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

### API Routes Return 404

- Ensure Netlify Next.js Runtime is enabled (automatic with `@netlify/plugin-nextjs`)
- Check build logs for function deployment
- Verify `netlify.toml` is in repository root

### Database Connection Fails

```bash
# Test connection locally
psql $DATABASE_URL -c "SELECT version();"

# Check environment variables
netlify env:list

# Check API route logs
# Netlify Dashboard → Functions → [function name] → View logs
```

### GitHub Actions Fails

- Verify secrets are set: Settings → Secrets and variables → Actions
- Check workflow logs in Actions tab
- Ensure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are correct

## Next Steps

1. **Customize the application**: Edit files in `app/` directory
2. **Add new API routes**: Create files in `app/api/` directory
3. **Modify database schema**: Add migrations in `db/migrations/`
4. **Configure environment variables**: Update `.env.local` and Netlify settings
5. **Set up staging environment**: Push to `develop` branch

## Resources

- [Full Deployment Guide](DEPLOYMENT.md) - Comprehensive deployment documentation
- [Database Setup](db/README.md) - Detailed database configuration
- [Netlify Documentation](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify DB Documentation](https://docs.netlify.com/platform/database/)

## Support

- GitHub Issues: [https://github.com/JustAGhosT/farm-business-plan/issues](https://github.com/JustAGhosT/farm-business-plan/issues)
- Netlify Support: [https://www.netlify.com/support/](https://www.netlify.com/support/)

---

**Estimated Setup Time:**
- Basic deployment (no database): 10-15 minutes
- With Netlify DB: 20-30 minutes
- With external database: 30-45 minutes
