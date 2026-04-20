import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: { select: { name: true } } } },
      deliveryZone: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}
