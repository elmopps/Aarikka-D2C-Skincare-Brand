import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/format'
import { CheckCircle2, Package, Truck } from 'lucide-react'

interface Props { params: { id: string } }

export default async function OrderConfirmationPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { select: { images: true, slug: true } } } },
      deliveryZone: true,
    },
  })

  if (!order) notFound()

  const address = order.shippingAddress as {
    name: string; line1: string; line2?: string; city: string; postcode: string
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container-content max-w-2xl">

        {/* Success banner */}
        <div className="text-center mb-10">
          <CheckCircle2 className="w-16 h-16 text-brand-gold mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-brand-green mb-2">Order Placed!</h1>
          <p className="text-brand-charcoal/70">
            Thank you, {order.guestName ?? 'there'}. We'll be in touch when your order ships.
          </p>
        </div>

        {/* Order ref */}
        <div className="card p-5 mb-6 text-center">
          <p className="text-xs text-brand-sage uppercase tracking-widest mb-1">Order Reference</p>
          <p className="font-serif text-2xl font-semibold text-brand-green">{order.orderRef}</p>
          <p className="text-xs text-brand-sage mt-1">{formatDate(order.createdAt)}</p>
        </div>

        {/* Delivery info */}
        <div className="card p-5 mb-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-charcoal">
            <Truck className="w-4 h-4 text-brand-green" />
            Delivery Details
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-brand-sage text-xs mb-0.5">Delivering to</p>
              <p className="font-medium">{address.name}</p>
              <p className="text-brand-charcoal/70">{address.line1}</p>
              {address.line2 && <p className="text-brand-charcoal/70">{address.line2}</p>}
              <p className="text-brand-charcoal/70">{address.city}, {address.postcode}</p>
            </div>
            <div>
              <p className="text-brand-sage text-xs mb-0.5">Estimated arrival</p>
              <p className="font-medium text-brand-green">{order.estimatedDelivery}</p>
              <p className="text-brand-sage text-xs mt-2">Payment: Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-charcoal mb-4">
            <Package className="w-4 h-4 text-brand-green" />
            Items in Your Order
          </div>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-brand-charcoal">{item.productName}</p>
                  <p className="text-brand-sage text-xs">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold">{formatPrice(item.priceAtPurchase * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-brand-sage">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-sage">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-charcoal">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-sm text-brand-sage">
            Keep your order reference <strong>{order.orderRef}</strong> safe.
            We'll email you when your order is on its way.
          </p>
          <Link href="/" className="btn-primary inline-block">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
