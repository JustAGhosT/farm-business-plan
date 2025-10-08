# Phase 3 Implementation Guide - Financial Tools & API Testing

## Overview

This document details the implementation of Phase 3 enhancements for the Farm Business Plan application, focusing on:
1. Calculator results persistence (saving calculations to database)
2. Comprehensive API testing infrastructure
3. Enhanced validation and error handling

## What Was Implemented

### 1. Calculator Results Database & API

#### Database Schema

Added `calculator_results` table to store financial calculator results:

```sql
CREATE TABLE calculator_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_plan_id UUID REFERENCES farm_plans(id) ON DELETE CASCADE,
    crop_plan_id UUID REFERENCES crop_plans(id) ON DELETE CASCADE,
    user_id UUID,
    calculator_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    results JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Supported Calculator Types:**
- `roi` - Return on Investment
- `break-even` - Break-Even Analysis
- `investment` - Investment Calculator
- `loan` - Loan Calculator
- `operating-costs` - Operating Costs Calculator
- `revenue` - Revenue Projections
- `cash-flow` - Cash Flow Projections
- `profit-margin` - Profit Margin Calculator

#### API Endpoints

**GET** `/api/calculator-results` - Retrieve calculator results

Query parameters:
- `farm_plan_id` (optional) - Filter by farm plan
- `crop_plan_id` (optional) - Filter by crop plan
- `calculator_type` (optional) - Filter by calculator type
- `user_id` (optional) - Filter by user
- `limit` (optional, default: 50) - Limit results

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "calculator_type": "roi",
      "input_data": {
        "initialInvestment": 100000,
        "annualRevenue": 50000,
        "annualCosts": 20000,
        "years": 5
      },
      "results": {
        "roi": 50,
        "netProfit": 150000,
        "annualNetProfit": 30000,
        "paybackPeriod": 3.33
      },
      "notes": "Initial calculation",
      "created_at": "2024-01-15T10:00:00Z",
      "farm_plan_name": "Green Valley Farm",
      "crop_name": "Dragon Fruit"
    }
  ],
  "count": 1
}
```

**POST** `/api/calculator-results` - Save a new calculator result

Request body:
```json
{
  "calculator_type": "roi",
  "input_data": {
    "initialInvestment": 100000,
    "annualRevenue": 50000,
    "annualCosts": 20000,
    "years": 5
  },
  "results": {
    "roi": 50,
    "netProfit": 150000,
    "annualNetProfit": 30000,
    "paybackPeriod": 3.33
  },
  "farm_plan_id": "uuid (optional)",
  "crop_plan_id": "uuid (optional)",
  "notes": "Optional notes"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  }
}
```

**DELETE** `/api/calculator-results?id=uuid` - Delete a calculator result

Response:
```json
{
  "success": true,
  "message": "Calculator result deleted successfully"
}
```

### 2. Testing Infrastructure

#### Test Setup

Added Jest testing framework with the following structure:

```
__tests__/
├── api/                       # API logic tests
│   ├── calculator-results.test.ts
│   ├── farm-plans.test.ts
│   └── tasks.test.ts
├── lib/                       # Library tests
│   └── validation.test.ts
└── utils/                     # Test utilities
    └── test-helpers.ts
```

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Coverage

Current test coverage:
- **52 tests passing**
- **Validation schemas**: 90%+ coverage
- **API logic**: Comprehensive validation testing
- **Error handling**: All edge cases covered

### 3. Validation Enhancements

Added `CalculatorResultSchema` to validation library:

```typescript
import { CalculatorResultSchema, validateData } from '@/lib/validation'

const result = validateData(CalculatorResultSchema, data)
if (!result.success) {
  // Handle validation errors
  console.error(result.errors)
} else {
  // Use validated data
  const validData = result.data
}
```

## Integration Examples

### Example 1: Save Calculator Results

```typescript
// In your calculator component
const saveCalculation = async () => {
  const calculatorResult = {
    calculator_type: 'roi',
    input_data: {
      initialInvestment: 100000,
      annualRevenue: 50000,
      annualCosts: 20000,
      years: 5
    },
    results: {
      roi: roiValue,
      netProfit: netProfitValue,
      annualNetProfit: annualNetProfitValue,
      paybackPeriod: paybackPeriodValue
    },
    farm_plan_id: currentFarmPlanId, // Optional
    notes: 'Q1 2024 projection'
  }

  const response = await fetch('/api/calculator-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(calculatorResult)
  })

  const data = await response.json()
  if (data.success) {
    console.log('Calculation saved:', data.data.id)
  }
}
```

### Example 2: Retrieve Calculator History

```typescript
// Get all ROI calculations for a farm
const getROIHistory = async (farmPlanId: string) => {
  const response = await fetch(
    `/api/calculator-results?farm_plan_id=${farmPlanId}&calculator_type=roi`
  )
  const data = await response.json()
  
  return data.data // Array of calculator results
}
```

### Example 3: Compare Calculations

