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

// Protect specific routes - only protect /tools/* except calculators and templates
export const config = {
  matcher: [
    '/tools/dashboard/:path*',
    '/tools/ai-wizard/:path*',
    '/tools/plan-generator/:path*',
    '/tools/reports/:path*',
  ],
}
