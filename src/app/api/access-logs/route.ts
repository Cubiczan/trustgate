import { db } from '@/lib/db'
import { verifyEvidenceChain } from '@/lib/evidenceEnvelope'
import type { ChainVerification } from '@/lib/evidenceEnvelope'
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

    // Row 10 sealed-evidence verify: recompute the hash chain over the
    // returned entries (ascending order) on request.
    let chain: ChainVerification | undefined
    if (searchParams.get('verify') === '1') {
      const sealed = [...logs]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((log) => ({
          agentId: log.agentId,
          action: log.action,
          resource: log.resource,
          details: log.details,
          createdAt: log.createdAt,
          entryHash: log.entryHash,
          prevHash: log.prevHash,
        }))
      chain = verifyEvidenceChain(sealed)
    }

    return NextResponse.json({ logs, ...(chain ? { chain } : {}) })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch access logs' },
      { status: 500 }
    )
  }
}
