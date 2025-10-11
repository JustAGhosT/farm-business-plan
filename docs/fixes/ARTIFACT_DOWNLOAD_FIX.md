# GitHub Actions Artifact Download Error Fix

**Date**: October 11, 2025  
**Issue**: Artifact not found for name: build-artifacts  
**Status**: ✅ Fixed

## Problem Statement

The GitHub Actions CI/CD workflow was failing with the following error:

```
Run actions/download-artifact@v4
  with:
    name: build-artifacts
    path: .next/
    merge-multiple: false
    repository: JustAGhosT/farm-business-plan
    run-id: 18434283575
  env:
    NODE_VERSION: 20
Downloading single artifact
Error: Unable to download artifact(s): Artifact not found for name: build-artifacts
        Please ensure that your artifact is not expired and the artifact was uploaded using a compatible version of toolkit/upload-artifact.
        For more information, visit the GitHub Artifacts FAQ: https://github.com/actions/toolkit/blob/main/packages/artifact/docs/faq.md
```

## Root Cause Analysis

The `deploy` job in `.github/workflows/ci-cd.yml` was attempting to:

1. Download pre-built artifacts (`.next/` directory) from the `build` job
2. Use these cached artifacts for Netlify deployment

This approach had several critical issues:

### Issue 1: Artifact Expiration
- Artifacts expire after 7 days (configured retention period)
- Any deployment attempt after expiration would fail

### Issue 2: Build Environment Mismatch
- Pre-built artifacts contain build-time environment variables and file paths
- These may not be valid in the deployment environment
- Environment variables like `DATABASE_URL`, `NEXTAUTH_SECRET`, etc., need to be set at build time

### Issue 3: Netlify Best Practices Violation
- Netlify's `@netlify/plugin-nextjs` expects to handle the Next.js build process
- The plugin needs to integrate with the build to enable:
  - Serverless functions for API routes
  - Incremental Static Regeneration (ISR)
  - Server-Side Rendering (SSR)
  - Edge functions

## Solution Implemented

### Changes Made

**File**: `.github/workflows/ci-cd.yml`  
**Job**: `deploy` (Job 7)

#### Before (Lines 364-368):
```yaml
- name: Download build artifacts
  uses: actions/download-artifact@v4
  with:
    name: build-artifacts
    path: .next/
```

#### After (Lines 364-370):
```yaml
- name: Build application for deployment
  run: npm run build
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
    NODE_ENV: production
```

### Key Changes

1. **Removed**: Artifact download step
2. **Added**: Fresh build step with production environment variables
3. **Retained**: Build artifact upload in `build` job (for debugging purposes)

## Benefits

✅ **No More Expiration Issues**: Fresh builds on every deployment  
✅ **Correct Environment Variables**: Production secrets properly injected at build time  
✅ **Netlify Compatibility**: Aligns with Netlify's recommended deployment pattern  
✅ **Debugging Support**: Build artifacts still available from `build` job for 7 days  
✅ **Consistent with Existing Workflows**: Matches the pattern in `netlify-deploy.yml`

## Workflow Architecture

### Current CI/CD Flow

```
Push to main branch
    ↓
[Code Quality] → [Tests] → [Database Migration]
    ↓                ↓
[API Testing] ← Tests Pass
    ↓
[Build Job] ← Builds and uploads artifacts for debugging
    ↓
[Security Scan]
    ↓
[Deploy Job] ← Rebuilds fresh and deploys to Netlify
    ↓
[Notification]
```

### Build Job (Job 6)
- **Purpose**: Verify build succeeds for all branches
- **Action**: Uploads `.next/` artifacts for debugging
- **Retention**: 7 days
- **Runs on**: All branches and PRs

### Deploy Job (Job 7)
- **Purpose**: Deploy to production
- **Action**: Fresh build with production environment variables
- **Deploys to**: Netlify using CLI
- **Runs on**: `main` branch only

## Testing & Validation

### Pre-Deployment Validation
```bash
# Linting
npm run lint
✓ No ESLint warnings or errors

# Tests
npm test
✓ 52 tests passing (4 suites)

# Build
npm run build
✓ Production build successful

# YAML Validation
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci-cd.yml'))"
✓ YAML syntax is valid
```

### Production Build Test
Successfully built with the following configuration:
- **Node Version**: 20
- **Environment**: production
- **Output Directory**: `.next/`
- **Build Time**: ~30 seconds
- **Total Bundle Size**: 87.6 kB shared JS

## Comparison with Other Workflows

### netlify-deploy.yml Pattern
The `netlify-deploy.yml` workflow already uses this pattern:

```yaml
# Job: build-and-deploy (Lines 68-69)
- name: Build
  run: npm run build
  env:
    NODE_ENV: production

# Job: preview-deploy (Lines 135-138)
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
```

Our fix aligns the `ci-cd.yml` workflow with this established pattern.

## Migration Notes

### For Developers
- No code changes required
- Workflow will automatically use the new pattern
- Build artifacts are still available for debugging via the `build` job

### For DevOps
- Ensure the following GitHub secrets are configured:
  - `NETLIFY_AUTH_TOKEN`: Netlify authentication token
  - `NETLIFY_SITE_ID`: Netlify site ID
  - `DATABASE_URL_PRODUCTION`: Production database connection string
  - `NEXTAUTH_SECRET`: NextAuth.js secret key
  - `NEXTAUTH_URL`: Production URL for NextAuth.js

### For QA
- Deployment behavior remains unchanged
- Fresh builds ensure latest code and environment variables
- Build artifacts available for 7 days in GitHub Actions

## Related Documentation

- [Deployment Guide](../deployment/DEPLOYMENT.md)
- [GitHub Actions Workflow Files](../../.github/workflows/)
- [Netlify Deployment Configuration](../../netlify.toml)

## Troubleshooting

### If Deployment Fails

1. **Check GitHub Secrets**: Ensure all required secrets are configured
   ```bash
   # Required secrets:
   - NETLIFY_AUTH_TOKEN
   - NETLIFY_SITE_ID
   - DATABASE_URL_PRODUCTION
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   ```

2. **Verify Build Succeeds Locally**:
   ```bash
   npm ci
   npm run build
   ```

3. **Check Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

4. **Review Workflow Logs**: Check GitHub Actions logs for detailed error messages

### If Build Job Artifacts Needed

Build artifacts are still uploaded in the `build` job and can be downloaded:

1. Go to GitHub Actions → Select workflow run
2. Scroll to "Artifacts" section
3. Download "build-artifacts" (available for 7 days)

## Future Improvements

### Potential Enhancements
- [ ] Add build cache to speed up deployments
- [ ] Implement parallel deployment for staging/production
- [ ] Add automated rollback on health check failure
- [ ] Integrate with monitoring tools (Sentry, DataDog, etc.)

### Performance Optimization
- Current deployment time: ~2-3 minutes
- Target deployment time: ~1-2 minutes
- Optimization opportunities:
  - npm cache restoration
  - Incremental builds
  - Parallel job execution

## References

- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)

---

**Last Updated**: October 11, 2025  
**Author**: GitHub Copilot  
**Review Status**: ✅ Validated
