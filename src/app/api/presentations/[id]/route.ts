import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, proof } = body

    const presentation = await db.presentation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(proof !== undefined && { proof: JSON.stringify(proof) }),
      },
    })

    return NextResponse.json({ presentation })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update presentation' },
      { status: 500 }
    )
  }
}
