import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  return (session?.user as { role?: string })?.role === 'ADMIN'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await prisma.product.findMany({
    include: { category: true, _count: { select: { reviews: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { ingredientIds, featuredIngredientIds, ...data } = body

  const product = await prisma.product.create({
    data: {
      ...data,
      ingredients: {
        create: (ingredientIds ?? []).map((id: string) => ({
          ingredientId: id,
          isFeatured:   (featuredIngredientIds ?? []).includes(id),
        })),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  })
  return NextResponse.json(product, { status: 201 })
}
