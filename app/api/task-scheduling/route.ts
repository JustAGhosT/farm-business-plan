import { NextResponse } from 'next/server'
import { cropRepository } from '@/lib/repositories/cropRepository'
import { taskRepository } from '@/lib/repositories/taskRepository'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * POST /api/task-scheduling
 * Generate automated tasks based on crop plans and calendars
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { farm_plan_id, crop_plan_id, planting_date } = body

    if (!farm_plan_id) {
      return NextResponse.json(
        { success: false, error: 'Farm plan ID is required' },
        { status: 400 }
      )
    }

    // Get crop plans to generate tasks for
    const cropPlans = await cropRepository.getAllPlans(farm_plan_id)

    if (cropPlans.length === 0) {
      return NextResponse.json({ success: false, error: 'No crop plans found' }, { status: 404 })
    }

    const generatedTasks: any[] = []

    // Generate tasks for each crop plan
    for (const cropPlan of cropPlans) {
      const plantingDateObj = planting_date ? new Date(planting_date) : new Date()
      const tasks = generateCropTasks(cropPlan, plantingDateObj)

      // Insert tasks into database
      for (const task of tasks) {
        const newTask = await taskRepository.create(
          {
            farm_plan_id,
            crop_plan_id: cropPlan.id,
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: task.priority,
            category: task.category,
            due_date: task.due_date,
          },
          null
        )
        generatedTasks.push(newTask)
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: generatedTasks,
        count: generatedTasks.length,
        message: `Successfully generated ${generatedTasks.length} automated tasks`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error generating tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generateCropTasks(
  cropPlan: any,
  plantingDate: Date
): Array<{
  title: string
  description: string
  priority: string
  category: string
  due_date: string
}> {
  const tasks: Array<{
    title: string
    description: string
    priority: string
    category: string
    due_date: string
  }> = []

  const cropName = cropPlan.crop_name || 'crop'
  const hectares = cropPlan.hectares || 1
  const calendar = getCropCalendar(cropPlan.crop_name)

  // Pre-planting tasks
  tasks.push({
    title: `Soil Preparation - ${cropName}`,
    description: `Prepare ${hectares} hectares for planting. Till soil, add compost, test pH.`,
    priority: 'high',
    category: 'soil_preparation',
    due_date: addDays(plantingDate, -14).toISOString(),
  })

  tasks.push({
    title: `Order Seeds - ${cropName}`,
    description: `Order seeds for ${hectares} hectares.`,
    priority: 'high',
    category: 'procurement',
    due_date: addDays(plantingDate, -21).toISOString(),
  })

  tasks.push({
    title: `Plant ${cropName}`,
    description: `Plant ${cropName} in ${hectares} hectares.`,
    priority: 'urgent',
    category: 'planting',
    due_date: plantingDate.toISOString(),
  })

  // Irrigation
  if (calendar.irrigationFrequencyDays) {
    for (let i = 1; i <= 12; i++) {
      tasks.push({
        title: `Irrigation Check - ${cropName}`,
        description: `Check irrigation for ${cropName}.`,
        priority: 'medium',
        category: 'irrigation',
        due_date: addDays(plantingDate, i * calendar.irrigationFrequencyDays).toISOString(),
      })
    }
  }

  // Fertilization
  if (calendar.fertilizerApplications) {
    calendar.fertilizerApplications.forEach((app: any) => {
      tasks.push({
        title: `Apply Fertilizer (${app.type}) - ${cropName}`,
        description: `Apply ${app.type} at rate ${app.rate}`,
        priority: 'high',
        category: 'fertilization',
        due_date: addDays(plantingDate, app.daysAfterPlanting).toISOString(),
      })
    })
  }

  // Harvest
  tasks.push({
    title: `Harvest Preparation - ${cropName}`,
    description: `Prepare for harvest of ${cropName}.`,
    priority: 'high',
    category: 'harvest',
    due_date: addDays(plantingDate, calendar.daysToHarvest - 7).toISOString(),
  })

  tasks.push({
    title: `Harvest ${cropName}`,
    description: `Harvest ${cropName} from ${hectares} hectares.`,
    priority: 'urgent',
    category: 'harvest',
    due_date: addDays(plantingDate, calendar.daysToHarvest).toISOString(),
  })

  return tasks
}

function getCropCalendar(cropName: string) {
  const calendars: Record<string, any> = {
    'dragon-fruit': {
      daysToHarvest: 180,
      irrigationFrequencyDays: 7,
      fertilizerApplications: [
        { type: 'NPK', daysAfterPlanting: 30, rate: '100g/plant' },
        { type: 'Phosphorus', daysAfterPlanting: 90, rate: '50g/plant' },
      ],
    },
    moringa: {
      daysToHarvest: 60,
      irrigationFrequencyDays: 5,
      fertilizerApplications: [{ type: 'Compost', daysAfterPlanting: 20, rate: '2kg/plant' }],
    },
    lucerne: {
      daysToHarvest: 90,
      irrigationFrequencyDays: 10,
      fertilizerApplications: [],
    },
  }

  return (
    calendars[cropName] || {
      daysToHarvest: 90,
      irrigationFrequencyDays: 7,
      fertilizerApplications: [],
    }
  )
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
