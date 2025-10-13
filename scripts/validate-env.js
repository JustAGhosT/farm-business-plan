#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * This script validates that required environment variables are properly set
 * before building the application. It helps catch configuration issues early
 * in the CI/CD pipeline.
 *
 * Usage:
 *   node scripts/validate-env.js
 *
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation errors found
 */

const path = require('path')
const fs = require('fs')

// Load environment variables from .env files
// This allows the script to validate local development configurations
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath })
}
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
}

// Track validation errors
let hasErrors = false
let warnings = []

/**
 * Log error message
 */
function logError(message) {
  console.error(`${colors.red}❌ ERROR: ${message}${colors.reset}`)
  hasErrors = true
}

/**
 * Log warning message
 */
function logWarning(message) {
  console.warn(`${colors.yellow}⚠️  WARNING: ${message}${colors.reset}`)
  warnings.push(message)
}

/**
 * Log success message
 */
function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`)
}

/**
 * Log info message
 */
function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`)
}

/**
 * Check if a variable is properly set (not empty or placeholder)
 */
function isValidValue(value) {
  if (!value) return false
  if (value.trim() === '') return false

  // Check for common placeholder patterns
  const placeholders = [
    'your-',
    'dummy',
    'test_',
    'example',
    'placeholder',
    'changeme',
    'replace-this',
    'replace_me',
  ]

  const lowerValue = value.toLowerCase()
  return !placeholders.some((placeholder) => lowerValue.includes(placeholder))
}

/**
 * Check if running in CI environment
 */
function isCI() {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI ||
    process.env.TRAVIS ||
    process.env.JENKINS_HOME
  )
}

/**
 * Check if running in build phase
 */
function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

/**
 * Validate required environment variables
 */
function validateRequiredVars() {
  logInfo('Validating required environment variables...')

  // DATABASE_URL is required but can be dummy for build
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    if (isBuildPhase() || isCI()) {
      logWarning('DATABASE_URL not set (using build-time fallback)')
      console.warn(`${colors.yellow}  → Note: This is acceptable for CI/CD builds${colors.reset}`)
      console.warn(`${colors.yellow}  → Set DATABASE_URL as environment variable for runtime deployments${colors.reset}`)
      if (isCI()) {
        console.warn(`${colors.yellow}  → For GitHub Actions: Add to Settings → Secrets and variables → Actions${colors.reset}`)
        console.warn(`${colors.yellow}  → For Netlify: Add to Site settings → Environment variables or use Netlify DB${colors.reset}`)
      }
    } else {
      logError('DATABASE_URL is required for runtime')
      console.error(`${colors.red}  → How to fix:${colors.reset}`)
      console.error(`${colors.red}    1. Copy .env.example to .env.local if not already done${colors.reset}`)
      console.error(`${colors.red}    2. Set up a PostgreSQL database (local or cloud)${colors.reset}`)
      console.error(`${colors.red}    3. Set DATABASE_URL="postgresql://user:pass@host:5432/dbname" in .env.local${colors.reset}`)
      console.error(`${colors.red}    4. Example: "postgresql://postgres:password@localhost:5432/farm_business_plan"${colors.reset}`)
    }
  } else if (!isValidValue(dbUrl)) {
    if (isBuildPhase() || isCI()) {
      logInfo('DATABASE_URL appears to be a placeholder (OK for build)')
    } else {
      logWarning('DATABASE_URL appears to be a placeholder value')
      console.warn(`${colors.yellow}  → Replace with actual database connection string${colors.reset}`)
      console.warn(`${colors.yellow}  → Format: postgresql://username:password@host:port/database${colors.reset}`)
    }
  } else {
    logSuccess('DATABASE_URL is set')
  }

  // NEXTAUTH_SECRET is required but can be placeholder for build in CI
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  if (!nextAuthSecret) {
    logError('NEXTAUTH_SECRET is not set - NextAuth secret key for JWT signing')
    console.error(`${colors.red}  → How to fix:${colors.reset}`)
    if (isCI()) {
      console.error(`${colors.red}    • For GitHub Actions: Add to Settings → Secrets and variables → Actions → New repository secret${colors.reset}`)
      console.error(`${colors.red}    • For Netlify: Add to Site settings → Environment variables${colors.reset}`)
      console.error(`${colors.red}    • Generate with: openssl rand -base64 32${colors.reset}`)
      console.error(`${colors.red}    • Variable name: NEXTAUTH_SECRET${colors.reset}`)
    } else {
      console.error(`${colors.red}    1. Generate a secret: openssl rand -base64 32${colors.reset}`)
      console.error(`${colors.red}    2. Copy .env.example to .env.local${colors.reset}`)
      console.error(`${colors.red}    3. Replace the NEXTAUTH_SECRET placeholder with your generated secret${colors.reset}`)
      console.error(`${colors.red}    4. See docs/guides/QUICK_START_ENV_SETUP.md for details${colors.reset}`)
    }
  } else if (!isValidValue(nextAuthSecret)) {
    if (isBuildPhase() || isCI()) {
      logInfo('NEXTAUTH_SECRET appears to be a placeholder (OK for build)')
    } else {
      logError('NEXTAUTH_SECRET contains a placeholder value - NextAuth secret key for JWT signing')
      console.error(`${colors.red}  → How to fix:${colors.reset}`)
      console.error(`${colors.red}    1. Generate a real secret: openssl rand -base64 32${colors.reset}`)
      console.error(`${colors.red}    2. Replace the placeholder in .env.local with the generated value${colors.reset}`)
      console.error(`${colors.red}    3. See docs/guides/QUICK_START_ENV_SETUP.md for details${colors.reset}`)
    }
  } else {
    logSuccess('NEXTAUTH_SECRET is properly set')
  }

  // NEXTAUTH_URL is always required
  const nextAuthUrl = process.env.NEXTAUTH_URL
  if (!nextAuthUrl) {
    logError('NEXTAUTH_URL is not set - Application URL for NextAuth callbacks')
    console.error(`${colors.red}  → How to fix:${colors.reset}`)
    if (isCI()) {
      console.error(`${colors.red}    • For GitHub Actions: Add to Settings → Secrets and variables → Actions → New repository secret${colors.reset}`)
      console.error(`${colors.red}    • For Netlify: Add to Site settings → Environment variables${colors.reset}`)
      console.error(`${colors.red}    • Variable name: NEXTAUTH_URL${colors.reset}`)
      console.error(`${colors.red}    • Example for production: https://your-domain.netlify.app${colors.reset}`)
      console.error(`${colors.red}    • Example for preview: https://preview-branch--your-site.netlify.app${colors.reset}`)
    } else {
      console.error(`${colors.red}    1. Copy .env.example to .env.local if not already done${colors.reset}`)
      console.error(`${colors.red}    2. Set NEXTAUTH_URL="http://localhost:3000" in .env.local${colors.reset}`)
      console.error(`${colors.red}    3. For production, use your actual domain URL${colors.reset}`)
    }
  } else if (!isValidValue(nextAuthUrl)) {
    logError('NEXTAUTH_URL contains a placeholder value - Application URL for NextAuth callbacks')
    console.error(`${colors.red}  → How to fix:${colors.reset}`)
    console.error(`${colors.red}    • Replace placeholder with actual URL${colors.reset}`)
    console.error(`${colors.red}    • Local dev: http://localhost:3000${colors.reset}`)
    console.error(`${colors.red}    • Production: https://your-domain.netlify.app${colors.reset}`)
  } else {
    logSuccess('NEXTAUTH_URL is properly set')
  }
}

