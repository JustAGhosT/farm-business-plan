'use client'

import Link from 'next/link'
import type { Session } from 'next-auth'
import {
  AccountBenefitsSection,
  DocumentationSection,
  FeaturesSection,
  HeroSection,
  PublicResourcesSection,
  QuickStartSection,
  ToolsSection,
} from '@/components/home-page-sections'
import { HOME_CONFIG } from '@/lib/home-page-config'
import { useSession } from 'next-auth/react'
import {
  Container,
  Section,
  Badge,
  Grid,
  Card,
  CardTitle,
  CardDescription,
} from '@/components/ui'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <Container>
        <HeroSection
          title={HOME_CONFIG.hero.title}
          subtitle={HOME_CONFIG.hero.subtitle}
          session={session}
          status={status}
        />

        <PublicResourcesSection resources={HOME_CONFIG.publicResources} />

        <FeaturesSection features={HOME_CONFIG.features} />

        <QuickStartSection steps={HOME_CONFIG.quickStartSteps} />

        {!session && <AccountBenefitsSection benefits={HOME_CONFIG.accountBenefits} />}

        <ToolsSection tools={HOME_CONFIG.tools} session={session} />

        {/* Quick Start Section */}
        <Section variant="default" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Quick Start Guide
          </h2>
          <div className="space-y-6">
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
                1
              </span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">
                  Review the Framework
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Explore the comprehensive business plan template to understand all components
                </p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
                2
              </span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">
                  Assess Your Context
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Conduct climate, soil, and resource analysis for your specific location
                </p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
                3
              </span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">
                  Select Your Crops
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Choose crops well-matched to your conditions and market opportunities
                </p>
              </div>
            </div>
            <div className="flex items-start group">
              <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
                4
              </span>
              <div>
                <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">
                  Develop Your Plan
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Complete the templates with your specific data and projections
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Benefits of Creating an Account */}
        {!session && (
          <Section variant="gradient">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Create an Account?
            </h2>
            <Grid cols={{ md: 3 }} gap={8} className="mt-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                  AI-Powered Recommendations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Get personalized crop suggestions and investment advice based on your location and
                  budget
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💾</div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                  Save Your Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Store your business plans, calculations, and track your farm operations over time
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Access detailed reports, financial projections, and operational dashboards
                </p>
              </div>
            </Grid>
            <div className="text-center mt-8">
              <Link
                href="/auth/register"
                className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
              >
                Create Free Account →
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Or sign in with <span className="font-semibold">Google</span> in just one click!
              </p>
            </div>
          </Section>
        )}

        {/* AI Wizard - Featured (Requires Login) */}
        <Section variant="featured" className="mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <span className="text-5xl mr-4">🤖</span>
                <div>
                  <h2 className="text-3xl font-bold">AI-Powered Farm Planning Wizard</h2>
                  {!session && (
                    <span className="inline-block mt-2 text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                      🔒 Login Required
                    </span>
                  )}
                </div>
              </div>
              <p className="text-primary-50 dark:text-primary-100 text-lg mb-5 leading-relaxed">
                Get personalized recommendations based on your location, climate, and budget. Let AI
                guide you through every step of farm planning.
              </p>
              <ul className="text-primary-50 dark:text-primary-100 space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Climate-specific crop recommendations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Budget-optimized investment planning
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Step-by-step guided setup
                </li>
              </ul>
            </div>
            {session ? (
              <Link
                href="/tools/ai-wizard"
                className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-10 py-5 rounded-xl font-bold text-lg hover:bg-primary-50 dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 flex-shrink-0 transform hover:scale-105"
              >
                Start Wizard →
              </Link>
            ) : (
              <Link
                href="/auth/signin?callbackUrl=/tools/ai-wizard"
                className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-10 py-5 rounded-xl font-bold text-lg hover:bg-primary-50 dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-300 flex-shrink-0 transform hover:scale-105"
              >
                Sign In to Start →
              </Link>
            )}
          </div>
        </Section>

        {/* Tools Section */}
        <Section variant="default" className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Interactive Tools
          </h2>
          <Grid cols={{ md: 2, lg: 4 }}>
            {[
              {
                href: session
                  ? '/tools/plan-generator'
                  : '/auth/signin?callbackUrl=/tools/plan-generator',
                title: '🌱 Plan Generator',
                description: 'Create customized business plans',
                locked: !session,
              },
              {
                href: '/tools/calculators',
                title: '💰 Financial Tools',
                description: '6 calculators: ROI, break-even & more',
                public: true,
              },
              {
                href: session ? '/tools/dashboard' : '/auth/signin?callbackUrl=/tools/dashboard',
                title: '📊 Dashboard',
                description: 'Track tasks and operations',
                locked: !session,
              },
              {
                href: '/tools/templates',
                title: '📚 Crop Templates',
                description: 'Browse pre-built crop profiles',
                public: true,
              },
            ].map((tool) => (
              <Card key={tool.href} href={tool.href} variant="bordered" className="relative">
                {tool.locked && (
                  <Badge variant="locked" className="absolute top-2 right-2">
                    🔒
                  </Badge>
                )}
                {tool.public && (
                  <Badge variant="public" className="absolute top-2 right-2">
                    Public
                  </Badge>
                )}
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </Card>
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
            {[
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
            ].map((doc) => (
              <Card key={doc.href} href={doc.href} variant="bordered">
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
