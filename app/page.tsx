'use client'

import { Container } from '@/components/ui'
import { useSession } from 'next-auth/react'
import { HOME_CONFIG } from '@/lib/home-page-config'
import {
  AccountBenefitsSection,
  DocumentationSection,
  FeaturesSection,
  HeroSection,
  PublicResourcesSection,
  QuickStartSection,
  ToolsSection,
} from '@/components/home-page-sections'

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

        <DocumentationSection documentation={HOME_CONFIG.documentation} />
      </Container>
    </main>
  )
}
