# Usage Examples for Custom Hooks

This file provides practical examples of using the custom hooks in real-world components.

## Example 1: Farm Plans Dashboard

A dashboard that displays all farm plans with their associated data.

```typescript
'use client'

import { useFarmPlans, useCropPlans, useTasks } from '@/lib/hooks'
import Link from 'next/link'

export default function FarmPlansDashboard() {
  const { farmPlans, loading, error } = useFarmPlans()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading farm plans: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {farmPlans.map(plan => (
        <Link
          key={plan.id}
          href={`/tools/dashboard/farm/${plan.id}`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.location}, {plan.province}</p>
          <div className="flex justify-between text-sm">
            <span>Size: {plan.farm_size} ha</span>
            <span className="text-primary-600">{plan.crop_count || 0} crops</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
```

---

## Example 2: Create Farm Plan Form

A form component that creates a new farm plan.

```typescript
'use client'

import { useState } from 'react'
import { useFarmPlans } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export default function CreateFarmPlanForm() {
  const router = useRouter()
  const { createFarmPlan, loading, error } = useFarmPlans()

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    province: '',
    farm_size: '',
    soil_type: '',
    water_source: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newPlan = await createFarmPlan({
      name: formData.name,
      location: formData.location,
      province: formData.province,
      farm_size: parseFloat(formData.farm_size),
      soil_type: formData.soil_type,
      water_source: formData.water_source,
      status: 'draft'
    })

    if (newPlan) {
      router.push(`/tools/dashboard/farm/${newPlan.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-2">Farm Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Location *</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Province *</label>
        <select
          value={formData.province}
          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="">Select Province</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Gauteng">Gauteng</option>
          <option value="KwaZulu-Natal">KwaZulu-Natal</option>
          {/* Add more provinces */}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Farm Size (hectares) *</label>
        <input
          type="number"
          step="0.1"
          value={formData.farm_size}
          onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Farm Plan'}
      </button>
    </form>
  )
}
```

---

## Example 3: Crop Plans List with Financial Data

Display crop plans with their associated financial projections.

```typescript
'use client'

import { useCropPlansByFarm, useFinancialData } from '@/lib/hooks'

interface CropPlansListProps {
  farmPlanId: string
}

