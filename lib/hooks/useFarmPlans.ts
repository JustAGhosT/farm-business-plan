import { useCallback, useEffect, useState } from 'react'
import { useCrudApi } from './useCrudApi'

export interface FarmPlan {
  id: string
  name: string
  location: string
  province?: string
  coordinates?: { lat: number; lng: number }
  farm_size: number
  soil_type?: string
  water_source?: string
  status: string
  owner_id?: string
  crop_count?: number
  task_count?: number
  created_at: string
  updated_at: string
}

interface UseFarmPlansResult {
  farmPlans: FarmPlan[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createFarmPlan: (data: Partial<FarmPlan>) => Promise<FarmPlan | null>
  updateFarmPlan: (id: string, data: Partial<FarmPlan>) => Promise<FarmPlan | null>
  deleteFarmPlan: (id: string) => Promise<boolean>
}

/**
 * Custom hook for managing farm plans
 * Provides CRUD operations and automatic data fetching
 * 
 * Refactored to use generic useCrudApi hook for consistent behavior and timeout handling
 */
export function useFarmPlans(ownerId?: string): UseFarmPlansResult {
  const filters = ownerId ? { owner_id: ownerId } : undefined
  
  const { items, loading, error, refetch, create, remove } = useCrudApi<FarmPlan>({
    endpoint: '/api/farm-plans',
    filters,
    timeout: 30000,
    updateMethod: 'PUT', // Farm plans use PUT with /api/farm-plans/[id]
  })

  // Custom update function that uses the /api/farm-plans/[id] endpoint
  const updateFarmPlan = useCallback(
    async (id: string, data: Partial<FarmPlan>) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch(`/api/farm-plans/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await refetch() // Refresh the list
          return result.data
        } else {
          return null
        }
      } catch (err) {
        return null
      } finally {
        clearTimeout(timeoutId)
      }
    },
    [refetch]
  )

  return {
    farmPlans: items,
    loading,
    error,
    refetch,
    createFarmPlan: create,
    updateFarmPlan,
    deleteFarmPlan: remove,
  }
}

interface UseFarmPlanResult {
  farmPlan: FarmPlan | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for fetching a single farm plan
 * This hook maintains the original implementation for fetching a single resource
 */
export function useFarmPlan(id: string | null): UseFarmPlanResult {
  const [farmPlan, setFarmPlan] = useState<FarmPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFarmPlan = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/farm-plans/${id}`, { signal: controller.signal })
      const result = await response.json()

      if (result.success) {
        setFarmPlan(result.data)
      } else {
        setError(result.error || 'Failed to fetch farm plan')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchFarmPlan()
  }, [fetchFarmPlan])

  return {
    farmPlan,
    loading,
    error,
    refetch: fetchFarmPlan,
  }
}
