import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isAdmin(session: any) {
  return (session?.user as { role?: string })?.role === 'ADMIN'
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true, ingredients: { include: { ingredient: true } } },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ingredientIds, featuredIngredientIds, ...data } = await req.json()

  await prisma.productIngredient.deleteMany({ where: { productId: params.id } })

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(ingredientIds && {
        ingredients: {
          create: ingredientIds.map((id: string) => ({
            ingredientId: id,
            isFeatured:   (featuredIngredientIds ?? []).includes(id),
          })),
        },
      }),
    },
    include: { ingredients: { include: { ingredient: true } } },
  })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
