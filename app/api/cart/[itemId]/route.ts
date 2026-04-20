import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const { qty } = await req.json()
  if (!qty || qty < 1) return NextResponse.json({ error: 'qty must be >= 1' }, { status: 400 })
  const item = await prisma.cartItem.update({ where: { id: params.itemId }, data: { qty } })
  return NextResponse.json(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { itemId: string } }) {
  await prisma.cartItem.delete({ where: { id: params.itemId } })
  return NextResponse.json({ ok: true })
}
