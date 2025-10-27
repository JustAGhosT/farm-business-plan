// Shared navigation configuration
export interface NavItem {
  href: string
  label: string
  external?: boolean
  requiresAuth?: boolean
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/docs/diversified-farm-plan',
    label: 'Documentation',
  },
  {
    href: '/tools/calculators',
    label: 'Calculators',
  },
  {
    href: '/tools/dashboard',
    label: 'Dashboard',
    requiresAuth: true,
  },
  {
    href: 'https://github.com/JustAGhosT/farm-business-plan',
    label: 'GitHub',
    external: true,
  },
]

export const getNavigationItems = (isAuthenticated: boolean = false) => {
  return NAVIGATION_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated)
}
