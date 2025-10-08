# Quick Fix Guide: Netlify "Error: Not Found" Issue

## 🎯 Problem
You're seeing this error in GitHub Actions when deploying to Netlify:
```
Run nwtgck/actions-netlify@v3.0
Error: Not Found
```

## ✅ Solution
The issue is that your Netlify publish directory is set incorrectly. Follow these steps:

### Step 1: Log into Netlify
1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Log in with your account
3. Select your **farm-business-plan** site

### Step 2: Navigate to Build Settings
1. Click on **"Site settings"** (in the top navigation)
2. Click on **"Build & deploy"** (in the left sidebar)
3. Scroll down to **"Build settings"** section

### Step 3: Fix the Publish Directory
Look for these fields and verify/update them:

| Setting | Current (Wrong) | Should Be (Correct) |
|---------|----------------|---------------------|
| **Build command** | `npm run build` | `npm run build` ✅ (already correct) |
| **Publish directory** | `.next` ❌ | `out` ✅ (CHANGE THIS!) |
| **Base directory** | (empty) | (leave empty) ✅ |

**Critical Change**: Change **Publish directory** from `.next` to `out`

### Step 4: Save Changes
1. Click the **"Save"** button at the bottom of the Build settings section
2. Wait for the confirmation message

### Step 5: Trigger New Deployment
Choose one of these options:
- **Option A**: Push a new commit to your repository
- **Option B**: Go to "Deploys" → "Trigger deploy" → "Deploy site"
- **Option C**: Re-run the failed GitHub Actions workflow

### Step 6: Verify Success
1. Check the GitHub Actions workflow - it should now complete successfully
2. Visit your site at `https://farmplan.netlify.app/` to confirm it's working

---

## 📚 Why This Fixes It

### Understanding Next.js Output Directories

When you run `npm run build` with Next.js configured for static export (`output: 'export'`), it creates **two directories**:

1. **`out/`** directory:
   - Contains the complete static website
   - Has `index.html`, `404.html`, and all your pages
   - This is what should be deployed
   - ✅ **This is the correct directory for deployment**

2. **`.next/`** directory:
   - Contains build metadata and cache files
   - Used internally by Next.js during the build process
   - Not meant to be served as a website
   - ❌ **This cannot be deployed as a website**

### The Root Cause

- Your `netlify.toml` file (in your repository) correctly specifies `publish = "out"`
- The GitHub Actions workflow correctly uses `publish-dir: './out'`
- **BUT**: The Netlify UI settings override these in some cases
- Netlify's auto-detection sometimes incorrectly chooses `.next` for Next.js projects
- This mismatch causes the "Error: Not Found" during deployment

### The Fix

By changing the Netlify UI setting to match the repository configuration (`out`), everything aligns:
- Repository config ✅ → `out`
- GitHub Actions ✅ → `out`
- Netlify UI ✅ → `out`

Now all three are pointing to the correct directory with the actual static website files!

---

## 🔍 Additional Checks

If you still have issues after fixing the publish directory, verify these:

### 1. Check GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Ensure these secrets are set:
- `NETLIFY_DEPLOY_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site API ID (found in Site settings → Site details → API ID)

### 2. Verify Token Permissions
- Go to Netlify → User Settings → Applications → Personal access tokens
- Ensure your token has **full access permissions**
- If the site is owned by a team, the token must be from a user who is a **member of that team**

### 3. Test Locally
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build your site
npm run build

# Deploy manually to test
export NETLIFY_AUTH_TOKEN="your-token-here"
netlify deploy --dir=out --site=YOUR_SITE_ID

# If successful, try production deploy
netlify deploy --prod --dir=out --site=YOUR_SITE_ID
```

---

## 📖 Related Documentation

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Netlify configuration: [netlify.toml](./netlify.toml)
- Next.js configuration: [next.config.js](./next.config.js)
- GitHub Actions workflow: [.github/workflows/netlify-deploy.yml](./.github/workflows/netlify-deploy.yml)

---

## 🆘 Still Having Issues?

If you've followed all steps and still see errors:

1. Check the full error message in GitHub Actions logs
2. Review the [troubleshooting section in DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)
3. Open an issue in the repository with:
   - The complete error message
   - Screenshot of your Netlify build settings
   - Your GitHub Actions workflow logs
