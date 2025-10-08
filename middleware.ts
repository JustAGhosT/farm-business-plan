import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
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

// Protect specific routes - everything except public routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (landing page)
     * - /api/auth/* (auth endpoints)
     * - /auth/* (sign in/register pages)
     * - /docs/* (documentation - public)
     * - /tools/calculators/* (calculators - public)
     * - /tools/templates (templates - public)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc. (static files)
     */
    '/((?!api/auth|auth|docs|_next/static|_next/image|favicon.ico|robots.txt).*)',
    '/tools/((?!calculators|templates).*)',
  ],
}
