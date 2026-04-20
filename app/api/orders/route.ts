import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateOrderRef } from '@/lib/format'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, identity, address, deliveryZoneId, deliveryLabel, shippingCost } = await req.json()

    if (!sessionId || !identity || !address || !deliveryZoneId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    })
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0)
    const total    = subtotal + (shippingCost ?? 0)

    let userId: string | undefined

    if (identity.mode === 'signup') {
      const existing = await prisma.user.findUnique({ where: { email: identity.email.toLowerCase() } })
      if (existing) {
        userId = existing.id
      } else {
        const passwordHash = await bcrypt.hash(identity.password, 12)
        const user = await prisma.user.create({
          data: { name: identity.name, email: identity.email.toLowerCase(), passwordHash },
        })
        userId = user.id
        await prisma.address.create({
          data: { userId, ...address, isDefault: true },
        })
      }
    }

    const order = await prisma.order.create({
      data: {
        orderRef:          generateOrderRef(),
        userId:            userId ?? null,
        guestEmail:        identity.mode === 'guest' ? identity.email : null,
        guestName:         identity.mode === 'guest' ? identity.name  : null,
        shippingAddress:   address,
        deliveryZoneId,
        estimatedDelivery: deliveryLabel,
        subtotal,
        shippingCost:      shippingCost ?? 0,
        total,
        items: {
          create: cartItems.map(i => ({
            productId:      i.productId,
            productName:    i.product.name,
            qty:            i.qty,
            priceAtPurchase: i.product.price,
          })),
        },
      },
    })

    await prisma.cartItem.deleteMany({ where: { sessionId } })

    return NextResponse.json({ orderId: order.id }, { status: 201 })
  } catch (err) {
    console.error('Order error:', err)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
