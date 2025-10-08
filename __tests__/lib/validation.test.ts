/**
 * Tests for validation schemas
 */
import {
  FarmPlanSchema,
  CropPlanSchema,
  TaskSchema,
  FinancialDataSchema,
  CalculatorResultSchema,
  validateData,
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('FarmPlanSchema', () => {
    it('should validate a valid farm plan', () => {
      const validData = {
        name: 'Green Valley Farm',
        location: 'Bela Bela',
        province: 'Limpopo',
        farm_size: 5.5,
        soil_type: 'Loamy',
        water_source: 'Borehole',
        status: 'draft',
      }

      const result = validateData(FarmPlanSchema, validData)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Green Valley Farm')
    })

    it('should reject farm plan without required fields', () => {
      const invalidData = {
        location: 'Bela Bela',
      }

      const result = validateData(FarmPlanSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject negative farm size', () => {
      const invalidData = {
        name: 'Test Farm',
        location: 'Test Location',
        farm_size: -5,
      }

      const result = validateData(FarmPlanSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept valid coordinates', () => {
      const validData = {
        name: 'Test Farm',
        location: 'Test Location',
        farm_size: 5.5,
        coordinates: { lat: -25.0, lng: 28.0 },
      }

      const result = validateData(FarmPlanSchema, validData)
      expect(result.success).toBe(true)
      expect(result.data?.coordinates).toEqual({ lat: -25.0, lng: 28.0 })
    })
  })

  describe('TaskSchema', () => {
    const validTaskData = {
      farm_plan_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Plant Dragon Fruit',
      description: 'Plant 50 dragon fruit seedlings',
      status: 'pending',
      priority: 'high',
      category: 'Planting',
    }

    it('should validate a valid task', () => {
      const result = validateData(TaskSchema, validTaskData)
      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Plant Dragon Fruit')
    })

    it('should reject task without required fields', () => {
      const invalidData = {
        description: 'Some description',
      }

      const result = validateData(TaskSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const invalidData = {
        ...validTaskData,
        status: 'invalid-status',
      }

      const result = validateData(TaskSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept valid priority values', () => {
      const priorities = ['low', 'medium', 'high']
      
      priorities.forEach(priority => {
        const result = validateData(TaskSchema, { ...validTaskData, priority })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('CalculatorResultSchema', () => {
    const validCalculatorResult = {
      calculator_type: 'roi',
      input_data: {
        initialInvestment: 100000,
        annualRevenue: 50000,
        annualCosts: 20000,
      },
      results: {
        roi: 50,
        netProfit: 150000,
      },
      notes: 'Initial calculation',
    }

    it('should validate a valid calculator result', () => {
      const result = validateData(CalculatorResultSchema, validCalculatorResult)
      expect(result.success).toBe(true)
      expect(result.data?.calculator_type).toBe('roi')
    })

    it('should reject invalid calculator type', () => {
      const invalidData = {
        ...validCalculatorResult,
        calculator_type: 'invalid-type',
      }

      const result = validateData(CalculatorResultSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid calculator types', () => {
      const types = ['roi', 'break-even', 'investment', 'loan', 'operating-costs', 'revenue', 'cash-flow', 'profit-margin']
      
      types.forEach(calculator_type => {
        const result = validateData(CalculatorResultSchema, { 
          ...validCalculatorResult, 
          calculator_type 
        })
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional farm_plan_id and crop_plan_id', () => {
      const dataWithIds = {
        ...validCalculatorResult,
        farm_plan_id: '123e4567-e89b-12d3-a456-426614174000',
        crop_plan_id: '123e4567-e89b-12d3-a456-426614174001',
      }

      const result = validateData(CalculatorResultSchema, dataWithIds)
      expect(result.success).toBe(true)
      expect(result.data?.farm_plan_id).toBeDefined()
    })
  })

  describe('FinancialDataSchema', () => {
    const validFinancialData = {
      crop_plan_id: '123e4567-e89b-12d3-a456-426614174000',
      initial_investment: 100000,
      fixed_costs: 20000,
      variable_costs: 10000,
      projected_revenue: 150000,
      roi_percentage: 50,
    }

    it('should validate valid financial data', () => {
      const result = validateData(FinancialDataSchema, validFinancialData)
      expect(result.success).toBe(true)
      expect(result.data?.initial_investment).toBe(100000)
    })

    it('should reject without crop_plan_id', () => {
      const invalidData = {
        initial_investment: 100000,
      }

      const result = validateData(FinancialDataSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all optional financial fields', () => {
      const minimalData = {
        crop_plan_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = validateData(FinancialDataSchema, minimalData)
      expect(result.success).toBe(true)
    })
  })

  describe('CropPlanSchema', () => {
    const validCropPlan = {
      farm_plan_id: '123e4567-e89b-12d3-a456-426614174000',
      crop_name: 'Dragon Fruit',
      planting_area: 2.5,
      status: 'planned',
    }

    it('should validate a valid crop plan', () => {
      const result = validateData(CropPlanSchema, validCropPlan)
      expect(result.success).toBe(true)
      expect(result.data?.crop_name).toBe('Dragon Fruit')
    })

    it('should reject negative planting area', () => {
      const invalidData = {
        ...validCropPlan,
        planting_area: -1,
      }

      const result = validateData(CropPlanSchema, invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept valid crop status values', () => {
      const statuses = ['planned', 'planted', 'growing', 'harvested', 'failed']
      
      statuses.forEach(status => {
        const result = validateData(CropPlanSchema, { ...validCropPlan, status })
        expect(result.success).toBe(true)
      })
    })
  })
})
