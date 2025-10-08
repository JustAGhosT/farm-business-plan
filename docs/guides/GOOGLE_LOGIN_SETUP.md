# Google Login Setup Guide

## Overview

The Farm Business Plan application now includes Google OAuth authentication, allowing users to sign in with their Google account in one click. This guide explains the implementation and setup process.

## Features Implemented

### 1. Google OAuth Integration
- **Sign in with Google** button on the login page
- Automatic user account creation on first Google login
- Seamless authentication flow with NextAuth.js
- Profile information (name, email) synced from Google account

### 2. Route Protection
Protected routes (require login):
- `/tools/dashboard` - Operations dashboard
- `/tools/ai-wizard` - AI planning wizard
- `/tools/plan-generator` - Business plan generator
- `/tools/reports` - Financial reports

Public routes (no login required):
- `/` - Landing page
- `/docs/*` - All documentation
- `/tools/calculators/*` - Financial calculators
- `/tools/templates` - Crop templates
- `/auth/*` - Authentication pages

### 3. Enhanced Landing Page
- Prominent "Sign In" and "Get Started Free" buttons
- "Free Public Resources" section highlighting public content
- "Why Create an Account?" benefits section
- Visual indicators (🔒 and "Public" badges) for route access
- Conditional content based on authentication state

## Setup Instructions

### Local Development

1. **Copy environment variables**
```bash
cp .env.example .env.local
```

2. **Set required variables in `.env.local`**
```bash
# NextAuth Configuration
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Database (if using authentication features)
DATABASE_URL="postgresql://user:password@localhost:5432/farm_plan"
```

3. **Enable Google OAuth (optional for UI testing)**
```bash
# These enable the Google button in UI even without real credentials
NEXT_PUBLIC_GOOGLE_ENABLED="true"
```

4. **Run development server**
```bash
npm run dev
```

### Google OAuth Setup (Production)

1. **Create Google OAuth Application**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.com/api/auth/callback/google`

2. **Configure Environment Variables**
```bash
# Google OAuth Credentials
GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_GOOGLE_ENABLED="true"
```

3. **Configure OAuth Consent Screen**
   - In Google Cloud Console, go to "OAuth consent screen"
   - Choose "External" if your app is public
   - Fill in app information:
     - App name: "Farm Business Plan"
     - User support email: your email
     - Developer contact: your email
   - Add required scopes: `email`, `profile`
   - Add test users if in testing mode

### Database Schema

Google OAuth users are automatically created in the `users` table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for OAuth users
  role VARCHAR(50) DEFAULT 'user',
  auth_provider VARCHAR(50) DEFAULT 'credentials', -- 'google' for Google OAuth
  auth_provider_id VARCHAR(255), -- Google user ID
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## User Experience

### For Unauthenticated Users

1. **Landing Page**
   - See all available features
   - Clear indication of what's free vs. what requires login
   - Easy access to sign-in or registration

2. **Accessing Protected Routes**
   - Automatically redirected to sign-in page
   - After login, returned to originally requested page
   - Example: `/tools/dashboard` → `/auth/signin?callbackUrl=/tools/dashboard`

3. **Public Content**
   - Full access to documentation
   - Use all financial calculators
   - Browse crop templates
   - No account needed

### For Authenticated Users

1. **Sign In Options**
   - Google OAuth (one-click)
   - GitHub OAuth (if enabled)
   - Email/password (traditional)

2. **After Sign In**
   - Access to all protected features
   - User profile displayed in header
   - Dashboard and planning tools available
   - Save and track progress

## Security Features

- **JWT-based sessions** - Secure, stateless authentication
- **HTTPS required in production** - All OAuth redirects use HTTPS
- **Secure cookie settings** - httpOnly, secure, sameSite flags
- **CSRF protection** - Built into NextAuth.js
- **Session expiration** - 30-day session lifetime (configurable)

## Testing

### Testing Protected Routes

1. **Without Authentication**
```bash
# Should redirect to sign-in
curl -L http://localhost:3000/tools/dashboard
# Expected: Redirects to /auth/signin?callbackUrl=/tools/dashboard
```

2. **Public Routes**
```bash
# Should load without redirect
curl http://localhost:3000/docs/executive-summary
curl http://localhost:3000/tools/calculators
```

### Testing OAuth (requires valid credentials)

1. Set up `.env.local` with real Google OAuth credentials
2. Start dev server: `npm run dev`
3. Navigate to `http://localhost:3000/auth/signin`
4. Click "Sign in with Google"
5. Complete Google authentication flow
6. Verify redirect back to requested page

## Troubleshooting

### Google Button Not Showing
- Check `NEXT_PUBLIC_GOOGLE_ENABLED="true"` in `.env.local`
- Restart dev server after changing environment variables
- Verify browser console for errors

### OAuth Redirect Errors
- Verify redirect URI matches exactly in Google Cloud Console
- Check `NEXTAUTH_URL` matches your domain
- Ensure HTTPS in production

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database is running
- Check users table exists with correct schema

### Session Issues
- Generate a secure `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Clear browser cookies and try again
- Check Next.js server logs for errors

## Architecture

### Files Modified/Created

1. **`middleware.ts`** (new)
   - NextAuth middleware integration
   - Route protection configuration
   - Redirect logic for unauthorized access

2. **`app/page.tsx`** (updated)
   - Client component with session awareness
   - Conditional rendering based on auth state
   - Enhanced CTAs and public resources section

3. **`lib/auth.ts`** (existing, already configured)
   - NextAuth configuration
   - Google OAuth provider
   - User creation for OAuth sign-ins

### Authentication Flow

```
User visits protected route
       ↓
Middleware checks auth
       ↓
   Authenticated?
      ↙     ↘
    Yes      No
     ↓        ↓
  Allow   Redirect to /auth/signin?callbackUrl=original-url
            ↓
      User signs in (Google/Email)
            ↓
      NextAuth validates
            ↓
      Create/update session
            ↓
      Redirect to callbackUrl
```

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Complete Authentication Guide](./AUTHENTICATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Support

For issues or questions:
1. Check the [AUTHENTICATION.md](./AUTHENTICATION.md) guide
2. Review [GitHub Issues](https://github.com/JustAGhosT/farm-business-plan/issues)
3. Open a new issue with details about your problem

---

**Last Updated**: January 2025  
**Version**: 3.0
