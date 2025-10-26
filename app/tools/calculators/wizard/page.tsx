'use client'

import WizardCropCharts from '@/components/WizardCropCharts'
import WizardScenarioComparison from '@/components/WizardScenarioComparison'
import {
    CROP_TEMPLATES,
    CropTemplate,
    getBalancedPortfolio,
    getHighProfitPortfolio,
    getLowWaterPortfolio,
} from '@/lib/cropTemplates'
import { useWizardSessions } from '@/lib/hooks/useWizardSessions'
import { generateWizardPDF } from '@/lib/wizardPdfExport'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Crop {
  id: string
  name: string
  percentage: number
}

export default function CalculatorWizard() {
  const router = useRouter()
  const [years, setYears] = useState('5')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSavedSessions, setShowSavedSessions] = useState(false)
  const [showScenarioComparison, setShowScenarioComparison] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [totalHectares, setTotalHectares] = useState('10')
  const [exportingPDF, setExportingPDF] = useState(false)
  const [cropSuggestions, setCropSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [crops, setCrops] = useState<Crop[]>([
    {
      id: '1',
      name: '',
      percentage: 100,
    },
  ])

  const { sessions, loading, createSession, deleteSession } = useWizardSessions()
  const hasUserInteracted = useRef(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true)
        const response = await fetch(`/api/suggest-crops?province=&town=`)
        if (!response.ok) {
          throw new Error('Failed to fetch crop suggestions')
        }
        const data = await response.json()
        setCropSuggestions(data.suggestions)
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [])

  const applyTemplate = (templateType: 'balanced' | 'lowWater' | 'highProfit' | string) => {
    let selectedCrops

    switch (templateType) {
      case 'balanced':
        selectedCrops = getBalancedPortfolio()
        break
      case 'lowWater':
        selectedCrops = getLowWaterPortfolio()
        break
      case 'highProfit':
        selectedCrops = getHighProfitPortfolio()
        break
      default:
        const template = CROP_TEMPLATES.find((t) => t.name === templateType)
        if (template) {
          selectedCrops = [template]
        }
        break
    }

    if (selectedCrops) {
      hasUserInteracted.current = true
      const newCrops = selectedCrops.map((template, index) => ({
        id: `template-${templateType}-${index}`,
        name: template.name,
        percentage: template.typicalPercentage,
      }))
      setCrops(newCrops)
      setShowTemplates(false)
    }
  }

  // Persistent counter for generating unique crop IDs
  const getInitialCounter = () => {
    const numericIds = crops
      .map((c) => {
        const match = c.id.match(/crop-(\d+)/)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter((n) => !isNaN(n))
    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1
  }
  const cropIdCounter = useRef(getInitialCounter())

  // Load data from sessionStorage on mount
  useEffect(() => {
    if (hasUserInteracted.current || crops.length > 1 || crops[0].name !== '') {
      return
    }
    const raw = sessionStorage.getItem('calculatorWizardData')
    if (!raw) return
    try {
      const wizardData = JSON.parse(raw)
      if (!wizardData || typeof wizardData !== 'object') return
      if (wizardData.years && typeof wizardData.years === 'number') {
        setYears(wizardData.years.toString())
      }
      if (Array.isArray(wizardData.crops) && wizardData.crops.length > 0) {
        const suggestedCrops = wizardData.crops.map((crop: any, index: number) => ({
          id: `wizard-crop-${index}`,
          name: crop.name || '',
          percentage: typeof crop.percentage === 'number' ? crop.percentage : 0,
        }))
        setCrops(suggestedCrops)
      }
    } catch (e) {
      console.error('Failed to parse calculatorWizardData', e)
    }
  }, [crops])

  const addCrop = () => {
    hasUserInteracted.current = true
    const nextId = `crop-${cropIdCounter.current}`
    cropIdCounter.current++
    setCrops([...crops, { id: nextId, name: '', percentage: 0 }])
  }

  const removeCrop = (id: string) => {
    hasUserInteracted.current = true
    if (crops.length > 1) {
      setCrops(crops.filter((c) => c.id !== id))
    }
  }

  const updateCrop = (id: string, field: keyof Crop, value: string | number) => {
    hasUserInteracted.current = true
    setCrops(crops.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const totalPercentage = crops.reduce((sum, c) => sum + (parseFloat(String(c.percentage)) || 0), 0)

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name')
      return
    }
    if (totalPercentage !== 100) {
      alert(
        `Total percentage must equal 100% before saving. Currently at ${totalPercentage.toFixed(0)}%`
      )
      return
    }
    const validCrops = crops.filter((c) => c.name.trim() !== '')
    if (validCrops.length === 0) {
      alert('Please add at least one crop before saving')
      return
    }
    try {
      await createSession({
        session_name: sessionName,
        years: parseInt(years),
        crops: validCrops,
        total_percentage: totalPercentage,
        total_hectares: parseFloat(totalHectares) || 10,
        current_step: 1,
        step_data: {},
      })
      setSaveMessage('✅ Session saved successfully!')
      setSessionName('')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      alert('Failed to save session. Please try again.')
      console.error('Save error:', error)
    }
  }

  const handleLoadSession = (session: any) => {
    hasUserInteracted.current = true
    setYears(session.years.toString())
    setCrops(session.crops)
    setShowSavedSessions(false)
    setSaveMessage(`✅ Loaded session: ${session.session_name}`)
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleDeleteSession = async (id: string, name: string) => {
    if (confirm(`Delete session "${name}"?`)) {
      try {
        await deleteSession(id)
        setSaveMessage('✅ Session deleted successfully')
        setTimeout(() => setSaveMessage(''), 3000)
      } catch (error) {
        alert('Failed to delete session')
      }
    }
  }

  const handleExportPDF = async () => {
    if (totalPercentage !== 100) {
      alert(
        `Total percentage must equal 100% to export. Currently at ${totalPercentage.toFixed(0)}%`
      )
      return
    }
    const validCrops = crops.filter((c) => c.name.trim() !== '')
    if (validCrops.length === 0) {
      alert('Please add at least one crop before exporting')
      return
    }
    setExportingPDF(true)
    try {
      const fileName = await generateWizardPDF(
        {
          years: parseInt(years),
          crops: validCrops,
          totalPercentage,
        },
        parseFloat(totalHectares) || 10,
        new Map(), // Pass an empty map for now
        sessionName || 'Farm Business Plan'
      )
      setSaveMessage(`✅ PDF exported successfully: ${fileName}`)
      setTimeout(() => setSaveMessage(''), 5000)
    } catch (error) {
      alert('Failed to export PDF. Please try again.')
      console.error('PDF export error:', error)
    } finally {
      setExportingPDF(false)
    }
  }

  const cropTemplateMap = new Map<string, CropTemplate>()
  CROP_TEMPLATES.forEach((t) => cropTemplateMap.set(t.name, t))

  const handleNext = () => {
    const warnings = []
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
      alert(`Total percentage must equal 100%. Currently at ${totalPercentage.toFixed(0)}%`)
      return
    }
    const yearsNum = parseInt(years)
    if (yearsNum > 10)
      warnings.push('Planning period over 10 years may have significant uncertainty')
    if (yearsNum < 3)
      warnings.push('Short planning periods may not show full crop maturity benefits')
    setupData.crops.forEach((crop) => {
      if (crop.percentage < 5)
        warnings.push(
          `${crop.name}: Very low allocation (${crop.percentage}%) may not be economically viable`
        )
      if (crop.percentage > 70)
        warnings.push(
          `${crop.name}: High allocation (${crop.percentage}%) increases risk - consider diversification`
        )
    })
    if (warnings.length > 0) {
      const proceed = confirm(
        `⚠️ Validation Warnings:\n\n${warnings.map((w) => `• ${w}`).join('\n')}\n\nProceed anyway?`
      )
      if (!proceed) return
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(setupData))
    router.push('/tools/calculators/wizard/location')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">🧭</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Calculator Wizard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Set up your crops and timeline once, then navigate through all calculators
              </p>
            </div>
          </div>
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Step 1 of 7:</strong> Farm Setup - Enter your crops and allocation
            </p>
            <div className="mt-2 text-xs text-blue-700 dark:text-blue-400">
              Next: Location → Investment → Revenue → Break-Even → ROI → Loan Analysis
            </div>
          </div>
          <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save & Load Sessions
              </h3>
              <button
                onClick={() => setShowSavedSessions(!showSavedSessions)}
                className="text-sm text-purple-700 hover:text-purple-900 underline"
              >
                {showSavedSessions ? 'Hide' : 'View Saved Sessions'}
              </button>
            </div>
            {saveMessage && (
              <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm">
                {saveMessage}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-purple-700 dark:text-purple-300 mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., My 2025 Farm Plan"
                  className="w-full px-3 py-2 border border-purple-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <button
                onClick={handleSaveSession}
                disabled={!sessionName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save Current Setup
              </button>
            </div>
            {showSavedSessions && (
              <div className="mt-4 border-t border-purple-200 dark:border-purple-700 pt-4">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  Saved Sessions
                </h4>
                {loading ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading sessions...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No saved sessions yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded border border-purple-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">
                            {session.session_name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {session.crops.length} crops • {session.years} years •{' '}
                            {new Date(session.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLoadSession(session)}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id, session.session_name)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Farm Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="years"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Planning Period (Years)
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ℹ️ Recommended: 3-5 years for most crops
                  </span>
                </label>
                <input
                  type="number"
                  id="years"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This timeline will be used across all calculators. Short-term crops: 1-3 years,
                  Perennial crops: 5-10 years
                </p>
              </div>
              <div>
                <label
                  htmlFor="hectares"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Total Land (Hectares)
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ℹ️ Total farm size for analysis
                  </span>
                </label>
                <input
                  type="number"
                  id="hectares"
                  value={totalHectares}
                  onChange={(e) => setTotalHectares(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter total available farmland in hectares (1 hectare ≈ 2.47 acres)
                </p>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Crop Allocation</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Use Template
                </button>
                <button
                  onClick={addCrop}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  + Add Crop
                </button>
              </div>
            </div>
            {showTemplates && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border-2 border-green-300 dark:border-green-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>Quick Start Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Pre-configured crop combinations optimized for Bela Bela, Limpopo region
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <button
                    onClick={() => applyTemplate('balanced')}
                    className="bg-white dark:bg-gray-800 border-2 border-green-400 dark:border-green-600 hover:border-green-600 dark:hover:border-green-500 rounded-lg p-4 text-left transition-all hover:shadow-md"
                  >
                    <div className="font-semibold text-green-700 dark:text-green-400 mb-1">
                      🌾 Balanced Portfolio
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Dragon Fruit (30%), Moringa (25%), Lucerne (20%), Tomatoes (15%), Butternut
                      (10%)
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">
                      ✓ Diversified risk • Mixed profitability
                    </div>
                  </button>
                  <button
                    onClick={() => applyTemplate('lowWater')}
                    className="bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 hover:border-blue-600 dark:hover:border-blue-500 rounded-lg p-4 text-left transition-all hover:shadow-md"
                  >
                    <div className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      💧 Low Water Portfolio
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Moringa (40%), Maize (35%), Butternut (25%)
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">
                      ✓ Drought resistant • Lower water costs
                    </div>
                  </button>
                  <button
                    onClick={() => applyTemplate('highProfit')}
                    className="bg-white dark:bg-gray-800 border-2 border-yellow-400 dark:border-yellow-600 hover:border-yellow-600 dark:hover:border-yellow-500 rounded-lg p-4 text-left transition-all hover:shadow-md"
                  >
                    <div className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                      💰 High Profit Portfolio
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Dragon Fruit (50%), Moringa (50%)
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-500">
                      ✓ Maximum returns • Higher investment
                    </div>
                  </button>
                </div>
                <div className="border-t dark:border-gray-600 pt-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Or choose individual crops:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CROP_TEMPLATES.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => applyTemplate(template.name)}
                        className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600 rounded text-sm transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4 mb-4">
              {loadingSuggestions ? (
                <p>Loading crop suggestions...</p>
              ) : (
                crops.map((crop, index) => (
                  <div
                    key={crop.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Crop {index + 1}
                        {crop.name ? `: ${crop.name}` : ''}
                      </h3>
                      {crops.length > 1 && (
                        <button
                          onClick={() => removeCrop(crop.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          aria-label="Remove crop"
                          title="Remove crop"
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
                        <label
                          htmlFor={`crop-name-${crop.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Crop Name *
                        </label>
                        <select
                          id={`crop-name-${crop.id}`}
                          value={crop.name}
                          onChange={(e) => updateCrop(crop.id, 'name', e.target.value)}
                          className="w-full px-4 py-3 md:py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation text-base"
                          aria-label={`Select crop for ${crop.id}`}
                        >
                          <option value="">Select a crop</option>
                          {cropSuggestions.map((suggestion) => (
                            <option key={suggestion.id} value={suggestion.name}>
                              {suggestion.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          % of Land/Resources *
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ℹ️ Must total 100%
                          </span>
                        </label>
                        <input
                          type="number"
                          value={crop.percentage}
                          onChange={(e) =>
                            updateCrop(crop.id, 'percentage', parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          max="100"
                          step="1"
                          className="w-full px-4 py-3 md:py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation text-base"
                          placeholder="e.g., 50"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Tip: Start with 20-30% for new crops
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Allocation:
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600 dark:text-green-400' : totalPercentage > 100 ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
                  >
                    {totalPercentage.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {totalPercentage === 100
                      ? '✓ Ready'
                      : totalPercentage > 100
                        ? '⚠ Over 100%'
                        : '⚠ Under 100%'}
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${totalPercentage === 100 ? 'bg-green-600' : totalPercentage > 100 ? 'bg-red-600' : 'bg-yellow-600'}`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="border-t dark:border-gray-700 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left-aligned action buttons */}
              <div className="flex w-full sm:w-auto items-center gap-3">
                <button
                  onClick={() => setShowScenarioComparison(true)}
                  disabled={
                    totalPercentage !== 100 || crops.filter((c) => c.name.trim()).length === 0
                  }
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Compare Scenarios
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={
                    exportingPDF ||
                    totalPercentage !== 100 ||
                    crops.filter((c) => c.name.trim()).length === 0
                  }
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  {exportingPDF ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>

              {/* Right-aligned navigation buttons */}
              <div className="flex w-full sm:w-auto items-center gap-3">
                <Link
                  href="/tools/calculators"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300 text-center"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleNext}
                  disabled={
                    totalPercentage !== 100 || crops.filter((c) => c.name.trim()).length === 0
                  }
                  className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  data-testid="wizard-next-button"
                >
                  Next{' '}
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
            </div>
          </div>
          {crops.filter((c) => c.name.trim() !== '').length > 0 && totalPercentage === 100 && (
            <div className="mt-8 border-t dark:border-gray-700 pt-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <svg
                    className="w-7 h-7 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Visual Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Compare crop performance, revenue projections, and profitability across your
                  portfolio
                </p>
              </div>
              <WizardCropCharts crops={crops} years={parseInt(years)} totalHectares={10} />
            </div>
          )}
        </div>
      </div>
      {showScenarioComparison && (
        <WizardScenarioComparison
          cropTemplates={cropTemplateMap}
          onClose={() => setShowScenarioComparison(false)}
          currentPlan={{
            name: 'Current Plan',
            crops: crops.map(({ name, percentage }) => ({ name, percentage })),
            years: parseInt(years),
            totalHectares: parseFloat(totalHectares),
            isSaved: false,
          }}
        />
      )}
    </div>
  )
}
