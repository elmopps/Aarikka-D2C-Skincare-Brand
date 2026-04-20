import { NextRequest, NextResponse } from 'next/server'
import { getDeliveryEstimate } from '@/lib/postcode'

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const result = await getDeliveryEstimate(params.code)
  if (!result) {
    return NextResponse.json({ error: 'Could not estimate delivery for this postcode' }, { status: 404 })
  }
  return NextResponse.json(result)
}
