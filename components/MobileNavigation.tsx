'use client'

import SharedNavigation from '@/components/NavigationComponents'
import UserProfile from '@/components/UserProfile'

interface MobileNavigationProps {
  onLinkClick: () => void
}

export default function MobileNavigation({ onLinkClick }: MobileNavigationProps) {
  return (
    <>
      <SharedNavigation variant="mobile" onLinkClick={onLinkClick} />
      <div className="pt-2">
        <UserProfile />
      </div>
    </>
  )
}
