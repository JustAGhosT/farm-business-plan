/**
 * Test utilities for API testing
 */

// Mock environment variables for testing
export function setupTestEnv() {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
}

// Mock fetch response helper
export function createMockResponse(data: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }
}

// Helper to create test farm plan data
export function createTestFarmPlan(overrides = {}) {
  return {
    name: 'Test Farm',
    location: 'Test Location',
    province: 'Limpopo',
    farm_size: 5.5,
    soil_type: 'Loamy',
    water_source: 'Borehole',
    status: 'draft',
    ...overrides,
  }
}

// Helper to create test crop plan data
export function createTestCropPlan(farmPlanId: string, overrides = {}) {
  return {
    farm_plan_id: farmPlanId,
    crop_name: 'Dragon Fruit',
    crop_variety: 'White Flesh',
    planting_area: 2.5,
    expected_yield: 1000,
    yield_unit: 'kg',
    status: 'planned',
    ...overrides,
  }
}

// Helper to create test task data
export function createTestTask(farmPlanId: string, overrides = {}) {
  return {
    farm_plan_id: farmPlanId,
    title: 'Test Task',
    description: 'Test task description',
    status: 'pending',
    priority: 'medium',
    category: 'Planting',
    ...overrides,
  }
}

// Helper to create test calculator result data
export function createTestCalculatorResult(overrides = {}) {
  return {
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
    notes: 'Test calculation',
    ...overrides,
  }
}

// Helper to create test financial data
export function createTestFinancialData(cropPlanId: string, overrides = {}) {
  return {
    crop_plan_id: cropPlanId,
    initial_investment: 100000,
    fixed_costs: 20000,
    variable_costs: 10000,
    monthly_operating_costs: 5000,
    annual_operating_costs: 60000,
    projected_revenue: 150000,
    break_even_point: 18,
    roi_percentage: 50,
    ...overrides,
  }
}

// Mock database query function
export function createMockQuery() {
  return jest.fn().mockResolvedValue({
    rows: [],
    rowCount: 0,
    command: '',
    oid: 0,
    fields: [],
  })
}

// Validation test helper
export function expectValidationError(response: any, field?: string) {
  expect(response.success).toBe(false)
  expect(response.error).toBeTruthy()
  if (field) {
    expect(response.details).toBeDefined()
  }
}

// Success response test helper
export function expectSuccessResponse(response: any) {
  expect(response.success).toBe(true)
  expect(response.data).toBeDefined()
}

// UUID validation helper
export function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
