# Environment Variable Validation

This directory contains scripts for validating environment variables before building or deploying the application.

## Purpose

The validation script helps catch configuration errors early by:

- Checking that required environment variables are set
- Validating OAuth provider configuration
- Verifying URL formats
- Detecting placeholder/dummy values

## Scripts

### `validate-env.js`

Main validation script that checks all environment variables.

**Usage:**

```bash
# Run validation
npm run validate:env

# Or directly
node scripts/validate-env.js
```

**Exit Codes:**

- `0` - All validations passed
- `1` - Validation errors found

**Environment Variables Checked:**

**Required:**

- `NEXTAUTH_SECRET` - NextAuth JWT secret
  - **Local Development**: Must be a real value (not a placeholder)
  - **CI/CD Builds**: Placeholder values allowed (shows INFO message)
  - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Application URL (always required, no placeholders allowed)
- `DATABASE_URL` - Database connection string
  - **Local Development**: Must be a real value
  - **CI/CD Builds**: Placeholder values allowed (shows INFO message)

**Optional OAuth:**

- `GOOGLE_ID` / `GOOGLE_SECRET` - Google OAuth credentials
- `GITHUB_ID` / `GITHUB_SECRET` - GitHub OAuth credentials
- `NEXT_PUBLIC_GOOGLE_ENABLED` - Enable Google OAuth in UI
- `NEXT_PUBLIC_GITHUB_ENABLED` - Enable GitHub OAuth in UI

## Environment-Specific Behavior

The validation script adapts its strictness based on the environment:

### CI/CD Environments (GitHub Actions, Netlify, etc.)

Detected when:

- `CI` environment variable is set
- `GITHUB_ACTIONS` is set
- Other CI flags (GitLab CI, CircleCI, Travis, Jenkins)

**Behavior:**

- `NEXTAUTH_SECRET` with placeholder → ℹ INFO message (build continues)
- `DATABASE_URL` with placeholder → ℹ INFO message (build continues)
- Allows PR builds to succeed without real secrets configured

### Local Development

Detected when CI flags are not set.

**Behavior:**

- `NEXTAUTH_SECRET` with placeholder → ❌ ERROR (build fails)
- `DATABASE_URL` with placeholder → ⚠️ WARNING (build continues)
- Enforces real secrets for local development

### Placeholder Detection

The following patterns are considered placeholders:

- `your-` (e.g., "your-secret-key-here")
- `dummy` (e.g., "dummy-value")
- `test_` (e.g., "test_password")
- `example` (e.g., "example-url")
- `placeholder`
- `changeme`
- `replace-this`

## Integration with Build

The validation is automatically run before every build:

```bash
# Standard build (with validation)
npm run build

# Skip validation (not recommended)
npm run build:skip-validation
```

## CI/CD Integration

The validation script is integrated into the CI/CD pipeline:

1. **GitHub Actions** - Runs as the first job (`env-validation`)
2. **Netlify Deploy** - Runs before build in deploy workflow
3. **Manual Builds** - Automatically runs via `npm run build`

### GitHub Actions Workflow

```yaml
- name: Validate environment variables
  run: npm run validate:env
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
    # ... other variables
```

## Common Scenarios

### Local Development

```bash
# 1. Copy example to local config
cp .env.example .env.local

# 2. Edit .env.local with your values
# 3. Run validation
npm run validate:env

# 4. If validation passes, build
npm run build
```

### CI/CD Setup

**GitHub Actions:**

1. Go to Settings → Secrets and variables → Actions
2. Add required secrets:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `DATABASE_URL` (if needed)
3. Add optional OAuth secrets if using:
   - `GOOGLE_ID`, `GOOGLE_SECRET`
   - `GITHUB_ID`, `GITHUB_SECRET`

**Netlify:**

1. Go to Site settings → Environment variables
2. Add the same variables as above
3. Environment variables are automatically available during build

## Where Environment Variables Come From

### In GitHub Actions / PR Builds

Environment variables are pulled from **multiple sources** in order of precedence:

