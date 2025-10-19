import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// Validate OpenAI API key at startup
if (!process.env.OPENAI_API_KEY) {
  console.error('FATAL: OPENAI_API_KEY environment variable is not set')
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5 // 5 requests per minute

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

// Lazy load OpenAI only when needed
let OpenAI: any
let openai: any

async function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  if (!OpenAI) {
    OpenAI = (await import('openai')).default
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openai
}

export async function GET(request: Request) {
  // Check authentication
  const session = await getServerSession()
  if (!session?.user) {
    console.warn('Unauthorized access attempt to more-suggestions API')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Apply rate limiting (scoped to user email or IP)
  const rateLimitKey = session.user.email || request.headers.get('x-forwarded-for') || 'anonymous'
  if (!checkRateLimit(rateLimitKey)) {
    console.warn(`Rate limit exceeded for user: ${rateLimitKey}`)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  if (!province || !town) {
    return NextResponse.json({ error: 'Province and town are required' }, { status: 400 })
  }

  try {
    const client = await getOpenAIClient()
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert in agriculture and crop planning. Provide a list of 5 crops that are suitable for growing in ${town}, ${province}. Return the list as a JSON array of strings.`,
        },
      ],
    })

    try {
      const crops = JSON.parse(completion.choices[0].message.content)
      return NextResponse.json({ crops })
    } catch (error) {
      console.error('Error parsing LLM response:', error)
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching more crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
