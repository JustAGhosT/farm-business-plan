import { NextResponse } from 'next/server'
import { userRepository } from '@/lib/repositories/userRepository'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = RegisterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      )
    }

    // Create user
    const user = await userRepository.create({ name, email, password })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register user',
      },
      { status: 500 }
    )
  }
}
