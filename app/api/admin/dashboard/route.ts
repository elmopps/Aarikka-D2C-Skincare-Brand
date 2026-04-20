import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [ordersToday, revenueData, lowStock, totalOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum:  { total: true },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 10 } },
      select: { id: true, name: true, stock: true, sku: true },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
    prisma.order.count(),
  ])

  return NextResponse.json({
    ordersToday,
    revenueMTD: revenueData._sum.total ?? 0,
    lowStock,
    totalOrders,
  })
}
