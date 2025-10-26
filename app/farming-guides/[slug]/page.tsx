'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer' // Assuming this component exists

interface CropDetails {
  id: string
  name: string
  scientific_name: string
  description: string
  image_url: string
  category: string
  climate_requirements: Record<string, string>
  cultivation_requirements: string
  production_timeline: Record<string, any>
  economic_analysis: string
  market_analysis: string
  risk_assessment: Record<string, any>
  strategic_recommendations: string
}

export default function CropDetailPage() {
  const { slug } = useParams()
  const [crop, setCrop] = useState<CropDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCrop() {
      if (!slug) return
      try {
        const response = await fetch(`/api/crops/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setCrop(data)
        } else {
          console.error('Failed to fetch crop:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch crop:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrop()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading crop details...</p>
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Crop not found.</p>
        <Link href="/farming-guides">
          <a className="text-green-600 hover:underline">Back to all guides</a>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/farming-guides"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-green-400 dark:hover:text-green-300 mb-6 transition-colors"
        >
           <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Farming Guides
        </Link>
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image
            src={crop.image_url || '/images/placeholder.jpg'}
            alt={crop.name}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
          {crop.name}
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 italic mb-8">
          {crop.scientific_name}
        </p>

        <div className="prose prose-lg dark:prose-dark max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Climate Requirements</h2>
              <ul>
                {Object.entries(crop.climate_requirements).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Production Timeline</h2>
              <ul>
                {Object.entries(crop.production_timeline).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Cultivation Guide</h2>
            <MarkdownRenderer content={crop.cultivation_requirements} />
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4">Economic Analysis</h2>
            <MarkdownRenderer content={crop.economic_analysis} />
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4">Market Analysis</h2>
            <MarkdownRenderer content={crop.market_analysis} />
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-4">Risk Assessment</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {Object.entries(crop.risk_assessment).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{key}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{value.Mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 bg-green-50 dark:bg-green-900 p-6 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Strategic Recommendations</h2>
            <MarkdownRenderer content={crop.strategic_recommendations} />
          </div>

        </div>
      </div>
    </div>
  )
}
