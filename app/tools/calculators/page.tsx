import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Calculators | Agricultural Business Plan',
  description: 'Financial modeling tools for agricultural operations',
}

export default function CalculatorsPage() {
  const calculators = [
    {
      title: 'ROI Calculator',
      description: 'Calculate Return on Investment for your farm operations',
      icon: '📈',
      href: '/tools/calculators/roi',
      color:
        'border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-600',
    },
    {
      title: 'Break-Even Analysis',
      description: 'Determine your break-even point for production and sales',
      icon: '⚖️',
      href: '/tools/calculators/break-even',
      color:
        'border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-600',
    },
    {
      title: 'Investment Calculator',
      description: 'Plan your startup investment and funding requirements',
      icon: '💰',
      href: '/tools/calculators/investment',
      color:
        'border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-600',
    },
    {
      title: 'Revenue Projections',
      description: 'Project revenue based on yield and market prices',
      icon: '📊',
      href: '/tools/calculators/revenue',
      color:
        'border-yellow-300 dark:border-yellow-700 hover:border-yellow-500 dark:hover:border-yellow-600',
    },
    {
      title: 'Operating Costs',
      description: 'Calculate monthly and annual operating expenses',
      icon: '💸',
      href: '/tools/calculators/operating-costs',
      color: 'border-red-300 dark:border-red-700 hover:border-red-500 dark:hover:border-red-600',
    },
    {
      title: 'Loan Calculator',
      description: 'Calculate loan payments and interest costs',
      icon: '🏦',
      href: '/tools/calculators/loan',
      color:
        'border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-600',
    },
  ]

  const features = [
    {
      title: 'Financial Dashboard',
      description: 'Comprehensive overview of all your financial metrics and trends',
      icon: '📊',
      href: '/tools/calculators/dashboard',
      color:
        'border-primary-300 dark:border-primary-700 hover:border-primary-500 dark:hover:border-primary-600',
    },
    {
      title: 'Scenario Comparison',
      description: 'Compare multiple investment scenarios, crops, and what-if analyses side-by-side',
      icon: '🔄',
      href: '/tools/calculators/scenarios',
      color:
        'border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-600',
    },
    {
      title: 'Calculator History',
      description: 'View and compare all your saved calculations with interactive charts',
      icon: '📋',
      href: '/tools/calculators/history',
      color:
        'border-teal-300 dark:border-teal-700 hover:border-teal-500 dark:hover:border-teal-600',
    },
    {
      title: 'Financial Reports',
      description: 'Generate comprehensive reports with PDF and CSV export',
      icon: '📈',
      href: '/tools/reports',
      color:
        'border-pink-300 dark:border-pink-700 hover:border-pink-500 dark:hover:border-pink-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-all font-medium group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 mb-10 border border-gray-100 dark:border-gray-700">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Financial Calculators
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Use these tools to create accurate financial projections for your agricultural business
            plan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className={`block bg-white dark:bg-gray-800 p-8 rounded-xl border-2 ${calc.color} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}
            >
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
                {calc.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{calc.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {calc.description}
              </p>
              <div className="text-primary-600 dark:text-primary-400 font-bold flex items-center group-hover:gap-3 gap-2 transition-all">
                Open Calculator
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Analysis Tools Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Analysis & Reporting Tools
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`block bg-white dark:bg-gray-800 p-8 rounded-xl border-2 ${feature.color} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-primary-600 dark:text-primary-400 font-bold flex items-center group-hover:gap-3 gap-2 transition-all">
                  View {feature.title}
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-l-4 border-blue-500 dark:border-blue-600 p-8 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Use These Tools
          </h3>
          <ul className="space-y-3 text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
              <span>Each calculator is designed for specific financial analysis needs</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
              <span>Input your actual or estimated data for accurate projections</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
              <span>Results can be exported or saved for your business plan</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-3 mt-1">•</span>
              <span>Use multiple calculators together for comprehensive financial planning</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
