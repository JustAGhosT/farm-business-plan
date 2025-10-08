import { useState, useEffect, useCallback } from 'react'

export interface AIRecommendation {
  id: string
  farm_plan_id: string
  recommendation_text: string
  category?: string
  priority: number
  created_at: string
  updated_at: string
  farm_plan_name?: string
}

interface UseAIRecommendationsResult {
  recommendations: AIRecommendation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createRecommendation: (data: Partial<AIRecommendation>) => Promise<AIRecommendation | null>
  updateRecommendation: (id: string, data: Partial<AIRecommendation>) => Promise<AIRecommendation | null>
  deleteRecommendation: (id: string) => Promise<boolean>
}

interface AIRecommendationFilters {
  farm_plan_id?: string
  category?: string
}

/**
 * Custom hook for managing AI recommendations
 * Provides CRUD operations and automatic data fetching with filtering
 */
export function useAIRecommendations(filters?: AIRecommendationFilters): UseAIRecommendationsResult {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)
      if (filters?.category) params.append('category', filters.category)

      const url = `/api/ai-recommendations${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setRecommendations(result.data)
      } else {
        setError(result.error || 'Failed to fetch AI recommendations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.farm_plan_id, filters?.category])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const createRecommendation = useCallback(async (data: Partial<AIRecommendation>) => {
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        await fetchRecommendations() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to create recommendation')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchRecommendations])

  const updateRecommendation = useCallback(async (id: string, data: Partial<AIRecommendation>) => {
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })

      const result = await response.json()

      if (result.success) {
        await fetchRecommendations() // Refresh the list
        return result.data
      } else {
        setError(result.error || 'Failed to update recommendation')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchRecommendations])

  const deleteRecommendation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/ai-recommendations?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchRecommendations() // Refresh the list
        return true
      } else {
        setError(result.error || 'Failed to delete recommendation')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    createRecommendation,
    updateRecommendation,
    deleteRecommendation
  }
}

/**
 * Custom hook for fetching AI recommendations for a single farm plan
 */
export function useAIRecommendationsByFarm(farmPlanId: string | null): Omit<UseAIRecommendationsResult, 'createRecommendation' | 'updateRecommendation' | 'deleteRecommendation'> {
  const filters = farmPlanId ? { farm_plan_id: farmPlanId } : undefined
  const { recommendations, loading, error, refetch } = useAIRecommendations(filters)

  return {
    recommendations,
    loading,
    error,
    refetch
  }
}

/**
 * Custom hook for fetching AI recommendations by category
 */
export function useAIRecommendationsByCategory(category: string | null): Omit<UseAIRecommendationsResult, 'createRecommendation' | 'updateRecommendation' | 'deleteRecommendation'> {
  const filters = category ? { category } : undefined
  const { recommendations, loading, error, refetch } = useAIRecommendations(filters)

  return {
    recommendations,
    loading,
    error,
    refetch
  }
}
