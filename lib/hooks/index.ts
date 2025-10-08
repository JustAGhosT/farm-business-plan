/**
 * Central export file for all custom hooks
 * Provides easy imports for React components
 */

// Farm Plans
export { useFarmPlans, useFarmPlan } from './useFarmPlans'
export type { FarmPlan } from './useFarmPlans'

// Tasks
export { useTasks } from './useTasks'
export type { Task } from './useTasks'

// Climate Data
export { useClimateData, useClimateDataByFarm } from './useClimateData'
export type { ClimateData } from './useClimateData'

// Crop Plans
export { useCropPlans, useCropPlansByFarm } from './useCropPlans'
export type { CropPlan } from './useCropPlans'

// Financial Data
export { 
  useFinancialData, 
  useFinancialDataByCrop, 
  useFinancialDataByFarm 
} from './useFinancialData'
export type { FinancialData } from './useFinancialData'

// Crop Templates
export { 
  useCropTemplates, 
  usePublicCropTemplates, 
  useCropTemplatesByCategory 
} from './useCropTemplates'
export type { CropTemplate } from './useCropTemplates'

// AI Recommendations
export { 
  useAIRecommendations, 
  useAIRecommendationsByFarm, 
  useAIRecommendationsByCategory 
} from './useAIRecommendations'
export type { AIRecommendation } from './useAIRecommendations'
