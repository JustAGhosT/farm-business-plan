'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

/**
 * Breadcrumb navigation component
 * Automatically generates breadcrumbs based on current path
 */
export default function Breadcrumb() {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home
    breadcrumbs.push({ label: 'Home', href: '/' })

    // Build breadcrumbs from path segments
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Format label (capitalize and replace hyphens)
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        label,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      {breadcrumbs.map((breadcrumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isHome = index === 0

        return (
          <div key={breadcrumb.href} className="flex items-center space-x-2">
            {index > 0 && (
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center"
              >
                {isHome && (
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {breadcrumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
