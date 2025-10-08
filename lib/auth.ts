import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          // Query user from database
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          )

          const user = result.rows[0]

          if (!user) {
            throw new Error('Invalid email or password')
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValid) {
            throw new Error('Invalid email or password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error('Authentication failed')
        }
      }
    }),
    // GitHub OAuth (requires GITHUB_ID and GITHUB_SECRET env vars)
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
          })
        ]
      : []),
    // Google OAuth (requires GOOGLE_ID and GOOGLE_SECRET env vars)
    ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
          })
        ]
      : [])
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle OAuth sign-in
      if (account?.provider && account.provider !== 'credentials') {
        // Check if user exists or create new user
        const result = await query(
          'SELECT * FROM users WHERE email = $1',
          [token.email]
        )

        if (result.rows.length === 0) {
          // Create new user from OAuth
          const newUser = await query(
            `INSERT INTO users (email, name, auth_provider, auth_provider_id, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, role`,
            [token.email, token.name, account.provider, account.providerAccountId, 'user']
          )
          token.id = newUser.rows[0].id
          token.role = newUser.rows[0].role
        } else {
          token.id = result.rows[0].id
          token.role = result.rows[0].role
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
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
}