1. **GitHub Secrets** (Settings → Secrets and variables → Actions)
   - Example: `${{ secrets.NEXTAUTH_SECRET }}`
   - Only available if explicitly configured

2. **Workflow Defaults** (specified in `.github/workflows/*.yml`)
   - Example: `NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET || 'build-time-secret-only' }}`
   - Uses the secret if available, otherwise uses fallback value
   - Fallback values may be placeholders suitable for build-time only

3. **Environment-Specific Overrides**
   - Different workflows may use different defaults
   - PR builds vs. production deployments may have different requirements

**Common pattern in workflows:**

```yaml
env:
  # If secret is not set, use a build-time fallback
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET || 'build-time-secret-only' }}
  DATABASE_URL: ${{ secrets.DATABASE_URL || 'postgresql://build:build@localhost:5432/build' }}
```

**Why the validation now allows placeholders in CI:**

- PR builds don't need real secrets to verify the code compiles
- The validation checks if you're in CI/CD and shows INFO instead of ERROR for placeholders
- This prevents PR build failures when secrets aren't configured
- Real validation still happens for local development

### In Netlify Builds

1. **Netlify Environment Variables** (Site settings → Environment variables)
2. **Netlify-provided variables** (e.g., `DATABASE_URL` for Netlify DB)
3. **Branch-specific overrides** (can be configured per deployment context)

## Error Messages

### Missing Required Variable

```
❌ ERROR: NEXTAUTH_SECRET is not set - NextAuth secret key for JWT signing
```

**Fix:** Set the environment variable in your `.env.local` or CI/CD platform.

### Placeholder Value (in Local Development)

```
❌ ERROR: NEXTAUTH_SECRET contains a placeholder value - NextAuth secret key for JWT signing
```

**Fix:** Generate a real secret with `openssl rand -base64 32` and set it in `.env.local`.

### Placeholder Value (in CI/CD Build)

```
ℹ NEXTAUTH_SECRET appears to be a placeholder (OK for build)
```

**This is informational only** - the build will continue. The validation system allows placeholders in CI/CD builds since they're often just compilation checks.

### OAuth Configuration Mismatch

```
❌ ERROR: Google OAuth is enabled but GOOGLE_SECRET is missing or invalid
```

**Fix:** Either disable OAuth (`NEXT_PUBLIC_GOOGLE_ENABLED=false`) or provide valid credentials.

### Invalid URL Format

```
❌ ERROR: NEXTAUTH_URL is not a valid URL: not-a-url
```

**Fix:** Provide a valid URL format (e.g., `http://localhost:3000`).

## Bypassing Validation

⚠️ **Not recommended for production**

If you need to bypass validation temporarily:

```bash
# Skip validation for one build
npm run build:skip-validation

# Or set environment variable
SKIP_ENV_VALIDATION=true npm run build
```

## Testing

Run the validation script tests:

```bash
npm test -- __tests__/scripts/validate-env.test.js
```

## Troubleshooting

### Validation Fails in CI but Works Locally

**Cause:** Environment variables are not set in CI/CD platform.

**Solution:**

1. Check that secrets are added in GitHub Actions or Netlify
2. Verify secret names match exactly (case-sensitive)
3. Check that secrets have non-empty values

### Build Works but Validation Fails

**Cause:** Validation is stricter than the build process.

**Solution:**

- This is intentional to catch potential runtime issues
- Fix the validation errors rather than skipping validation
- If you believe the validation is too strict, review the validation rules

### OAuth Providers Not Working

**Cause:** Credentials not set or placeholder values used.

**Solution:**

1. Verify OAuth app credentials in provider dashboard (Google/GitHub)
2. Ensure callback URLs are correct
3. Set `NEXT_PUBLIC_<PROVIDER>_ENABLED=true` to enable
4. Provide valid `<PROVIDER>_ID` and `<PROVIDER>_SECRET`

## Contributing

When adding new required environment variables:

1. Update `.env.example` with the new variable
2. Add validation logic to `validate-env.js`
3. Update this README
4. Update CI/CD workflow files
5. Add tests for the new validation

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
