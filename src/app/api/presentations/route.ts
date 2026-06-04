import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const presentations = await db.presentation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        credential: { select: { type: true, issuer: true, userId: true } },
      },
    })
    return NextResponse.json({ presentations })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch presentations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentialId, verifier, agentId, proof } = body

    if (!credentialId) {
      return NextResponse.json({ error: 'credentialId is required' }, { status: 400 })
    }

    const presentation = await db.presentation.create({
      data: {
        credentialId,
        verifier: verifier || '',
        agentId: agentId || '',
        status: 'pending',
        proof: JSON.stringify(proof || {}),
      },
    })

    return NextResponse.json({ presentation }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create presentation' },
      { status: 500 }
    )
  }
}
