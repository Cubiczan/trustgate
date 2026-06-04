import { t3Get } from '@/lib/t3-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const result = await t3Get('/v1/did')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch DID' },
      { status: 500 }
    )
  }
}
