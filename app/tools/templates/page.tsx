'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CropTemplate {
  id: string
  name: string
  category: string
  icon: string
  description: string
  growingPeriod: string
  waterNeeds: string
  sunRequirements: string
  difficulty: string
}

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Get current date/time info
  const currentDate = new Date()
  const currentTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions)

  const templates: CropTemplate[] = [
    {
      id: 'dragon-fruit',
      name: 'Dragon Fruit (Pitaya)',
      category: 'Fruits',
      icon: '🐉',
      description:
        'High-value exotic fruit with wall-farming potential. Low water requirements, ideal for semi-arid climates.',
      growingPeriod: '18-24 months to first harvest',
      waterNeeds: 'Low to Moderate',
      sunRequirements: 'Full Sun',
      difficulty: 'Moderate',
    },
    {
      id: 'moringa',
      name: 'Moringa (Drumstick Tree)',
      category: 'Herbs & Superfoods',
      icon: '🌿',
      description:
        'Fast-growing superfood tree. Leaves harvested for powder production. Drought-tolerant and nutritious.',
      growingPeriod: '6-8 months to first harvest',
      waterNeeds: 'Low',
      sunRequirements: 'Full Sun',
      difficulty: 'Easy',
    },
    {
      id: 'lucerne',
      name: 'Lucerne (Alfalfa)',
      category: 'Forage Crops',
      icon: '🌾',
      description:
        'High-protein fodder crop. Multiple harvests per year. Excellent for livestock feed production.',
      growingPeriod: '60-90 days per cutting',
      waterNeeds: 'Moderate to High',
      sunRequirements: 'Full Sun',
      difficulty: 'Moderate',
    },
    {
      id: 'tomatoes',
      name: 'Tomatoes',
      category: 'Vegetables',
      icon: '🍅',
      description:
        'Popular vegetable crop with high market demand. Requires consistent care and pest management.',
      growingPeriod: '80-100 days',
      waterNeeds: 'Moderate',
      sunRequirements: 'Full Sun',
      difficulty: 'Moderate',
    },
    {
      id: 'lettuce',
      name: 'Lettuce',
      category: 'Vegetables',
      icon: '🥬',
      description: 'Fast-growing leafy vegetable. Ideal for hydroponics or cool-season production.',
      growingPeriod: '45-60 days',
      waterNeeds: 'Moderate',
      sunRequirements: 'Partial Shade',
      difficulty: 'Easy',
    },
    {
      id: 'peppers',
      name: 'Bell Peppers',
      category: 'Vegetables',
      icon: '🫑',
      description:
        'High-value vegetable with good storage life. Multiple harvests from same plants.',
      growingPeriod: '90-120 days',
      waterNeeds: 'Moderate',
      sunRequirements: 'Full Sun',
      difficulty: 'Moderate',
    },
    {
      id: 'herbs-basil',
      name: 'Basil',
      category: 'Herbs',
      icon: '🌱',
      description:
        'Popular culinary herb with high demand. Quick growing and profitable in small spaces.',
      growingPeriod: '40-60 days',
      waterNeeds: 'Moderate',
      sunRequirements: 'Full Sun',
      difficulty: 'Easy',
    },
    {
      id: 'strawberries',
      name: 'Strawberries',
      category: 'Fruits',
      icon: '🍓',
      description:
        'High-value berry crop. Suitable for vertical farming and protected cultivation.',
      growingPeriod: '4-6 months to first harvest',
      waterNeeds: 'Moderate',
      sunRequirements: 'Full Sun',
      difficulty: 'Moderate',
    },
    {
      id: 'kale',
      name: 'Kale',
      category: 'Vegetables',
      icon: '🥬',
      description:
        'Hardy superfood vegetable. Cold-tolerant and nutritious. Growing market demand.',
      growingPeriod: '55-75 days',
      waterNeeds: 'Moderate',
      sunRequirements: 'Full Sun to Partial Shade',
      difficulty: 'Easy',
    },
  ]

  const categories = ['All', 'Fruits', 'Vegetables', 'Herbs', 'Forage Crops']

  // Filter templates by selected category and search query
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Herbs'
          ? template.category.includes('Herbs')
          : template.category === selectedCategory

    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'Moderate':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Difficult':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search input with '/' key
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

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

        {/* Improved Header with Time Context */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📚 Crop Templates Library
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-3">
            {formattedDate} • {currentTime}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Explore pre-built templates for common agricultural crops with detailed growing
            requirements and best practices.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates by name or description... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full px-4 py-3 pl-12 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Filter by Category:
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedCategory === category
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'All' && !searchQuery && ` in ${selectedCategory}`}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <span className="text-4xl mr-3">{template.icon}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
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
                      {template.growingPeriod}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
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
                      Water: {template.waterNeeds}
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <svg
                        className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"
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
                      {template.sunRequirements}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}
                    >
                      {template.difficulty}
                    </span>
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm flex items-center">
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
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-100 dark:border-gray-700 text-center mb-8">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No templates found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* How to Use Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 dark:border-blue-600 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Use Templates
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
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
