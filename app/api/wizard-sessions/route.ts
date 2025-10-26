import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { wizardSessionRepository } from '@/lib/repositories/wizardSessionRepository'

// GET: Fetch all wizard sessions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await wizardSessionRepository.getAll(session.user.id)

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching wizard sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch wizard sessions' }, { status: 500 })
  }
}

// POST: Create a new wizard session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { session_name, years, crops, total_percentage } = body

    // Validate required fields
    if (!session_name || !years || !crops) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate total_percentage
    if (total_percentage < 0 || total_percentage > 100) {
      return NextResponse.json({ error: 'Invalid total percentage' }, { status: 400 })
    }

    const newSession = await wizardSessionRepository.create(session.user.id, body)

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    console.error('Error creating wizard session:', error)
    return NextResponse.json({ error: 'Failed to create wizard session' }, { status: 500 })
  }
}

// PUT: Update an existing wizard session
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const updatedSession = await wizardSessionRepository.update(session.user.id, body)

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error updating wizard session:', error)
    return NextResponse.json({ error: 'Failed to update wizard session' }, { status: 500 })
  }
}

// DELETE: Delete a wizard session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const deletedSession = await wizardSessionRepository.delete(session.user.id, id)

    if (!deletedSession) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting wizard session:', error)
    return NextResponse.json({ error: 'Failed to delete wizard session' }, { status: 500 })
  }
}
