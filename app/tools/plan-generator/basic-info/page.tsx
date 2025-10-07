'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BasicInfoForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    farmName: '',
    ownerName: '',
    location: '',
    farmSize: '',
    contactEmail: '',
    contactPhone: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store in localStorage for now (will add proper persistence later)
    localStorage.setItem('farmPlanBasicInfo', JSON.stringify(formData))
    // Navigate to next step
    router.push('/tools/plan-generator/climate-assessment')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link 
          href="/tools/plan-generator" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Plan Generator
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Basic Information</h1>
            <p className="text-gray-600">Step 1 of 6: Tell us about your farm</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-primary-700">Progress</span>
              <span className="text-sm font-medium text-primary-700">17%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '17%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Name *
              </label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                required
                value={formData.farmName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Green Valley Farm"
              />
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                Owner/Manager Name *
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                required
                value={formData.ownerName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="City, Province/State, Country"
              />
            </div>

            <div>
              <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 mb-2">
                Farm Size (hectares) *
              </label>
              <input
                type="number"
                id="farmSize"
                name="farmSize"
                required
                step="0.1"
                min="0"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 1.5"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="flex justify-between pt-6">
              <Link
                href="/tools/plan-generator"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Next: Climate Assessment
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> This information will be used throughout your business plan. 
            You can always come back and edit it later.
          </p>
        </div>
      </div>
    </div>
  )
}
