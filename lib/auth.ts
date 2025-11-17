import { NextAuthOptions, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/types/enums'
import { credentialsSchema } from './validation/auth'

async function authorizeCredentials(credentials: Record<string, string> | undefined): Promise<User | null> {
  const parsedCredentials = credentialsSchema.safeParse(credentials)

  if (!parsedCredentials.success) {
    throw new Error('Invalid credentials')
  }

  const { email, password } = parsedCredentials.data

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [credentials.email])
    const user = result.rows[0]

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await bcrypt.compare(credentials.password, user.password_hash)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error('Auth error:', error)
    throw new Error('Authentication failed')
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
    // OAuth providers - dynamically configured
    ...getOAuthProviders(),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle OAuth sign-in - only on first sign in when account is present
      if (account?.provider && account.provider !== 'credentials') {
        const oauthUser = await handleOAuthSignIn(account, token)
        if (oauthUser) {
          token.id = oauthUser.id
          token.role = oauthUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build-only-do-not-use-in-production',
  debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
}

async function handleOAuthSignIn(account: any, token: any) {
  try {
    console.log('OAuth sign-in:', account.provider, token.email)

    const result = await query('SELECT * FROM users WHERE email = $1', [token.email])

    if (result.rows.length === 0) {
      console.log('Creating new OAuth user:', token.email)
      const newUser = await query(
        `INSERT INTO users (email, name, auth_provider, auth_provider_id, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, role`,
        [
          token.email,
          token.name,
          account.provider,
          account.providerAccountId,
          UserRole.User,
        ]
      )
      return { id: newUser.rows[0].id, role: newUser.rows[0].role }
    } else {
      const existingUser = result.rows[0]
      console.log('Existing user found:', existingUser.id)
      if (!existingUser.auth_provider || existingUser.auth_provider !== account.provider) {
        await query(
          'UPDATE users SET auth_provider = $1, auth_provider_id = $2 WHERE email = $3',
          [account.provider, account.providerAccountId, token.email]
        )
        console.log('Updated user OAuth provider')
      }
      return { id: existingUser.id, role: existingUser.role }
    }
  } catch (error) {
    console.error('Error handling OAuth user:', error)
    throw new Error('Error handling OAuth user')
  }
}
