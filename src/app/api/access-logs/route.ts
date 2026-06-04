import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const action = searchParams.get('action')

    const where: Record<string, unknown> = {}
    if (agentId) where.agentId = agentId
    if (action) where.action = action

    const logs = await db.accessLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        agent: { select: { name: true, did: true } },
      },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch access logs' },
      { status: 500 }
    )
  }
}
