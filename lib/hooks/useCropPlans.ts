import { useCrudApi } from './useCrudApi'

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
 * 
 * Refactored to use generic useCrudApi hook for consistent behavior and timeout handling
 */
export function useCropPlans(filters?: CropPlanFilters): UseCropPlansResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<CropPlan>({
    endpoint: '/api/crop-plans',
    filters,
    timeout: 30000,
  })

  return {
    cropPlans: items,
    loading,
    error,
    refetch,
    createCropPlan: create,
    updateCropPlan: update,
    deleteCropPlan: remove,
  }
}

/**
 * Custom hook for fetching crop plans for a single farm
 */
export function useCropPlansByFarm(
  farmPlanId: string | null
): Omit<UseCropPlansResult, 'createCropPlan' | 'updateCropPlan' | 'deleteCropPlan'> {
  const filters = farmPlanId ? { farm_plan_id: farmPlanId } : undefined
  const { cropPlans, loading, error, refetch } = useCropPlans(filters)

  return {
    cropPlans,
    loading,
    error,
    refetch,
  }
}
