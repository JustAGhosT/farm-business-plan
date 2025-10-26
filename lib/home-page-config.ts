// Home page configuration - centralized data and settings
export interface ResourceItem {
  href: string
  title: string
  description: string
  icon?: string
}

export interface ToolItem {
  href: string | ((session: any) => string)
  title: string
  description: string
  requiresAuth: boolean
  icon?: string
}

export interface StepItem {
  title: string
  description: string
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface BenefitItem {
  icon: string
  title: string
  description: string
}

// Configuration data
export const HOME_CONFIG = {
  hero: {
    title: 'Agricultural Business Plan Template',
    subtitle: 'A comprehensive framework for developing professional agricultural business plans and managing farm operations - adaptable for any crop, location, or scale',
  },
  
  quickStartSteps: [
    {
      title: 'Review the Framework',
      description: 'Explore the comprehensive business plan template to understand all components',
    },
    {
      title: 'Assess Your Context',
      description: 'Conduct climate, soil, and resource analysis for your specific location',
    },
    {
      title: 'Select Your Crops',
      description: 'Choose crops well-matched to your conditions and market opportunities',
    },
    {
      title: 'Develop Your Plan',
      description: 'Complete the templates with your specific data and projections',
    },
  ] as StepItem[],

  features: [
    {
      icon: '🌱',
      title: 'Crop-Agnostic',
      description: 'Adaptable framework for any agricultural crop or livestock system',
    },
    {
      icon: '🌍',
      title: 'Location-Flexible',
      description: 'Templates for climate, soil, and market analysis for any region',
    },
    {
      icon: '📊',
      title: 'Comprehensive',
      description: 'Covers technical planning, financial modeling, and operations management',
    },
  ] as FeatureItem[],

  accountBenefits: [
    {
      icon: '🤖',
      title: 'AI-Powered Recommendations',
      description: 'Get personalized crop suggestions and investment advice based on your location and budget',
    },
    {
      icon: '💾',
      title: 'Save Your Progress',
      description: 'Store your business plans, calculations, and track your farm operations over time',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Access detailed reports, financial projections, and operational dashboards',
    },
  ] as BenefitItem[],

  publicResources: [
    {
      href: '/docs/diversified-farm-plan',
      title: '📚 Documentation',
      description: 'Business plan templates and guides',
    },
    {
      href: '/tools/calculators',
      title: '💰 Calculators',
      description: 'ROI, break-even & financial tools',
    },
    {
      href: '/tools/templates',
      title: '🌾 Templates',
      description: 'Pre-built crop profiles',
    },
  ] as ResourceItem[],

  tools: [
    {
      href: (session: any) => (session ? '/tools/ai-wizard' : '/auth/signin?callbackUrl=/tools/ai-wizard'),
      title: '🤖 AI Farm Planning',
      description: 'Complete farm planning with AI recommendations',
      requiresAuth: true,
    },
    {
      href: () => '/tools/calculators',
      title: '💰 Financial Tools',
      description: '6 calculators + unified reports & analytics',
      requiresAuth: false,
    },
    {
      href: (session: any) => (session ? '/tools/dashboard' : '/auth/signin?callbackUrl=/tools/dashboard'),
      title: '📊 Dashboard',
      description: 'Unified overview with financial metrics',
      requiresAuth: true,
    },
    {
      href: () => '/tools/templates',
      title: '📚 Crop Templates',
      description: 'Browse pre-built crop profiles',
      requiresAuth: false,
    },
  ] as ToolItem[],

  documentation: [
    {
      href: '/docs/diversified-farm-plan',
      title: '🌾 Main Business Plan Template',
      description: 'Comprehensive agricultural business planning framework',
    },
    {
      href: '/docs/executive-summary',
      title: '📋 Executive Summary Template',
      description: 'High-level business plan summary structure',
    },
    {
      href: '/docs/technical-implementation',
      title: '🔧 Technical Implementation',
      description: 'Technical specifications and implementation details',
    },
    {
      href: '/docs/financial-analysis',
      title: '💰 Financial Analysis Framework',
      description: 'Financial modeling and projection tools',
    },
    {
      href: '/docs/operations-manual',
      title: '⚙️ Operations Manual',
      description: 'Daily operations and maintenance procedures',
    },
    {
      href: '/docs/market-strategy',
      title: '🛒 Market Strategy',
      description: 'Marketing and sales planning guide',
    },
    {
      href: '/docs/risk-management',
      title: '⚠️ Risk Management',
      description: 'Risk assessment and mitigation frameworks',
    },
    {
      href: '/docs/implementation-timeline',
      title: '📅 Implementation Timeline',
      description: 'Project timeline and milestone templates',
    },
  ] as ResourceItem[],
}
