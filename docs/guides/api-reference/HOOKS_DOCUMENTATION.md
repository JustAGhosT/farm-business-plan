# Custom Hooks Documentation

This document provides comprehensive documentation for all custom React hooks available in the Farm Business Plan application.

## Overview

All hooks follow a consistent pattern and provide:
- Automatic data fetching on mount
- Loading and error states
- CRUD operations (Create, Read, Update, Delete)
- Filtering capabilities
- Automatic refetching after mutations

## Import Usage

All hooks can be imported from a single location:

```typescript
import { 
  useFarmPlans, 
  useTasks, 
  useClimateData,
  useCropPlans,
  useFinancialData,
  useCropTemplates,
  useAIRecommendations
} from '@/lib/hooks'
```

## Available Hooks

### 1. useFarmPlans

Manages farm plan data.

**Basic Usage:**
```typescript
import { useFarmPlans } from '@/lib/hooks'

function MyComponent() {
  const { 
    farmPlans, 
    loading, 
    error, 
    refetch,
    createFarmPlan,
    updateFarmPlan,
    deleteFarmPlan
  } = useFarmPlans()

  // Display farm plans
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {farmPlans.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  )
}
```

**Filter by Owner:**
```typescript
const { farmPlans } = useFarmPlans('user-uuid')
```

**Single Farm Plan:**
```typescript
import { useFarmPlan } from '@/lib/hooks'

const { farmPlan, loading, error } = useFarmPlan('farm-plan-uuid')
```

**Create Farm Plan:**
```typescript
const { createFarmPlan } = useFarmPlans()

const newPlan = await createFarmPlan({
  name: 'My Farm',
  location: 'Bela Bela',
  province: 'Limpopo',
  farm_size: 5.5,
  status: 'draft'
})
```

---

### 2. useTasks

Manages task data for farm operations.

**Basic Usage:**
```typescript
import { useTasks } from '@/lib/hooks'

const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks()
```

**Filter by Farm Plan:**
```typescript
const { tasks } = useTasks({ farm_plan_id: 'uuid' })
```

**Filter by Status:**
```typescript
const { tasks } = useTasks({ status: 'pending' })
```

**Multiple Filters:**
```typescript
const { tasks } = useTasks({ 
  farm_plan_id: 'uuid',
  status: 'pending',
  priority: 'high'
})
```

**Create Task:**
```typescript
const newTask = await createTask({
  farm_plan_id: 'uuid',
  title: 'Plant dragon fruit cuttings',
  description: 'Plant 100 cuttings in prepared beds',
  status: 'pending',
  priority: 'high',
  due_date: '2025-02-15'
})
```

---

### 3. useClimateData

Manages climate data associated with farm plans.

**Basic Usage:**
```typescript
import { useClimateData } from '@/lib/hooks'

const { 
  climateData, 
  loading, 
  error,
  createClimateData,
  updateClimateData,
  deleteClimateData
} = useClimateData()
```

**Filter by Farm Plan:**
```typescript
const { climateData } = useClimateData({ farm_plan_id: 'uuid' })
```

**Convenience Hook:**
```typescript
import { useClimateDataByFarm } from '@/lib/hooks'

const { climateData, loading, error } = useClimateDataByFarm('farm-plan-uuid')
```

**Create Climate Data:**
```typescript
const newClimateData = await createClimateData({
  farm_plan_id: 'uuid',
  avg_temp_summer: 28.5,
  avg_temp_winter: 16.2,
  annual_rainfall: 600,
  frost_risk: false,
  growing_season_length: 210,
  auto_populated: false
})
```

---

### 4. useCropPlans

Manages individual crop plans within farm plans.

**Basic Usage:**
```typescript
import { useCropPlans } from '@/lib/hooks'

const { 
  cropPlans, 
  loading, 
  error,
  createCropPlan,
  updateCropPlan,
  deleteCropPlan
} = useCropPlans()
```

**Filter by Farm Plan:**
```typescript
const { cropPlans } = useCropPlans({ farm_plan_id: 'uuid' })
```

**Filter by Status:**
```typescript
const { cropPlans } = useCropPlans({ status: 'planted' })
```

**Convenience Hook:**
```typescript
import { useCropPlansByFarm } from '@/lib/hooks'

const { cropPlans, loading, error } = useCropPlansByFarm('farm-plan-uuid')
```

**Create Crop Plan:**
```typescript
const newCropPlan = await createCropPlan({
  farm_plan_id: 'uuid',
  crop_name: 'Dragon Fruit',
  crop_variety: 'Red Pitaya',
  planting_area: 2.5,
  planting_date: '2025-03-01',
  harvest_date: '2025-12-01',
  expected_yield: 5000,
  yield_unit: 'kg',
  status: 'planned'
})
```

