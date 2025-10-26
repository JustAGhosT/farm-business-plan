'use client'

import SharedNavigation from '@/components/SharedNavigation'
import UserProfile from '@/components/UserProfile'

export default function Navigation() {
  return (
    <>
      <SharedNavigation variant="desktop" />
      <UserProfile />
    </>
  )
}
