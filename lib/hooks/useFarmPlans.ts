import { useState, useEffect, useCallback } from 'react'

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
 */
export function useFarmPlans(ownerId?: string): UseFarmPlansResult {
  const [farmPlans, setFarmPlans] = useState<FarmPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFarmPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = ownerId 
        ? `/api/farm-plans?owner_id=${ownerId}`
        : '/api/farm-plans'
      
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setFarmPlans(result.data)
      } else {
        setError(result.error || 'Failed to fetch farm plans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [ownerId])

  useEffect(() => {
    fetchFarmPlans()
  }, [fetchFarmPlans])

  const createFarmPlan = useCallback(async (data: Partial<FarmPlan>) => {
    try {
      const response = await fetch('/api/farm-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchFarmPlans() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to create farm plan')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchFarmPlans])

  const updateFarmPlan = useCallback(async (id: string, data: Partial<FarmPlan>) => {
    try {
      const response = await fetch(`/api/farm-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchFarmPlans() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to update farm plan')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchFarmPlans])

  const deleteFarmPlan = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/farm-plans/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchFarmPlans() // Refresh the list
        return true
      } else {
        setError(result.error || 'Failed to delete farm plan')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [fetchFarmPlans])

  return {
    farmPlans,
    loading,
    error,
    refetch: fetchFarmPlans,
    createFarmPlan,
    updateFarmPlan,
    deleteFarmPlan
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

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/farm-plans/${id}`)
      const result = await response.json()

      if (result.success) {
        setFarmPlan(result.data)
      } else {
        setError(result.error || 'Failed to fetch farm plan')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
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
    refetch: fetchFarmPlan
  }
}
