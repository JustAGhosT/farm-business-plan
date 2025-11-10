import { withAuth } from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from './lib/rate-limit'

// Public routes that don't require authentication
const publicRoutes = ['/api/health', '/api/auth']

export default function middleware(req: NextRequest) {
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // For public API routes, just apply rate limiting without auth
  if (isPublicRoute) {
    // Skip rate limiting for health checks
    if (req.nextUrl.pathname.startsWith('/api/health')) {
      return NextResponse.next()
    }

    // Apply rate limiting for other public routes (like auth)
    if (req.nextUrl.pathname.startsWith('/api/auth/')) {
      const pathname = req.nextUrl.pathname

      // Exempt low-risk NextAuth endpoints to avoid tripping limits during normal flow
      const isExemptAuthGet =
        req.method === 'GET' &&
        (pathname === '/api/auth/csrf' ||
          pathname === '/api/auth/providers' ||
          pathname === '/api/auth/session' ||
          pathname.startsWith('/api/auth/signin'))

      // Also exempt callback endpoints (both GET and POST)
      const isExemptAuthCallback = pathname.startsWith('/api/auth/callback')

      if (isExemptAuthGet || isExemptAuthCallback) {
        return NextResponse.next()
      }

      // In development, relax auth rate limits significantly
      const isProd = process.env.NODE_ENV === 'production'
      const authConfig = isProd
        ? RATE_LIMITS.auth
        : { maxRequests: 100, windowMs: 60 * 1000 } // 100 requests per minute in dev

      // Scope by path+IP so each auth sub-endpoint has its own bucket
      const scopeKey = pathname

      const { allowed, headers } = applyRateLimit(req, authConfig, undefined, scopeKey)

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          {
            status: 429,
            headers,
          }
        )
      }

      const response = NextResponse.next()
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    return NextResponse.next()
  }

  // For protected routes, use withAuth
  return (
    withAuth(
      function middleware(req) {
        // Apply rate limiting to protected API routes
        if (req.nextUrl.pathname.startsWith('/api/')) {
          const { allowed, headers } = applyRateLimit(
            req,
            RATE_LIMITS.api,
            req.nextauth?.token?.sub
          )

          if (!allowed) {
            return NextResponse.json(
              {
                success: false,
                error: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
              },
              {
                status: 429,
                headers,
              }
            )
          }

          const response = NextResponse.next()
          Object.entries(headers).forEach(([key, value]) => {
            response.headers.set(key, value)
          })
          return response
        }

        return NextResponse.next()
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: '/auth/signin',
        },
      }
    ) as any
  )(req)
}

// Protect specific routes and apply rate limiting to API routes
export const config = {
  matcher: [
    '/tools/dashboard/:path*',
    '/tools/ai-wizard/:path*',
    '/tools/plan-generator/:path*',
    '/tools/reports/:path*',
    '/api/:path*',
  ],
}
