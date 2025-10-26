'use client'

import SharedNavigation from '@/components/NavigationComponents'
import UserProfile from '@/components/UserProfile'

export default function Navigation() {
  return (
    <>
      <SharedNavigation variant="desktop" />
      <UserProfile />
    </>
  )
}
