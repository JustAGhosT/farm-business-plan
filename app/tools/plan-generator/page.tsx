import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Farm Plan | Agricultural Business Plan',
  description: 'Interactive form to create a customized agricultural business plan',
}

export default function PlanGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Plan Generator</h1>
          <p className="text-lg text-gray-600 mb-8">
            Create a customized agricultural business plan tailored to your specific crops,
            location, and resources.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📝 Interactive Planning Tool
            </h3>
            <p className="text-blue-800">
              This tool will guide you through creating a comprehensive business plan step by step.
              Complete each section to generate your personalized agricultural business plan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/tools/ai-wizard"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start mb-4">
                <span className="text-3xl mr-4">🌱</span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Plan Generator</h3>
                  <p className="text-gray-600">
                    Create your complete farm business plan with AI recommendations and automated analysis
                  </p>
                </div>
              </div>
              <div className="mt-4 text-primary-600 font-medium flex items-center">
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>

            <Link
              href="/tools/templates"
              className="block p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start mb-4">
                <span className="text-3xl mr-4">📚</span>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Browse Templates</h3>
                  <p className="text-gray-600">
                    Explore pre-built templates for common crops and farming systems
                  </p>
                </div>
              </div>
              <div className="mt-4 text-primary-600 font-medium flex items-center">
                View Templates
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll Create</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Executive Summary</h4>
                <p className="text-gray-600">
                  High-level overview of your agricultural operation and business goals
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Technical Implementation Plan</h4>
                <p className="text-gray-600">
                  Detailed specifications for infrastructure, irrigation, and crop management
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Financial Projections</h4>
                <p className="text-gray-600">
                  Comprehensive financial analysis including investment, costs, and revenue
                  forecasts
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Operations Manual</h4>
                <p className="text-gray-600">
                  Daily operations procedures, maintenance schedules, and best practices
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Market Strategy</h4>
                <p className="text-gray-600">
                  Marketing plan, pricing strategy, and sales channels
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary-100 rounded-full p-2 mr-4 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Risk Management Plan</h4>
                <p className="text-gray-600">
                  Identification and mitigation strategies for potential risks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
