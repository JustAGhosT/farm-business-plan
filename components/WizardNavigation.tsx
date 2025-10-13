import Link from 'next/link'

interface WizardNavigationProps {
  currentStep: number
  prevHref?: string
  nextHref?: string
  totalSteps?: number
  stepName: string
}

const steps = [
  { name: 'Setup', href: '/tools/calculators/wizard' },
  { name: 'Investment', href: '/tools/calculators/wizard/investment' },
  { name: 'Revenue', href: '/tools/calculators/wizard/revenue' },
  { name: 'Break-Even', href: '/tools/calculators/wizard/break-even' },
  { name: 'ROI', href: '/tools/calculators/wizard/roi' },
  { name: 'Loan', href: '/tools/calculators/wizard/loan' },
]

export default function WizardNavigation({
  currentStep,
  prevHref,
  nextHref,
  totalSteps = 6,
  stepName,
}: WizardNavigationProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}: {stepName}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Labels */}
      <div className="grid grid-cols-6 gap-2 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className={`text-center ${
              index + 1 === currentStep
                ? 'font-bold text-primary-600'
                : index + 1 < currentStep
                  ? 'text-green-600'
                  : 'text-gray-400'
            }`}
          >
            <div className="text-xs">{step.name}</div>
            {index + 1 < currentStep && <div className="text-xs">✓</div>}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        ) : (
          <Link
            href="/tools/calculators"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          >
            Exit Wizard
          </Link>
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <Link
            href="/tools/calculators"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Finish
          </Link>
        )}
      </div>
    </div>
  )
}
