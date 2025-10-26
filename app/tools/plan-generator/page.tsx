import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Create Farm Plan | Agricultural Business Plan',
  description: 'Interactive form to create a customized agricultural business plan',
}

export default function PlanGeneratorPage() {
  // Redirect to the unified AI Wizard
  redirect('/tools/ai-wizard')
}
