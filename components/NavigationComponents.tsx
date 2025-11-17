'use client'

import { NAVIGATION_ITEMS } from '@/lib/navigation-config'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface NavigationLinkProps {
  item: (typeof NAVIGATION_ITEMS)[0]
  className?: string
  onClick?: () => void
}

const NavigationLink = ({ item, className, onClick }: NavigationLinkProps) => {
  const baseClasses =
    'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium'

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${className || ''}`}
        onClick={onClick}
      >
        {item.label}
      </a>
    )
  }

  return (
    <Link href={item.href} className={`${baseClasses} ${className || ''}`} onClick={onClick}>
      {item.label}
    </Link>
  )
}

interface SharedNavigationProps {
  variant: 'desktop' | 'mobile'
  onLinkClick?: () => void
}

export default function SharedNavigation({ variant, onLinkClick }: SharedNavigationProps) {
  const { data: session } = useSession()
  const isAuthenticated = !!session

  const filteredItems = NAVIGATION_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated)

  if (variant === 'desktop') {
    return (
      <nav className="hidden md:flex items-center space-x-6">
        {filteredItems.map((item, index) => (
          <NavigationLink key={index} item={item} />
        ))}
      </nav>
    )
  }

  return (
    <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-3">
        {filteredItems.map((item, index) => (
          <NavigationLink key={index} item={item} className="py-2" onClick={onLinkClick} />
        ))}
      </div>
    </nav>
  )
}