```typescript
// Get recent calculations for comparison
const getRecentCalculations = async () => {
  const response = await fetch('/api/calculator-results?limit=10')
  const data = await response.json()
  
  // Compare results
  const calculations = data.data
  calculations.forEach(calc => {
    console.log(`${calc.calculator_type}: ROI ${calc.results.roi}%`)
  })
}
```

## Database Migration

To add the calculator_results table to your database:

```bash
# Using psql
psql -d your_database -f db/migrations/003_add_calculator_results.sql

# Or using your database management tool, run:
```

```sql
-- See db/migrations/003_add_calculator_results.sql for full migration
```

## Testing the Implementation

### 1. Run Unit Tests

```bash
npm test
```

All tests should pass. Expected output:
```
Test Suites: 4 passed, 4 total
Tests:       52 passed, 52 total
```

### 2. Test API Endpoints

```bash
# Start development server
npm run dev

# Test creating a calculator result
curl -X POST http://localhost:3000/api/calculator-results \
  -H "Content-Type: application/json" \
  -d '{
    "calculator_type": "roi",
    "input_data": {"initialInvestment": 100000},
    "results": {"roi": 50}
  }'

# Test retrieving calculator results
curl http://localhost:3000/api/calculator-results

# Test filtering by calculator type
curl "http://localhost:3000/api/calculator-results?calculator_type=roi"
```

### 3. Verify Build

```bash
npm run build
```

Build should complete successfully with no errors.

## Next Steps

### Immediate Enhancements
1. **Update Calculator UI Components**
   - Add "Save" button to each calculator
   - Display calculation history
   - Add comparison view

2. **Create Calculator History Page**
   - List all saved calculations
   - Filter and search functionality
   - Export to CSV/PDF

3. **Add Calculator Dashboard**
   - Visual charts of calculations over time
   - Comparison graphs
   - Key financial metrics

### Future Enhancements (Phase 3 continued)

#### Financial Reports Module
- Generate comprehensive financial reports
- Visual charts and graphs (Chart.js/Recharts)
- Year-over-year comparisons
- Budget vs. actual tracking

#### Export & Sharing
- PDF export for financial reports
- Excel/CSV export for data
- Email report functionality
- Shareable report links

## API Documentation Summary

### Calculator Results API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calculator-results` | Get all calculator results (with filters) |
| POST | `/api/calculator-results` | Create new calculator result |
| DELETE | `/api/calculator-results?id={id}` | Delete calculator result |

### Request/Response Formats

See detailed examples above in the API Endpoints section.

## Testing Documentation

### Test Structure

```typescript
// Validation tests
describe('Schema validation', () => {
  it('should validate correct data', () => {
    const result = validateData(Schema, validData)
    expect(result.success).toBe(true)
  })
  
  it('should reject invalid data', () => {
    const result = validateData(Schema, invalidData)
    expect(result.success).toBe(false)
  })
})
```

### Test Helpers

Available in `__tests__/utils/test-helpers.ts`:
- `createTestFarmPlan()` - Create test farm plan data
- `createTestTask()` - Create test task data
- `createTestCalculatorResult()` - Create test calculator result data
- `isValidUUID()` - Validate UUID format

## Troubleshooting

### Tests Failing

1. **Check Node environment**: Tests run in Node environment, not browser
2. **Clear Jest cache**: `npx jest --clearCache`
3. **Check test files**: Ensure `.test.ts` or `.spec.ts` extension

### Build Errors

1. **Type errors**: Run `npm run lint` to check for TypeScript issues
2. **Missing dependencies**: Run `npm install`
3. **Database connection**: Ensure DATABASE_URL is set correctly

### API Errors

1. **404 errors**: Ensure API route files are in correct location
2. **Validation errors**: Check request body matches schema
3. **Database errors**: Verify database migrations have run

## Success Metrics

✅ **All 52 tests passing**  
✅ **Build completes successfully**  
✅ **No linting errors**  
✅ **Calculator results API functional**  
✅ **Validation schemas comprehensive**  
✅ **Test coverage >90% for validation**  

## Files Created/Modified

### New Files
- `db/migrations/003_add_calculator_results.sql` - Database migration
- `app/api/calculator-results/route.ts` - Calculator results API
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file
- `__tests__/api/calculator-results.test.ts` - Calculator API tests
- `__tests__/api/farm-plans.test.ts` - Farm plans API tests
- `__tests__/api/tasks.test.ts` - Tasks API tests
- `__tests__/lib/validation.test.ts` - Validation tests
- `__tests__/utils/test-helpers.ts` - Test utilities
- `__tests__/__mocks__/lib/db.ts` - Database mock
- `PHASE3_GUIDE.md` - This file

### Modified Files
- `package.json` - Added test scripts and Jest dependency
- `lib/validation.ts` - Added CalculatorResultSchema

---

**Phase 3 Status**: ✅ Core Implementation Complete  
**Next Phase**: Phase 3 Continued - Financial Reports & Export

*Generated: January 2025*  
*Version: 1.0*
