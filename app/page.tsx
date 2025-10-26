'use client'

import { Badge, Card, CardDescription, CardTitle, Container, Grid, Section } from '@/components/ui'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// Data configuration
const QUICK_START_STEPS = [
  {
    title: 'Review the Framework',
    description: 'Explore the comprehensive business plan template to understand all components'
  },
  {
    title: 'Assess Your Context', 
    description: 'Conduct climate, soil, and resource analysis for your specific location'
  },
  {
    title: 'Select Your Crops',
    description: 'Choose crops well-matched to your conditions and market opportunities'
  },
  {
    title: 'Develop Your Plan',
    description: 'Complete the templates with your specific data and projections'
  }
]

const FEATURE_CARDS = [
  {
    icon: '🌱',
    title: 'Crop-Agnostic',
    description: 'Adaptable framework for any agricultural crop or livestock system'
  },
  {
    icon: '🌍', 
    title: 'Location-Flexible',
    description: 'Templates for climate, soil, and market analysis for any region'
  },
  {
    icon: '📊',
    title: 'Comprehensive', 
    description: 'Covers technical planning, financial modeling, and operations management'
  }
]

const ACCOUNT_BENEFITS = [
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    description: 'Get personalized crop suggestions and investment advice based on your location and budget'
  },
  {
    icon: '💾',
    title: 'Save Your Progress',
    description: 'Store your business plans, calculations, and track your farm operations over time'
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Access detailed reports, financial projections, and operational dashboards'
  }
]

const PUBLIC_RESOURCES = [
  {
    href: '/docs/diversified-farm-plan',
    title: '📚 Documentation',
    description: 'Business plan templates and guides'
  },
  {
    href: '/tools/calculators',
    title: '💰 Calculators', 
    description: 'ROI, break-even & financial tools'
  },
  {
    href: '/tools/templates',
    title: '🌾 Templates',
    description: 'Pre-built crop profiles'
  }
]

const TOOLS = [
  {
    href: session => session ? '/tools/ai-wizard' : '/auth/signin?callbackUrl=/tools/ai-wizard',
    title: '🤖 AI Farm Planning',
    description: 'Complete farm planning with AI recommendations',
    requiresAuth: true
  },
  {
    href: () => '/tools/calculators',
    title: '💰 Financial Tools',
    description: '6 calculators + unified reports & analytics',
    requiresAuth: false
  },
  {
    href: session => session ? '/tools/dashboard' : '/auth/signin?callbackUrl=/tools/dashboard',
    title: '📊 Dashboard',
    description: 'Unified overview with financial metrics',
    requiresAuth: true
  },
  {
    href: () => '/tools/templates',
    title: '📚 Crop Templates',
    description: 'Browse pre-built crop profiles',
    requiresAuth: false
  }
]

const DOCUMENTATION_LINKS = [
  {
    href: '/docs/diversified-farm-plan',
    title: '🌾 Main Business Plan Template',
    description: 'Comprehensive agricultural business planning framework'
  },
  {
    href: '/docs/executive-summary',
    title: '📋 Executive Summary Template',
    description: 'High-level business plan summary structure'
  },
  {
    href: '/docs/technical-implementation',
    title: '🔧 Technical Implementation',
    description: 'Technical specifications and implementation details'
  },
  {
    href: '/docs/financial-analysis',
    title: '💰 Financial Analysis Framework',
    description: 'Financial modeling and projection tools'
  },
  {
    href: '/docs/operations-manual',
    title: '⚙️ Operations Manual',
    description: 'Daily operations and maintenance procedures'
  },
  {
    href: '/docs/market-strategy',
    title: '🛒 Market Strategy',
    description: 'Marketing and sales planning guide'
  },
  {
    href: '/docs/risk-management',
    title: '⚠️ Risk Management',
    description: 'Risk assessment and mitigation frameworks'
  },
  {
    href: '/docs/implementation-timeline',
    title: '📅 Implementation Timeline',
    description: 'Project timeline and milestone templates'
  }
]

// Reusable components
const StepCard = ({ step, index }: { step: typeof QUICK_START_STEPS[0], index: number }) => (
  <div className="flex items-start group">
    <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
      {index + 1}
    </span>
    <div>
      <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">
        {step.title}
      </h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {step.description}
      </p>
    </div>
  </div>
)

