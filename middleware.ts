import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { applyRateLimit, RATE_LIMITS } from './lib/rate-limit'

export default withAuth(
  function middleware(req) {
    // Skip authentication and rate limiting for public health checks
    if (req.nextUrl.pathname.startsWith('/api/health')) {
      return NextResponse.next()
    }

    // Apply rate limiting to API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Apply stricter rate limiting for auth endpoints
      if (req.nextUrl.pathname.startsWith('/api/auth/')) {
        const { allowed, headers } = applyRateLimit(req, RATE_LIMITS.auth, req.nextauth?.token?.sub)

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

      // Apply standard rate limiting for other API endpoints
      const { allowed, headers } = applyRateLimit(req, RATE_LIMITS.api, req.nextauth?.token?.sub)

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
)

// Protect specific routes - only protect /tools/* except calculators and templates
export const config = {
  matcher: [
    '/tools/dashboard/:path*',
    '/tools/ai-wizard/:path*',
    '/tools/plan-generator/:path*',
    '/tools/reports/:path*',
    '/api/:path*', // Apply rate limiting to all API routes
  ],
}
