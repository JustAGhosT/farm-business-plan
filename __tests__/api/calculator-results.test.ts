/**
 * Tests for Calculator Results API validation and logic
 */
import { CalculatorResultSchema, validateData } from '@/lib/validation'
import { createTestCalculatorResult } from '../utils/test-helpers'

describe('Calculator Results API Logic', () => {
  describe('CalculatorResultSchema validation', () => {
    it('should validate a valid calculator result', () => {
      const validResult = createTestCalculatorResult()
      const result = validateData(CalculatorResultSchema, validResult)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      if (result.data) {
        expect(result.data.calculator_type).toBe('roi')
        expect(result.data.input_data).toBeDefined()
        expect(result.data.results).toBeDefined()
      }
    })

    it('should reject invalid calculator type', () => {
      const invalidResult = {
        calculator_type: 'invalid-type',
        input_data: {},
        results: {},
      }
      
      const result = validateData(CalculatorResultSchema, invalidResult)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should require calculator_type field', () => {
      const invalidResult = {
        // missing calculator_type
        input_data: {},
        results: {},
      }
      
      const result = validateData(CalculatorResultSchema, invalidResult)
      expect(result.success).toBe(false)
    })

    it('should accept all valid calculator types', () => {
      const types = ['roi', 'break-even', 'investment', 'loan', 'operating-costs', 'revenue', 'cash-flow', 'profit-margin']
      
      types.forEach(calculator_type => {
        const testResult = createTestCalculatorResult({ calculator_type })
        const result = validateData(CalculatorResultSchema, testResult)
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional farm_plan_id and crop_plan_id', () => {
      const resultWithIds = createTestCalculatorResult({
        farm_plan_id: '123e4567-e89b-12d3-a456-426614174000',
        crop_plan_id: '123e4567-e89b-12d3-a456-426614174001',
      })
      
      const result = validateData(CalculatorResultSchema, resultWithIds)
      expect(result.success).toBe(true)
      if (result.data) {
        expect(result.data.farm_plan_id).toBeDefined()
        expect(result.data.crop_plan_id).toBeDefined()
      }
    })

    it('should accept null for optional fields', () => {
      const resultWithNulls = createTestCalculatorResult({
        farm_plan_id: null,
        crop_plan_id: null,
        user_id: null,
      })
      
      const result = validateData(CalculatorResultSchema, resultWithNulls)
      expect(result.success).toBe(true)
    })
  })

  describe('Calculator result data structure', () => {
    it('should have proper input_data structure', () => {
      const testResult = createTestCalculatorResult()
      
      expect(testResult.input_data).toBeDefined()
      expect(typeof testResult.input_data).toBe('object')
    })

    it('should have proper results structure', () => {
      const testResult = createTestCalculatorResult()
      
      expect(testResult.results).toBeDefined()
      expect(typeof testResult.results).toBe('object')
    })

    it('should support ROI calculator data', () => {
      const roiResult = createTestCalculatorResult({
        calculator_type: 'roi',
        input_data: {
          initialInvestment: 100000,
          annualRevenue: 50000,
          annualCosts: 20000,
          years: 5,
        },
        results: {
          roi: 50,
          netProfit: 150000,
          annualNetProfit: 30000,
          paybackPeriod: 3.33,
        },
      })
      
      const result = validateData(CalculatorResultSchema, roiResult)
      expect(result.success).toBe(true)
    })

    it('should support different calculator types with different data', () => {
      const breakEvenResult = createTestCalculatorResult({
        calculator_type: 'break-even',
        input_data: {
          fixedCosts: 50000,
          pricePerUnit: 10,
          costPerUnit: 5,
        },
        results: {
          breakEvenUnits: 10000,
          breakEvenRevenue: 100000,
        },
      })
      
      const result = validateData(CalculatorResultSchema, breakEvenResult)
      expect(result.success).toBe(true)
    })
  })
})
