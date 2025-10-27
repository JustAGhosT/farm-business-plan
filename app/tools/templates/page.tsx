'use client'

import { useCropTemplates } from '@/lib/hooks'
import Link from 'next/link'
import { useState } from 'react'

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Fetch templates from database
  const { cropTemplates, loading } = useCropTemplates({
    is_public: true, // Only show public templates
    ...(selectedCategory !== 'All' ? { category: selectedCategory } : {}),
  })

  const categories = ['All', 'Fruits', 'Vegetables', 'Herbs', 'Forage Crops']

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50'
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-50'
      case 'Difficult':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // Helper to safely get nested properties from technical_specs
  const getSpec = (template: any, key: string): string => {
    return template.technical_specs?.[key] || template.growing_requirements?.[key] || 'N/A'
  }

  const getIcon = (template: any): string => {
    // Try to extract icon from technical_specs or use a default
    return template.technical_specs?.icon || '🌱'
  }

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Crop Templates Library</h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore pre-built templates for common agricultural crops. Each template includes
            detailed growing requirements, financial projections, and best practices.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  category === 'All'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 hover:border-primary-300 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading crop templates...</p>
          </div>
        ) : cropTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'All'
                ? `No ${selectedCategory.toLowerCase()} templates available.`
                : 'No crop templates available in the database.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cropTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-4xl mr-3">{getIcon(template)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                        <span className="text-sm text-gray-500">{template.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{template.description}</p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {getSpec(template, 'growing_period')}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                      </svg>
                      Water: {getSpec(template, 'water_needs')}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {getSpec(template, 'sun_requirements')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {template.growing_requirements?.difficulty && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          template.growing_requirements.difficulty
                        )}`}
                      >
                        {template.growing_requirements.difficulty}
                      </span>
                    )}
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                      View Details
                      <svg
                        className="w-4 h-4 ml-1"
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
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 How to Use Templates</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Select a crop template that matches your climate and market conditions</li>
            <li>Review the growing requirements and financial projections</li>
            <li>Customize the template with your specific data and circumstances</li>
            <li>Use the template as a starting point for your complete business plan</li>
            <li>Combine multiple crop templates for diversified farming systems</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
