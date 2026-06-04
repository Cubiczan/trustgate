import { t3Post, t3Get } from '@/lib/t3-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await t3Post('/v1/sub_client', body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create sub-client' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await t3Get('/v1/sub_client')
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to list sub-clients' },
      { status: 500 }
    )
  }
}
