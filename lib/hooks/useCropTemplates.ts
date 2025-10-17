import { useCrudApi } from './useCrudApi'

export interface CropTemplate {
  id: string
  name: string
  description?: string
  category?: string
  technical_specs?: Record<string, any>
  financial_projections?: Record<string, any>
  growing_requirements?: Record<string, any>
  market_info?: Record<string, any>
  is_public: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

interface UseCropTemplatesResult {
  cropTemplates: CropTemplate[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCropTemplate: (data: Partial<CropTemplate>) => Promise<CropTemplate | null>
  updateCropTemplate: (id: string, data: Partial<CropTemplate>) => Promise<CropTemplate | null>
  deleteCropTemplate: (id: string) => Promise<boolean>
}

interface CropTemplateFilters {
  category?: string
  is_public?: boolean
}

/**
 * Custom hook for managing crop templates
 * Provides CRUD operations and automatic data fetching with filtering
 *
 * Refactored to use generic useCrudApi hook for consistent behavior
 */
export function useCropTemplates(filters?: CropTemplateFilters): UseCropTemplatesResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<CropTemplate>({
    endpoint: '/api/crop-templates',
    filters,
    timeout: 30000,
  })

  return {
    cropTemplates: items,
    loading,
    error,
    refetch,
    createCropTemplate: create,
    updateCropTemplate: update,
    deleteCropTemplate: remove,
  }
}