---

### 5. useFinancialData

Manages financial projections and analysis for crop plans.

**Basic Usage:**
```typescript
import { useFinancialData } from '@/lib/hooks'

const { 
  financialData, 
  loading, 
  error,
  createFinancialData,
  updateFinancialData,
  deleteFinancialData
} = useFinancialData()
```

**Filter by Crop Plan:**
```typescript
const { financialData } = useFinancialData({ crop_plan_id: 'uuid' })
```

**Filter by Farm Plan:**
```typescript
const { financialData } = useFinancialData({ farm_plan_id: 'uuid' })
```

**Convenience Hooks:**
```typescript
import { useFinancialDataByCrop, useFinancialDataByFarm } from '@/lib/hooks'

const { financialData } = useFinancialDataByCrop('crop-plan-uuid')
const { financialData } = useFinancialDataByFarm('farm-plan-uuid')
```

**Create Financial Data:**
```typescript
const newFinancialData = await createFinancialData({
  crop_plan_id: 'uuid',
  initial_investment: 50000,
  fixed_costs: 15000,
  variable_costs: 10000,
  monthly_operating_costs: 3000,
  annual_operating_costs: 36000,
  projected_revenue: 150000,
  break_even_point: 18,
  roi_percentage: 200
})
```

---

### 6. useCropTemplates

Manages reusable crop templates with technical specifications.

**Basic Usage:**
```typescript
import { useCropTemplates } from '@/lib/hooks'

const { 
  cropTemplates, 
  loading, 
  error,
  createCropTemplate,
  updateCropTemplate,
  deleteCropTemplate
} = useCropTemplates()
```

**Filter by Category:**
```typescript
const { cropTemplates } = useCropTemplates({ category: 'fruit' })
```

**Filter Public Templates:**
```typescript
const { cropTemplates } = useCropTemplates({ is_public: true })
```

**Convenience Hooks:**
```typescript
import { usePublicCropTemplates, useCropTemplatesByCategory } from '@/lib/hooks'

const { cropTemplates } = usePublicCropTemplates()
const { cropTemplates } = usePublicCropTemplates('fruit') // with category
const { cropTemplates } = useCropTemplatesByCategory('fruit')
```

**Create Crop Template:**
```typescript
const newTemplate = await createCropTemplate({
  name: 'Dragon Fruit Standard',
  description: 'Standard dragon fruit cultivation template',
  category: 'fruit',
  technical_specs: {
    spacing: '3m x 3m',
    support_type: 'trellis',
    irrigation: 'drip'
  },
  financial_projections: {
    initial_cost_per_ha: 80000,
    annual_revenue_per_ha: 150000
  },
  growing_requirements: {
    temperature_min: 15,
    temperature_max: 35,
    rainfall_min: 400,
    rainfall_max: 1000
  },
  market_info: {
    target_markets: ['local', 'export'],
    price_per_kg: 30
  },
  is_public: true
})
```

---

### 7. useAIRecommendations

Manages AI-generated recommendations for farm plans.

**Basic Usage:**
```typescript
import { useAIRecommendations } from '@/lib/hooks'

const { 
  recommendations, 
  loading, 
  error,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation
} = useAIRecommendations()
```

**Filter by Farm Plan:**
```typescript
const { recommendations } = useAIRecommendations({ farm_plan_id: 'uuid' })
```

**Filter by Category:**
```typescript
const { recommendations } = useAIRecommendations({ category: 'irrigation' })
```

**Convenience Hooks:**
```typescript
import { useAIRecommendationsByFarm, useAIRecommendationsByCategory } from '@/lib/hooks'

const { recommendations } = useAIRecommendationsByFarm('farm-plan-uuid')
const { recommendations } = useAIRecommendationsByCategory('irrigation')
```

**Create Recommendation:**
```typescript
const newRecommendation = await createRecommendation({
  farm_plan_id: 'uuid',
  recommendation_text: 'Consider installing drip irrigation to reduce water usage by 40%',
  category: 'irrigation',
  priority: 5
})
```

---

## Common Patterns

### Error Handling

All hooks provide error states:

```typescript
const { data, loading, error } = useHook()

if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error} />

return <DataDisplay data={data} />
```

### Manual Refetch

```typescript
const { data, refetch } = useHook()

const handleRefresh = async () => {
  await refetch()
}
```

### Conditional Fetching

Only fetch when a required parameter is available:

```typescript
// Hook won't fetch if farmPlanId is null
const { cropPlans } = useCropPlansByFarm(farmPlanId)
```

### Loading States

```typescript
const { loading } = useHook()

return (
  <div>
    {loading ? (
      <div className="animate-pulse">Loading...</div>
    ) : (
      <DataDisplay />
    )}
  </div>
)
```

