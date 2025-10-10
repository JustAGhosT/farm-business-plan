import { useState, useEffect, useCallback } from 'react'

export interface CropTemplate {
  id: string
  name: string
  description?: string
  category?: string
  technical_specs?: any
  financial_projections?: any
  growing_requirements?: any
  market_info?: any
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
 */
export function useCropTemplates(filters?: CropTemplateFilters): UseCropTemplatesResult {
  const [cropTemplates, setCropTemplates] = useState<CropTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCropTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.is_public !== undefined) params.append('is_public', String(filters.is_public))

      const url = `/api/crop-templates${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setCropTemplates(result.data)
      } else {
        setError(result.error || 'Failed to fetch crop templates')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.category, filters?.is_public])

  useEffect(() => {
    fetchCropTemplates()
  }, [fetchCropTemplates])

  const createCropTemplate = useCallback(
    async (data: Partial<CropTemplate>) => {
      try {
        const response = await fetch('/api/crop-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (result.success) {
          await fetchCropTemplates() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to create crop template')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchCropTemplates]
  )

  const updateCropTemplate = useCallback(
    async (id: string, data: Partial<CropTemplate>) => {
      try {
        const response = await fetch('/api/crop-templates', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })

        const result = await response.json()

        if (result.success) {
          await fetchCropTemplates() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to update crop template')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      }
    },
    [fetchCropTemplates]
  )

  const deleteCropTemplate = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/crop-templates?id=${id}`, {
          method: 'DELETE',
        })

        const result = await response.json()

        if (result.success) {
          await fetchCropTemplates() // Refresh the list
          return true
        } else {
          setError(result.error || 'Failed to delete crop template')
          return false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return false
      }
    },
    [fetchCropTemplates]
  )

  return {
    cropTemplates,
    loading,
    error,
    refetch: fetchCropTemplates,
    createCropTemplate,
    updateCropTemplate,
    deleteCropTemplate,
  }
}

/**
 * Custom hook for fetching public crop templates only
 */
export function usePublicCropTemplates(
  category?: string
): Omit<
  UseCropTemplatesResult,
  'createCropTemplate' | 'updateCropTemplate' | 'deleteCropTemplate'
> {
  const filters = { is_public: true, ...(category && { category }) }
  const { cropTemplates, loading, error, refetch } = useCropTemplates(filters)

  return {
    cropTemplates,
    loading,
    error,
    refetch,
  }
}

/**
 * Custom hook for fetching crop templates by category
 */
export function useCropTemplatesByCategory(
  category: string | null
): Omit<
  UseCropTemplatesResult,
  'createCropTemplate' | 'updateCropTemplate' | 'deleteCropTemplate'
> {
  const filters = category ? { category } : undefined
  const { cropTemplates, loading, error, refetch } = useCropTemplates(filters)

  return {
    cropTemplates,
    loading,
    error,
    refetch,
  }
}
