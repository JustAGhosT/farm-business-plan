import { useCrudApi } from './useCrudApi'

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
 *
 * Refactored to use generic useCrudApi hook for consistent behavior
 */
export function useClimateData(filters?: ClimateDataFilters): UseClimateDataResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<ClimateData>({
    endpoint: '/api/climate-data',
    filters,
    timeout: 30000,
  })

  return {
    climateData: items,
    loading,
    error,
    refetch,
    createClimateData: create,
    updateClimateData: update,
    deleteClimateData: remove,
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
