
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Town {
  id: number
  name: string
  province_id: number
}

interface Province {
  id: number
  name: string
  towns: Town[]
}

export default function LocationStep() {
  const router = useRouter()
  const [locations, setLocations] = useState<Province[]>([])
  const [province, setProvince] = useState('')
  const [town, setTown] = useState('')
  const [towns, setTowns] = useState<Town[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        const data = await response.json()
        setLocations(data.locations)
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }
    fetchLocations()
  }, [])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvinceId = e.target.value
    setProvince(selectedProvinceId)
    setTown('')
    const selectedProvince = locations.find((p) => p.id === parseInt(selectedProvinceId))
    setTowns(selectedProvince ? selectedProvince.towns : [])
  }

  const [suggestedCrops, setSuggestedCrops] = useState<string[]>([])

  const handleSuggestCrops = async () => {
    if (!province || !town) {
      alert('Please select a province and town')
      return
    }

    const selectedProvince = locations.find((p) => p.id === parseInt(province))
    const selectedTown = towns.find((t) => t.id === parseInt(town))

    if (!selectedProvince || !selectedTown) {
      alert('Invalid province or town selected')
      return
    }

    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(
          `/api/suggest-crops?province=${selectedProvince.name}&town=${selectedTown.name}`
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Suggested crops:', data.crops)
        setSuggestedCrops(data.crops)
        return
      } catch (error) {
        console.error('Error fetching crop suggestions:', error)
        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } else {
          alert('Failed to fetch crop suggestions. Please try again.')
        }
      }
    }
  }

  const handleMoreSuggestions = async () => {
    if (!province || !town) {
      alert('Please select a province and town')
      return
    }

    const selectedProvince = locations.find((p) => p.id === parseInt(province))
    const selectedTown = towns.find((t) => t.id === parseInt(town))

    if (!selectedProvince || !selectedTown) {
      alert('Invalid province or town selected')
      return
    }

    try {
      const response = await fetch(
        `/api/more-suggestions?province=${selectedProvince.name}&town=${selectedTown.name}`
      )
      const data = await response.json()
      setSuggestedCrops([...suggestedCrops, ...data.crops])
    } catch (error) {
      console.error('Error fetching more crop suggestions:', error)
      alert('Failed to fetch more crop suggestions. Please try again.')
    }
  }

  const handleNext = () => {
    if (!province || !town) {
      alert('Please select a province and town')
      return
    }

    const wizardData = JSON.parse(sessionStorage.getItem('calculatorWizardData') || '{}')
    wizardData.location = { province, town }
    wizardData.suggestedCrops = suggestedCrops
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
    router.push('/tools/calculators/wizard/investment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">📍</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farm Location</h1>
              <p className="text-gray-600">
                Specify the location of your farm for tailored recommendations.
              </p>
            </div>
          </div>

          <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Step 2 of 7:</strong> Location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <select
                id="province"
                value={province}
                onChange={handleProvinceChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Province</option>
                {locations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">
                Town
              </label>
              <select
                id="town"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                disabled={!province}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="">Select Town</option>
                {towns.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {suggestedCrops.length > 0 && (
            <div className="mt-8" key={suggestedCrops.join(',')}>
              <h2 className="text-lg font-semibold mb-4">Suggested Crops</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedCrops.map((crop) => (
                  <div key={crop} className="bg-gray-100 rounded-lg p-4">
                    {crop}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-8">
            <Link
              href="/tools/calculators/wizard"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSuggestCrops}
                disabled={!province || !town}
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:bg-gray-400"
              >
                Suggest Crops
              </button>
              <button
                onClick={handleMoreSuggestions}
                disabled={!province || !town}
                className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 disabled:bg-gray-400"
              >
                More Suggestions
              </button>
              <button
                onClick={handleNext}
                disabled={!province || !town}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