### Optimistic Updates

```typescript
const { tasks, updateTask } = useTasks()

const handleToggleComplete = async (taskId: string, currentStatus: string) => {
  // Optimistically update UI
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
  
  // Update via API (automatically refetches)
  await updateTask(taskId, { status: newStatus })
}
```

---

## TypeScript Support

All hooks are fully typed. Import types alongside hooks:

```typescript
import { useFarmPlans, type FarmPlan } from '@/lib/hooks'

const { farmPlans } = useFarmPlans()

const selectedPlan: FarmPlan = farmPlans[0]
```

Available types:
- `FarmPlan`
- `Task`
- `ClimateData`
- `CropPlan`
- `FinancialData`
- `CropTemplate`
- `AIRecommendation`

---

## Best Practices

### 1. Use Convenience Hooks

When filtering by a single parameter, use the convenience hooks:

```typescript
// Instead of:
const { cropPlans } = useCropPlans({ farm_plan_id: farmId })

// Use:
const { cropPlans } = useCropPlansByFarm(farmId)
```

### 2. Handle Loading States

Always handle loading states to prevent flickering:

```typescript
if (loading) return <Skeleton />
```

### 3. Destructure Only What You Need

```typescript
// Only need data and loading
const { cropPlans, loading } = useCropPlans()
```

### 4. Avoid Multiple Hooks for Same Data

```typescript
// ❌ Bad - fetches twice
const { farmPlans: plans1 } = useFarmPlans()
const { farmPlans: plans2 } = useFarmPlans()

// ✅ Good - fetch once, share data
const { farmPlans } = useFarmPlans()
```

### 5. Use useCallback for Actions

```typescript
const { createTask } = useTasks()

const handleCreateTask = useCallback(async (data) => {
  const newTask = await createTask(data)
  if (newTask) {
    console.log('Task created:', newTask.id)
  }
}, [createTask])
```

---

## Advanced Usage

### Combining Multiple Hooks

```typescript
function FarmDashboard({ farmPlanId }: { farmPlanId: string }) {
  const { farmPlan, loading: farmLoading } = useFarmPlan(farmPlanId)
  const { cropPlans, loading: cropsLoading } = useCropPlansByFarm(farmPlanId)
  const { tasks, loading: tasksLoading } = useTasks({ farm_plan_id: farmPlanId })
  const { recommendations } = useAIRecommendationsByFarm(farmPlanId)

  const loading = farmLoading || cropsLoading || tasksLoading

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1>{farmPlan?.name}</h1>
      <div>Crops: {cropPlans.length}</div>
      <div>Tasks: {tasks.length}</div>
      <RecommendationsList recommendations={recommendations} />
    </div>
  )
}
```

### Pagination (Future Enhancement)

Hooks are ready for pagination support:

```typescript
// Future API
const { cropPlans, hasMore, loadMore } = useCropPlans({ 
  farm_plan_id: 'uuid',
  page: 1,
  per_page: 20
})
```

---

## Testing

When testing components that use these hooks, mock them:

```typescript
import { useFarmPlans } from '@/lib/hooks'

jest.mock('@/lib/hooks', () => ({
  useFarmPlans: jest.fn()
}))

describe('MyComponent', () => {
  it('renders farm plans', () => {
    (useFarmPlans as jest.Mock).mockReturnValue({
      farmPlans: [{ id: '1', name: 'Test Farm' }],
      loading: false,
      error: null
    })

    render(<MyComponent />)
    expect(screen.getByText('Test Farm')).toBeInTheDocument()
  })
})
```

---

## API Response Format

All hooks expect consistent API responses:

**Success:**
```json
{
  "success": true,
  "data": { /* resource or array */ },
  "count": 1,
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [ /* validation errors */ ]
}
```

---

## Troubleshooting

### Hook Not Fetching Data

Check that:
1. API endpoint is accessible
2. Database connection is configured
3. Required parameters are provided
4. CORS is configured if calling from different origin

### Stale Data

Force a refetch:
```typescript
const { refetch } = useHook()
await refetch()
```

### Memory Leaks

Hooks automatically cleanup on unmount. No manual cleanup needed.

---

## Related Documentation

- [API Endpoints Documentation](../API_ENDPOINTS.md)
- [Database Schema](../db/schema.sql)
- [Validation Schemas](../lib/validation.ts)
- [Phase 1 Implementation Guide](../PHASE1_GUIDE.md)

---

## Support

For issues or questions:
1. Check the [Issues](https://github.com/JustAGhosT/farm-business-plan/issues) page
2. Review [API_ENDPOINTS.md](../API_ENDPOINTS.md) for API details
3. Check validation schemas in `lib/validation.ts`
