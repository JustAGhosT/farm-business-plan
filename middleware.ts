import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'
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
      const { allowed, headers } = applyRateLimit(req, RATE_LIMITS.auth)

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
