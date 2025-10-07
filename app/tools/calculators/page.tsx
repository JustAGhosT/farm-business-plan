import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Calculators | Agricultural Business Plan',
  description: 'Financial modeling tools for agricultural operations'
}

export default function CalculatorsPage() {
  const calculators = [
    {
      title: 'ROI Calculator',
      description: 'Calculate Return on Investment for your farm operations',
      icon: '📈',
      href: '/tools/calculators/roi',
      color: 'border-green-300 hover:border-green-500'
    },
    {
      title: 'Break-Even Analysis',
      description: 'Determine your break-even point for production and sales',
      icon: '⚖️',
      href: '/tools/calculators/break-even',
      color: 'border-blue-300 hover:border-blue-500'
    },
    {
      title: 'Investment Calculator',
      description: 'Plan your startup investment and funding requirements',
      icon: '💰',
      href: '/tools/calculators/investment',
      color: 'border-purple-300 hover:border-purple-500'
    },
    {
      title: 'Revenue Projections',
      description: 'Project revenue based on yield and market prices',
      icon: '📊',
      href: '/tools/calculators/revenue',
      color: 'border-yellow-300 hover:border-yellow-500'
    },
    {
      title: 'Operating Costs',
      description: 'Calculate monthly and annual operating expenses',
      icon: '💸',
      href: '/tools/calculators/operating-costs',
      color: 'border-red-300 hover:border-red-500'
    },
    {
      title: 'Loan Calculator',
      description: 'Calculate loan payments and interest costs',
      icon: '🏦',
      href: '/tools/calculators/loan',
      color: 'border-indigo-300 hover:border-indigo-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Financial Calculators</h1>
          <p className="text-lg text-gray-600">
            Use these tools to create accurate financial projections for your agricultural business plan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className={`block bg-white p-6 rounded-lg border-2 ${calc.color} shadow-md hover:shadow-lg transition-all`}
            >
              <div className="text-4xl mb-4">{calc.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{calc.title}</h3>
              <p className="text-gray-600 mb-4">{calc.description}</p>
              <div className="text-primary-600 font-medium flex items-center">
                Open Calculator
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How to Use These Tools</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Each calculator is designed for specific financial analysis needs</li>
            <li>Input your actual or estimated data for accurate projections</li>
            <li>Results can be exported or saved for your business plan</li>
            <li>Use multiple calculators together for comprehensive financial planning</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
