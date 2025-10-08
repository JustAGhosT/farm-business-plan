import { useState, useEffect, useCallback } from 'react'

export interface CropPlan {
  id: string
  farm_plan_id: string
  crop_name: string
  crop_variety?: string
  planting_area: number
  planting_date?: string
  harvest_date?: string
  expected_yield?: number
  yield_unit?: string
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed'
  created_at: string
  updated_at: string
  farm_plan_name?: string
  financial_data_count?: number
  task_count?: number
}

interface UseCropPlansResult {
  cropPlans: CropPlan[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCropPlan: (data: Partial<CropPlan>) => Promise<CropPlan | null>
  updateCropPlan: (id: string, data: Partial<CropPlan>) => Promise<CropPlan | null>
  deleteCropPlan: (id: string) => Promise<boolean>
}

interface CropPlanFilters {
  farm_plan_id?: string
  status?: string
}

/**
 * Custom hook for managing crop plans
 * Provides CRUD operations and automatic data fetching with filtering
 */
export function useCropPlans(filters?: CropPlanFilters): UseCropPlansResult {
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCropPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)
      if (filters?.status) params.append('status', filters.status)

      const url = `/api/crop-plans${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setCropPlans(result.data)
      } else {
        setError(result.error || 'Failed to fetch crop plans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.farm_plan_id, filters?.status])

  useEffect(() => {
    fetchCropPlans()
  }, [fetchCropPlans])

  const createCropPlan = useCallback(async (data: Partial<CropPlan>) => {
    try {
      const response = await fetch('/api/crop-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchCropPlans() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to create crop plan')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchCropPlans])

  const updateCropPlan = useCallback(async (id: string, data: Partial<CropPlan>) => {
    try {
      const response = await fetch('/api/crop-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })

      const result = await response.json()

      if (result.success) {
        await fetchCropPlans() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to update crop plan')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchCropPlans])

  const deleteCropPlan = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/crop-plans?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchCropPlans() // Refresh the list
        return true
      } else {
        setError(result.error || 'Failed to delete crop plan')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [fetchCropPlans])

  return {
    cropPlans,
    loading,
    error,
    refetch: fetchCropPlans,
    createCropPlan,
    updateCropPlan,
    deleteCropPlan
  }
}

/**
 * Custom hook for fetching crop plans for a single farm
 */
export function useCropPlansByFarm(farmPlanId: string | null): Omit<UseCropPlansResult, 'createCropPlan' | 'updateCropPlan' | 'deleteCropPlan'> {
  const filters = farmPlanId ? { farm_plan_id: farmPlanId } : undefined
  const { cropPlans, loading, error, refetch } = useCropPlans(filters)

  return {
    cropPlans,
    loading,
    error,
    refetch
  }
}
