'use client'

import { useFarmPlans } from '@/lib/hooks/useFarmPlans'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Step =
  | 'farm-selection'
  | 'basic-info'
  | 'location'
  | 'climate'
  | 'crops'
  | 'financials'
  | 'timeline'
  | 'calculators'
  | 'recommendations'

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
  // Farm Selection
  selectedFarmId: string | null
  // Basic Info
  farmName: string
  ownerName: string
  contactEmail: string
  contactPhone: string
  // Location & Size
  location: string
  province: string
  coordinates: {
    lat: string
    lng: string
  }
  farmSize: string
  farmSizeSource: 'manual' | 'boundary' | 'calculated'
  boundaryPoints: BoundaryPoint[]
  // Climate
  climate: {
    avgTempSummer: string
    avgTempWinter: string
    annualRainfall: string
    frostRisk: string
    autoPopulated: boolean
  }
  // Crops
  crops: string[]
  cropAllocations: CropAllocation[]
  // Financials
  budget: string
  timeline: string
  soilType: string
  waterSource: string
}

export default function AIWizardPage() {
  const router = useRouter()
  const { farmPlans, loading: loadingFarms } = useFarmPlans()
  const [currentStep, setCurrentStep] = useState<Step>('farm-selection')
  const [isLoadingClimate, setIsLoadingClimate] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [cropSuggestions, setCropSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [data, setData] = useState<WizardData>({
    // Farm Selection
    selectedFarmId: null,
    // Basic Info
    farmName: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    // Location & Size
    location: '',
    province: '',
    coordinates: {
      lat: '',
      lng: '',
    },
    farmSize: '',
    farmSizeSource: 'manual',
    boundaryPoints: [],
    // Climate
    climate: {
      avgTempSummer: '',
      avgTempWinter: '',
      annualRainfall: '',
      frostRisk: 'no',
      autoPopulated: false,
    },
    // Crops
    crops: [],
    cropAllocations: [],
    // Financials
    budget: '',
    timeline: '',
    soilType: '',
    waterSource: '',
  })

  const [aiRecommendations, setAiRecommendations] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    if (!email) return true // Empty email is allowed (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (currentStep !== 'crops') return
      try {
        setLoadingSuggestions(true)
        const response = await fetch(
          `/api/suggest-crops?province=${data.province}&town=${data.location}`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch crop suggestions')
        }
        const res_data = await response.json()
        setCropSuggestions(res_data.suggestions)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [currentStep, data.province, data.location])

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

  // Calculate farm size from boundary points
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
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / n
    const latFactor = 111 * 1000
    const lngFactor = 111 * 1000 * Math.cos((avgLat * Math.PI) / 180)
    const areaInSquareMeters = area * latFactor * lngFactor
    return areaInSquareMeters / 10000
  }

  // Detect town name from coordinates
  const detectTownFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}`
      )
      if (!response.ok) throw new Error('Reverse geocoding failed')
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
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
      const response = await fetch('https://ipapi.co/json/')
      if (!response.ok) throw new Error('IP location detection failed')
      const ipData = await response.json()
      if (ipData.country_code === 'ZA') {
        const lat = ipData.latitude
        const lng = ipData.longitude
        const detectedProvince = detectProvinceFromCoordinates(lat, lng)
        setData((prev) => ({
          ...prev,
          coordinates: { lat: lat.toString(), lng: lng.toString() },
          province: detectedProvince || ipData.region || '',
          location: ipData.city || 'Unknown location',
        }))
      } else {
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

  // Auto-detect user's current location
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
        const townName = await detectTownFromCoordinates(lat, lng)
        const detectedProvince = detectProvinceFromCoordinates(lat, lng)
        setData((prev) => ({
          ...prev,
          coordinates: { lat: lat.toString(), lng: lng.toString() },
          province: detectedProvince,
          location: townName,
        }))
        setIsDetectingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        detectLocationViaIP()
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Detect South African province from coordinates
  const detectProvinceFromCoordinates = (lat: number, lng: number): string => {
    if (lat < -22 && lat > -25 && lng > 28 && lng < 31) return 'Limpopo'
    if (lat < -24 && lat > -27 && lng > 29 && lng < 32) return 'Mpumalanga'
    if (lat < -25.5 && lat > -26.5 && lng > 27.5 && lng < 29) return 'Gauteng'
    if (lat < -27 && lat > -31 && lng > 29 && lng < 33) return 'KwaZulu-Natal'
    if (lat < -32 && lat > -35 && lng > 18 && lng < 24) return 'Western Cape'
    if (lat < -30 && lat > -34 && lng > 24 && lng < 30) return 'Eastern Cape'
    if (lat < -27 && lat > -31 && lng > 20 && lng < 25) return 'Northern Cape'
    if (lat < -27 && lat > -30 && lng > 26 && lng < 30) return 'Free State'
    if (lat < -25 && lat > -28 && lng > 24 && lng < 28) return 'North West'
    return ''
  }

  // Fetch climate data
  const fetchClimateData = async () => {
    setIsLoadingClimate(true)
    try {
      const climateData =
        data.coordinates.lat && data.coordinates.lng
          ? getClimateDataForCoordinates(
              parseFloat(data.coordinates.lat),
              parseFloat(data.coordinates.lng)
            )
          : getClimateDataForProvince(data.province, data.location)
      setData({ ...data, climate: { ...climateData, autoPopulated: true } })
    } catch (error) {
      console.error('Error fetching climate data:', error)
    } finally {
      setIsLoadingClimate(false)
    }
  }

  // Simulated climate data
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
    const avgLat = Math.abs(lat)
    if (avgLat < 26)
      return { avgTempSummer: '30', avgTempWinter: '18', annualRainfall: '450', frostRisk: 'no' }
    else if (avgLat < 28)
      return { avgTempSummer: '27', avgTempWinter: '14', annualRainfall: '600', frostRisk: 'yes' }
    else
      return { avgTempSummer: '24', avgTempWinter: '12', annualRainfall: '550', frostRisk: 'yes' }
  }

  // Get budget recommendations
  const getRecommendedBudget = () => {
    const size = parseFloat(data.farmSize) || 0
    const cropCount = data.crops.length
    if (size === 0 || cropCount === 0) return ''
    let costPerHectare = 50000
    if (data.crops.includes('dragon-fruit')) costPerHectare = 150000
    else if (data.crops.includes('moringa') || data.crops.includes('lucerne'))
      costPerHectare = 70000
    else if (data.crops.includes('vegetables')) costPerHectare = 80000
    return Math.round(size * costPerHectare).toString()
  }

  // Get soil and water recommendations
  const getSoilRecommendation = () => {
    if (data.province === 'Limpopo' || data.province === 'Northern Cape')
      return 'Sandy loam with low organic matter - may require amendments'
    else if (data.province === 'KwaZulu-Natal') return 'Clay-rich soils with good water retention'
    else if (data.province === 'Western Cape') return 'Sandy or alluvial soils - good drainage'
    return 'Mixed soil types - conduct soil test for specifics'
  }

  const getWaterSourceRecommendation = () => {
    const rainfall = parseInt(data.climate.annualRainfall) || 0
    if (rainfall < 400) return 'Borehole or municipal water essential - very low rainfall'
    else if (rainfall < 600) return 'Supplementary irrigation required - moderate rainfall'
    else if (rainfall > 900) return 'Rainwater harvesting viable - high rainfall area'
    return 'Mixed sources recommended - seasonal variation'
  }

  const steps: { id: Step; title: string; icon: string }[] = [
    { id: 'farm-selection', title: 'Select Farm', icon: '🏡' },
    { id: 'basic-info', title: 'Basic Info', icon: '📝' },
    { id: 'location', title: 'Location & Size', icon: '📍' },
    { id: 'climate', title: 'Climate Data', icon: '🌡️' },
    { id: 'crops', title: 'Crop Selection', icon: '🌱' },
    { id: 'financials', title: 'Budget & Goals', icon: '💰' },
    { id: 'timeline', title: 'Timeline', icon: '📅' },
    { id: 'calculators', title: 'Financial Analysis', icon: '🧮' },
    { id: 'recommendations', title: 'AI Recommendations', icon: '🤖' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const generateAIRecommendations = () => {
    const recommendations: string[] = []
    if (parseInt(data.climate.annualRainfall) < 600) {
      recommendations.push(
        'Low rainfall area detected. Consider drought-resistant crops like Moringa, Dragon Fruit, or dry-land crops.',
        'Implement drip irrigation for water efficiency.'
      )
    } else if (parseInt(data.climate.annualRainfall) > 1000) {
      recommendations.push(
        'High rainfall area. Perfect for crops like Lucerne, vegetables, and high-water-demand crops.'
      )
    }
    if (parseInt(data.climate.avgTempSummer) > 30) {
      recommendations.push(
        'Hot climate detected. Dragon Fruit and heat-tolerant crops recommended.',
        'Consider shade structures for sensitive crops.'
      )
    }
    if (data.climate.frostRisk === 'yes') {
      recommendations.push(
        'Frost risk identified. Avoid frost-sensitive crops or implement frost protection measures.'
      )
    }
    const budget = parseInt(data.budget)
    if (budget < 100000) {
      recommendations.push(
        'Starting budget: Focus on low-capital crops like leafy vegetables, herbs (Basil), or small-scale Moringa.',
        'Consider phased investment approach - start small and expand.'
      )
    } else if (budget < 300000) {
      recommendations.push(
        'Medium budget: You can start with Dragon Fruit (1-2 hectares) or mixed vegetable production.',
        'Allocate 20% for infrastructure, 30% for inputs, 50% for working capital.'
      )
    } else {
      recommendations.push(
        'Strong budget: Consider diversified operation with multiple high-value crops.',
        'Invest in quality infrastructure and irrigation systems.'
      )
    }
    if (data.crops.includes('dragon-fruit')) {
      recommendations.push(
        'Dragon Fruit: Expected ROI of 40-60% annually. 18-24 months to first harvest.',
        'Recommended tools: ROI Calculator, Break-Even Analysis, Investment Calculator'
      )
    }
    if (data.crops.includes('moringa')) {
      recommendations.push(
        'Moringa: Fast-growing, 6-8 months to first harvest. Lower capital requirements.',
        'Consider value-added products (powder, tea) for higher margins.'
      )
    }
    if (data.crops.includes('vegetables')) {
      recommendations.push(
        'Vegetables: Quick returns (2-4 months), but require intensive management.',
        'Focus on high-demand local varieties for better market access.'
      )
    }
    const size = parseFloat(data.farmSize)
    if (size < 1) {
      recommendations.push(
        'Small farm: Focus on high-value crops per square meter.',
        'Consider intensive methods like hydroponics or vertical farming.'
      )
    } else if (size > 5) {
      recommendations.push(
        'Larger farm: Implement crop rotation and diversification strategies.',
        'Consider mechanization to reduce labor costs.'
      )
    }
    if (data.timeline === 'immediate') {
      recommendations.push(
        'Immediate start: Begin with quick-growing crops (vegetables, herbs) for cash flow.',
        'Use revenue from fast crops to fund longer-term investments.'
      )
    }
    recommendations.push(
      'Next steps: Use Financial Calculators to validate projections.',
      'Visit Templates Library to explore detailed crop profiles.',
      'Review Operations Manual for daily management guidelines.'
    )
    setAiRecommendations(recommendations)
  }

  const generateAutomationSuggestions = (): string[] => {
    return [
      '🤖 **Weather Integration**: Connect to real-time weather APIs for accurate forecasts and alerts',
      '📊 **Market Price Tracking**: Automatically fetch current market prices for your crops',
      '💧 **Smart Irrigation**: Implement IoT sensors to automate irrigation',
      '📅 **Task Scheduling**: Set up automated reminders for planting, fertilizing, and harvesting',
      '📈 **Yield Prediction**: Use historical data and ML models to predict harvest yields',
      '🌱 **Pest & Disease Alerts**: Integrate climate-based pest prediction systems',
      '💰 **Expense Tracking**: Connect bank accounts or use receipt scanning to automatically track farm expenses',
      '📱 **Mobile Notifications**: Enable push notifications for critical farm events',
      '🔄 **Crop Rotation Planning**: Auto-generate optimal crop rotation schedules',
      '📊 **Inventory Management**: Track seed, fertilizer, and equipment inventory with low-stock alerts',
    ]
  }

  const handleNext = () => {
    // Handle farm selection
    if (currentStep === 'farm-selection') {
      // If user selected "Create new farm", move to basic-info
      if (data.selectedFarmId === 'new') {
        setCurrentStep('basic-info')
        return
      }
      // If user selected an existing farm, populate data and move to location
      if (data.selectedFarmId) {
        const selectedFarm = farmPlans.find((f) => f.id === data.selectedFarmId)
        if (selectedFarm) {
          setData((prev) => ({
            ...prev,
            farmName: selectedFarm.name,
            location: selectedFarm.location,
            province: selectedFarm.province || '',
            coordinates: {
              lat: selectedFarm.coordinates?.lat?.toString() || '',
              lng: selectedFarm.coordinates?.lng?.toString() || '',
            },
            farmSize: selectedFarm.farm_size?.toString() || '',
            soilType: selectedFarm.soil_type || '',
            waterSource: selectedFarm.water_source || '',
          }))
          setCurrentStep('location')
          return
        }
      }
      // If no selection, don't advance
      return
    }

    // Validate basic-info step
    if (currentStep === 'basic-info') {
      const newErrors: Record<string, string> = {}

      if (!data.farmName.trim()) {
        newErrors.farmName = 'Farm name is required'
      }

      if (!data.ownerName.trim()) {
        newErrors.ownerName = 'Owner/Manager name is required'
      }

      if (data.contactEmail && !validateEmail(data.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address'
      }

      setErrors(newErrors)

      if (Object.keys(newErrors).length > 0) {
        return // Don't advance if there are errors
      }
    }

    if (currentStep === 'timeline') {
      setCurrentStep('calculators')
    } else if (currentStep === 'calculators') {
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
      localStorage.setItem('aiWizardData', JSON.stringify(data))
      localStorage.setItem('aiRecommendations', JSON.stringify(aiRecommendations))
      const farmPlanResponse = await fetch('/api/farm-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.farmName || `${data.location} Farm Plan`,
          location: data.location,
          province: data.province,
          coordinates:
            data.coordinates.lat && data.coordinates.lng
              ? { lat: parseFloat(data.coordinates.lat), lng: parseFloat(data.coordinates.lng) }
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
        for (const cropId of data.crops) {
          const cropOption = cropSuggestions.find((c) => c.id === cropId)
          if (cropOption) {
            const cropPlanResponse = await fetch('/api/crop-plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                farm_plan_id: farmPlanId,
                crop_name: cropOption.name,
                planting_area: parseFloat(data.farmSize) / data.crops.length,
                status: 'planned',
              }),
            })
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
        for (const recommendation of aiRecommendations) {
          let category = 'general'
          if (
            recommendation.toLowerCase().includes('irrigation') ||
            recommendation.toLowerCase().includes('water')
          )
            category = 'irrigation'
          else if (
            recommendation.toLowerCase().includes('budget') ||
            recommendation.toLowerCase().includes('cost')
          )
            category = 'financial'
          else if (recommendation.toLowerCase().includes('crop')) category = 'crop-selection'
          else if (
            recommendation.toLowerCase().includes('climate') ||
            recommendation.toLowerCase().includes('frost')
          )
            category = 'climate'
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
        router.push('/tools/dashboard')
      } else {
        console.error('Failed to create farm plan:', farmPlanResult.error)
        router.push('/tools/dashboard')
      }
    } catch (error) {
      console.error('Error saving farm plan:', error)
      router.push('/tools/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mb-6 transition-colors"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🤖 AI Farm Planning Wizard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create your complete farm business plan with AI-powered recommendations
            </p>
          </div>
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 ${index < currentStepIndex ? 'bg-primary-600 text-white' : index === currentStepIndex ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-600 dark:border-primary-500' : 'bg-gray-100 dark:bg-gray-700'}`}
                  >
                    {index < currentStepIndex ? '✓' : step.icon}
                  </div>
                  <span className="text-xs text-center hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="min-h-[400px]">
            {currentStep === 'farm-selection' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">🏡 Select Your Farm</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Choose an existing farm or create a new one
                </p>
                {loadingFarms ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading your farms...</p>
                  </div>
                ) : farmPlans.length === 0 ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <div className="flex items-start">
                      <div className="text-4xl mr-4">🌱</div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                          No farms yet
                        </h3>
                        <p className="text-blue-800 dark:text-blue-300 mb-4">
                          You don&apos;t have any existing farms. Let&apos;s create your first farm
                          plan!
                        </p>
                        <button
                          onClick={() => {
                            setData({ ...data, selectedFarmId: 'new' })
                            setCurrentStep('basic-info')
                          }}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Create New Farm
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farmPlans.map((farm) => (
                      <button
                        key={farm.id}
                        onClick={() => setData({ ...data, selectedFarmId: farm.id })}
                        className={`w-full p-6 border-2 rounded-lg text-left transition-all ${
                          data.selectedFarmId === farm.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {farm.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              📍 {farm.location}
                              {farm.province && `, ${farm.province}`}
                            </p>
                            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{farm.farm_size} hectares</span>
                              {farm.soil_type && <span>• {farm.soil_type}</span>}
                              {farm.crop_count && farm.crop_count > 0 && (
                                <span>• {farm.crop_count} crops</span>
                              )}
                            </div>
                          </div>
                          {data.selectedFarmId === farm.id && (
                            <div className="text-primary-600 dark:text-primary-400 text-2xl">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => setData({ ...data, selectedFarmId: 'new' })}
                      className={`w-full p-6 border-2 border-dashed rounded-lg text-left transition-all ${
                        data.selectedFarmId === 'new'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">➕</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Create New Farm
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Start a new farm plan from scratch
                          </p>
                        </div>
                        {data.selectedFarmId === 'new' && (
                          <div className="ml-auto text-primary-600 dark:text-primary-400 text-2xl">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
            {currentStep === 'basic-info' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">📝 Basic Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Tell us about your farm and contact information
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Farm Name *
                    </label>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <input
                      type="text"
                      value={data.farmName}
                      onChange={(e) => setData({ ...data, farmName: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        errors.farmName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      placeholder="e.g., Green Valley Farm"
                      aria-required="true"
                      aria-invalid={!!errors.farmName}
                      aria-describedby={errors.farmName ? 'farmName-error' : undefined}
                    />
                    {errors.farmName && (
                      <p
                        id="farmName-error"
                        className="text-xs text-red-600 dark:text-red-400 mt-1"
                      >
                        {errors.farmName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Owner/Manager Name *
                    </label>
                    <input
                      type="text"
                      value={data.ownerName}
                      onChange={(e) => setData({ ...data, ownerName: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        errors.ownerName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      placeholder="Your name"
                      aria-required="true"
                      aria-invalid={!!errors.ownerName}
                      aria-describedby={errors.ownerName ? 'ownerName-error' : undefined}
                    />
                    {errors.ownerName && (
                      <p
                        id="ownerName-error"
                        className="text-xs text-red-600 dark:text-red-400 mt-1"
                      >
                        {errors.ownerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={data.contactEmail}
                      onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                      className={`w-full px-4 py-2 border ${
                        errors.contactEmail
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      placeholder="your@email.com"
                      aria-required="false"
                      aria-invalid={!!errors.contactEmail}
                      aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
                    />
                    {errors.contactEmail ? (
                      <p
                        id="contactEmail-error"
                        className="text-xs text-red-600 dark:text-red-400 mt-1"
                      >
                        {errors.contactEmail}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Optional: For sharing and collaboration
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={data.contactPhone}
                      onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+27 12 345 6789"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Optional: Include country code
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>💡 Tip:</strong> This information will be used throughout your
                      business plan. You can always come back and edit it later.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 'location' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">📍 Location & Farm Size</h2>
                <div className="space-y-4">
                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                    <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-2">
                      📍 Auto-Detect Your Location
                    </h3>
                    <p className="text-sm text-primary-800 dark:text-primary-300 mb-3">
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
                            {' '}
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              {' '}
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>{' '}
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>{' '}
                            </svg>{' '}
                            Detecting...{' '}
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
                            {' '}
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              {' '}
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>{' '}
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>{' '}
                            </svg>{' '}
                            Detecting...{' '}
                          </>
                        ) : (
                          '🌐 Use IP Location'
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      GPS is more accurate. IP location is used as fallback if GPS fails.
                    </p>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location / Town *
                    </label>
                    <input
                      type="text"
                      list="locations"
                      value={data.location}
                      onChange={(e) => setData({ ...data, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Bela Bela, Polokwane"
                    />
                    <datalist id="locations">
                      {southAfricanLocations.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Start typing to see suggestions
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="province-select"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Province *
                    </label>
                    <select
                      id="province-select"
                      value={data.province}
                      onChange={(e) => setData({ ...data, province: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      📍 Optional: Farm Coordinates
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                      Provide exact coordinates for more accurate climate data
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., -24.2819"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., 28.4167"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Farm Size Method *
                    </label>
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center dark:text-gray-300">
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
                      <label className="flex items-center dark:text-gray-300">
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Farm Size (hectares) *
                        </label>
                        <input
                          type="number"
                          value={data.farmSize}
                          onChange={(e) => setData({ ...data, farmSize: e.target.value })}
                          step="0.1"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., 2.5"
                        />
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                          🗺️ Define Farm Boundary
                        </h3>
                        <p className="text-sm text-green-800 dark:text-green-300 mb-3">
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
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg"
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
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg"
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
                          className="w-full px-4 py-2 border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors mt-2"
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
                              <div className="mt-2 p-3 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
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
                <h2 className="text-2xl font-bold mb-4 dark:text-white">🌡️ Climate Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Help us understand your local climate conditions
                </p>
                <div className="space-y-4">
                  {!data.climate.autoPopulated && (data.location || data.coordinates.lat) && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                      <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-2">
                        🤖 Auto-Populate Climate Data
                      </h3>
                      <p className="text-sm text-primary-800 dark:text-primary-300 mb-3">
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
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        ✓ Climate data auto-populated based on your location. You can adjust values
                        if needed.
                      </p>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 28"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 16"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frost Risk
                    </label>
                    <div className="flex gap-4 dark:text-gray-300">
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong>💡 Tip:</strong> You can find this information from your local weather
                      station or agricultural extension office.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 'crops' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                  🌱 Crop Selection & Allocation
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select crops you&apos;re interested in growing and allocate land
                </p>
                {loadingSuggestions ? (
                  <p>Loading crop suggestions...</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {cropSuggestions.map((crop) => (
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
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${data.crops.includes(crop.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'}`}
                      >
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">🌱</span>
                          <div>
                            <h3 className="font-semibold dark:text-white">{crop.name}</h3>
                            {data.crops.includes(crop.id) && (
                              <span className="text-xs text-primary-600 dark:text-primary-400">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {currentStep === 'calculators' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                  🧮 Financial Analysis Tools
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Use our financial calculators to analyze your farm&apos;s profitability and
                  investment requirements
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/tools/calculators/roi" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">📈</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            ROI Calculator
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Calculate Return on Investment for your farm operations
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  <Link href="/tools/calculators/break-even" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">⚖️</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            Break-Even Analysis
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Determine your break-even point for production and sales
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  <Link href="/tools/calculators/investment" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">💰</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            Investment Calculator
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Plan your startup investment and funding requirements
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  <Link href="/tools/calculators/revenue" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">📊</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            Revenue Projections
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Project revenue based on yield and market prices
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  <Link href="/tools/calculators/operating-costs" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">💸</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            Operating Costs
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Calculate monthly and annual operating expenses
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                  <Link href="/tools/calculators/loan" legacyBehavior>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start mb-4">
                        <span className="text-3xl mr-4">🏦</span>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 dark:text-white">
                            Loan Calculator
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Calculate loan payments and interest costs
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                </div>
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>💡 Tip:</strong> Use these calculators to validate your financial
                    projections and get detailed analysis of your farm&apos;s profitability. You can
                    also view your calculation history and generate reports from the dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
