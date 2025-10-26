'use client'

import { Card } from '@/components/Card'
import { ErrorMessage } from '@/lib/error-handling'
import { useLoadingState } from '@/lib/hooks/useLoadingState'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface CalculatorRedirectProps {
  calculatorType: string
  calculatorName: string
  calculatorIcon: string
}

export default function CalculatorRedirect({
  calculatorType,
  calculatorName,
  calculatorIcon,
}: CalculatorRedirectProps) {
  const router = useRouter()
  const { loading, error, executeWithLoading } = useLoadingState()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    executeWithLoading(async () => {
      // Add a small delay to show the redirect message
      await new Promise((resolve) => {
        timeoutId = setTimeout(resolve, 1500)
      })

      // Redirect to unified calculator with the specific calculator pre-selected
      router.push(`/tools/calculators/unified?calculator=${calculatorType}`)
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [calculatorType, router, executeWithLoading])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage error={error} />
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/tools/calculators')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Calculators
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="py-8">
            <div className="text-6xl mb-4">{calculatorIcon}</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {calculatorName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Redirecting to the unified calculator interface...
            </p>

            {loading && (
              <div className="flex items-center justify-center" role="status" aria-busy="true">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
                  aria-hidden="true"
                ></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300" aria-live="polite">
                  Loading...
                </span>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>✨ New Feature:</strong> All calculators are now available in a unified
                interface where you can switch between different calculator types seamlessly.
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => router.push('/tools/calculators')}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                ← Back to Calculators
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
