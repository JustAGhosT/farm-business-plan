/**
 * Central export file for all custom hooks
 * Provides easy imports for React components
 */

// Generic CRUD API Hook (Refactoring #1)
export { useCrudApi } from './useCrudApi'
export type { CrudApiConfig, UseCrudApiResult } from './useCrudApi'

// Farm Plans
export { useFarmPlan, useFarmPlans } from './useFarmPlans'
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
export { useFinancialData } from './useFinancialData'
export type { FinancialData } from './useFinancialData'

// Crop Templates
export { useCropTemplates } from './useCropTemplates'
export type { CropTemplate } from './useCropTemplates'

// AI Recommendations
export { useAIRecommendations } from './useAIRecommendations'
export type { AIRecommendation } from './useAIRecommendations'

// Wizard Sessions
export { useWizardSessions } from './useWizardSessions'
export type { WizardSession } from './useWizardSessions'
