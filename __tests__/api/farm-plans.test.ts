/**
 * Tests for Farm Plans API validation and logic
 */
import { FarmPlanSchema, validateData } from '@/lib/validation'
import { createTestFarmPlan } from '../utils/test-helpers'

describe('Farm Plans API Logic', () => {
  describe('FarmPlanSchema validation', () => {
    it('should validate a valid farm plan', () => {
      const validPlan = createTestFarmPlan()
      const result = validateData(FarmPlanSchema, validPlan)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      if (result.data) {
        expect(result.data.name).toBe('Test Farm')
        expect(result.data.location).toBe('Test Location')
      }
    })

    it('should reject farm plan without required fields', () => {
      const invalidPlan = {
        location: 'Test Location',
        // missing name and farm_size
      }
      
      const result = validateData(FarmPlanSchema, invalidPlan)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject negative farm size', () => {
      const invalidPlan = createTestFarmPlan({ farm_size: -5 })
      
      const result = validateData(FarmPlanSchema, invalidPlan)
      expect(result.success).toBe(false)
    })

    it('should accept valid coordinates', () => {
      const planWithCoords = createTestFarmPlan({
        coordinates: { lat: -25.0, lng: 28.0 },
      })
      
      const result = validateData(FarmPlanSchema, planWithCoords)
      expect(result.success).toBe(true)
      if (result.data) {
        expect(result.data.coordinates).toEqual({ lat: -25.0, lng: 28.0 })
      }
    })

    it('should reject invalid coordinates', () => {
      const planWithInvalidCoords = createTestFarmPlan({
        coordinates: { lat: 100, lng: 200 }, // Out of range
      })
      
      const result = validateData(FarmPlanSchema, planWithInvalidCoords)
      expect(result.success).toBe(false)
    })

    it('should accept all valid status values', () => {
      const statuses = ['draft', 'active', 'completed', 'archived']
      
      statuses.forEach(status => {
        const plan = createTestFarmPlan({ status })
        const result = validateData(FarmPlanSchema, plan)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid status', () => {
      const invalidPlan = createTestFarmPlan({
        status: 'invalid-status',
      })
      
      const result = validateData(FarmPlanSchema, invalidPlan)
      expect(result.success).toBe(false)
    })

    it('should accept optional owner_id', () => {
      const planWithOwner = createTestFarmPlan({
        owner_id: '123e4567-e89b-12d3-a456-426614174000',
      })
      
      const result = validateData(FarmPlanSchema, planWithOwner)
      expect(result.success).toBe(true)
      if (result.data) {
        expect(result.data.owner_id).toBeDefined()
      }
    })
  })

  describe('Farm plan data structure', () => {
    it('should have proper required fields', () => {
      const plan = createTestFarmPlan()
      
      expect(plan.name).toBeDefined()
      expect(plan.location).toBeDefined()
      expect(plan.farm_size).toBeDefined()
      expect(typeof plan.farm_size).toBe('number')
    })

    it('should have default status as draft', () => {
      const plan = createTestFarmPlan()
      expect(plan.status).toBe('draft')
    })

    it('should support various soil types', () => {
      const soilTypes = ['Loamy', 'Sandy', 'Clay', 'Silty', 'Peaty']
      
      soilTypes.forEach(soil_type => {
        const plan = createTestFarmPlan({ soil_type })
        const result = validateData(FarmPlanSchema, plan)
        expect(result.success).toBe(true)
      })
    })

    it('should support various water sources', () => {
      const waterSources = ['Borehole', 'Municipal', 'River', 'Dam', 'Rainwater']
      
      waterSources.forEach(water_source => {
        const plan = createTestFarmPlan({ water_source })
        const result = validateData(FarmPlanSchema, plan)
        expect(result.success).toBe(true)
      })
    })

    it('should support South African provinces', () => {
      const provinces = ['Limpopo', 'Gauteng', 'Western Cape', 'Eastern Cape', 'KwaZulu-Natal']
      
      provinces.forEach(province => {
        const plan = createTestFarmPlan({ province })
        const result = validateData(FarmPlanSchema, plan)
        expect(result.success).toBe(true)
      })
    })
  })
})
