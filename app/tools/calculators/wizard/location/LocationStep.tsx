'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useState } from 'react'

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

export default function LocationStep({ initialLocations }: { initialLocations: Province[] }) {
  const [locations] = useState(initialLocations)
  const [province, setProvince] = useState('')
  const [town, setTown] = useState('')
  const [towns, setTowns] = useState<Town[]>([])
  const [suggestedCrops, setSuggestedCrops] = useState<string[]>([])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvinceId = e.target.value
    setProvince(selectedProvinceId)
    setTown('')
    const selectedProvince = locations.find((p) => p.id === parseInt(selectedProvinceId))
    setTowns(selectedProvince ? selectedProvince.towns : [])
  }

  const fetchSuggestions = async (endpoint: string, append = false) => {
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
        const params = new URLSearchParams({
          province: selectedProvince.name,
          town: selectedTown.name,
        })
        const response = await fetch(`${endpoint}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (append) {
          setSuggestedCrops((prev) => [...prev, ...data.crops])
        } else {
          setSuggestedCrops(data.crops)
        }
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

  const handleNext = () => {
    const wizardData = JSON.parse(sessionStorage.getItem('calculatorWizardData') || '{}')
    wizardData.location = { province, town }
    wizardData.suggestedCrops = suggestedCrops
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="Farm Location"
      description="Specify the location of your farm for tailored recommendations."
      step={2}
      isFormValid={!!province && !!town}
      onNext={handleNext}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="province"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Province
          </label>
          <select
            id="province"
            value={province}
            onChange={handleProvinceChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500"
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
          <label
            htmlFor="town"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Town
          </label>
          <select
            id="town"
            value={town}
            onChange={(e) => setTown(e.target.value)}
            disabled={!province}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
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
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Suggested Crops</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestedCrops.map((crop, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                {crop}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={() => fetchSuggestions('/api/suggest-crops')}
          disabled={!province || !town}
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:bg-gray-400"
        >
          Suggest Crops
        </button>
        <button
          onClick={() => fetchSuggestions('/api/more-suggestions', true)}
          disabled={!province || !town}
          className="inline-flex items-center gap-2 px-6 py-3 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 disabled:bg-gray-400"
        >
          More Suggestions
        </button>
      </div>
    </WizardWrapper>
  )
}
