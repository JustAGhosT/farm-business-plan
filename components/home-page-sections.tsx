'use client'

import { Badge, Card, CardDescription, CardTitle, Container, Grid, Section } from '@/components/ui'
import Link from 'next/link'
import React from 'react'
import { BenefitItem, FeatureItem, ResourceItem, StepItem, ToolItem } from '@/lib/home-page-config'

// Reusable components for home page sections
export interface StepCardProps {
  step: StepItem
  index: number
}

export const StepCard = ({ step, index }: StepCardProps) => (
  <div className="flex items-start group">
    <span className="bg-primary-500 dark:bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-5 mt-1 flex-shrink-0 font-bold shadow-md group-hover:bg-primary-600 dark:group-hover:bg-primary-700 transition-colors">
      {index + 1}
    </span>
    <div>
      <h4 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">{step.title}</h4>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
    </div>
  </div>
)

export interface FeatureCardProps {
  feature: FeatureItem
}

export const FeatureCard = ({ feature }: FeatureCardProps) => (
  <Card hover={true}>
    <div className="text-5xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
  </Card>
)

export interface BenefitCardProps {
  benefit: BenefitItem
}

export const BenefitCard = ({ benefit }: BenefitCardProps) => (
  <div className="text-center">
    <div className="text-5xl mb-4">{benefit.icon}</div>
    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">{benefit.title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
      {benefit.description}
    </p>
  </div>
)

export interface ToolCardProps {
  tool: ToolItem
  session: any
}

export const ToolCard = ({ tool, session }: ToolCardProps) => {
  const href = typeof tool.href === 'function' ? tool.href(session) : tool.href()

  return (
    <Card href={href} variant="bordered" className="relative">
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

export interface ResourceCardProps {
  resource: ResourceItem
}

export const ResourceCard = ({ resource }: ResourceCardProps) => (
  <Card href={resource.href} variant="elevated">
    <CardTitle>{resource.title}</CardTitle>
    <CardDescription>{resource.description}</CardDescription>
  </Card>
)

export interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export const CTAButton = ({ href, children, variant = 'primary' }: CTAButtonProps) => {
  const baseClasses =
    'px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl font-bold text-lg transform hover:scale-105'
  const variantClasses =
    variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-2 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-gray-700'

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </Link>
  )
}

// Section components
export interface HeroSectionProps {
  title: string
  subtitle: string
  session: any
  status: string
}

export const HeroSection = ({ title, subtitle, session, status }: HeroSectionProps) => (
  <div className="text-center mb-16">
    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">{subtitle}</p>

    {status !== 'loading' && (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
        {session ? (
          <CTAButton href="/tools/dashboard">Go to Dashboard →</CTAButton>
        ) : (
          <>
            <CTAButton href="/auth/signin">Sign In</CTAButton>
            <CTAButton href="/auth/register" variant="secondary">
              Get Started Free
            </CTAButton>
          </>
        )}
      </div>
    )}
  </div>
)

export interface PublicResourcesSectionProps {
  resources: ResourceItem[]
}

export const PublicResourcesSection = ({ resources }: PublicResourcesSectionProps) => (
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
      {resources.map((resource, index) => (
        <ResourceCard key={index} resource={resource} />
      ))}
    </Grid>
  </div>
)

export interface FeaturesSectionProps {
  features: FeatureItem[]
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => (
  <Grid cols={{ md: 3 }} gap={8} className="mb-16">
    {features.map((feature, index) => (
      <FeatureCard key={index} feature={feature} />
    ))}
  </Grid>
)

export interface QuickStartSectionProps {
  steps: StepItem[]
}

export const QuickStartSection = ({ steps }: QuickStartSectionProps) => (
  <Section variant="default" className="mb-16">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Quick Start Guide</h2>
    <div className="space-y-6">
      {steps.map((step, index) => (
        <StepCard key={index} step={step} index={index} />
      ))}
    </div>
  </Section>
)

export interface AccountBenefitsSectionProps {
  benefits: BenefitItem[]
}

export const AccountBenefitsSection = ({ benefits }: AccountBenefitsSectionProps) => (
  <Section variant="gradient">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
      Why Create an Account?
    </h2>
    <Grid cols={{ md: 3 }} gap={8} className="mt-8">
      {benefits.map((benefit, index) => (
        <BenefitCard key={index} benefit={benefit} />
      ))}
    </Grid>
    <div className="text-center mt-8">
      <CTAButton href="/auth/register">Create Free Account →</CTAButton>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Or sign in with <span className="font-semibold">Google</span> in just one click!
      </p>
    </div>
  </Section>
)

export interface ToolsSectionProps {
  tools: ToolItem[]
  session: any
}

export const ToolsSection = ({ tools, session }: ToolsSectionProps) => (
  <Section variant="default" className="mb-10">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Interactive Tools</h2>
    <Grid cols={{ md: 2, lg: 4 }}>
      {tools.map((tool, index) => (
        <ToolCard key={index} tool={tool} session={session} />
      ))}
    </Grid>
  </Section>
)

export interface DocumentationSectionProps {
  documentation: ResourceItem[]
}

export const DocumentationSection = ({ documentation }: DocumentationSectionProps) => (
  <Section variant="default">
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Documentation</h2>
      <Badge variant="success" size="md">Free Access - No Login Required</Badge>
    </div>
    <Grid cols={{ md: 2 }}>
      {documentation.map((doc, index) => (
        <ResourceCard key={index} resource={doc} />
      ))}
    </Grid>
  </Section>
)
