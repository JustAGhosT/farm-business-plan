import { useCrudApi } from './useCrudApi'

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
 * 
 * Refactored to use generic useCrudApi hook for consistent behavior
 */
export function useAIRecommendations(filters?: AIRecommendationFilters): UseAIRecommendationsResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<AIRecommendation>({
    endpoint: '/api/ai-recommendations',
    filters,
    timeout: 30000,
  })

  return {
    recommendations: items,
    loading,
    error,
    refetch,
    createRecommendation: create,
    updateRecommendation: update,
    deleteRecommendation: remove,
  }
}
