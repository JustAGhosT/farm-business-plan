# Fixing "TypeError: Invalid URL" During Build

## Problem

During the Next.js build process, you might encounter this error:

```
Error occurred prerendering page "/tools/calculators/investment". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Invalid URL
    at new URL (node:internal/url:806:29)
```

## Root Cause

This error typically occurs when:

1. **OAuth providers are enabled** with empty or placeholder credentials
2. The OAuth provider constructors (GitHub/Google) try to create URL objects with invalid values
3. During static page generation (prerendering), these providers are initialized

## Solution

We've implemented an **environment variable validation system** that catches these issues early.

### Important: NEXTAUTH_SECRET in CI/CD

The validation system treats `NEXTAUTH_SECRET` differently based on your environment:

- **CI/CD Builds (GitHub Actions, Netlify, etc.)**: Placeholder values are allowed with an INFO message. This enables PR builds to succeed even without real secrets configured.
- **Local Development**: Placeholder values are rejected with an ERROR message. This ensures you use real secrets when developing locally.

**Example placeholder patterns that are detected:**

- `your-secret-key-here`
- `dummy-value`
- `test_password`
- `example-url`
- `placeholder`
- `changeme`

**To generate a proper NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### Automatic Prevention

The build process now includes validation that runs **before** the build starts:

```bash
npm run build  # Automatically runs validation first
```

This will catch missing or invalid environment variables before they cause build errors.

### Manual Fix

If you encounter this error:

#### Option 1: Disable OAuth Providers (Recommended for Development)

**Local Development (`.env.local`):**

```env
NEXT_PUBLIC_GOOGLE_ENABLED="false"
NEXT_PUBLIC_GITHUB_ENABLED="false"
```

**CI/CD (GitHub Actions/Netlify):**
Set these environment variables in your CI/CD platform:

```env
NEXT_PUBLIC_GOOGLE_ENABLED=false
NEXT_PUBLIC_GITHUB_ENABLED=false
```

#### Option 2: Provide Valid OAuth Credentials

**For Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Set environment variables:
   ```env
   GOOGLE_ID="your-actual-client-id"
   GOOGLE_SECRET="your-actual-client-secret"
   NEXT_PUBLIC_GOOGLE_ENABLED="true"
   ```

**For GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set environment variables:
   ```env
   GITHUB_ID="your-actual-client-id"
   GITHUB_SECRET="your-actual-client-secret"
   NEXT_PUBLIC_GITHUB_ENABLED="true"
   ```

### Validation Check

Run the validation manually to check your configuration:

```bash
npm run validate:env
```

This will tell you exactly what's wrong with your environment variables.

## CI/CD Configuration

### GitHub Actions

The validation now runs as the first job in the CI pipeline. If it fails, the build won't even start, saving time and resources.

**Required Secrets:**

- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your application URL

**Optional OAuth Secrets:**

- `GOOGLE_ID` and `GOOGLE_SECRET`
- `GITHUB_ID` and `GITHUB_SECRET`

**To add secrets:**

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each required secret

### Netlify

**To add environment variables:**

1. Go to your site in Netlify
2. Site settings → Environment variables
3. Click "Add a variable"
4. Add each required variable

Netlify automatically provides `DATABASE_URL` if you're using Netlify DB.

## Prevention in .env.example

The `.env.example` file has been updated to comment out OAuth providers by default:

```env
# OAuth Providers (Optional)
# To enable OAuth providers:
#   1. Create OAuth app in provider's developer console
#   2. Set the ID and SECRET environment variables
#   3. Set NEXT_PUBLIC_<PROVIDER>_ENABLED="true"

# Google OAuth - Create app at https://console.cloud.google.com/
# GOOGLE_ID="your-google-client-id"
# GOOGLE_SECRET="your-google-client-secret"
# NEXT_PUBLIC_GOOGLE_ENABLED="true"
```

## Quick Fix Commands

```bash
# For local development - create .env.local
cp .env.example .env.local

# Edit .env.local and set:
# 1. Disable OAuth if not needed
echo 'NEXT_PUBLIC_GOOGLE_ENABLED="false"' >> .env.local
echo 'NEXT_PUBLIC_GITHUB_ENABLED="false"' >> .env.local

# 2. Set required variables
echo 'NEXTAUTH_SECRET="'$(openssl rand -base64 32)'"' >> .env.local
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env.local
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/farm_business_plan"' >> .env.local

# Validate your configuration
npm run validate:env

# Build
npm run build
```

## Related Files

- `scripts/validate-env.js` - Validation script
- `scripts/README.md` - Detailed documentation
- `.github/workflows/ci-cd.yml` - CI pipeline with validation
- `.github/workflows/netlify-deploy.yml` - Deployment pipeline with validation

## Additional Resources

- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [GitHub OAuth Setup](https://github.com/settings/developers)

## Still Having Issues?

Run the validation script to get detailed error messages:

```bash
npm run validate:env
```

The script will tell you:

- ✅ What's configured correctly
- ❌ What needs to be fixed
- ⚠️ What might cause issues

Then follow the error messages to fix your configuration.
