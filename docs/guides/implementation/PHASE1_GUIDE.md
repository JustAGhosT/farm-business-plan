# Phase 1 Implementation Guide

## Overview

This document describes the Phase 1 implementation of the Farm Business Plan enhancement roadmap. Phase 1 focuses on **Core Data Persistence & Backend Integration**, transforming the application from a static template to a fully functional farm management system with database integration.

---

## What Was Implemented

### 1. Database Infrastructure

#### Database Connection Layer (`lib/db.ts`)

- PostgreSQL connection pooling with automatic retry
- Type-safe query execution
- Transaction support via client connections
- Connection health monitoring
- Error handling and logging

**Usage Example**:

```typescript
import { query, getClient } from '@/lib/db'

// Simple query
const result = await query('SELECT * FROM farm_plans WHERE id = $1', [planId])

// Transaction
const client = await getClient()
try {
  await client.query('BEGIN')
  await client.query('INSERT INTO farm_plans ...')
  await client.query('INSERT INTO crop_plans ...')
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

#### Data Validation (`lib/validation.ts`)

- Zod schemas for all database entities
- Type-safe validation with automatic type inference
- Comprehensive error messages

**Available Schemas**:

- `FarmPlanSchema` - Farm plan data
- `CropPlanSchema` - Crop cultivation plans
- `TaskSchema` - Farm tasks and activities
- `FinancialDataSchema` - Financial projections
- `ClimateDataSchema` - Climate information

**Usage Example**:

```typescript
import { FarmPlanSchema, validateData } from '@/lib/validation'

const validation = validateData(FarmPlanSchema, userData)
if (!validation.success) {
  console.error(validation.errors)
  return
}

const validatedData = validation.data // Fully typed!
```

---

### 2. API Routes

#### Farm Plans API (`/api/farm-plans`)

**GET** - Retrieve farm plans

```typescript
// Get all farm plans
GET /api/farm-plans

// Filter by owner
GET /api/farm-plans?owner_id=uuid

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Green Valley Farm",
      "location": "Bela Bela",
      "province": "Limpopo",
      "farm_size": 5.5,
      "crop_count": 3,
      "task_count": 12,
      ...
    }
  ],
  "count": 1
}
```

**POST** - Create new farm plan

```typescript
POST /api/farm-plans
Content-Type: application/json

{
  "name": "Green Valley Farm",
  "location": "Bela Bela",
  "province": "Limpopo",
  "farm_size": 5.5,
  "coordinates": {
    "lat": -24.2819,
    "lng": 28.4167
  },
  "soil_type": "Sandy loam",
  "water_source": "Borehole",
  "status": "draft"
}

Response:
{
  "success": true,
  "data": { ... },
  "message": "Farm plan created successfully"
}
```

#### Tasks API (`/api/tasks`)

**GET** - Retrieve tasks

```typescript
// All tasks
GET /api/tasks

// Filter by farm plan
GET /api/tasks?farm_plan_id=uuid

// Filter by status
GET /api/tasks?status=pending

// Filter by priority
GET /api/tasks?priority=high
```

**POST** - Create new task

```typescript
POST /api/tasks
Content-Type: application/json

{
  "farm_plan_id": "uuid",
  "crop_plan_id": "uuid", // optional
  "title": "Plant dragon fruit cuttings",
  "description": "Plant 100 cuttings in prepared beds",
  "status": "pending",
  "priority": "high",
  "category": "Planting",
  "due_date": "2025-02-15"
}
```

**PATCH** - Update task

```typescript
PATCH /api/tasks
Content-Type: application/json

{
  "id": "uuid",
  "status": "completed",
  "completed_at": "2025-01-15T10:30:00Z"
}
```

**DELETE** - Delete task

```typescript
DELETE /api/tasks?id=uuid
```

---

### 3. UI Components

#### Toast Notifications (`components/ToastProvider.tsx`)

Professional toast notifications for user feedback.

**Usage**:

```typescript
'use client'

import { useToast } from '@/components/ToastProvider'

export default function MyComponent() {
  const { showToast } = useToast()

  const handleAction = async () => {
    try {
      await someApiCall()
      showToast('success', 'Action completed successfully!')
    } catch (error) {
      showToast('error', 'Action failed. Please try again.')
    }
  }

  return <button onClick={handleAction}>Do Action</button>
}
```

**Toast Types**:

- `success` - Green, for successful operations
- `error` - Red, for errors
- `warning` - Yellow, for warnings
- `info` - Blue, for informational messages

**Options**:

```typescript
showToast('success', 'Message here', 3000) // Custom duration (ms)
showToast('info', 'Message here', 0) // No auto-dismiss
```

#### Loading States (`components/LoadingStates.tsx`)

**Components Available**:

1. **LoadingSpinner** - Simple spinner

```typescript
import { LoadingSpinner } from '@/components/LoadingStates'

<LoadingSpinner size="sm" /> // sm, md, lg
```

2. **LoadingOverlay** - Full-screen loading

```typescript
import { LoadingOverlay } from '@/components/LoadingStates'

{isLoading && <LoadingOverlay message="Saving your plan..." />}
```

3. **SkeletonCard** - Placeholder for cards

```typescript
import { SkeletonCard } from '@/components/LoadingStates'

{loading ? <SkeletonCard /> : <ActualCard data={data} />}
```

4. **SkeletonTable** - Placeholder for tables

```typescript
import { SkeletonTable } from '@/components/LoadingStates'