export default function CropPlansList({ farmPlanId }: CropPlansListProps) {
  const { cropPlans, loading: cropsLoading, error: cropsError } = useCropPlansByFarm(farmPlanId)
  const { financialData, loading: financialLoading } = useFinancialData({ farm_plan_id: farmPlanId })

  if (cropsLoading || financialLoading) {
    return <div>Loading crop plans...</div>
  }

  if (cropsError) {
    return <div>Error: {cropsError}</div>
  }

  const getFinancialDataForCrop = (cropPlanId: string) => {
    return financialData.find(fd => fd.crop_plan_id === cropPlanId)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Crop Plans</h2>

      {cropPlans.length === 0 ? (
        <p className="text-gray-600">No crop plans yet. Add your first crop!</p>
      ) : (
        <div className="grid gap-4">
          {cropPlans.map(crop => {
            const financial = getFinancialDataForCrop(crop.id)

            return (
              <div key={crop.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{crop.crop_name}</h3>
                    {crop.crop_variety && (
                      <p className="text-gray-600">{crop.crop_variety}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    crop.status === 'harvested' ? 'bg-green-100 text-green-800' :
                    crop.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                    crop.status === 'planted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {crop.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Planting Area</p>
                    <p className="font-semibold">{crop.planting_area} ha</p>
                  </div>
                  {crop.expected_yield && (
                    <div>
                      <p className="text-sm text-gray-600">Expected Yield</p>
                      <p className="font-semibold">
                        {crop.expected_yield} {crop.yield_unit}
                      </p>
                    </div>
                  )}
                </div>

                {financial && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Financial Projection</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {financial.initial_investment && (
                        <div>
                          <span className="text-gray-600">Investment: </span>
                          <span className="font-semibold">
                            R {financial.initial_investment.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {financial.projected_revenue && (
                        <div>
                          <span className="text-gray-600">Revenue: </span>
                          <span className="font-semibold">
                            R {financial.projected_revenue.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {financial.roi_percentage && (
                        <div>
                          <span className="text-gray-600">ROI: </span>
                          <span className="font-semibold text-green-600">
                            {financial.roi_percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

---

## Example 4: Tasks Manager with Status Updates

Manage and update task status.

```typescript
'use client'

import { useTasks } from '@/lib/hooks'
import { useState } from 'react'

interface TasksManagerProps {
  farmPlanId: string
}

export default function TasksManager({ farmPlanId }: TasksManagerProps) {
  const { tasks, loading, error, updateTask, deleteTask } = useTasks({ farm_plan_id: farmPlanId })
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(task => task.status === filter)

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, {
      status: newStatus as any,
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
    })
  }

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId)
    }
  }

  if (loading) return <div>Loading tasks...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} tasks</p>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleStatusChange(
                  task.id,
                  task.status === 'completed' ? 'pending' : 'completed'
                )}
                className="w-5 h-5"
              />

              <div className="flex-1">
                <h3 className={`font-semibold ${
                  task.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  <span className={`px-2 py-1 rounded ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => handleDelete(task.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

---

## Example 5: AI Recommendations Display

Display AI-generated recommendations with filtering.

```typescript
'use client'

import { useAIRecommendationsByFarm } from '@/lib/hooks'
import { useState } from 'react'

interface AIRecommendationsProps {
  farmPlanId: string
}

export default function AIRecommendations({ farmPlanId }: AIRecommendationsProps) {
  const { recommendations, loading, error } = useAIRecommendationsByFarm(farmPlanId)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (loading) return <div>Loading recommendations...</div>
  if (error) return <div>Error: {error}</div>

  const categories = ['all', ...new Set(recommendations.map(r => r.category).filter(Boolean))]

  const filteredRecommendations = selectedCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === selectedCategory)

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => b.priority - a.priority)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🤖 AI Recommendations</h2>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {sortedRecommendations.length === 0 ? (
        <p className="text-gray-600">No recommendations available</p>
      ) : (
        <div className="space-y-3">
          {sortedRecommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-primary-600 rounded-lg"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">
                {rec.priority}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{rec.recommendation_text}</p>
                {rec.category && (
                  <span className="inline-block mt-2 px-2 py-1 bg-white text-xs rounded">
                    {rec.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Example 6: Climate Data Display

Show climate information for a farm.

```typescript
'use client'

import { useClimateDataByFarm } from '@/lib/hooks'

interface ClimateDisplayProps {
  farmPlanId: string
}

export default function ClimateDisplay({ farmPlanId }: ClimateDisplayProps) {
  const { climateData, loading, error } = useClimateDataByFarm(farmPlanId)

  if (loading) return <div>Loading climate data...</div>
  if (error) return <div>Error: {error}</div>
  if (climateData.length === 0) return <div>No climate data available</div>

  const climate = climateData[0] // Get most recent

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        🌡️ Climate Information
        {climate.auto_populated && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Auto-populated
          </span>
        )}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Summer Temp</p>
          <p className="text-2xl font-bold text-orange-600">
            {climate.avg_temp_summer}°C
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Average Winter Temp</p>
          <p className="text-2xl font-bold text-blue-600">
            {climate.avg_temp_winter}°C
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Annual Rainfall</p>
          <p className="text-2xl font-bold text-blue-500">
            {climate.annual_rainfall} mm
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-600">Frost Risk</p>
          <p className={`text-2xl font-bold ${
            climate.frost_risk ? 'text-red-600' : 'text-green-600'
          }`}>
            {climate.frost_risk ? '⚠️ Yes' : '✓ No'}
          </p>
        </div>

        {climate.growing_season_length && (
          <div className="bg-white rounded-lg p-4 md:col-span-2">
            <p className="text-sm text-gray-600">Growing Season Length</p>
            <p className="text-2xl font-bold text-green-600">
              {climate.growing_season_length} days
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Example 7: Crop Templates Browser

Browse and use crop templates.

```typescript
'use client'

import { usePublicCropTemplates } from '@/lib/hooks'
import { useState } from 'react'

export default function CropTemplatesBrowser() {
  const { cropTemplates, loading, error } = usePublicCropTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  if (loading) return <div>Loading templates...</div>
  if (error) return <div>Error: {error}</div>

  const selected = cropTemplates.find(t => t.id === selectedTemplate)

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Templates List */}
      <div className="md:col-span-1 space-y-2">
        <h3 className="font-bold mb-4">Available Templates</h3>
        {cropTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedTemplate === template.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <p className="font-semibold">{template.name}</p>
            {template.category && (
              <p className="text-xs text-gray-600">{template.category}</p>
            )}
          </button>
        ))}
      </div>

      {/* Template Details */}
      <div className="md:col-span-2">
        {selected ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
            {selected.description && (
              <p className="text-gray-600 mb-6">{selected.description}</p>
            )}

            {selected.technical_specs && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Technical Specifications</h4>
                <div className="bg-gray-50 rounded p-4">
                  <pre className="text-sm">
                    {JSON.stringify(selected.technical_specs, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {selected.financial_projections && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Financial Projections</h4>
                <div className="bg-gray-50 rounded p-4">
                  <pre className="text-sm">
                    {JSON.stringify(selected.financial_projections, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Use This Template
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a template to view details
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Example 8: Complete Farm Detail Page

A comprehensive page combining multiple hooks.

```typescript
'use client'

import { useFarmPlan } from '@/lib/hooks'
import CropPlansList from './CropPlansList'
import TasksManager from './TasksManager'
import AIRecommendations from './AIRecommendations'
import ClimateDisplay from './ClimateDisplay'

interface FarmDetailPageProps {
  params: { id: string }
}

export default function FarmDetailPage({ params }: FarmDetailPageProps) {
  const { farmPlan, loading, error, refetch } = useFarmPlan(params.id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm plan...</p>
        </div>
      </div>
    )
  }

  if (error || !farmPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Farm Plan</h2>
          <p className="text-red-600">{error || 'Farm plan not found'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{farmPlan.name}</h1>
        <p className="text-gray-600 text-lg">
          📍 {farmPlan.location}, {farmPlan.province}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-600">Farm Size</p>
            <p className="text-xl font-bold">{farmPlan.farm_size} ha</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold capitalize">{farmPlan.status}</p>
          </div>
          {farmPlan.crop_count !== undefined && (
            <div>
              <p className="text-sm text-gray-600">Crops</p>
              <p className="text-xl font-bold">{farmPlan.crop_count}</p>
            </div>
          )}
          {farmPlan.task_count !== undefined && (
            <div>
              <p className="text-sm text-gray-600">Tasks</p>
              <p className="text-xl font-bold">{farmPlan.task_count}</p>
            </div>
          )}
        </div>
      </div>

      {/* Climate Data */}
      <ClimateDisplay farmPlanId={params.id} />

      {/* AI Recommendations */}
      <AIRecommendations farmPlanId={params.id} />

      {/* Crop Plans */}
      <CropPlansList farmPlanId={params.id} />

      {/* Tasks */}
      <TasksManager farmPlanId={params.id} />
    </div>
  )
}
```

---

## Tips for Using These Examples

1. **Copy and adapt** - These examples are starting points, modify them for your needs
2. **Error handling** - Always handle loading and error states
3. **Accessibility** - Add proper ARIA labels and keyboard navigation
4. **Responsive design** - Test on mobile, tablet, and desktop
5. **Type safety** - Use TypeScript for better developer experience
6. **Testing** - Write tests for components using these hooks

---

For more information, see [HOOKS_DOCUMENTATION.md](./HOOKS_DOCUMENTATION.md)
