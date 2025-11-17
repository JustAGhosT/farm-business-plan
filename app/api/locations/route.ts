import { locationRepository } from '@/lib/repositories/locationRepository'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// Note: Cannot use Edge runtime due to database connection requirements

interface Province {
  id: string
  name: string
}

interface Town {
  id: string
  name: string
  province_id: string
}

interface ProvinceWithTowns extends Province {
  towns: Town[]
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30 // 30 requests per minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      console.warn('Unauthorized access attempt to locations API')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const rateLimitKey = session.user.email || request.headers.get('x-forwarded-for') || 'anonymous'
    if (!checkRateLimit(rateLimitKey)) {
      console.warn(`Rate limit exceeded for user: ${rateLimitKey}`)
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse pagination params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '100')))
    const offset = (page - 1) * limit

    const provinces = await locationRepository.getProvinces(limit, offset)
    const towns = await locationRepository.getTowns()

    // Group towns by province_id using Map for O(n+m) complexity
    const townsByProvince = new Map<string, Town[]>()
    for (const town of towns) {
      const provinceId = town.province_id
      if (!townsByProvince.has(provinceId)) {
        townsByProvince.set(provinceId, [])
      }
      townsByProvince.get(provinceId)!.push(town)
    }

    // Build locations with associated towns
    const locations: ProvinceWithTowns[] = provinces.map((province) => ({
      ...province,
      towns: townsByProvince.get(province.id) || [],
    }))

    return NextResponse.json({ locations, page, limit, total: provinces.length })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
