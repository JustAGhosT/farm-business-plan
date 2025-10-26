'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Crop {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  category: string
}

export default function FarmingGuidesPage() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCrops() {
      try {
        const response = await fetch('/api/crops')
        const data = await response.json()
        setCrops(data)
      } catch (error) {
        console.error('Failed to fetch crops:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCrops()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Farming Guides
        </h1>
        {loading ? (
          <p>Loading guides...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop) => (
              <Link href={`/farming-guides/${crop.slug}`} key={crop.id}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={crop.image_url || '/images/placeholder.jpg'}
                      alt={crop.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                      {crop.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {crop.description}
                    </p>
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                      {crop.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
