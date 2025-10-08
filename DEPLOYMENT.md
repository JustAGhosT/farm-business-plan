# Deployment Guide

This document describes the automated deployment workflows and manual deployment options for the Farm Business Plan application.

**🚀 Live Application:** [https://farmplan.netlify.app/](https://farmplan.netlify.app/)

## GitHub Actions Workflows

### Netlify Deployment

The application automatically deploys to Netlify when changes are pushed to the repository.

**Workflow File:** `.github/workflows/netlify-deploy.yml`

**Triggers:**
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Preview deployment with URL comment

**Setup Requirements:**
1. Create a Netlify account and site
2. Add GitHub repository secrets:
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
- PR preview comments with deployment URL

**Deployment URLs:**
- **Production**: [https://farmplan.netlify.app/](https://farmplan.netlify.app/)
- **Staging**: Automatically deployed from `develop` branch
- **Preview**: Unique URLs generated for each pull request

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

1. Verify Netlify secrets are set correctly
2. Check build command in netlify.toml
3. Ensure static export is enabled in next.config.js
4. Review Netlify deploy logs

#### "Error: Not Found" from Netlify Action

This error typically indicates an issue with Netlify credentials or site configuration:

1. **Verify NETLIFY_SITE_ID**: 
   - Go to Netlify Dashboard → Your Site → Site Settings → Site details
   - Copy the "API ID" (not the site name)
   - Add/update it in GitHub repository secrets as `NETLIFY_SITE_ID`

2. **Verify NETLIFY_DEPLOY_TOKEN**:
   - Go to Netlify Dashboard → User Settings → Applications → Personal access tokens
   - Generate a new token if needed
   - Add/update it in GitHub repository secrets as `NETLIFY_DEPLOY_TOKEN`
   - Ensure the token has full access permissions

3. **Check Site Exists**:
   - Confirm the Netlify site hasn't been deleted
   - Verify you have access to the site with your token

4. **Test Locally**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Link to your site (uses NETLIFY_SITE_ID)
   netlify link --id YOUR_SITE_ID
   
   # Test deployment
   netlify deploy --dir=out
   ```

## Support

For deployment issues:
1. Check workflow logs in GitHub Actions
2. Review Netlify deployment logs
3. Consult database README: `db/README.md`
4. Open an issue in the repository