/**
 * Validate OAuth provider configuration
 */
function validateOAuthProviders() {
  logInfo('\nValidating OAuth provider configuration...')

  const providers = [
    {
      name: 'Google',
      enabledVar: 'NEXT_PUBLIC_GOOGLE_ENABLED',
      idVar: 'GOOGLE_ID',
      secretVar: 'GOOGLE_SECRET',
    },
    {
      name: 'GitHub',
      enabledVar: 'NEXT_PUBLIC_GITHUB_ENABLED',
      idVar: 'GITHUB_ID',
      secretVar: 'GITHUB_SECRET',
    },
  ]

  for (const provider of providers) {
    const enabled = process.env[provider.enabledVar] === 'true'
    const hasId = process.env[provider.idVar]
    const hasSecret = process.env[provider.secretVar]

    if (enabled) {
      logInfo(`${provider.name} OAuth is enabled`)

      if (!hasId || !isValidValue(hasId)) {
        logError(`${provider.name} OAuth is enabled but ${provider.idVar} is missing or invalid`)
        console.error(`${colors.red}  → How to fix:${colors.reset}`)
        if (provider.name === 'Google') {
          console.error(`${colors.red}    1. Go to https://console.cloud.google.com/${colors.reset}`)
          console.error(`${colors.red}    2. Create or select a project${colors.reset}`)
          console.error(`${colors.red}    3. Enable Google+ API${colors.reset}`)
          console.error(`${colors.red}    4. Create OAuth 2.0 credentials${colors.reset}`)
          console.error(`${colors.red}    5. Set ${provider.idVar} with your Client ID${colors.reset}`)
        } else if (provider.name === 'GitHub') {
          console.error(`${colors.red}    1. Go to https://github.com/settings/developers${colors.reset}`)
          console.error(`${colors.red}    2. Click "New OAuth App"${colors.reset}`)
          console.error(`${colors.red}    3. Fill in app details${colors.reset}`)
          console.error(`${colors.red}    4. Set ${provider.idVar} with your Client ID${colors.reset}`)
        }
        console.error(`${colors.red}    → Or disable OAuth: Set ${provider.enabledVar}="false"${colors.reset}`)
      } else {
        logSuccess(`${provider.idVar} is set`)
      }

      if (!hasSecret || !isValidValue(hasSecret)) {
        logError(
          `${provider.name} OAuth is enabled but ${provider.secretVar} is missing or invalid`
        )
        console.error(`${colors.red}  → How to fix:${colors.reset}`)
        console.error(`${colors.red}    • Get the Client Secret from the same ${provider.name} OAuth app${colors.reset}`)
        console.error(`${colors.red}    • Set ${provider.secretVar} with your Client Secret${colors.reset}`)
        console.error(`${colors.red}    → Or disable OAuth: Set ${provider.enabledVar}="false"${colors.reset}`)
      } else {
        logSuccess(`${provider.secretVar} is set`)
      }
    } else if (hasId || hasSecret) {
      logWarning(
        `${provider.name} OAuth credentials are set but ${provider.enabledVar} is not 'true'`
      )
      console.warn(`${colors.yellow}  → To enable: Set ${provider.enabledVar}="true" in your environment variables${colors.reset}`)
    }
  }
}

