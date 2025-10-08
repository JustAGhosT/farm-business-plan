# Authentication System Setup Guide

## Overview

The Farm Business Plan application uses NextAuth.js for authentication, supporting:
- Email/password authentication with bcrypt
- OAuth providers (GitHub, Google)
- JWT-based sessions
- Role-based access control

## Database Schema

Add the following to your PostgreSQL database:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for OAuth users
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin', 'manager'
  auth_provider VARCHAR(50) DEFAULT 'credentials', -- 'credentials', 'github', 'google'
  auth_provider_id VARCHAR(255), -- Provider's user ID for OAuth
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Update farm_plans to reference users
ALTER TABLE farm_plans 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index on owner_id for faster lookups
CREATE INDEX idx_farm_plans_owner ON farm_plans(owner_id);
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required

```env
# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"
```

### Optional OAuth Providers

#### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: Farm Business Plan (Dev)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/api/auth/callback/github
4. Copy Client ID and Client Secret

```env
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
NEXT_PUBLIC_GITHUB_ENABLED="true"
```

#### Google OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google
7. Copy Client ID and Client Secret

```env
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_GOOGLE_ENABLED="true"
```

## Usage

### Sign Up

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securepassword123'
  })
})
```

### Sign In

```typescript
import { signIn } from 'next-auth/react'

// Credentials
await signIn('credentials', {
  email: 'john@example.com',
  password: 'securepassword123',
  callbackUrl: '/tools/dashboard'
})

// OAuth
await signIn('github', { callbackUrl: '/tools/dashboard' })
await signIn('google', { callbackUrl: '/tools/dashboard' })
```

### Get Session

```typescript
import { useSession } from 'next-auth/react'

function Component() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>

  return <div>Welcome {session.user.name}</div>
}
```

### Sign Out

```typescript
import { signOut } from 'next-auth/react'

await signOut({ callbackUrl: '/' })
```

### Protect API Routes

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Continue with authenticated request
}
```

### Protect Pages

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function ProtectedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    }
  })

  if (status === 'loading') return <div>Loading...</div>

  return <div>Protected content</div>
}
```

## Role-Based Access Control

Check user role in components:

```typescript
const { data: session } = useSession()

if (session?.user?.role === 'admin') {
  // Show admin features
}
```

Check role in API routes:

```typescript
const session = await getServerSession(authOptions)

if (session?.user?.role !== 'admin') {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  )
}
```

## Testing

### Create Test User

```sql
-- Password is: testpassword123 (hashed with bcrypt)
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LqRqI4MV2J8QZ5jzi',
  'user'
);
```

### Test Endpoints

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com","password":"testpass123"}'

# Sign in (NextAuth handles this via browser)
# Visit: http://localhost:3000/auth/signin
```

## Production Deployment

### Netlify

1. Add environment variables in Netlify dashboard
2. Set `NEXTAUTH_URL` to your production domain
3. Update OAuth callback URLs in provider settings
4. Generate strong `NEXTAUTH_SECRET`

```bash
# Generate secret
openssl rand -base64 32
```

### Environment Variables

```env
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.netlify.app"
DATABASE_URL="postgresql://..."
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Strong passwords** - Enforce minimum 8 characters
3. **HTTPS only** - Always use HTTPS in production
4. **Rotate secrets** - Change NEXTAUTH_SECRET periodically
5. **Rate limiting** - Add rate limiting to auth endpoints
6. **Email verification** - Implement email verification for new users
7. **Password reset** - Implement secure password reset flow
8. **2FA** - Consider adding two-factor authentication

## Troubleshooting

### "NEXTAUTH_SECRET is not set"
Add `NEXTAUTH_SECRET` to your `.env.local` file

### "Database connection failed"
Check `DATABASE_URL` is correct and database is running

### "OAuth callback error"
Verify callback URLs in OAuth provider settings match your configuration

### "Session undefined"
Ensure `SessionProvider` is wrapping your components and session callback is configured correctly

## Next Steps

1. Add middleware for route protection
2. Implement email verification
3. Add password reset functionality
4. Add user profile management
5. Implement 2FA
6. Add audit logging

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