const FeatureCard = ({ feature }: { feature: typeof FEATURE_CARDS[0] }) => (
  <Card hover={true}>
    <div className="text-5xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
      {feature.description}
    </p>
  </Card>
)

const BenefitCard = ({ benefit }: { benefit: typeof ACCOUNT_BENEFITS[0] }) => (
  <div className="text-center">
    <div className="text-5xl mb-4">{benefit.icon}</div>
    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
      {benefit.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
      {benefit.description}
    </p>
  </div>
)

const ToolCard = ({ tool }: { tool: typeof TOOLS[0] }) => {
  const href = typeof tool.href === 'function' ? tool.href(session) : tool.href()
  
  return (
    <Card
      href={href}
      variant="bordered"
      className="relative"
    >
      {tool.requiresAuth && !session && (
        <Badge variant="locked" className="absolute top-2 right-2">
          🔒
        </Badge>
      )}
      {!tool.requiresAuth && (
        <Badge variant="public" className="absolute top-2 right-2">
          Public
        </Badge>
      )}
      <CardTitle>{tool.title}</CardTitle>
      <CardDescription>{tool.description}</CardDescription>
    </Card>
  )
}

const CTAButton = ({ 
  href, 
  children, 
  variant = 'primary' 
}: { 
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}) => {
  const baseClasses = "px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
  const variantClasses = variant === 'primary' 
    ? "bg-green-600 text-white hover:bg-green-700"
    : "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700"
  
  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </Link>
  )
}

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <Container>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Agricultural Business Plan Template
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive framework for developing professional agricultural business plans and
            managing farm operations - adaptable for any crop, location, or scale
          </p>

          {/* Call to Action Buttons */}
          {status !== 'loading' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {session ? (
                <CTAButton href="/tools/dashboard">
                  Go to Dashboard →
                </CTAButton>
              ) : (
                <>
                  <CTAButton href="/auth/signin">
                    Sign In
                  </CTAButton>
                  <CTAButton href="/auth/register" variant="secondary">
                    Get Started Free
                  </CTAButton>
                </>
              )}
            </div>
          )}
        </div>

        {/* Public Resources - Always Available */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-xl p-8 mb-16 border border-blue-100 dark:border-blue-800">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🌐 Free Public Resources
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access these tools and documentation without signing in
            </p>
          </div>
          <Grid cols={{ md: 3 }}>
            {PUBLIC_RESOURCES.map((resource, index) => (
              <Card key={index} href={resource.href} variant="elevated">
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </Card>
            ))}
          </Grid>
        </div>

        {/* Feature Cards */}
        <Grid cols={{ md: 3 }} gap={8} className="mb-16">
          {FEATURE_CARDS.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </Grid>

        {/* Quick Start Section */}
        <Section variant="default" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Quick Start Guide
          </h2>
          <div className="space-y-6">
            {QUICK_START_STEPS.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </Section>

        {/* Benefits of Creating an Account */}
        {!session && (
          <Section variant="gradient">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Create an Account?
            </h2>
            <Grid cols={{ md: 3 }} gap={8} className="mt-8">
              {ACCOUNT_BENEFITS.map((benefit, index) => (
                <BenefitCard key={index} benefit={benefit} />
              ))}
            </Grid>
            <div className="text-center mt-8">
              <CTAButton href="/auth/register">
                Create Free Account →
              </CTAButton>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Or sign in with <span className="font-semibold">Google</span> in just one click!
              </p>
            </div>
          </Section>
        )}

        {/* Tools Section */}
        <Section variant="default" className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Interactive Tools
          </h2>
          <Grid cols={{ md: 2, lg: 4 }}>
            {TOOLS.map((tool, index) => (
              <ToolCard key={index} tool={tool} />
            ))}
          </Grid>
        </Section>

        {/* Documentation Links */}
        <Section variant="default">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h2>
            <Badge variant="success" size="md">
              Free Access - No Login Required
            </Badge>
          </div>
          <Grid cols={{ md: 2 }}>
            {DOCUMENTATION_LINKS.map((doc, index) => (
              <Card key={index} href={doc.href} variant="bordered">
                <CardTitle>{doc.title}</CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </Card>
            ))}
          </Grid>
        </Section>
      </Container>
    </main>
  )
}
