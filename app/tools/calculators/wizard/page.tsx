'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Crop {
  id: string
  name: string
  percentage: number
}

export default function CalculatorWizard() {
  const router = useRouter()
  const [years, setYears] = useState('5')
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
    },
  ])

  const addCrop = () => {
    setCrops([
      ...crops,
      {
        id: Date.now().toString(),
        name: '',
        percentage: 0,
      },
    ])
  }

  const removeCrop = (id: string) => {
    if (crops.length > 1) {
      setCrops(crops.filter((c) => c.id !== id))
    }
  }

  const updateCrop = (id: string, field: keyof Crop, value: string | number) => {
    setCrops(crops.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const handleStartCalculators = () => {
    // Store the setup data in sessionStorage
    const setupData = {
      years,
      crops: crops.filter((c) => c.name.trim() !== ''),
      totalPercentage,
    }
    
    if (setupData.crops.length === 0) {
      alert('Please add at least one crop with a name')
      return
    }
    
    if (totalPercentage !== 100) {
      alert('Total percentage must equal 100%')
      return
    }

    sessionStorage.setItem('calculatorWizardData', JSON.stringify(setupData))
    
    // Navigate to the first calculator in the sequence
    router.push('/tools/calculators/wizard/investment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/tools/calculators"
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
          Back to Calculators
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">🧭</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calculator Wizard</h1>
              <p className="text-gray-600">
                Set up your crops and timeline once, then navigate through all calculators
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Step 1 of 6:</strong> Farm Setup - Enter your crops and allocation
            </p>
            <div className="mt-2 text-xs text-blue-700">
              Next: Investment → Revenue → Break-Even → ROI → Loan Analysis
            </div>
          </div>

          {/* Global Settings */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div>
              <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-2">
                Planning Period (Years)
              </label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used across all calculators
              </p>
            </div>
          </div>

          {/* Crop Setup */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Crop Allocation</h2>
              <button
                onClick={addCrop}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                + Add Crop
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {crops.map((crop, index) => (
                <div key={crop.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Crop {index + 1}
                      {crop.name ? `: ${crop.name}` : ''}
                    </h3>
                    {crops.length > 1 && (
                      <button
                        onClick={() => removeCrop(crop.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Name *
                      </label>
                      <input
                        type="text"
                        value={crop.name}
                        onChange={(e) => updateCrop(crop.id, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Dragon Fruit, Moringa, Lucerne"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        % of Land/Resources *
                      </label>
                      <input
                        type="number"
                        value={crop.percentage}
                        onChange={(e) =>
                          updateCrop(crop.id, 'percentage', parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Allocation Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Allocation:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      totalPercentage === 100
                        ? 'text-green-600'
                        : totalPercentage > 100
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}
                  >
                    {totalPercentage.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-600">
                    {totalPercentage === 100
                      ? '✓ Ready'
                      : totalPercentage > 100
                        ? '⚠ Over 100%'
                        : '⚠ Under 100%'}
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    totalPercentage === 100
                      ? 'bg-green-600'
                      : totalPercentage > 100
                        ? 'bg-red-600'
                        : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t pt-6">
            <Link
              href="/tools/calculators"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </Link>
            <button
              onClick={handleStartCalculators}
              disabled={totalPercentage !== 100 || crops.filter((c) => c.name.trim()).length === 0}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              Start Calculators
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 How It Works</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Enter your crops and allocate percentages (must total 100%)</li>
              <li>Set your planning timeline (years)</li>
              <li>Navigate through calculators using Next/Back buttons</li>
              <li>Your setup data will be pre-filled in each calculator</li>
              <li>You can modify data in individual calculators as needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
