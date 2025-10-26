'use client'

import { Badge, Card, CardDescription, CardTitle, Container, Grid, Section } from '@/components/ui'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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
                <Link
                  href="/tools/dashboard"
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105"
                  >
                    Get Started Free
                  </Link>
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
            <Card href="/docs/diversified-farm-plan" variant="elevated">
              <CardTitle>📚 Documentation</CardTitle>
              <CardDescription>Business plan templates and guides</CardDescription>
            </Card>

            <Card href="/tools/calculators" variant="elevated">
              <CardTitle>💰 Calculators</CardTitle>
              <CardDescription>ROI, break-even & financial tools</CardDescription>
            </Card>

            <Card href="/tools/templates" variant="elevated">
              <CardTitle>🌾 Templates</CardTitle>
              <CardDescription>Pre-built crop profiles</CardDescription>
            </Card>
          </Grid>
        </div>

        {/* Feature Cards */}
        <Grid cols={{ md: 3 }} gap={8} className="mb-16">
          <Card hover={true}>
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Crop-Agnostic</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Adaptable framework for any agricultural crop or livestock system
            </p>
          </Card>

          <Card hover={true}>
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Location-Flexible
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Templates for climate, soil, and market analysis for any region
            </p>
          </Card>

          <Card hover={true}>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Comprehensive</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Covers technical planning, financial modeling, and operations management
            </p>
          </Card>
        </Grid>

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
            <Card
              href={
                session ? '/tools/ai-wizard' : '/auth/signin?callbackUrl=/tools/ai-wizard'
              }
              variant="bordered"
              className="relative"
            >
              {!session && (
                <Badge variant="locked" className="absolute top-2 right-2">
                  🔒
                </Badge>
              )}
              <CardTitle>🤖 AI Farm Planning</CardTitle>
              <CardDescription>Complete farm planning with AI recommendations</CardDescription>
            </Card>

            <Card href="/tools/calculators" variant="bordered" className="relative">
              <Badge variant="public" className="absolute top-2 right-2">
                Public
              </Badge>
              <CardTitle>💰 Financial Tools</CardTitle>
              <CardDescription>6 calculators + unified reports & analytics</CardDescription>
            </Card>

            <Card
              href={session ? '/tools/dashboard' : '/auth/signin?callbackUrl=/tools/dashboard'}
              variant="bordered"
              className="relative"
            >
              {!session && (
                <Badge variant="locked" className="absolute top-2 right-2">
                  🔒
                </Badge>
              )}
              <CardTitle>📊 Dashboard</CardTitle>
              <CardDescription>Unified overview with financial metrics</CardDescription>
            </Card>

            <Card href="/tools/templates" variant="bordered" className="relative">
              <Badge variant="public" className="absolute top-2 right-2">
                Public
              </Badge>
              <CardTitle>📚 Crop Templates</CardTitle>
              <CardDescription>Browse pre-built crop profiles</CardDescription>
            </Card>
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
            <Card href="/docs/diversified-farm-plan" variant="bordered">
              <CardTitle>🌾 Main Business Plan Template</CardTitle>
              <CardDescription>
                Comprehensive agricultural business planning framework
              </CardDescription>
            </Card>

            <Card href="/docs/executive-summary" variant="bordered">
              <CardTitle>📋 Executive Summary Template</CardTitle>
              <CardDescription>High-level business plan summary structure</CardDescription>
            </Card>

            <Card href="/docs/technical-implementation" variant="bordered">
              <CardTitle>🔧 Technical Implementation</CardTitle>
              <CardDescription>Technical specifications and implementation details</CardDescription>
            </Card>

            <Card href="/docs/financial-analysis" variant="bordered">
              <CardTitle>💰 Financial Analysis Framework</CardTitle>
              <CardDescription>Financial modeling and projection tools</CardDescription>
            </Card>

            <Card href="/docs/operations-manual" variant="bordered">
              <CardTitle>⚙️ Operations Manual</CardTitle>
              <CardDescription>Daily operations and maintenance procedures</CardDescription>
            </Card>

            <Card href="/docs/market-strategy" variant="bordered">
              <CardTitle>🛒 Market Strategy</CardTitle>
              <CardDescription>Marketing and sales planning guide</CardDescription>
            </Card>

            <Card href="/docs/risk-management" variant="bordered">
              <CardTitle>⚠️ Risk Management</CardTitle>
              <CardDescription>Risk assessment and mitigation frameworks</CardDescription>
            </Card>

            <Card href="/docs/implementation-timeline" variant="bordered">
              <CardTitle>📅 Implementation Timeline</CardTitle>
              <CardDescription>Project timeline and milestone templates</CardDescription>
            </Card>
          </Grid>
        </Section>
      </Container>
    </main>
  )
}
