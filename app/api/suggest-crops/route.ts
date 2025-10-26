import { z } from 'zod'
import { cropRepository } from '@/lib/repositories/cropRepository'
import { NextResponse } from 'next/server'

const suggestCropsSchema = z.object({
  province: z.string().max(100).optional(),
  town: z.string().max(100).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const validationResult = suggestCropsSchema.safeParse({
    province: searchParams.get('province'),
    town: searchParams.get('town'),
  })

  if (!validationResult.success) {
    return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 })
  }

  const { province, town } = validationResult.data

  try {
    const suggestions = await cropRepository.getSuggestions(province, town)
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error fetching crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
