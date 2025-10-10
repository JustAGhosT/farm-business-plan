import { useState, useEffect, useCallback } from 'react'

export interface ClimateData {
  id: string
  farm_plan_id: string
  avg_temp_summer?: number
  avg_temp_winter?: number
  annual_rainfall?: number
  frost_risk: boolean
  growing_season_length?: number
  auto_populated: boolean
  created_at: string
  updated_at: string
  farm_plan_name?: string
}

interface UseClimateDataResult {
  climateData: ClimateData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createClimateData: (data: Partial<ClimateData>) => Promise<ClimateData | null>
  updateClimateData: (id: string, data: Partial<ClimateData>) => Promise<ClimateData | null>
  deleteClimateData: (id: string) => Promise<boolean>
}

interface ClimateDataFilters {
  farm_plan_id?: string
}

/**
 * Custom hook for managing climate data
 * Provides CRUD operations and automatic data fetching with filtering
 */
export function useClimateData(filters?: ClimateDataFilters): UseClimateDataResult {
  const [climateData, setClimateData] = useState<ClimateData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClimateData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)

      const url = `/api/climate-data${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setClimateData(result.data)
      } else {
        setError(result.error || 'Failed to fetch climate data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.farm_plan_id])

  useEffect(() => {
    fetchClimateData()
  }, [fetchClimateData])

  const createClimateData = useCallback(
    async (data: Partial<ClimateData>) => {
      try {
        const response = await fetch('/api/climate-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          await fetchClimateData() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to create climate data')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchClimateData]
  )

  const updateClimateData = useCallback(
    async (id: string, data: Partial<ClimateData>) => {
      try {
        const response = await fetch('/api/climate-data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })

        const result = await response.json()

        if (result.success) {
          await fetchClimateData() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to update climate data')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchClimateData]
  )

  const deleteClimateData = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/climate-data?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          await fetchClimateData() // Refresh the list
          return true
        } else {
          setError(result.error || 'Failed to delete climate data')
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [fetchClimateData]
  )

  return {
    climateData,
    loading,
    error,
    refetch: fetchClimateData,
    createClimateData,
    updateClimateData,
    deleteClimateData,
  }
}

/**
 * Custom hook for fetching climate data for a single farm plan
 */
export function useClimateDataByFarm(
  farmPlanId: string | null
): Omit<UseClimateDataResult, 'createClimateData' | 'updateClimateData' | 'deleteClimateData'> {
  const filters = farmPlanId ? { farm_plan_id: farmPlanId } : undefined
  const { climateData, loading, error, refetch } = useClimateData(filters)

  return {
    climateData,
    loading,
    error,
    refetch,
  }
}
