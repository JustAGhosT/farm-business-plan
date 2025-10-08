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
2. **Enable Next.js Runtime** (Important!):
   - Netlify automatically detects Next.js and uses the `@netlify/plugin-nextjs` plugin
   - This enables serverless functions, API routes, and incremental static regeneration (ISR)
   - The `netlify.toml` file configures this automatically
3. Add GitHub repository secrets:
   - `NETLIFY_DEPLOY_TOKEN`: Your Netlify personal access token
     - Found at: Netlify Dashboard → User Settings → Applications → Personal access tokens
     - Create new token with full access permissions
   - `NETLIFY_SITE_ID`: Your Netlify site ID (API ID)
     - Found at: Netlify Dashboard → Your Site → Site Settings → Site details → API ID
     - **Note**: Use the API ID, not the site name

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
- Additional API routes can be added in the `app/api/` directory

### Database Deployment

Automated database migrations and deployments.

**Workflow File:** `.github/workflows/database-deploy.yml`

**Triggers:**
- Push to `main` with database file changes
- Manual workflow dispatch (for controlled deployments)

**Setup Requirements:**
1. Set up PostgreSQL database (staging and production)
2. Add GitHub repository secrets:
   - `DATABASE_URL`: Staging database connection string
   - `DATABASE_URL_PRODUCTION`: Production database connection string

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

### Static Site Export

Build and deploy the static site manually:

```bash
# Build the application
npm run build

# The output will be in the 'out' directory
# Upload contents to any static hosting provider
```

### Netlify Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=out
```

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

### For Application

```bash
# .env.local (for local development)
DATABASE_URL=postgresql://username:password@localhost:5432/farm_business_plan
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### For GitHub Actions

Required secrets in repository settings:
- `NETLIFY_DEPLOY_TOKEN`
- `NETLIFY_SITE_ID`
- `DATABASE_URL`
- `DATABASE_URL_PRODUCTION`

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Linting passes with no errors
- [ ] Build completes successfully
- [ ] Database migrations tested in staging
- [ ] Environment variables configured
- [ ] Secrets added to GitHub repository
- [ ] Netlify site connected to repository
- [ ] Netlify Next.js Runtime enabled (automatic with `@netlify/plugin-nextjs`)
- [ ] API routes tested locally and in production
- [ ] Database backup created

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

| Issue | Quick Solution |
|-------|---------------|
| Build fails in GitHub Actions | ✅ Run `npm run build` locally to identify the issue |
| Deployment fails | ✅ Check Netlify CLI authentication and site ID |
| API routes return 404 | ✅ Ensure Netlify Next.js Runtime is enabled |
| Functions timeout | ✅ Check Netlify function logs and increase timeout if needed |

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
   
2. **Check Netlify CLI Authentication**:
   ```bash
   # Test your token locally
   export NETLIFY_AUTH_TOKEN="your-token-here"
   netlify sites:list
   
   # Test deployment
   netlify deploy --dir=. --message="Test deploy"
   ```

3. **Verify Next.js Runtime**:
   - Check that `netlify.toml` includes the `@netlify/plugin-nextjs` plugin
   - Netlify should automatically detect Next.js and enable the runtime
   - Review build logs to confirm Next.js Runtime is being used

4. **Team-Owned Sites**:
   - If your site is owned by a team, ensure your token is from a team member
   - The token must have permissions to deploy to team sites

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

## Support

For deployment issues:
1. Check workflow logs in GitHub Actions
2. Review Netlify deployment logs
3. Consult database README: `db/README.md`
4. Open an issue in the repository
