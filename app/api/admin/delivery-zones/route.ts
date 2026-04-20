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

  const zones = await prisma.deliveryZone.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(zones)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...data } = await req.json()
  const zone = await prisma.deliveryZone.update({ where: { id }, data })
  return NextResponse.json(zone)
}
