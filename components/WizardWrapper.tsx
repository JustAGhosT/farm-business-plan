'use client'

import { WIZARD_STEPS } from '@/lib/wizardSteps'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface WizardWrapperProps {
  children: React.ReactNode
  title: string
  description: string
  step: number
  isFormValid?: boolean
  onNext?: () => void
  onBack?: () => void
}

export default function WizardWrapper({
  children,
  title,
  description,
  step,
  isFormValid = true,
  onNext,
  onBack,
}: WizardWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.path === pathname)

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (currentStepIndex < WIZARD_STEPS.length - 1) {
      router.push(WIZARD_STEPS[currentStepIndex + 1].path)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (currentStepIndex > 0) {
      router.push(WIZARD_STEPS[currentStepIndex - 1].path)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">🧭</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              <p className="text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          </div>

          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>
                Step {step} of {WIZARD_STEPS.length}:
              </strong>{' '}
              {title}
            </p>
          </div>

          {children}

          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Back
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/tools/calculators/wizard"
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Save & Exit
              </Link>
              <button
                onClick={handleNext}
                disabled={!isFormValid}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