/**
 * Validate URL format
 */
function validateURLs() {
  logInfo('\nValidating URL formats...')

  const urlVars = ['NEXTAUTH_URL', 'NEXT_PUBLIC_API_URL', 'DATABASE_URL']

  for (const varName of urlVars) {
    const value = process.env[varName]

    if (!value) {
      if (varName === 'NEXT_PUBLIC_API_URL') {
        // Optional
        continue
      }
      // Already checked in required vars
      continue
    }

    // Skip placeholder check for DATABASE_URL in build
    if (varName === 'DATABASE_URL' && !isValidValue(value)) {
      continue
    }

    // Basic URL validation
    try {
      new URL(value)
      logSuccess(`${varName} is a valid URL`)
    } catch (error) {
      logError(`${varName} is not a valid URL: ${value}`)
    }
  }
}

/**
 * Check for .env.example file
 */
function checkEnvExample() {
  logInfo('\nChecking .env.example file...')

  const envExamplePath = path.join(process.cwd(), '.env.example')

  if (fs.existsSync(envExamplePath)) {
    logSuccess('.env.example file exists')

    // Read and suggest if .env.local doesn't exist
    const envLocalPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envLocalPath) && !isCI()) {
      logWarning(
        '.env.local not found. Copy .env.example to .env.local and configure your environment variables'
      )
    }
  } else {
    logWarning('.env.example file not found')
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60))

  if (hasErrors) {
    console.log(`${colors.red}❌ Environment validation FAILED${colors.reset}`)
    console.log(`\n${colors.red}Fix the errors above before building or deploying.${colors.reset}`)

    if (isCI()) {
      console.log('\n' + colors.blue + 'For CI/CD environments:' + colors.reset)
      console.log('  • GitHub Actions: Add secrets/variables via:')
      console.log('    Repository → Settings → Secrets and variables → Actions')
      console.log('    - Click "New repository secret" for each variable')
      console.log('    - Name: Variable name (e.g., NEXTAUTH_SECRET)')
      console.log('    - Value: Your generated value')
      console.log('')
      console.log('  • Netlify: Add environment variables via:')
      console.log('    Site settings → Environment variables → Add a variable')
      console.log('    - Or use Netlify DB for automatic DATABASE_URL')
      console.log('')
      console.log('  ' + colors.blue + 'Quick reference:' + colors.reset)
      console.log('    - Generate NEXTAUTH_SECRET: openssl rand -base64 32')
      console.log('    - See docs/guides/QUICK_START_ENV_SETUP.md for details')
    } else {
      console.log('\n' + colors.blue + 'Quick Start for Local Development:' + colors.reset)
      console.log('  1. Copy the example file:')
      console.log('     ' + colors.green + 'cp .env.example .env.local' + colors.reset)
      console.log('')
      console.log('  2. Generate NEXTAUTH_SECRET:')
      console.log('     ' + colors.green + 'openssl rand -base64 32' + colors.reset)
      console.log('')
      console.log('  3. Edit .env.local and set:')
      console.log('     - NEXTAUTH_SECRET: Paste the generated secret')
      console.log('     - NEXTAUTH_URL: http://localhost:3000')
      console.log('     - DATABASE_URL: Your PostgreSQL connection string')
      console.log('')
      console.log('  4. Verify configuration:')
      console.log('     ' + colors.green + 'npm run validate:env' + colors.reset)
      console.log('')
      console.log('  ' + colors.blue + 'See docs/guides/QUICK_START_ENV_SETUP.md for detailed setup' + colors.reset)
    }
  } else {
    console.log(`${colors.green}✅ Environment validation PASSED${colors.reset}`)

    if (warnings.length > 0) {
      console.log(`\n${colors.yellow}${warnings.length} warning(s) found:${colors.reset}`)
      console.log('These are non-critical but should be addressed.')
    }
  }

  console.log('='.repeat(60) + '\n')
}

/**
 * Main validation function
 */
function main() {
  console.log('\n🔍 Environment Variable Validation\n')
  console.log(`Environment: ${isCI() ? 'CI/CD' : 'Local Development'}`)
  console.log(`Build Phase: ${isBuildPhase() ? 'Yes' : 'No'}`)
  console.log('')

  // Run all validations
  validateRequiredVars()
  validateOAuthProviders()
  validateURLs()
  checkEnvExample()

  // Print summary and exit
  printSummary()

  if (hasErrors) {
    process.exit(1)
  }

  process.exit(0)
}

// Run if executed directly
if (require.main === module) {
  main()
}

module.exports = { isValidValue, isCI, isBuildPhase }
