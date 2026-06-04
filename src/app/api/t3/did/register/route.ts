import { t3Post } from '@/lib/t3-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await t3Post('/v1/did/register', body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to register DID' },
      { status: 500 }
    )
  }
}
