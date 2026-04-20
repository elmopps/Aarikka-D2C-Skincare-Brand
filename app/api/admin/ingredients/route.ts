import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function isAdmin(session: any) {
  return (session?.user as { role?: string })?.role === 'ADMIN'
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(ingredients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const ingredient = await prisma.ingredient.create({ data })
  return NextResponse.json(ingredient, { status: 201 })
}
