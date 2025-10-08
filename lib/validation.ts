import { z } from 'zod'

/**
 * Farm Plan Validation Schema
 */
export const FarmPlanSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Farm name is required').max(255),
  location: z.string().min(1, 'Location is required').max(255),
  province: z.string().max(100).optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  farm_size: z.number().positive('Farm size must be positive'),
  soil_type: z.string().max(255).optional(),
  water_source: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  owner_id: z.string().uuid().optional()
})

export type FarmPlan = z.infer<typeof FarmPlanSchema>

/**
 * Crop Plan Validation Schema
 */
export const CropPlanSchema = z.object({
  id: z.string().uuid().optional(),
  farm_plan_id: z.string().uuid(),
  crop_name: z.string().min(1, 'Crop name is required').max(255),
  crop_variety: z.string().max(255).optional(),
  planting_area: z.number().positive('Planting area must be positive'),
  planting_date: z.string().optional(), // ISO date string
  harvest_date: z.string().optional(), // ISO date string
  expected_yield: z.number().optional(),
  yield_unit: z.string().max(50).optional(),
  status: z.enum(['planned', 'planted', 'growing', 'harvested', 'failed']).default('planned')
})

export type CropPlan = z.infer<typeof CropPlanSchema>

/**
 * Task Validation Schema
 */
export const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  farm_plan_id: z.string().uuid(),
  crop_plan_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().max(100).optional(),
  due_date: z.string().optional(), // ISO date string
  completed_at: z.string().optional() // ISO date string
})

export type Task = z.infer<typeof TaskSchema>

/**
 * Financial Data Validation Schema
 */
export const FinancialDataSchema = z.object({
  id: z.string().uuid().optional(),
  crop_plan_id: z.string().uuid(),
  initial_investment: z.number().optional(),
  fixed_costs: z.number().optional(),
  variable_costs: z.number().optional(),
  monthly_operating_costs: z.number().optional(),
  annual_operating_costs: z.number().optional(),
  projected_revenue: z.number().optional(),
  break_even_point: z.number().int().optional(),
  roi_percentage: z.number().optional()
})

export type FinancialData = z.infer<typeof FinancialDataSchema>

/**
 * Climate Data Validation Schema
 */
export const ClimateDataSchema = z.object({
  id: z.string().uuid().optional(),
  farm_plan_id: z.string().uuid(),
  avg_temp_summer: z.number().optional(),
  avg_temp_winter: z.number().optional(),
  annual_rainfall: z.number().optional(),
  frost_risk: z.boolean().default(false),
  growing_season_length: z.number().int().optional(),
  auto_populated: z.boolean().default(false)
})

export type ClimateData = z.infer<typeof ClimateDataSchema>

/**
 * Calculator Result Validation Schema
 */
export const CalculatorResultSchema = z.object({
  id: z.string().uuid().optional(),
  farm_plan_id: z.string().uuid().optional().nullable(),
  crop_plan_id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  calculator_type: z.enum(['roi', 'break-even', 'investment', 'loan', 'operating-costs', 'revenue', 'cash-flow', 'profit-margin']),
  input_data: z.any(), // Simplified to z.any() to avoid Zod v4 record issues
  results: z.any(), // Simplified to z.any() to avoid Zod v4 record issues
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export type CalculatorResult = z.infer<typeof CalculatorResultSchema>

/**
 * Validation helper function
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}
