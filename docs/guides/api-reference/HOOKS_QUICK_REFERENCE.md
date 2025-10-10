# Custom Hooks Quick Reference

Quick reference card for all custom hooks in the Farm Business Plan application.

---

## Import Statement

```typescript
import {
  useFarmPlans,
  useTasks,
  useClimateData,
  useCropPlans,
  useFinancialData,
  useCropTemplates,
  useAIRecommendations,
} from '@/lib/hooks'
```

---

## useFarmPlans

**Manages farm plans**

```typescript
// All farm plans
const { farmPlans, loading, error, refetch, createFarmPlan, updateFarmPlan, deleteFarmPlan } =
  useFarmPlans()

// By owner
const { farmPlans } = useFarmPlans('owner-uuid')

// Single farm plan
const { farmPlan, loading, error } = useFarmPlan('farm-plan-uuid')

// Create
await createFarmPlan({ name: 'My Farm', location: 'Bela Bela', farm_size: 5.5, status: 'draft' })

// Update
await updateFarmPlan('uuid', { status: 'active' })

// Delete
await deleteFarmPlan('uuid')
```

---

## useTasks

**Manages farm tasks**

```typescript
// All tasks
const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks()

// Filtered
const { tasks } = useTasks({ farm_plan_id: 'uuid', status: 'pending', priority: 'high' })

// Create
await createTask({
  farm_plan_id: 'uuid',
  title: 'Plant crops',
  status: 'pending',
  priority: 'high',
})

// Update
await updateTask('uuid', { status: 'completed' })

// Delete
await deleteTask('uuid')
```

---

## useClimateData ⚡ NEW

**Manages climate data**

```typescript
// All climate data
const { climateData, loading, error, createClimateData, updateClimateData, deleteClimateData } =
  useClimateData()

// By farm plan
const { climateData } = useClimateData({ farm_plan_id: 'uuid' })

// Convenience hook
const { climateData, loading, error } = useClimateDataByFarm('farm-plan-uuid')

// Create
await createClimateData({
  farm_plan_id: 'uuid',
  avg_temp_summer: 28.5,
  avg_temp_winter: 16.2,
  annual_rainfall: 600,
  frost_risk: false,
})
```

---

## useCropPlans ⚡ NEW

**Manages crop plans**

```typescript
// All crop plans
const { cropPlans, loading, error, createCropPlan, updateCropPlan, deleteCropPlan } = useCropPlans()

// Filtered
const { cropPlans } = useCropPlans({ farm_plan_id: 'uuid', status: 'planted' })

// Convenience hook
const { cropPlans, loading, error } = useCropPlansByFarm('farm-plan-uuid')

// Create
await createCropPlan({
  farm_plan_id: 'uuid',
  crop_name: 'Dragon Fruit',
  planting_area: 2.5,
  status: 'planned',
})

// Update
await updateCropPlan('uuid', { status: 'planted' })
```

---

## useFinancialData ⚡ NEW

**Manages financial projections**

```typescript
// All financial data
const {
  financialData,
  loading,
  error,
  createFinancialData,
  updateFinancialData,
  deleteFinancialData,
} = useFinancialData()

// By crop plan
const { financialData } = useFinancialData({ crop_plan_id: 'uuid' })

// By farm plan
const { financialData } = useFinancialData({ farm_plan_id: 'uuid' })

// Convenience hooks
const { financialData } = useFinancialDataByCrop('crop-plan-uuid')
const { financialData } = useFinancialDataByFarm('farm-plan-uuid')

// Create
await createFinancialData({
  crop_plan_id: 'uuid',
  initial_investment: 50000,
  projected_revenue: 150000,
  roi_percentage: 200,
})
```

---

## useCropTemplates ⚡ NEW

**Manages crop templates**

```typescript
// All templates
const {
  cropTemplates,
  loading,
  error,
  createCropTemplate,
  updateCropTemplate,
  deleteCropTemplate,
} = useCropTemplates()

// By category
const { cropTemplates } = useCropTemplates({ category: 'fruit' })

// Public only
const { cropTemplates } = useCropTemplates({ is_public: true })

// Convenience hooks
const { cropTemplates } = usePublicCropTemplates()
const { cropTemplates } = usePublicCropTemplates('fruit')
const { cropTemplates } = useCropTemplatesByCategory('fruit')

// Create
await createCropTemplate({
  name: 'Dragon Fruit Standard',
  category: 'fruit',
  is_public: true,
  technical_specs: { spacing: '3m x 3m' },
})
```

---

## useAIRecommendations ⚡ NEW

**Manages AI recommendations**

```typescript
// All recommendations
const {
  recommendations,
  loading,
  error,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} = useAIRecommendations()

// By farm plan
const { recommendations } = useAIRecommendations({ farm_plan_id: 'uuid' })

// By category
const { recommendations } = useAIRecommendations({ category: 'irrigation' })

// Convenience hooks
const { recommendations } = useAIRecommendationsByFarm('farm-plan-uuid')
const { recommendations } = useAIRecommendationsByCategory('irrigation')

// Create
await createRecommendation({
  farm_plan_id: 'uuid',
  recommendation_text: 'Consider drip irrigation',
  category: 'irrigation',
  priority: 5,
})
```

---

## Common Patterns

### Loading State

```typescript
const { data, loading } = useHook()

if (loading) return <LoadingSpinner />
```

### Error Handling

```typescript
const { data, error } = useHook()

if (error) return <ErrorMessage message={error} />
```

### Refetch Data

```typescript
const { data, refetch } = useHook()

await refetch() // Manually refresh data
```

### Conditional Fetching

```typescript
// Won't fetch if farmPlanId is null
const { cropPlans } = useCropPlansByFarm(farmPlanId)
```

---

## Return Values

All hooks return an object with:

| Key       | Type           | Description           |
| --------- | -------------- | --------------------- |
| `data`    | Array/Object   | The fetched data      |
| `loading` | boolean        | Loading state         |
| `error`   | string \| null | Error message if any  |
| `refetch` | function       | Manually refetch data |
| `create*` | function       | Create new item       |
| `update*` | function       | Update existing item  |
| `delete*` | function       | Delete item           |

---

## TypeScript Types

```typescript
import {
  type FarmPlan,
  type Task,
  type ClimateData,
  type CropPlan,
  type FinancialData,
  type CropTemplate,
  type AIRecommendation,
} from '@/lib/hooks'
```

---

## Complete Example

```typescript
'use client'

import { useFarmPlan, useCropPlansByFarm, useAIRecommendationsByFarm } from '@/lib/hooks'

export default function FarmDetailPage({ farmPlanId }: { farmPlanId: string }) {
  const { farmPlan, loading: farmLoading } = useFarmPlan(farmPlanId)
  const { cropPlans, loading: cropsLoading } = useCropPlansByFarm(farmPlanId)
  const { recommendations } = useAIRecommendationsByFarm(farmPlanId)

  if (farmLoading || cropsLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{farmPlan?.name}</h1>
      <p>Crops: {cropPlans.length}</p>
      <p>Recommendations: {recommendations.length}</p>
    </div>
  )
}
```

---

## Documentation Links

- **Full Documentation:** [HOOKS_DOCUMENTATION.md](./HOOKS_DOCUMENTATION.md)
- **Usage Examples:** [HOOKS_USAGE_EXAMPLES.md](./HOOKS_USAGE_EXAMPLES.md)
- **API Reference:** [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- **Integration Summary:** [AI_INTEGRATION_SUMMARY.md](./AI_INTEGRATION_SUMMARY.md)

---

**Quick Tip:** All hooks follow the same pattern. If you know how to use one, you know how to use them all! 🚀
