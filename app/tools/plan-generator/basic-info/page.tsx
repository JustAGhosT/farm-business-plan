'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormInput, useFormValidation } from '@/components/FormValidation'

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

  // Validation rules
  const validationRules = {
    farmName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Farm name must be between 2 and 100 characters'
    },
    ownerName: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Owner name must be between 2 and 100 characters'
    },
    location: {
      required: true,
      minLength: 3,
      message: 'Please provide a valid location'
    },
    farmSize: {
      required: true,
      min: 0.01,
      max: 100000,
      message: 'Farm size must be greater than 0'
    },
    contactEmail: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    contactPhone: {
      pattern: /^[\d\s\+\-\(\)]+$/,
      message: 'Please enter a valid phone number'
    }
  }

  const { errors, validateForm, handleBlur, getError } = useFormValidation(validationRules)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm(formData)) {
      return
    }

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
            <FormInput
              label="Farm Name"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('farmName')}
              required
              placeholder="e.g., Green Valley Farm"
            />

            <FormInput
              label="Owner/Manager Name"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('ownerName')}
              required
              placeholder="Your name"
            />

            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('location')}
              required
              placeholder="City, Province/State, Country"
              helpText="Provide your farm's location for climate and market analysis"
            />

            <FormInput
              label="Farm Size (hectares)"
              name="farmSize"
              type="number"
              value={formData.farmSize}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('farmSize')}
              required
              step="0.1"
              min="0.01"
              placeholder="e.g., 1.5"
              helpText="Total area available for farming activities"
            />

            <FormInput
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('contactEmail')}
              placeholder="your@email.com"
              helpText="Optional: For sharing and collaboration"
            />

            <FormInput
              label="Contact Phone"
              name="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError('contactPhone')}
              placeholder="+1 234 567 8900"
              helpText="Optional: Include country code"
            />

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
