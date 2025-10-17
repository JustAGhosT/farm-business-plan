import { useCrudApi } from './useCrudApi'

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
 *
 * Refactored to use generic useCrudApi hook for consistent behavior
 */
export function useFinancialData(filters?: FinancialDataFilters): UseFinancialDataResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<FinancialData>({
    endpoint: '/api/financial-data',
    filters,
    timeout: 30000,
  })

  return {
    financialData: items,
    loading,
    error,
    refetch,
    createFinancialData: create,
    updateFinancialData: update,
    deleteFinancialData: remove,
  }
}
