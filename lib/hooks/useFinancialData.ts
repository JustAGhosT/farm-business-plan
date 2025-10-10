import { useState, useEffect, useCallback } from 'react'

export interface FinancialData {
  id: string
  crop_plan_id: string
  initial_investment?: number
  fixed_costs?: number
  variable_costs?: number
  monthly_operating_costs?: number
  annual_operating_costs?: number
  projected_revenue?: number
  break_even_point?: number
  roi_percentage?: number
  created_at: string
  updated_at: string
  crop_name?: string
  planting_area?: number
  farm_plan_name?: string
}

interface UseFinancialDataResult {
  financialData: FinancialData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createFinancialData: (data: Partial<FinancialData>) => Promise<FinancialData | null>
  updateFinancialData: (id: string, data: Partial<FinancialData>) => Promise<FinancialData | null>
  deleteFinancialData: (id: string) => Promise<boolean>
}

interface FinancialDataFilters {
  crop_plan_id?: string
  farm_plan_id?: string
}

/**
 * Custom hook for managing financial data
 * Provides CRUD operations and automatic data fetching with filtering
 */
export function useFinancialData(filters?: FinancialDataFilters): UseFinancialDataResult {
  const [financialData, setFinancialData] = useState<FinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.crop_plan_id) params.append('crop_plan_id', filters.crop_plan_id)
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)

      const url = `/api/financial-data${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setFinancialData(result.data)
      } else {
        setError(result.error || 'Failed to fetch financial data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.crop_plan_id, filters?.farm_plan_id])

  useEffect(() => {
    fetchFinancialData()
  }, [fetchFinancialData])

  const createFinancialData = useCallback(
    async (data: Partial<FinancialData>) => {
      try {
        const response = await fetch('/api/financial-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          await fetchFinancialData() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to create financial data')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchFinancialData]
  )

  const updateFinancialData = useCallback(
    async (id: string, data: Partial<FinancialData>) => {
      try {
        const response = await fetch('/api/financial-data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })

        const result = await response.json()

        if (result.success) {
          await fetchFinancialData() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to update financial data')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchFinancialData]
  )

  const deleteFinancialData = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/financial-data?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          await fetchFinancialData() // Refresh the list
          return true
        } else {
          setError(result.error || 'Failed to delete financial data')
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [fetchFinancialData]
  )

  return {
    financialData,
    loading,
    error,
    refetch: fetchFinancialData,
    createFinancialData,
    updateFinancialData,
    deleteFinancialData,
  }
}

/**
 * Custom hook for fetching financial data for a single crop plan
 */
export function useFinancialDataByCrop(
  cropPlanId: string | null
): Omit<
  UseFinancialDataResult,
  'createFinancialData' | 'updateFinancialData' | 'deleteFinancialData'
> {
  const filters = cropPlanId ? { crop_plan_id: cropPlanId } : undefined
  const { financialData, loading, error, refetch } = useFinancialData(filters)

  return {
    financialData,
    loading,
    error,
    refetch,
  }
}

/**
 * Custom hook for fetching financial data for a farm plan
 */
export function useFinancialDataByFarm(
  farmPlanId: string | null
): Omit<
  UseFinancialDataResult,
  'createFinancialData' | 'updateFinancialData' | 'deleteFinancialData'
> {
  const filters = farmPlanId ? { farm_plan_id: farmPlanId } : undefined
  const { financialData, loading, error, refetch } = useFinancialData(filters)

  return {
    financialData,
    loading,
    error,
    refetch,
  }
}
