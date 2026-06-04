import { t3Get } from '@/lib/t3-client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const params: Record<string, string> = {}
    const { searchParams } = new URL(request.url)
    if (searchParams.get('user_id')) params.user_id = searchParams.get('user_id')!
    if (searchParams.get('status')) params.status = searchParams.get('status')!

    const result = await t3Get('/v1/vc/issuer/credentials', params)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list credentials' },
      { status: 500 }
    )
  }
}
