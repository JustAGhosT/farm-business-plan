/**
 * Tests for Tasks API validation and logic
 */
import { TaskSchema, validateData } from '@/lib/validation'
import { createTestTask } from '../utils/test-helpers'

describe('Tasks API Logic', () => {
  const farmPlanId = '123e4567-e89b-12d3-a456-426614174000'

  describe('TaskSchema validation', () => {
    it('should validate a valid task', () => {
      const validTask = createTestTask(farmPlanId)
      const result = validateData(TaskSchema, validTask)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      if (result.data) {
        expect(result.data.title).toBe('Test Task')
        expect(result.data.farm_plan_id).toBe(farmPlanId)
      }
    })

    it('should reject task without required fields', () => {
      const invalidTask = {
        description: 'Some description',
        // missing farm_plan_id and title
      }
      
      const result = validateData(TaskSchema, invalidTask)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject invalid status', () => {
      const invalidTask = createTestTask(farmPlanId, {
        status: 'invalid-status',
      })
      
      const result = validateData(TaskSchema, invalidTask)
      expect(result.success).toBe(false)
    })

    it('should accept all valid status values', () => {
      const statuses = ['pending', 'in-progress', 'completed', 'cancelled']
      
      statuses.forEach(status => {
        const task = createTestTask(farmPlanId, { status })
        const result = validateData(TaskSchema, task)
        expect(result.success).toBe(true)
      })
    })

    it('should accept all valid priority values', () => {
      const priorities = ['low', 'medium', 'high']
      
      priorities.forEach(priority => {
        const task = createTestTask(farmPlanId, { priority })
        const result = validateData(TaskSchema, task)
        expect(result.success).toBe(true)
      })
    })

    it('should accept optional crop_plan_id', () => {
      const task = createTestTask(farmPlanId, {
        crop_plan_id: '123e4567-e89b-12d3-a456-426614174001',
      })
      
      const result = validateData(TaskSchema, task)
      expect(result.success).toBe(true)
      if (result.data) {
        expect(result.data.crop_plan_id).toBeDefined()
      }
    })

    it('should accept optional due_date and completed_at', () => {
      const task = createTestTask(farmPlanId, {
        due_date: '2024-12-31',
        completed_at: '2024-12-15T10:00:00Z',
      })
      
      const result = validateData(TaskSchema, task)
      expect(result.success).toBe(true)
    })
  })

  describe('Task data structure', () => {
    it('should have proper required fields', () => {
      const task = createTestTask(farmPlanId)
      
      expect(task.farm_plan_id).toBeDefined()
      expect(task.title).toBeDefined()
      expect(task.status).toBeDefined()
      expect(task.priority).toBeDefined()
    })

    it('should have default status as pending', () => {
      const task = createTestTask(farmPlanId)
      expect(task.status).toBe('pending')
    })

    it('should have default priority as medium', () => {
      const task = createTestTask(farmPlanId)
      expect(task.priority).toBe('medium')
    })

    it('should support different categories', () => {
      const categories = ['Planting', 'Watering', 'Fertilizing', 'Harvesting', 'Maintenance']
      
      categories.forEach(category => {
        const task = createTestTask(farmPlanId, { category })
        const result = validateData(TaskSchema, task)
        expect(result.success).toBe(true)
      })
    })
  })
})
