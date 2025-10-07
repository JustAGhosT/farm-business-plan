'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'location' | 'climate' | 'crops' | 'financials' | 'timeline' | 'recommendations'

interface WizardData {
  location: string
  province: string
  farmSize: string
  climate: {
    avgTempSummer: string
    avgTempWinter: string
    annualRainfall: string
    frostRisk: string
  }
  crops: string[]
  budget: string
  timeline: string
}

export default function AIWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('location')
  const [data, setData] = useState<WizardData>({
    location: '',
    province: '',
    farmSize: '',
    climate: {
      avgTempSummer: '',
      avgTempWinter: '',
      annualRainfall: '',
      frostRisk: 'no'
    },
    crops: [],
    budget: '',
    timeline: ''
  })

  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  const steps: { id: Step; title: string; icon: string }[] = [
    { id: 'location', title: 'Location & Size', icon: '📍' },
    { id: 'climate', title: 'Climate Data', icon: '🌡️' },
    { id: 'crops', title: 'Crop Selection', icon: '🌱' },
    { id: 'financials', title: 'Budget & Goals', icon: '💰' },
    { id: 'timeline', title: 'Timeline', icon: '📅' },
    { id: 'recommendations', title: 'AI Recommendations', icon: '🤖' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const generateAIRecommendations = () => {
    // Simulated AI recommendations based on input data
    const recommendations: string[] = []

    // Climate-based recommendations
    if (parseInt(data.climate.annualRainfall) < 600) {
      recommendations.push('Low rainfall area detected. Consider drought-resistant crops like Moringa, Dragon Fruit, or dry-land crops.')
      recommendations.push('Implement drip irrigation for water efficiency.')
    } else if (parseInt(data.climate.annualRainfall) > 1000) {
      recommendations.push('High rainfall area. Perfect for crops like Lucerne, vegetables, and high-water-demand crops.')
    }

    // Temperature-based recommendations
    if (parseInt(data.climate.avgTempSummer) > 30) {
      recommendations.push('Hot climate detected. Dragon Fruit and heat-tolerant crops recommended.')
      recommendations.push('Consider shade structures for sensitive crops.')
    }

    if (data.climate.frostRisk === 'yes') {
      recommendations.push('Frost risk identified. Avoid frost-sensitive crops or implement frost protection measures.')
    }

    // Budget-based recommendations
    const budget = parseInt(data.budget)
    if (budget < 100000) {
      recommendations.push('Starting budget: Focus on low-capital crops like leafy vegetables, herbs (Basil), or small-scale Moringa.')
      recommendations.push('Consider phased investment approach - start small and expand.')
    } else if (budget < 300000) {
      recommendations.push('Medium budget: You can start with Dragon Fruit (1-2 hectares) or mixed vegetable production.')
      recommendations.push('Allocate 20% for infrastructure, 30% for inputs, 50% for working capital.')
    } else {
      recommendations.push('Strong budget: Consider diversified operation with multiple high-value crops.')
      recommendations.push('Invest in quality infrastructure and irrigation systems.')
    }

    // Crop-specific recommendations
    if (data.crops.includes('dragon-fruit')) {
      recommendations.push('Dragon Fruit: Expected ROI of 40-60% annually. 18-24 months to first harvest.')
      recommendations.push('Recommended tools: ROI Calculator, Break-Even Analysis, Investment Calculator')
    }

    if (data.crops.includes('moringa')) {
      recommendations.push('Moringa: Fast-growing, 6-8 months to first harvest. Lower capital requirements.')
      recommendations.push('Consider value-added products (powder, tea) for higher margins.')
    }

    if (data.crops.includes('vegetables')) {
      recommendations.push('Vegetables: Quick returns (2-4 months), but require intensive management.')
      recommendations.push('Focus on high-demand local varieties for better market access.')
    }

    // Farm size recommendations
    const size = parseFloat(data.farmSize)
    if (size < 1) {
      recommendations.push('Small farm: Focus on high-value crops per square meter.')
      recommendations.push('Consider intensive methods like hydroponics or vertical farming.')
    } else if (size > 5) {
      recommendations.push('Larger farm: Implement crop rotation and diversification strategies.')
      recommendations.push('Consider mechanization to reduce labor costs.')
    }

    // Timeline recommendations
    if (data.timeline === 'immediate') {
      recommendations.push('Immediate start: Begin with quick-growing crops (vegetables, herbs) for cash flow.')
      recommendations.push('Use revenue from fast crops to fund longer-term investments.')
    }

    // Tool recommendations
    recommendations.push('Next steps: Use Financial Calculators to validate projections.')
    recommendations.push('Visit Templates Library to explore detailed crop profiles.')
    recommendations.push('Review Operations Manual for daily management guidelines.')

    setAiRecommendations(recommendations)
  }

  const handleNext = () => {
    if (currentStep === 'timeline') {
      generateAIRecommendations()
      setCurrentStep('recommendations')
    } else {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].id)
      }
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  const handleComplete = () => {
    // Save data to localStorage
    localStorage.setItem('aiWizardData', JSON.stringify(data))
    localStorage.setItem('aiRecommendations', JSON.stringify(aiRecommendations))
    router.push('/tools/dashboard')
  }

  const cropOptions = [
    { id: 'dragon-fruit', name: 'Dragon Fruit', icon: '🐉' },
    { id: 'moringa', name: 'Moringa', icon: '🌿' },
    { id: 'lucerne', name: 'Lucerne (Alfalfa)', icon: '🌾' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'fruits', name: 'Other Fruits', icon: '🍓' },
    { id: 'herbs', name: 'Herbs', icon: '🌱' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Farm Planning Wizard</h1>
            <p className="text-gray-600">Get personalized recommendations based on your location, climate, and goals</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${
                    index < currentStepIndex ? 'bg-primary-600 text-white' : 
                    index === currentStepIndex ? 'bg-primary-100 border-2 border-primary-600' :
                    'bg-gray-100'
                  }`}>
                    {index < currentStepIndex ? '✓' : step.icon}
                  </div>
                  <span className="text-xs text-center hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 'location' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">📍 Location & Farm Size</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location / Town *
                    </label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => setData({ ...data, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Bela Bela, Polokwane"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={data.province}
                      onChange={(e) => setData({ ...data, province: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Province</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="North West">North West</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Size (hectares) *
                    </label>
                    <input
                      type="number"
                      value={data.farmSize}
                      onChange={(e) => setData({ ...data, farmSize: e.target.value })}
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 2.5"
                    />
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> The AI will use your location to provide climate-specific recommendations and suitable crop suggestions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'climate' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🌡️ Climate Information</h2>
                <p className="text-gray-600 mb-6">Help us understand your local climate conditions</p>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Summer Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={data.climate.avgTempSummer}
                        onChange={(e) => setData({ ...data, climate: { ...data.climate, avgTempSummer: e.target.value } })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 28"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Winter Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={data.climate.avgTempWinter}
                        onChange={(e) => setData({ ...data, climate: { ...data.climate, avgTempWinter: e.target.value } })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 16"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      value={data.climate.annualRainfall}
                      onChange={(e) => setData({ ...data, climate: { ...data.climate, annualRainfall: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frost Risk
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="frostRisk"
                          value="no"
                          checked={data.climate.frostRisk === 'no'}
                          onChange={(e) => setData({ ...data, climate: { ...data.climate, frostRisk: e.target.value } })}
                          className="mr-2"
                        />
                        No frost
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="frostRisk"
                          value="yes"
                          checked={data.climate.frostRisk === 'yes'}
                          onChange={(e) => setData({ ...data, climate: { ...data.climate, frostRisk: e.target.value } })}
                          className="mr-2"
                        />
                        Frost occurs
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> You can find this information from your local weather station or agricultural extension office.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'crops' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🌱 Crop Selection</h2>
                <p className="text-gray-600 mb-6">Select crops you&apos;re interested in growing</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {cropOptions.map((crop) => (
                    <div
                      key={crop.id}
                      onClick={() => {
                        if (data.crops.includes(crop.id)) {
                          setData({ ...data, crops: data.crops.filter(c => c !== crop.id) })
                        } else {
                          setData({ ...data, crops: [...data.crops, crop.id] })
                        }
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        data.crops.includes(crop.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{crop.icon}</span>
                        <div>
                          <h3 className="font-semibold">{crop.name}</h3>
                          {data.crops.includes(crop.id) && (
                            <span className="text-xs text-primary-600">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data.crops.length > 0 && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Selected:</strong> {data.crops.length} crop(s). The AI will provide specific recommendations for each.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'financials' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">💰 Budget & Financial Goals</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Investment Budget (ZAR) *
                    </label>
                    <input
                      type="number"
                      value={data.budget}
                      onChange={(e) => setData({ ...data, budget: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 150000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total capital available for startup and first season</p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="font-semibold text-blue-900 mb-2">Budget Guidelines</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Small scale (&lt;R100k): Vegetables, herbs, small plot Moringa</li>
                      <li>• Medium scale (R100k-R300k): Dragon Fruit 1-2ha, mixed vegetables</li>
                      <li>• Large scale (&gt;R300k): Diversified operation, multiple crops</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'timeline' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">📅 Implementation Timeline</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When do you want to start?
                    </label>
                    <select
                      value={data.timeline}
                      onChange={(e) => setData({ ...data, timeline: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="immediate">Immediately (within 1 month)</option>
                      <option value="short">Short-term (1-3 months)</option>
                      <option value="medium">Medium-term (3-6 months)</option>
                      <option value="long">Long-term (6+ months)</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> Consider seasonal factors and crop planting schedules when planning your start date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'recommendations' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🤖 AI Recommendations</h2>
                <p className="text-gray-600 mb-6">Based on your inputs, here are personalized recommendations:</p>
                
                <div className="space-y-3 mb-6">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded">
                      <span className="text-green-600 mr-3 flex-shrink-0">✓</span>
                      <p className="text-sm text-gray-800">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">📋 Your Farm Profile</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><strong>Location:</strong> {data.location}, {data.province}</div>
                    <div><strong>Farm Size:</strong> {data.farmSize} hectares</div>
                    <div><strong>Rainfall:</strong> {data.climate.annualRainfall}mm/year</div>
                    <div><strong>Budget:</strong> R{parseInt(data.budget).toLocaleString()}</div>
                    <div><strong>Selected Crops:</strong> {data.crops.length}</div>
                    <div><strong>Start Timeline:</strong> {data.timeline}</div>
                  </div>
                </div>

                <div className="mt-6 bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
                  <h3 className="font-semibold text-primary-900 mb-2">🎯 Next Steps</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-primary-800">
                    <li>Use Financial Calculators to validate your projections</li>
                    <li>Review crop templates for detailed growing requirements</li>
                    <li>Create your detailed business plan using the Plan Generator</li>
                    <li>Set up your operations dashboard to track progress</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep === 'recommendations' ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Complete & Go to Dashboard
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
