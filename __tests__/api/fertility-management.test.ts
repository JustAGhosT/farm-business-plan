/**
 * @jest-environment node
 */

import { GET, POST, PUT } from '@/app/api/fertility-management/route'
import { query } from '@/lib/db'

// Mock the database module
jest.mock('@/lib/db')

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

const mockQuery = query as jest.MockedFunction<typeof query>

describe('/api/fertility-management', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock data for database queries
    mockQuery.mockImplementation(async (sql: string) => {
      // Mock crop_fertility_data query
      if (sql.includes('crop_fertility_data')) {
        return {
          rows: [
            {
              crop_name: 'soybean',
              p2o5_removal_rate: '0.75',
              k2o_removal_rate: '1.17',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'bu',
              description: 'Soybean grain removal rates per bushel',
              fertility_notes: null,
              crop_category: 'legume',
              ph_range: '6.0-7.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'potato',
              p2o5_removal_rate: '3.0',
              k2o_removal_rate: '12.5',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: '2.0',
              calcium_removal_rate: null,
              boron_removal_rate: '0.05',
              yield_unit: 'ton',
              description: 'Potato removal rates per ton',
              fertility_notes: 'Requires sulfur',
              crop_category: 'tuber',
              ph_range: '5.5-6.5',
              micronutrients: 'Boron',
              special_requirements: 'Use K₂SO₄',
            },
            {
              crop_name: 'dragon-fruit',
              p2o5_removal_rate: '2.0',
              k2o_removal_rate: '8.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: '3.0',
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Dragon fruit removal rates',
              fertility_notes: null,
              crop_category: 'fruit',
              ph_range: '6.0-7.0',
              micronutrients: 'Calcium',
              special_requirements: null,
            },
            {
              crop_name: 'moringa',
              p2o5_removal_rate: '1.5',
              k2o_removal_rate: '5.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Moringa removal rates',
              fertility_notes: null,
              crop_category: 'tree',
              ph_range: '6.0-8.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'lucerne',
              p2o5_removal_rate: '1.0',
              k2o_removal_rate: '3.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Lucerne removal rates',
              fertility_notes: null,
              crop_category: 'forage',
              ph_range: '6.5-7.5',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'tomato',
              p2o5_removal_rate: '2.5',
              k2o_removal_rate: '6.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Tomato removal rates',
              fertility_notes: 'Heavy feeder - requires consistent nutrition throughout season',
              crop_category: 'vegetable',
              ph_range: '6.0-6.8',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'cucumber',
              p2o5_removal_rate: '2.0',
              k2o_removal_rate: '4.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Cucumber removal rates',
              fertility_notes: null,
              crop_category: 'vegetable',
              ph_range: '6.0-7.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'lettuce',
              p2o5_removal_rate: '1.5',
              k2o_removal_rate: '3.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'ton',
              description: 'Lettuce removal rates',
              fertility_notes: null,
              crop_category: 'vegetable',
              ph_range: '6.0-7.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'maize',
              p2o5_removal_rate: '0.4',
              k2o_removal_rate: '0.25',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'bu',
              description: 'Maize removal rates',
              fertility_notes: null,
              crop_category: 'grain',
              ph_range: '6.0-7.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'wheat',
              p2o5_removal_rate: '0.6',
              k2o_removal_rate: '0.35',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'bu',
              description: 'Wheat removal rates',
              fertility_notes: null,
              crop_category: 'grain',
              ph_range: '6.0-7.0',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'grain-sorghum',
              p2o5_removal_rate: '0.45',
              k2o_removal_rate: '0.30',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'bu',
              description: 'Grain sorghum removal rates',
              fertility_notes: null,
              crop_category: 'grain',
              ph_range: '6.0-7.5',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'sunflower',
              p2o5_removal_rate: '1.2',
              k2o_removal_rate: '1.8',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: null,
              yield_unit: 'cwt',
              description: 'Sunflower removal rates',
              fertility_notes: null,
              crop_category: 'oilseed',
              ph_range: '6.0-7.5',
              micronutrients: null,
              special_requirements: null,
            },
            {
              crop_name: 'beetroot',
              p2o5_removal_rate: '2.0',
              k2o_removal_rate: '8.0',
              nitrogen_removal_rate: null,
              sulfur_removal_rate: null,
              calcium_removal_rate: null,
              boron_removal_rate: '0.03',
              yield_unit: 'ton',
              description: 'Beetroot removal rates',
              fertility_notes: 'Requires boron',
              crop_category: 'root',
              ph_range: '6.2-7.0',
              micronutrients: 'Boron',
              special_requirements: 'Maintain pH 6.2-7.0',
            },
          ],
          rowCount: 13,
          command: 'SELECT',
          oid: 0,
          fields: [],
        }
      }
      
      // Mock nitrogen_programs query
      if (sql.includes('nitrogen_programs')) {
        return {
          rows: [
            {
              transition_name: 'soybean-to-potato',
              from_crop: 'soybean',
              to_crop: 'potato',
              nitrogen_credit: '40',
              nitrogen_requirement: 'Reduced N rate by credit amount',
              application_strategy: 'Pre-plant N application',
              monitoring_requirements: 'Soil test before planting',
              notes: 'Legume credit applies',
              recommendations: 'Account for N credit in fertilizer plan',
            },
          ],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        }
      }
      
      // Mock potassium_sources query
      if (sql.includes('potassium_sources')) {
        return {
          rows: [
            {
              crop_name: 'potato',
              preferred_source: 'K₂SO₄ (SOP)',
              reason: 'Provides sulfur and avoids chloride',
              sources_to_avoid: 'Heavy preplant KCl',
              alternatives: 'Split applications of KCl',
              application_timing: 'Preplant and side-dress',
            },
          ],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        }
      }
      
      // Mock cover_crops query
      if (sql.includes('cover_crops')) {
        return {
          rows: [
            {
              after_crop: 'potato',
              primary_cover_crop: 'Rye',
              optional_cover_crops: ['Oats', 'Vetch'],
              benefits: 'Erosion control and soil improvement',
              timing: 'After harvest, before frost',
              termination_notes: 'Terminate 2-3 weeks before planting',
            },
            {
              after_crop: 'sunflower',
              primary_cover_crop: 'Rye',
              optional_cover_crops: ['Wheat', 'Oats'],
              benefits: 'Scavenge residual N and improve soil structure',
              timing: 'After harvest in fall',
              termination_notes: 'Spring termination before planting',
            },
          ],
          rowCount: 2,
          command: 'SELECT',
          oid: 0,
          fields: [],
        }
      }
      
      // Mock crop_monitoring_protocols query
      if (sql.includes('crop_monitoring_protocols')) {
        return {
          rows: [],
          rowCount: 0,
          command: 'SELECT',
          oid: 0,
          fields: [],
        }
      }
      
      // Default empty result
      return {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      }
    })
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

      const soybean = data.data.nutrientRemovalRates.soybean
      expect(soybean.p2o5_lb).toBe(0.75)
      expect(soybean.k2o_lb).toBe(1.17)
      expect(soybean.unit).toBe('bu')
      expect(soybean.description).toBe('Soybean grain removal rates per bushel')
    })

    it('should include potato removal rates', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('p2o5_lb', 3.0)
      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('k2o_lb', 12.5)
      expect(data.data.nutrientRemovalRates.potato).toHaveProperty('sulfur_lb')
    })

    it('should include extended crop list', async () => {
      const response = await GET()
      const data = await response.json()

      // Check new crops are included
      expect(data.data.nutrientRemovalRates).toHaveProperty('dragon-fruit')
      expect(data.data.nutrientRemovalRates).toHaveProperty('moringa')
      expect(data.data.nutrientRemovalRates).toHaveProperty('lucerne')
      expect(data.data.nutrientRemovalRates).toHaveProperty('tomato')
      expect(data.data.nutrientRemovalRates).toHaveProperty('cucumber')
      expect(data.data.nutrientRemovalRates).toHaveProperty('maize')
      expect(data.data.nutrientRemovalRates).toHaveProperty('wheat')
    })

    it('should include dragon fruit removal rates', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.data.nutrientRemovalRates['dragon-fruit']).toHaveProperty('p2o5_lb', 2.0)
      expect(data.data.nutrientRemovalRates['dragon-fruit']).toHaveProperty('k2o_lb', 8.0)
      expect(data.data.nutrientRemovalRates['dragon-fruit']).toHaveProperty('calcium_lb')
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
      const potatoRec = data.data.nutrientRecommendations.find((r: any) => r.crop === 'potato')

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
      expect(soybeanToPotato.guidance).toHaveProperty('nitrogenCredit')
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

    it('should work with new crops like dragon fruit', async () => {
      const request = {
        json: async () => ({
          crops: ['dragon-fruit', 'moringa'],
          yieldTargets: { 'dragon-fruit': 10, moringa: 5 },
          soilType: 'loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.nutrientRecommendations.length).toBe(2)

      const dragonFruitRec = data.data.nutrientRecommendations.find(
        (r: any) => r.crop === 'dragon-fruit'
      )
      expect(dragonFruitRec).toBeDefined()
      expect(dragonFruitRec.removal.p2o5_lb).toBe(20) // 10 tons * 2.0 lb/ton
      expect(dragonFruitRec.removal.k2o_lb).toBe(80) // 10 tons * 8.0 lb/ton
    })

    it('should work with vegetable crops', async () => {
      const request = {
        json: async () => ({
          crops: ['tomato', 'cucumber', 'lettuce'],
          yieldTargets: { tomato: 15, cucumber: 12, lettuce: 8 },
          soilType: 'sandy loam',
        }),
      } as Request

      const response = await POST(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.nutrientRecommendations.length).toBe(3)

      const tomatoRec = data.data.nutrientRecommendations.find((r: any) => r.crop === 'tomato')
      expect(tomatoRec).toBeDefined()
      expect(tomatoRec.recommendations).toContain(
        'Heavy feeder - requires consistent nutrition throughout season'
      )
    })
  })

  describe('PUT /api/fertility-management (AI Integration)', () => {
    it('should generate AI-ready recommendations', async () => {
      const request = {
        json: async () => ({
          crops: ['potato', 'tomato'],
          yieldTargets: { potato: 20, tomato: 15 },
          soilType: 'sandy loam',
          includeAI: true,
        }),
      } as Request

      const response = await PUT(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('fertilityPlan')
      expect(data.data).toHaveProperty('aiRecommendations')
      expect(Array.isArray(data.data.aiRecommendations)).toBe(true)
      expect(data.data.aiRecommendations.length).toBeGreaterThan(0)
    })

    it('should categorize AI recommendations', async () => {
      const request = {
        json: async () => ({
          crops: ['soybean', 'potato'],
          yieldTargets: { soybean: 50, potato: 20 },
          soilType: 'loam',
          includeAI: true,
        }),
      } as Request

      const response = await PUT(request)
      const data = await response.json()

      const categories = new Set(data.data.aiRecommendations.map((r: any) => r.category))
      expect(categories.has('fertility')).toBe(true)

      // Check priority levels
      const priorities = data.data.aiRecommendations.map((r: any) => r.priority)
      expect(Math.max(...priorities)).toBeGreaterThanOrEqual(8)
    })

    it('should skip AI recommendations when includeAI is false', async () => {
      const request = {
        json: async () => ({
          crops: ['potato'],
          yieldTargets: { potato: 20 },
          soilType: 'sandy',
          includeAI: false,
        }),
      } as Request

      const response = await PUT(request)
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.data.aiRecommendations).toEqual([])
    })
  })
})
