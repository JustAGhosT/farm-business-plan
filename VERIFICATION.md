# Deployment Verification Checklist

This checklist helps verify that the MIME type fix is working correctly after deployment to Netlify.

## Quick Verification

After deployment completes, check these in your browser:

### 1. Visual Check
- [ ] Visit https://farmplan.netlify.app/
- [ ] Page loads with proper styling (green header, styled buttons, proper layout)
- [ ] No console errors in browser DevTools

### 2. Network Tab Verification

Open browser DevTools (F12) → Network tab:

#### CSS Files
- [ ] Look for `/_next/static/css/*.css` requests
- [ ] Status should be **200** (not 404)
- [ ] Content-Type should be **text/css** (not text/html)
- [ ] Cache-Control should be **public, max-age=31536000, immutable**

#### JavaScript Files  
- [ ] Look for `/_next/static/chunks/*.js` requests
- [ ] Status should be **200**
- [ ] Content-Type should be **application/javascript**

#### Example of Correct Network Response:
```
Request URL: https://farmplan.netlify.app/_next/static/css/3d45d3d4a4ee1e3e.css
Status: 200 OK
Content-Type: text/css; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
```

#### Example of INCORRECT Response (The Bug):
```
Request URL: https://farmplan.netlify.app/_next/static/css/3d45d3d4a4ee1e3e.css
Status: 404 Not Found
Content-Type: text/html    ❌ This is wrong!
```

### 3. Console Check
Open browser DevTools (F12) → Console tab:

- [ ] No errors like: "Refused to apply style because its MIME type"
- [ ] No 404 errors for CSS/JS files
- [ ] Only expected Next.js info messages

## If Issues Persist

### Step 1: Clear Netlify Cache
1. Go to Netlify Dashboard
2. Select your site (farmplan)
3. Go to: Site Settings → Build & deploy
4. Click "Clear cache and deploy site"
5. Wait for deployment to complete (~2-3 minutes)

### Step 2: Hard Refresh Browser
- **Chrome/Edge:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Firefox:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Safari:** Cmd+Option+R (Mac)

### Step 3: Check Netlify Configuration
Verify in the repository that `netlify.toml` has:
```toml
[build]
  publish = "."  # Must be "." not ".next"
```

### Step 4: Check Build Logs
1. Go to Netlify Dashboard → Deploys
2. Click on the latest deploy
3. Expand "Build logs"
4. Look for:
   - ✅ Next.js plugin is active
   - ✅ Build completes successfully
   - ❌ No errors about missing files

## Advanced Debugging

### Test Specific CSS File
```bash
# Check if CSS file returns correct Content-Type
curl -I https://farmplan.netlify.app/_next/static/css/YOUR-CSS-FILE.css

# Should see:
# HTTP/2 200
# content-type: text/css; charset=utf-8
```

### Test API Routes (Bonus Check)
```bash
# Health check endpoint
curl https://farmplan.netlify.app/api/health

# Should return JSON with status
```

## Success Criteria

All of these should be true:
- ✅ Page loads with proper styling
- ✅ No console errors about MIME types
- ✅ CSS files return 200 with Content-Type: text/css
- ✅ JS files return 200 with Content-Type: application/javascript
- ✅ Static assets have proper cache headers

## Need Help?

If the issue persists after following these steps:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Open an issue on GitHub with:
   - Browser console errors (screenshot)
   - Network tab showing CSS file request/response (screenshot)
   - Link to Netlify deploy logs

---

**Last Updated:** 2025-01-08  
**Related Issue:** MIME type error for CSS files  
**Fix PR:** [Link to this PR]
