# Testing Guide

This document provides guidance on running and writing tests for the Farm Business Plan application.

## Overview

The application uses **Jest** as the testing framework with support for TypeScript and Next.js.

## Test Structure

```
__tests__/
├── api/                       # API validation and logic tests
│   ├── calculator-results.test.ts
│   ├── farm-plans.test.ts
│   └── tasks.test.ts
├── lib/                       # Library/utility tests
│   └── validation.test.ts
├── utils/                     # Test utilities
│   └── test-helpers.ts
└── __mocks__/                 # Mock implementations
    └── lib/
        └── db.ts
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage report will be generated in the `coverage/` directory.

### Run Specific Test File
```bash
npm test -- validation.test.ts
```

### Run Tests Matching a Pattern
```bash
npm test -- --testNamePattern="should validate"
```

## Current Test Coverage

**Total Tests**: 52  
**Test Suites**: 4

| Test Suite | Tests | Status |
|------------|-------|--------|
| Validation Schemas | 14 | ✅ Passing |
| Calculator Results API | 12 | ✅ Passing |
| Farm Plans API | 12 | ✅ Passing |
| Tasks API | 14 | ✅ Passing |

### Coverage by Module

| Module | Coverage |
|--------|----------|
| Validation Schemas | >90% |
| API Logic | Comprehensive |
| Error Handling | All edge cases |

## Writing Tests

### Test Naming Convention

```typescript
describe('Component/Module Name', () => {
  describe('Specific Feature', () => {
    it('should do something specific', () => {
      // Test implementation
    })
    
    it('should handle error cases', () => {
      // Error test
    })
  })
})
```

### Using Test Helpers

```typescript
import { 
  createTestFarmPlan,
  createTestTask,
  createTestCalculatorResult 
} from '../utils/test-helpers'

// Create test data
const farmPlan = createTestFarmPlan()
const task = createTestTask(farmPlan.id)
const calcResult = createTestCalculatorResult()
```

### Validation Testing Example

```typescript
import { FarmPlanSchema, validateData } from '@/lib/validation'

describe('FarmPlanSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      name: 'Test Farm',
      location: 'Bela Bela',
      farm_size: 5.5
    }
    
    const result = validateData(FarmPlanSchema, validData)
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })
  
  it('should reject invalid data', () => {
    const invalidData = {
      name: 'Test Farm'
      // missing required fields
    }
    
    const result = validateData(FarmPlanSchema, invalidData)
    
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })
})
```

### API Logic Testing Example

```typescript
import { TaskSchema, validateData } from '@/lib/validation'
import { createTestTask } from '../utils/test-helpers'

describe('Tasks API Logic', () => {
  const farmPlanId = '123e4567-e89b-12d3-a456-426614174000'
  
  it('should validate a valid task', () => {
    const validTask = createTestTask(farmPlanId)
    const result = validateData(TaskSchema, validTask)
    
    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('Test Task')
  })
})
```

## Test Utilities

### Available Helpers

Located in `__tests__/utils/test-helpers.ts`:

#### `createTestFarmPlan(overrides?)`
Creates a valid farm plan object for testing.

```typescript
const farmPlan = createTestFarmPlan({
  name: 'Custom Farm Name',
  farm_size: 10.5
})
```

#### `createTestTask(farmPlanId, overrides?)`
Creates a valid task object for testing.

```typescript
const task = createTestTask(farmPlanId, {
  priority: 'high',
  status: 'in-progress'
})
```

#### `createTestCalculatorResult(overrides?)`
Creates a valid calculator result object.

```typescript
const result = createTestCalculatorResult({
  calculator_type: 'roi',
  results: { roi: 75 }
})
```

#### `isValidUUID(uuid)`
Validates UUID format.

```typescript
expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
```

## Best Practices

### 1. Test One Thing at a Time
```typescript
// Good ✅
it('should reject negative farm size', () => {
  const result = validateData(FarmPlanSchema, { farm_size: -5 })
  expect(result.success).toBe(false)
})

// Avoid ❌
it('should validate everything', () => {
  // Testing multiple unrelated things
})
```

### 2. Use Descriptive Test Names
```typescript
// Good ✅
it('should accept all valid status values', () => { })

// Avoid ❌
it('test status', () => { })
```

### 3. Test Both Success and Failure Cases
```typescript
describe('Task validation', () => {
  it('should validate correct task data', () => { })
  it('should reject task without required fields', () => { })
  it('should reject invalid status values', () => { })
})
```

### 4. Use Setup and Teardown
```typescript
describe('API tests', () => {
  beforeEach(() => {
    // Setup before each test
  })
  
  afterEach(() => {
    // Cleanup after each test
  })
})
```

### 5. Keep Tests Independent
Each test should run independently without depending on other tests.

```typescript
// Good ✅
it('should create a farm plan', () => {
  const plan = createTestFarmPlan()
  // Test with this specific plan
})

// Avoid ❌
let sharedPlan // Don't share state between tests
it('should create a farm plan', () => {
  sharedPlan = createTestFarmPlan()
})
```

## Continuous Integration

Tests automatically run on:
- Pull request creation
- Push to main branch
- Manual workflow dispatch

### CI/CD Configuration

Tests must pass before merging. The CI pipeline:
1. Installs dependencies
2. Runs linter
3. Runs all tests
4. Builds the application

## Debugging Tests

### Run a Single Test in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand test-file.test.ts
```

### View Detailed Error Messages
```bash
npm test -- --verbose
```

### Clear Jest Cache
If tests behave unexpectedly:
```bash
npx jest --clearCache
npm test
```

## Common Issues

### "Cannot find module" Errors
- Check import paths use `@/` alias
- Ensure files exist in correct locations
- Run `npm install` to install dependencies

### "Timeout" Errors
- Increase timeout for slow tests:
```typescript
it('should handle slow operation', async () => {
  // Test code
}, 10000) // 10 second timeout
```

### TypeScript Errors in Tests
- Ensure `@types/jest` is installed
- Check `tsconfig.json` includes test files
- Use proper TypeScript types

## Future Testing Enhancements

- [ ] Add integration tests for API routes
- [ ] Add E2E tests with Playwright
- [ ] Add component tests for React components
- [ ] Set up test database for integration tests
- [ ] Add performance/load tests
- [ ] Increase coverage to >95%

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Support

For questions or issues with tests:
1. Check this guide
2. Review existing test examples
3. Check Jest documentation
4. Open a GitHub issue

---

**Last Updated**: January 2025  
**Test Framework**: Jest 29+  
**Total Tests**: 52 passing
