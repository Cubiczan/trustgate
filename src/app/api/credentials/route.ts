import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const credentials = await db.credential.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { _count: { select: { presentations: true } } },
    })
    return NextResponse.json({ credentials })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch credentials' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, issuer, expiresAt, data } = body

    if (!userId || !type) {
      return NextResponse.json({ error: 'userId and type are required' }, { status: 400 })
    }

    const credential = await db.credential.create({
      data: {
        userId,
        type,
        issuer: issuer || 'Terminal 3',
        status: 'active',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        data: JSON.stringify(data || {}),
      },
    })

    return NextResponse.json({ credential }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create credential' },
      { status: 500 }
    )
  }
}
