# Quick Start: Environment Setup

## The Problem

If you see this error:

```
❌ ERROR: NEXTAUTH_SECRET contains a placeholder value - NextAuth secret key for JWT signing
```

**You need to generate a real secret key!**

## The Solution

### Step 1: Copy the example file

```bash
cp .env.example .env.local
```

### Step 2: Generate a secure secret

```bash
openssl rand -base64 32
```

This will output something like:

```
K8mN9pQ2rS5tU8vW1xY4zA7bC0dE3fG6hI9jL2mN5oP8
```

### Step 3: Edit .env.local

Open `.env.local` and replace the placeholder with your generated secret:

**❌ WRONG:**

```env
NEXTAUTH_SECRET="REPLACE_ME_RUN_openssl_rand_base64_32"
```

**✅ CORRECT:**

```env
NEXTAUTH_SECRET="K8mN9pQ2rS5tU8vW1xY4zA7bC0dE3fG6hI9jL2mN5oP8"
```

### Step 4: Verify your configuration

```bash
npm run validate:env
```

You should see:

```
✅ Environment validation PASSED
```

## Why This Matters

The `NEXTAUTH_SECRET` is used to:

- Sign JWT tokens
- Encrypt session data
- Secure authentication

**Never use placeholder values in production!**

## Complete Example

Here's a complete `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/farm_business_plan"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# NextAuth - REPLACE WITH YOUR GENERATED SECRET!
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET_HERE"
NEXTAUTH_URL="http://localhost:3000"
```

## Troubleshooting

### Still getting the error?

1. Make sure you're editing `.env.local` (not `.env.example`)
2. Make sure you actually replaced the placeholder text
3. Make sure there are no extra spaces or quotes
4. Run `npm run validate:env` to check

### Need help?

Check the full [Authentication Guide](./AUTHENTICATION.md) for more details.