{loading ? <SkeletonTable rows={5} /> : <ActualTable data={data} />}
```

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
# OR
POSTGRES_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Optional: For Neon/Netlify
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
```

### Database Setup

1. **Create Database**:

   ```bash
   # Using Neon, Railway, or local PostgreSQL
   createdb farm_business_plan
   ```

2. **Run Schema**:

   ```bash
   psql -d farm_business_plan -f db/schema.sql
   ```

3. **Seed Data** (Optional):

   ```bash
   psql -d farm_business_plan -f db/seeds/[seed-file].sql
   ```

4. **Test Connection**:
   ```bash
   # Create a test file
   node -e "
   const { testConnection } = require('./lib/db.ts')
   testConnection().then(success => {
     console.log(success ? '✅ Connected' : '❌ Failed')
   })
   "
   ```

---

## Integration Examples

### Example 1: Fetch and Display Farm Plans

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastProvider'
import { LoadingSpinner } from '@/components/LoadingStates'

interface FarmPlan {
  id: string
  name: string
  location: string
  farm_size: number
  crop_count: number
  task_count: number
}

export default function FarmPlansPage() {
  const [plans, setPlans] = useState<FarmPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/farm-plans')
      const data = await response.json()

      if (data.success) {
        setPlans(data.data)
      } else {
        showToast('error', 'Failed to load farm plans')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div>
      <h1>My Farm Plans</h1>
      {plans.map(plan => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>{plan.location} - {plan.farm_size} ha</p>
          <p>{plan.crop_count} crops, {plan.task_count} tasks</p>
        </div>
      ))}
    </div>
  )
}
```

### Example 2: Create a New Task

```typescript
'use client'

import { useState } from 'react'
import { useToast } from '@/components/ToastProvider'

export default function CreateTaskForm({ farmPlanId }: { farmPlanId: string }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_plan_id: farmPlanId,
          title,
          status: 'pending',
          priority: 'medium'
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Task created successfully!')
        setTitle('')
      } else {
        showToast('error', data.error || 'Failed to create task')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  )
}
```

### Example 3: Update Task Status

```typescript
'use client'

import { useToast } from '@/components/ToastProvider'

export default function TaskItem({ task }: { task: any }) {
  const { showToast } = useToast()

  const markAsCompleted = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          status: 'completed'
        })
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Task marked as completed!')
        // Refresh or update local state
      } else {
        showToast('error', 'Failed to update task')
      }
    } catch (error) {
      showToast('error', 'An error occurred')
    }
  }

  return (
    <div>
      <h3>{task.title}</h3>
      <button onClick={markAsCompleted}>Mark as Completed</button>
    </div>
  )
}
```

---

## Testing the Implementation

### 1. Test Database Connection

```bash
# Create a test script
cat > test-db.js << 'EOF'
const { testConnection } = require('./lib/db.ts')

testConnection()
  .then(success => {
    console.log(success ? '✅ Database connected' : '❌ Connection failed')
    process.exit(success ? 0 : 1)
  })
EOF

node test-db.js
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test farm plans (requires database)
curl http://localhost:3000/api/farm-plans

# Create a farm plan
curl -X POST http://localhost:3000/api/farm-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farm",
    "location": "Test Location",
    "province": "Limpopo",
    "farm_size": 5.5
  }'
```

### 3. Test UI Components

Visit these pages to see the new components:

- Any page will show toast notifications when triggered
- Loading states appear during data fetching
- Check browser console for validation errors

---

## Troubleshooting

### Database Connection Issues

**Problem**: "Database connection string not configured"

```
Solution: Add DATABASE_URL to .env.local
```

**Problem**: SSL/TLS connection errors

```
Solution: For local dev, use ?sslmode=disable
For production, ensure SSL is properly configured
```

### API Errors

**Problem**: Validation errors

```
Check the API response for 'details' field with specific errors
Ensure all required fields are provided
Verify data types match the schema
```

**Problem**: 500 Internal Server Error

```
Check server logs (console output)
Verify database connection
Check PostgreSQL logs
```

### Build Errors

**Problem**: Type errors with Zod

```bash
npm install --save-dev @types/node
```

**Problem**: Module resolution errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## Next Steps

### Immediate Tasks (Remaining Phase 1)

1. Add individual farm plan endpoints (GET by ID, PUT, DELETE)
2. Integrate dashboard with real API data
3. Add error boundaries throughout the app
4. Implement optimistic updates for better UX
5. Create custom React hooks for data fetching
6. Add comprehensive testing

### Future Phases

- **Phase 2**: User authentication with NextAuth.js
- **Phase 3**: Enhanced financial calculators with data persistence
- **Phase 4**: Complete plan generator workflow
- **Phase 5**: Advanced operations management

---

## Resources

### Documentation

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Database Services

- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Railway](https://railway.app/) - PostgreSQL hosting
- [Supabase](https://supabase.com/) - PostgreSQL with additional features

---

## Support

For issues or questions:

1. Check the [ENHANCEMENT_ROADMAP.md](./ENHANCEMENT_ROADMAP.md) for planned features
2. Review existing documentation in `/docs`
3. Open an issue on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

---

_Last Updated: January 2025_  
_Phase: 1 - Core Data Persistence_  
_Status: Foundation Complete_
