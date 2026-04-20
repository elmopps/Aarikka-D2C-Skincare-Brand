import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = searchParams.get('category')
  const featured  = searchParams.get('featured')

  const products = await prisma.product.findMany({
    where: {
      ...(category && { category: { slug: category } }),
      ...(featured === 'true' && { featured: true }),
    },
    include: { reviews: { select: { rating: true } }, category: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}
