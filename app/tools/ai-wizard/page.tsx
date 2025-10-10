'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'location' | 'climate' | 'crops' | 'financials' | 'timeline' | 'recommendations'

interface BoundaryPoint {
  lat: number
  lng: number
}

interface CropAllocation {
  cropId: string
  minHectares: string
  maxHectares: string
}

interface WizardData {
  location: string
  province: string
  coordinates: {
    lat: string
    lng: string
  }
  farmSize: string
  farmSizeSource: 'manual' | 'boundary' | 'calculated'
  boundaryPoints: BoundaryPoint[]
  climate: {
    avgTempSummer: string
    avgTempWinter: string
    annualRainfall: string
    frostRisk: string
    autoPopulated: boolean
  }
  crops: string[]
  cropAllocations: CropAllocation[]
  budget: string
  timeline: string
  soilType: string
  waterSource: string
}

export default function AIWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('location')
  const [isLoadingClimate, setIsLoadingClimate] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [data, setData] = useState<WizardData>({
    location: '',
    province: '',
    coordinates: {
      lat: '',
      lng: '',
    },
    farmSize: '',
    farmSizeSource: 'manual',
    boundaryPoints: [],
    climate: {
      avgTempSummer: '',
      avgTempWinter: '',
      annualRainfall: '',
      frostRisk: 'no',
      autoPopulated: false,
    },
    crops: [],
    cropAllocations: [],
    budget: '',
    timeline: '',
    soilType: '',
    waterSource: '',
  })

  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])

  // South African cities/towns for autocomplete
  const southAfricanLocations = [
    'Bela Bela',
    'Polokwane',
    'Tzaneen',
    'Mokopane',
    'Musina',
    'Thohoyandou', // Limpopo
    'Nelspruit (Mbombela)',
    'White River',
    'Barberton',
    'Hazyview',
    'Lydenburg', // Mpumalanga
    'Johannesburg',
    'Pretoria',
    'Midrand',
    'Sandton',
    'Roodepoort',
    'Soweto', // Gauteng
    'Durban',
    'Pietermaritzburg',
    'Richards Bay',
    'Newcastle',
    'Ladysmith', // KwaZulu-Natal
    'Cape Town',
    'Stellenbosch',
    'Paarl',
    'George',
    'Knysna',
    'Mossel Bay', // Western Cape
    'Port Elizabeth (Gqeberha)',
    'East London',
    'Grahamstown (Makhanda)',
    'Uitenhage', // Eastern Cape
    'Kimberley',
    'Upington',
    'Kuruman',
    'Springbok', // Northern Cape
    'Bloemfontein',
    'Welkom',
    'Kroonstad',
    'Bethlehem',
    'Sasolburg', // Free State
    'Rustenburg',
    'Mahikeng',
    'Klerksdorp',
    'Potchefstroom',
    'Brits', // North West
  ]

  // Calculate farm size from boundary points using the Shoelace formula
  const calculateAreaFromBoundary = (points: BoundaryPoint[]): number => {
    if (points.length < 3) return 0

    let area = 0
    const n = points.length

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += points[i].lat * points[j].lng
      area -= points[j].lat * points[i].lng
    }

    area = Math.abs(area) / 2

    // Convert from square degrees to hectares (approximate)
    // 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 * cos(latitude) km
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / n
    const latFactor = 111 * 1000 // meters per degree
    const lngFactor = 111 * 1000 * Math.cos((avgLat * Math.PI) / 180)

    const areaInSquareMeters = area * latFactor * lngFactor
    const hectares = areaInSquareMeters / 10000

    return hectares
  }

  // Detect town name from coordinates using reverse geocoding
  const detectTownFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Use Open-Meteo Geocoding API (free, no API key required)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}`
      )

      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()

      // Get the most relevant result
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        // Return city/town name or admin region
        return result.name || result.admin1 || 'Unknown location'
      }

      return 'Unknown location'
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
      return 'Unknown location'
    }
  }

  // Detect location via IP address
  const detectLocationViaIP = async () => {
    setIsDetectingLocation(true)
    try {
      // Use ipapi.co free API (no key required, 30k requests/month)
      const response = await fetch('https://ipapi.co/json/')

      if (!response.ok) {
        throw new Error('IP location detection failed')
      }

      const ipData = await response.json()

      // Check if it's in South Africa
      if (ipData.country_code === 'ZA') {
        const lat = ipData.latitude
        const lng = ipData.longitude
        const detectedProvince = detectProvinceFromCoordinates(lat, lng)

        setData((prev) => ({
          ...prev,
          coordinates: {
            lat: lat.toString(),
            lng: lng.toString(),
          },
          province: detectedProvince || ipData.region || '',
          location: ipData.city || 'Unknown location',
        }))
      } else {
        // Not in South Africa, just use what we got
        setData((prev) => ({
          ...prev,
          location: ipData.city || 'Unknown location',
          province: ipData.region || '',
        }))
      }
    } catch (error) {
      console.error('Error detecting location via IP:', error)
      alert('Unable to detect location via IP. Please use GPS or enter manually.')
    } finally {
      setIsDetectingLocation(false)
    }
  }

  // Auto-detect user's current location using browser geolocation API
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        // Try to reverse geocode to get town name
        const townName = await detectTownFromCoordinates(lat, lng)
        const detectedProvince = detectProvinceFromCoordinates(lat, lng)

        setData((prev) => ({
          ...prev,
          coordinates: {
            lat: lat.toString(),
            lng: lng.toString(),
          },
          province: detectedProvince,
          location: townName,
        }))

        setIsDetectingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        // Fallback to IP-based detection
        console.log('Falling back to IP-based location detection...')
        detectLocationViaIP()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Detect South African province from coordinates
  const detectProvinceFromCoordinates = (lat: number, lng: number): string => {
    // Approximate province boundaries for South Africa
    // Northern provinces (Limpopo)
    if (lat < -22 && lat > -25 && lng > 28 && lng < 31) return 'Limpopo'
    // Mpumalanga
    if (lat < -24 && lat > -27 && lng > 29 && lng < 32) return 'Mpumalanga'
    // Gauteng
    if (lat < -25.5 && lat > -26.5 && lng > 27.5 && lng < 29) return 'Gauteng'
    // KwaZulu-Natal
    if (lat < -27 && lat > -31 && lng > 29 && lng < 33) return 'KwaZulu-Natal'
    // Western Cape
    if (lat < -32 && lat > -35 && lng > 18 && lng < 24) return 'Western Cape'
    // Eastern Cape
    if (lat < -30 && lat > -34 && lng > 24 && lng < 30) return 'Eastern Cape'
    // Northern Cape
    if (lat < -27 && lat > -31 && lng > 20 && lng < 25) return 'Northern Cape'
    // Free State
    if (lat < -27 && lat > -30 && lng > 26 && lng < 30) return 'Free State'
    // North West
    if (lat < -25 && lat > -28 && lng > 24 && lng < 28) return 'North West'

    // Default - couldn't determine
    return ''
  }

  // Fetch climate data based on location
  const fetchClimateData = async () => {
    if (!data.coordinates.lat || !data.coordinates.lng) {
      // Try to geocode the location first
      if (data.location && data.province) {
        setIsLoadingClimate(true)
        try {
          // Simulated climate data based on South African provinces
          const climateData = getClimateDataForProvince(data.province, data.location)

          setData({
            ...data,
            climate: {
              ...climateData,
              autoPopulated: true,
            },
          })
        } catch (error) {
          console.error('Error fetching climate data:', error)
        } finally {
          setIsLoadingClimate(false)
        }
      }
    } else {
      setIsLoadingClimate(true)
      try {
        // Use coordinates to get more accurate climate data
        const climateData = getClimateDataForCoordinates(
          parseFloat(data.coordinates.lat),
          parseFloat(data.coordinates.lng)
        )

        setData({
          ...data,
          climate: {
            ...climateData,
            autoPopulated: true,
          },
        })
      } catch (error) {
        console.error('Error fetching climate data:', error)
      } finally {
        setIsLoadingClimate(false)
      }
    }
  }

  // Simulated climate data function (in production, this would call a real API)
  const getClimateDataForProvince = (province: string, location: string) => {
    const climateDB: Record<string, any> = {
      Limpopo: {
        avgTempSummer: '28',
        avgTempWinter: '16',
        annualRainfall: '500',
        frostRisk: 'yes',
      },
      Mpumalanga: {
        avgTempSummer: '26',
        avgTempWinter: '14',
        annualRainfall: '750',
        frostRisk: 'yes',
      },
      Gauteng: {
        avgTempSummer: '26',
        avgTempWinter: '12',
        annualRainfall: '650',
        frostRisk: 'yes',
      },
      'KwaZulu-Natal': {
        avgTempSummer: '27',
        avgTempWinter: '18',
        annualRainfall: '1000',
        frostRisk: 'no',
      },
      'Western Cape': {
        avgTempSummer: '24',
        avgTempWinter: '12',
        annualRainfall: '520',
        frostRisk: 'yes',
      },
      'Eastern Cape': {
        avgTempSummer: '25',
        avgTempWinter: '14',
        annualRainfall: '650',
        frostRisk: 'yes',
      },
      'Northern Cape': {
        avgTempSummer: '30',
        avgTempWinter: '14',
        annualRainfall: '200',
        frostRisk: 'yes',
      },
      'Free State': {
        avgTempSummer: '27',
        avgTempWinter: '10',
        annualRainfall: '550',
        frostRisk: 'yes',
      },
      'North West': {
        avgTempSummer: '28',
        avgTempWinter: '12',
        annualRainfall: '500',
        frostRisk: 'yes',
      },
    }

    return (
      climateDB[province] || {
        avgTempSummer: '26',
        avgTempWinter: '14',
        annualRainfall: '600',
        frostRisk: 'no',
      }
    )
  }

  const getClimateDataForCoordinates = (lat: number, lng: number) => {
    // Simulated based on latitude (more sophisticated in production)
    const avgLat = Math.abs(lat)

    if (avgLat < 26) {
      // Northern, hotter
      return {
        avgTempSummer: '30',
        avgTempWinter: '18',
        annualRainfall: '450',
        frostRisk: 'no',
      }
    } else if (avgLat < 28) {
      return {
        avgTempSummer: '27',
        avgTempWinter: '14',
        annualRainfall: '600',
        frostRisk: 'yes',
      }
    } else {
      // Southern, cooler
      return {
        avgTempSummer: '24',
        avgTempWinter: '12',
        annualRainfall: '550',
        frostRisk: 'yes',
      }
    }
  }

  // Autopopulate budget recommendations based on farm size and crops
  const getRecommendedBudget = () => {
    const size = parseFloat(data.farmSize) || 0
    const cropCount = data.crops.length

    if (size === 0 || cropCount === 0) return ''

    // Base cost per hectare varies by crop complexity
    let costPerHectare = 50000 // Base for simple crops

    if (data.crops.includes('dragon-fruit')) {
      costPerHectare = 150000 // High infrastructure cost
    } else if (data.crops.includes('moringa') || data.crops.includes('lucerne')) {
      costPerHectare = 70000 // Medium cost
    } else if (data.crops.includes('vegetables')) {
      costPerHectare = 80000 // Medium-high for intensive management
    }

    const estimatedBudget = Math.round(size * costPerHectare)
    return estimatedBudget.toString()
  }

  // Autopopulate soil and water recommendations
  const getSoilRecommendation = () => {
    if (data.province === 'Limpopo' || data.province === 'Northern Cape') {
      return 'Sandy loam with low organic matter - may require amendments'
    } else if (data.province === 'KwaZulu-Natal') {
      return 'Clay-rich soils with good water retention'
    } else if (data.province === 'Western Cape') {
      return 'Sandy or alluvial soils - good drainage'
    }
    return 'Mixed soil types - conduct soil test for specifics'
  }

  const getWaterSourceRecommendation = () => {
    const rainfall = parseInt(data.climate.annualRainfall) || 0

    if (rainfall < 400) {
      return 'Borehole or municipal water essential - very low rainfall'
    } else if (rainfall < 600) {
      return 'Supplementary irrigation required - moderate rainfall'
    } else if (rainfall > 900) {
      return 'Rainwater harvesting viable - high rainfall area'
    }
    return 'Mixed sources recommended - seasonal variation'
  }

  const steps: { id: Step; title: string; icon: string }[] = [
    { id: 'location', title: 'Location & Size', icon: '📍' },
    { id: 'climate', title: 'Climate Data', icon: '🌡️' },
    { id: 'crops', title: 'Crop Selection', icon: '🌱' },
    { id: 'financials', title: 'Budget & Goals', icon: '💰' },
    { id: 'timeline', title: 'Timeline', icon: '📅' },
    { id: 'recommendations', title: 'AI Recommendations', icon: '🤖' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const generateAIRecommendations = () => {
    // Simulated AI recommendations based on input data
    const recommendations: string[] = []

    // Climate-based recommendations
    if (parseInt(data.climate.annualRainfall) < 600) {
      recommendations.push(
        'Low rainfall area detected. Consider drought-resistant crops like Moringa, Dragon Fruit, or dry-land crops.'
      )
      recommendations.push('Implement drip irrigation for water efficiency.')
    } else if (parseInt(data.climate.annualRainfall) > 1000) {
      recommendations.push(
        'High rainfall area. Perfect for crops like Lucerne, vegetables, and high-water-demand crops.'
      )
    }

    // Temperature-based recommendations
    if (parseInt(data.climate.avgTempSummer) > 30) {
      recommendations.push(
        'Hot climate detected. Dragon Fruit and heat-tolerant crops recommended.'
      )
      recommendations.push('Consider shade structures for sensitive crops.')
    }

    if (data.climate.frostRisk === 'yes') {
      recommendations.push(
        'Frost risk identified. Avoid frost-sensitive crops or implement frost protection measures.'
      )
    }

    // Budget-based recommendations
    const budget = parseInt(data.budget)
    if (budget < 100000) {
      recommendations.push(
        'Starting budget: Focus on low-capital crops like leafy vegetables, herbs (Basil), or small-scale Moringa.'
      )
      recommendations.push('Consider phased investment approach - start small and expand.')
    } else if (budget < 300000) {
      recommendations.push(
        'Medium budget: You can start with Dragon Fruit (1-2 hectares) or mixed vegetable production.'
      )
      recommendations.push(
        'Allocate 20% for infrastructure, 30% for inputs, 50% for working capital.'
      )
    } else {
      recommendations.push(
        'Strong budget: Consider diversified operation with multiple high-value crops.'
      )
      recommendations.push('Invest in quality infrastructure and irrigation systems.')
    }

    // Crop-specific recommendations
    if (data.crops.includes('dragon-fruit')) {
      recommendations.push(
        'Dragon Fruit: Expected ROI of 40-60% annually. 18-24 months to first harvest.'
      )
      recommendations.push(
        'Recommended tools: ROI Calculator, Break-Even Analysis, Investment Calculator'
      )
    }

    if (data.crops.includes('moringa')) {
      recommendations.push(
        'Moringa: Fast-growing, 6-8 months to first harvest. Lower capital requirements.'
      )
      recommendations.push('Consider value-added products (powder, tea) for higher margins.')
    }

    if (data.crops.includes('vegetables')) {
      recommendations.push(
        'Vegetables: Quick returns (2-4 months), but require intensive management.'
      )
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
      recommendations.push(
        'Immediate start: Begin with quick-growing crops (vegetables, herbs) for cash flow.'
      )
      recommendations.push('Use revenue from fast crops to fund longer-term investments.')
    }

    // Tool recommendations
    recommendations.push('Next steps: Use Financial Calculators to validate projections.')
    recommendations.push('Visit Templates Library to explore detailed crop profiles.')
    recommendations.push('Review Operations Manual for daily management guidelines.')

    setAiRecommendations(recommendations)
  }

  const generateAutomationSuggestions = (): string[] => {
    const suggestions: string[] = []

    // Suggest automations based on context
    suggestions.push(
      '🤖 **Weather Integration**: Connect to real-time weather APIs (OpenWeatherMap, WeatherAPI) for accurate forecasts and alerts'
    )
    suggestions.push(
      '📊 **Market Price Tracking**: Automatically fetch current market prices for your crops to optimize selling decisions'
    )
    suggestions.push(
      '💧 **Smart Irrigation**: Implement IoT sensors to automate irrigation based on soil moisture and weather forecasts'
    )
    suggestions.push(
      '📅 **Task Scheduling**: Set up automated reminders for planting, fertilizing, and harvesting based on crop calendars'
    )
    suggestions.push(
      '📈 **Yield Prediction**: Use historical data and ML models to predict harvest yields and plan accordingly'
    )
    suggestions.push(
      '🌱 **Pest & Disease Alerts**: Integrate climate-based pest prediction systems for early warning'
    )
    suggestions.push(
      '💰 **Expense Tracking**: Connect bank accounts or use receipt scanning to automatically track farm expenses'
    )
    suggestions.push(
      '📱 **Mobile Notifications**: Enable push notifications for critical farm events (frost warnings, irrigation needs, harvest time)'
    )
    suggestions.push(
      '🔄 **Crop Rotation Planning**: Auto-generate optimal crop rotation schedules based on soil health and market demand'
    )
    suggestions.push(
      '📊 **Inventory Management**: Track seed, fertilizer, and equipment inventory with low-stock alerts'
    )

    return suggestions
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

  const handleComplete = async () => {
    try {
      // Save to localStorage as backup
      localStorage.setItem('aiWizardData', JSON.stringify(data))
      localStorage.setItem('aiRecommendations', JSON.stringify(aiRecommendations))

      // Create farm plan via API
      const farmPlanResponse = await fetch('/api/farm-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${data.location} Farm Plan`,
          location: data.location,
          province: data.province,
          coordinates:
            data.coordinates.lat && data.coordinates.lng
              ? {
                  lat: parseFloat(data.coordinates.lat),
                  lng: parseFloat(data.coordinates.lng),
                }
              : undefined,
          farm_size: parseFloat(data.farmSize),
          soil_type: data.soilType,
          water_source: data.waterSource,
          status: 'draft',
        }),
      })

      const farmPlanResult = await farmPlanResponse.json()

      if (farmPlanResult.success && farmPlanResult.data) {
        const farmPlanId = farmPlanResult.data.id

        // Create climate data
        if (
          data.climate.avgTempSummer &&
          data.climate.avgTempWinter &&
          data.climate.annualRainfall
        ) {
          await fetch('/api/climate-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              farm_plan_id: farmPlanId,
              avg_temp_summer: parseFloat(data.climate.avgTempSummer),
              avg_temp_winter: parseFloat(data.climate.avgTempWinter),
              annual_rainfall: parseFloat(data.climate.annualRainfall),
              frost_risk: data.climate.frostRisk === 'yes',
              auto_populated: data.climate.autoPopulated,
            }),
          })
        }

        // Create crop plans
        for (const cropId of data.crops) {
          const cropOption = cropOptions.find((c) => c.id === cropId)
          if (cropOption) {
            const cropPlanResponse = await fetch('/api/crop-plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                farm_plan_id: farmPlanId,
                crop_name: cropOption.name,
                planting_area: parseFloat(data.farmSize) / data.crops.length, // Equal distribution
                status: 'planned',
              }),
            })

            // If crop plan created, add financial data
            const cropPlanResult = await cropPlanResponse.json()
            if (cropPlanResult.success && cropPlanResult.data && data.budget) {
              await fetch('/api/financial-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  crop_plan_id: cropPlanResult.data.id,
                  initial_investment: parseFloat(data.budget) / data.crops.length,
                }),
              })
            }
          }
        }

        // Create AI recommendations
        for (const recommendation of aiRecommendations) {
          // Extract category from recommendation text
          let category = 'general'
          if (
            recommendation.toLowerCase().includes('irrigation') ||
            recommendation.toLowerCase().includes('water')
          ) {
            category = 'irrigation'
          } else if (
            recommendation.toLowerCase().includes('budget') ||
            recommendation.toLowerCase().includes('cost')
          ) {
            category = 'financial'
          } else if (recommendation.toLowerCase().includes('crop')) {
            category = 'crop-selection'
          } else if (
            recommendation.toLowerCase().includes('climate') ||
            recommendation.toLowerCase().includes('frost')
          ) {
            category = 'climate'
          }

          await fetch('/api/ai-recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              farm_plan_id: farmPlanId,
              recommendation_text: recommendation,
              category,
              priority: 5,
            }),
          })
        }

        // Navigate to dashboard
        router.push('/tools/dashboard')
      } else {
        console.error('Failed to create farm plan:', farmPlanResult.error)
        // Still navigate to dashboard with localStorage data
        router.push('/tools/dashboard')
      }
    } catch (error) {
      console.error('Error saving farm plan:', error)
      // Still navigate to dashboard with localStorage data
      router.push('/tools/dashboard')
    }
  }

  const cropOptions = [
    { id: 'dragon-fruit', name: 'Dragon Fruit', icon: '🐉' },
    { id: 'moringa', name: 'Moringa', icon: '🌿' },
    { id: 'lucerne', name: 'Lucerne (Alfalfa)', icon: '🌾' },
    { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
    { id: 'fruits', name: 'Other Fruits', icon: '🍓' },
    { id: 'herbs', name: 'Herbs', icon: '🌱' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Farm Planning Wizard</h1>
            <p className="text-gray-600">
              Get personalized recommendations based on your location, climate, and goals
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${
                      index < currentStepIndex
                        ? 'bg-primary-600 text-white'
                        : index === currentStepIndex
                          ? 'bg-primary-100 border-2 border-primary-600'
                          : 'bg-gray-100'
                    }`}
                  >
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
                  {/* Auto-detect location button */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-900 mb-2">
                      📍 Auto-Detect Your Location
                    </h3>
                    <p className="text-sm text-primary-800 mb-3">
                      Use your device&apos;s GPS to automatically detect your current location and
                      coordinates
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <button
                        onClick={detectCurrentLocation}
                        disabled={isDetectingLocation}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isDetectingLocation ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Detecting...
                          </>
                        ) : (
                          '🎯 Use GPS Location'
                        )}
                      </button>
                      <button
                        onClick={detectLocationViaIP}
                        disabled={isDetectingLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {isDetectingLocation ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Detecting...
                          </>
                        ) : (
                          '🌐 Use IP Location'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      GPS is more accurate. IP location is used as fallback if GPS fails.
                    </p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location / Town *
                    </label>
                    <input
                      type="text"
                      list="locations"
                      value={data.location}
                      onChange={(e) => setData({ ...data, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Bela Bela, Polokwane"
                    />
                    <datalist id="locations">
                      {southAfricanLocations.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-500 mt-1">Start typing to see suggestions</p>
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      📍 Optional: Farm Coordinates
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Provide exact coordinates for more accurate climate data
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={data.coordinates.lat}
                          onChange={(e) =>
                            setData({
                              ...data,
                              coordinates: { ...data.coordinates, lat: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., -24.2819"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={data.coordinates.lng}
                          onChange={(e) =>
                            setData({
                              ...data,
                              coordinates: { ...data.coordinates, lng: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., 28.4167"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Size Method *
                    </label>
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="farmSizeSource"
                          value="manual"
                          checked={data.farmSizeSource === 'manual'}
                          onChange={(e) =>
                            setData({
                              ...data,
                              farmSizeSource: 'manual' as 'manual' | 'boundary' | 'calculated',
                            })
                          }
                          className="mr-2"
                        />
                        Manual Entry
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="farmSizeSource"
                          value="boundary"
                          checked={data.farmSizeSource === 'boundary'}
                          onChange={(e) =>
                            setData({
                              ...data,
                              farmSizeSource: 'boundary' as 'manual' | 'boundary' | 'calculated',
                            })
                          }
                          className="mr-2"
                        />
                        Boundary Points
                      </label>
                    </div>

                    {data.farmSizeSource === 'manual' ? (
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
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">
                          🗺️ Define Farm Boundary
                        </h3>
                        <p className="text-sm text-green-800 mb-3">
                          Enter at least 3 corner points (lat, lng) to calculate area
                        </p>

                        {data.boundaryPoints.map((point, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="number"
                              step="0.000001"
                              value={point.lat}
                              onChange={(e) => {
                                const newPoints = [...data.boundaryPoints]
                                newPoints[index].lat = parseFloat(e.target.value) || 0
                                setData({ ...data, boundaryPoints: newPoints })
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Latitude"
                            />
                            <input
                              type="number"
                              step="0.000001"
                              value={point.lng}
                              onChange={(e) => {
                                const newPoints = [...data.boundaryPoints]
                                newPoints[index].lng = parseFloat(e.target.value) || 0
                                setData({ ...data, boundaryPoints: newPoints })
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Longitude"
                            />
                            <button
                              onClick={() => {
                                const newPoints = data.boundaryPoints.filter((_, i) => i !== index)
                                setData({ ...data, boundaryPoints: newPoints })
                              }}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            setData({
                              ...data,
                              boundaryPoints: [...data.boundaryPoints, { lat: 0, lng: 0 }],
                            })
                          }}
                          className="w-full px-4 py-2 border-2 border-dashed border-green-300 rounded-lg text-green-700 hover:bg-green-100 transition-colors mt-2"
                        >
                          + Add Boundary Point
                        </button>

                        {data.boundaryPoints.length >= 3 && (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                const calculatedSize = calculateAreaFromBoundary(
                                  data.boundaryPoints
                                )
                                setData({
                                  ...data,
                                  farmSize: calculatedSize.toFixed(2),
                                  farmSizeSource: 'calculated',
                                })
                              }}
                              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              Calculate Area from Boundary
                            </button>

                            {data.farmSizeSource === 'calculated' && data.farmSize && (
                              <div className="mt-2 p-3 bg-white border border-green-300 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Calculated Area:</strong>{' '}
                                  {parseFloat(data.farmSize).toFixed(2)} hectares
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> The AI will use your location to provide
                      climate-specific recommendations and suitable crop suggestions.
                      {data.coordinates.lat &&
                        data.coordinates.lng &&
                        ' Coordinates will enable precise climate data.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'climate' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🌡️ Climate Information</h2>
                <p className="text-gray-600 mb-6">
                  Help us understand your local climate conditions
                </p>

                <div className="space-y-4">
                  {!data.climate.autoPopulated && (data.location || data.coordinates.lat) && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <h3 className="font-semibold text-primary-900 mb-2">
                        🤖 Auto-Populate Climate Data
                      </h3>
                      <p className="text-sm text-primary-800 mb-3">
                        We can automatically fetch climate data based on your location
                      </p>
                      <button
                        onClick={fetchClimateData}
                        disabled={isLoadingClimate}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {isLoadingClimate ? 'Loading...' : '✨ Auto-Fill Climate Data'}
                      </button>
                    </div>
                  )}

                  {data.climate.autoPopulated && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✓ Climate data auto-populated based on your location. You can adjust values
                        if needed.
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Summer Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={data.climate.avgTempSummer}
                        onChange={(e) =>
                          setData({
                            ...data,
                            climate: {
                              ...data.climate,
                              avgTempSummer: e.target.value,
                              autoPopulated: false,
                            },
                          })
                        }
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
                        onChange={(e) =>
                          setData({
                            ...data,
                            climate: {
                              ...data.climate,
                              avgTempWinter: e.target.value,
                              autoPopulated: false,
                            },
                          })
                        }
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
                      onChange={(e) =>
                        setData({
                          ...data,
                          climate: {
                            ...data.climate,
                            annualRainfall: e.target.value,
                            autoPopulated: false,
                          },
                        })
                      }
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
                          onChange={(e) =>
                            setData({
                              ...data,
                              climate: { ...data.climate, frostRisk: e.target.value },
                            })
                          }
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
                          onChange={(e) =>
                            setData({
                              ...data,
                              climate: { ...data.climate, frostRisk: e.target.value },
                            })
                          }
                          className="mr-2"
                        />
                        Frost occurs
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 Tip:</strong> You can find this information from your local weather
                      station or agricultural extension office.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'crops' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🌱 Crop Selection & Allocation</h2>
                <p className="text-gray-600 mb-6">
                  Select crops you&apos;re interested in growing and allocate land
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {cropOptions.map((crop) => (
                    <div
                      key={crop.id}
                      onClick={() => {
                        if (data.crops.includes(crop.id)) {
                          setData({
                            ...data,
                            crops: data.crops.filter((c) => c !== crop.id),
                            cropAllocations: data.cropAllocations.filter(
                              (a) => a.cropId !== crop.id
                            ),
                          })
                        } else {
                          setData({
                            ...data,
                            crops: [...data.crops, crop.id],
                            cropAllocations: [
                              ...data.cropAllocations,
                              { cropId: crop.id, minHectares: '', maxHectares: '' },
                            ],
                          })
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

                {data.crops.length > 0 && data.farmSize && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-3">📊 Land Allocation</h3>
                    <p className="text-sm text-blue-800 mb-4">
                      Total farm size:{' '}
                      <strong>{parseFloat(data.farmSize).toFixed(2)} hectares</strong>
                    </p>

                    <div className="space-y-3">
                      {data.crops.map((cropId) => {
                        const crop = cropOptions.find((c) => c.id === cropId)
                        const allocation = data.cropAllocations.find((a) => a.cropId === cropId)

                        return (
                          <div
                            key={cropId}
                            className="bg-white rounded-lg p-3 border border-blue-200"
                          >
                            <div className="flex items-center mb-2">
                              <span className="text-2xl mr-2">{crop?.icon}</span>
                              <h4 className="font-semibold">{crop?.name}</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Min Hectares
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={allocation?.minHectares || ''}
                                  onChange={(e) => {
                                    const newAllocations = data.cropAllocations.map((a) =>
                                      a.cropId === cropId
                                        ? { ...a, minHectares: e.target.value }
                                        : a
                                    )
                                    setData({ ...data, cropAllocations: newAllocations })
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="e.g., 0.5"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Max Hectares
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={allocation?.maxHectares || ''}
                                  onChange={(e) => {
                                    const newAllocations = data.cropAllocations.map((a) =>
                                      a.cropId === cropId
                                        ? { ...a, maxHectares: e.target.value }
                                        : a
                                    )
                                    setData({ ...data, cropAllocations: newAllocations })
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="e.g., 1.5"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {(() => {
                      const totalMin = data.cropAllocations.reduce(
                        (sum, a) => sum + (parseFloat(a.minHectares) || 0),
                        0
                      )
                      const totalMax = data.cropAllocations.reduce(
                        (sum, a) => sum + (parseFloat(a.maxHectares) || 0),
                        0
                      )
                      const farmSize = parseFloat(data.farmSize) || 0

                      return (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Min Allocation:</span>
                            <span
                              className={
                                totalMin > farmSize ? 'text-red-600 font-semibold' : 'font-semibold'
                              }
                            >
                              {totalMin.toFixed(2)} ha{' '}
                              {totalMin > farmSize && '⚠️ Exceeds farm size!'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Max Allocation:</span>
                            <span
                              className={
                                totalMax > farmSize ? 'text-red-600 font-semibold' : 'font-semibold'
                              }
                            >
                              {totalMax.toFixed(2)} ha{' '}
                              {totalMax > farmSize && '⚠️ Exceeds farm size!'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Unallocated Land:</span>
                            <span className="font-semibold text-green-600">
                              {Math.max(0, farmSize - totalMax).toFixed(2)} ha available
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {data.crops.length > 0 && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Selected:</strong> {data.crops.length} crop(s). The AI will provide
                      specific recommendations for each crop allocation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'financials' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">💰 Budget & Financial Goals</h2>

                <div className="space-y-4">
                  {data.farmSize && data.crops.length > 0 && !data.budget && (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <h3 className="font-semibold text-primary-900 mb-2">🤖 Recommended Budget</h3>
                      <p className="text-sm text-primary-800 mb-3">
                        Based on your farm size ({parseFloat(data.farmSize).toFixed(2)} ha) and
                        selected crops
                      </p>
                      <button
                        onClick={() => {
                          const recommendedBudget = getRecommendedBudget()
                          setData({ ...data, budget: recommendedBudget })
                        }}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        ✨ Use Recommended Budget: R
                        {parseInt(getRecommendedBudget()).toLocaleString()}
                      </button>
                    </div>
                  )}

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
                    <p className="text-xs text-gray-500 mt-1">
                      Total capital available for startup and first season
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">📋 Additional Information</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soil Type (Auto-detected)
                        </label>
                        <input
                          type="text"
                          value={data.soilType || getSoilRecommendation()}
                          onChange={(e) => setData({ ...data, soilType: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-blue-50"
                          placeholder="Soil type information"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Water Source (Auto-recommended)
                        </label>
                        <input
                          type="text"
                          value={data.waterSource || getWaterSourceRecommendation()}
                          onChange={(e) => setData({ ...data, waterSource: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-blue-50"
                          placeholder="Water source information"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      💡 These fields are auto-populated based on your location and climate. You can
                      edit them if needed.
                    </p>
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
                      <strong>💡 Tip:</strong> Consider seasonal factors and crop planting schedules
                      when planning your start date.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'recommendations' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">🤖 AI Recommendations</h2>
                <p className="text-gray-600 mb-6">
                  Based on your inputs, here are personalized recommendations:
                </p>

                <div className="space-y-3 mb-6">
                  {aiRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded"
                    >
                      <span className="text-green-600 mr-3 flex-shrink-0">✓</span>
                      <p className="text-sm text-gray-800">{rec}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">📋 Your Farm Profile</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong>Location:</strong> {data.location}, {data.province}
                    </div>
                    <div>
                      <strong>Farm Size:</strong> {data.farmSize} hectares
                    </div>
                    <div>
                      <strong>Rainfall:</strong> {data.climate.annualRainfall}mm/year
                    </div>
                    <div>
                      <strong>Budget:</strong> R{parseInt(data.budget).toLocaleString()}
                    </div>
                    <div>
                      <strong>Selected Crops:</strong> {data.crops.length}
                    </div>
                    <div>
                      <strong>Start Timeline:</strong> {data.timeline}
                    </div>
                  </div>
                </div>

                {/* Automation Suggestions Section */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">⚡</span>
                    <h3 className="font-semibold text-purple-900">
                      Future Automation Opportunities
                    </h3>
                  </div>
                  <p className="text-sm text-purple-800 mb-4">
                    Here are ways this wizard and your farm operations can be further automated:
                  </p>
                  <div className="space-y-2">
                    {generateAutomationSuggestions().map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 bg-white rounded-lg border border-purple-100"
                      >
                        <span className="text-purple-500 mr-2 flex-shrink-0 text-sm">•</span>
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700">
                      💡 <strong>Pro Tip:</strong> Start with 1-2 automation features that align
                      with your immediate needs. Weather integration and task scheduling are great
                      starting points for most farms.
                    </p>
                  </div>
                </div>

                <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
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
