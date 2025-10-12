/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'
import { POST, GET } from '@/app/api/fertility-management/route'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ...data,
    })),
  },
}))

describe('/api/fertility-management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/fertility-management', () => {
    it('should return reference data', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('nutrientRemovalRates')
      expect(data.data).toHaveProperty('nitrogenPrograms')
      expect(data.data).toHaveProperty('potassiumSources')
      expect(data.data).toHaveProperty('coverCrops')
      expect(data.data).toHaveProperty('monitoringSystem')
    })

    it('should include soybean removal rates', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data.nutrientRemovalRates.soybean).toEqual({
        p2o5_lb: 0.75,
        k2o_lb: 1.17,
        unit: 'bu',
        description: 'Soybean grain removal rates per bushel',
      })
    })

    it('should include potato removal rates', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('p2o5_lb', 3.0)
      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('k2o_lb', 12.5)
      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('sulfur_lb')
    })
  })

  describe('POST /api/fertility-management', () => {
    it('should generate fertility plan for simple crop array', async () => {
      const request = {
        json: async () => ({
          crops: ['soybean', 'potato'],
          soilType: 'sandy loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('cropSequence')
      expect(data.data).toHaveProperty('nutrientRecommendations')
      expect(data.data).toHaveProperty('transitionGuidance')
      expect(data.data).toHaveProperty('monitoringSchedule')
      expect(data.data).toHaveProperty('coverCropPlan')
      expect(data.data).toHaveProperty('criticalAmendments')
    })

    it('should calculate nutrient removal with yield targets', async () => {
      const request = {
        json: async () => ({
          crops: ['potato'],
          yieldTargets: { potato: 20 },
          soilType: 'sandy loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      const potatoRec = data.data.nutrientRecommendations.find(
        (r: any) => r.crop === 'potato'
      )

      expect(potatoRec).toBeDefined()
      expect(potatoRec.removal.p2o5_lb).toBe(60) // 20 tons * 3 lb/ton
      expect(potatoRec.removal.k2o_lb).toBe(250) // 20 tons * 12.5 lb/ton
    })

    it('should provide transition guidance between crops', async () => {
      const request = {
        json: async () => ({
          crops: ['soybean', 'potato', 'grain-sorghum'],
          soilType: 'loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.transitionGuidance).toHaveLength(2)

      const soybeanToPotato = data.data.transitionGuidance.find(
        (t: any) => t.from === 'soybean' && t.to === 'potato'
      )
      expect(soybeanToPotato).toBeDefined()
      expect(soybeanToPotato.guidance).toHaveProperty('soybeanCredit')
    })

    it('should include cover crop recommendations', async () => {
      const request = {
        json: async () => ({
          crops: ['potato', 'sunflower'],
          soilType: 'sandy',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.coverCropPlan.length).toBeGreaterThan(0)

      const afterPotato = data.data.coverCropPlan.find((c: any) => c.after === 'potato')
      expect(afterPotato).toBeDefined()
      expect(afterPotato.recommendation.primary).toBe('Rye')
    })

    it('should provide potato-specific recommendations', async () => {
      const request = {
        json: async () => ({
          crops: ['potato'],
          soilType: 'sandy loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      const potatoRec = data.data.nutrientRecommendations[0]
      const recommendations = potatoRec.recommendations

      expect(recommendations).toContain('Use K₂SO₄ (SOP) for quality - avoid heavy preplant KCl')
      expect(recommendations).toContain(
        'Monitor petiole nitrate weekly during bulking (target 13,000-15,000 ppm)'
      )
      expect(recommendations).toContain('Add 15-30 lb S/ac as sulfate form')
    })

    it('should provide beetroot-specific recommendations', async () => {
      const request = {
        json: async () => ({
          crops: ['beetroot'],
          soilType: 'loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      const beetrootRec = data.data.nutrientRecommendations[0]
      const recommendations = beetrootRec.recommendations

      expect(recommendations).toContain(
        'Maintain soil pH at 6.2-7.0 for optimal micronutrient availability'
      )
      expect(recommendations).toContain('Apply 2-3 lb B/ac preplant broadcast uniformly')
    })

    it('should return error if crops array is missing', async () => {
      const request = {
        json: async () => ({}),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Crops array is required')
    })

    it('should return error if crops is not an array', async () => {
      const request = {
        json: async () => ({
          crops: 'potato',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe('Crops array is required')
    })

    it('should include monitoring schedule with tissue testing', async () => {
      const request = {
        json: async () => ({
          crops: ['potato', 'beetroot', 'sunflower'],
          soilType: 'sandy loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.monitoringSchedule).toHaveProperty('soilTesting')
      expect(data.data.monitoringSchedule).toHaveProperty('tissueTesting')

      const tissueTesting = data.data.monitoringSchedule.tissueTesting
      expect(tissueTesting.length).toBe(3)

      const potatoTest = tissueTesting.find((t: any) => t.crop === 'potato')
      expect(potatoTest).toBeDefined()
      expect(potatoTest.protocol.target).toBe('13,000-15,000 ppm NO₃-N')
    })

    it('should include critical amendments summary', async () => {
      const request = {
        json: async () => ({
          crops: ['potato'],
          soilType: 'sandy',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      const amendments = data.data.criticalAmendments
      expect(amendments).toHaveProperty('phosphorus')
      expect(amendments).toHaveProperty('potassium')
      expect(amendments).toHaveProperty('sulfur')
      expect(amendments).toHaveProperty('boron')

      expect(amendments.phosphorus.strategy).toContain('Sufficiency-based')
      expect(amendments.sulfur.crops).toContain('potato')
    })
  })
})
