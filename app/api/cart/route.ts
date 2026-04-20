import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json([], { status: 200 })

  const items = await prisma.cartItem.findMany({
    where: { sessionId },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, images: true, stock: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, productId, qty = 1 } = await req.json()
    if (!sessionId || !productId) {
      return NextResponse.json({ error: 'sessionId and productId required' }, { status: 400 })
    }

    const existing = await prisma.cartItem.findUnique({
      where: { sessionId_productId: { sessionId, productId } },
    })

    const item = existing
      ? await prisma.cartItem.update({
          where: { sessionId_productId: { sessionId, productId } },
          data:  { qty: existing.qty + qty },
        })
      : await prisma.cartItem.create({ data: { sessionId, productId, qty } })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
