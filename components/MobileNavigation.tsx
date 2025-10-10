'use client'

import Link from 'next/link'
import UserProfile from '@/components/UserProfile'

interface MobileNavigationProps {
  onLinkClick: () => void
}

export default function MobileNavigation({ onLinkClick }: MobileNavigationProps) {
  return (
    <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-3">
        <Link
          href="/"
          className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium py-2"
          onClick={onLinkClick}
        >
          Home
        </Link>
        <Link
          href="/docs/diversified-farm-plan"
          className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium py-2"
          onClick={onLinkClick}
        >
          Documentation
        </Link>
        <Link
          href="/tools/calculators"
          className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium py-2"
          onClick={onLinkClick}
        >
          Calculators
        </Link>
        <Link
          href="/tools/dashboard"
          className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium py-2"
          onClick={onLinkClick}
        >
          Dashboard
        </Link>
        <a
          href="https://github.com/JustAGhosT/farm-business-plan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium py-2"
        >
          GitHub
        </a>
        <div className="pt-2">
          <UserProfile />
        </div>
      </div>
    </nav>
  )
}
