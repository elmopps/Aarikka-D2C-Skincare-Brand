'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CheckCircle2 } from 'lucide-react'

type Step = 1 | 2 | 3

interface Identity {
  mode:     'signup' | 'guest'
  name:     string
  email:    string
  password: string
}

interface AddressForm {
  line1:    string
  line2:    string
  city:     string
  county:   string
  postcode: string
}

const STEPS = ['Who are you?', 'Delivery', 'Review & Place']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, sessionId, clearCart } = useCart()

  const [step, setStep]             = useState<Step>(1)
  const [identity, setIdentity]     = useState<Identity>({ mode: 'guest', name: '', email: '', password: '' })
  const [address, setAddress]       = useState<AddressForm>({ line1: '', line2: '', city: '', county: '', postcode: '' })
  const [deliveryInfo, setDelivery] = useState<{ label: string; cost: number; zoneId: string } | null>(null)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-brand-sage text-lg">Your bag is empty.</p>
        <a href="/" className="btn-primary">Go Shopping</a>
      </div>
    )
  }

  /* ---------- Step 1 validation ---------- */
  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!identity.name.trim())  e.name  = 'Name is required'
    if (!identity.email.trim()) e.email = 'Email is required'
    if (identity.mode === 'signup' && identity.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ---------- Step 2 validation + postcode lookup ---------- */
  const validateStep2 = async () => {
    const e: Record<string, string> = {}
    if (!address.line1.trim())    e.line1    = 'Address line 1 is required'
    if (!address.city.trim())     e.city     = 'City is required'
    if (!address.postcode.trim()) e.postcode = 'Postcode is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return false

    try {
      const res = await fetch(`/api/postcode/${encodeURIComponent(address.postcode.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.zone) {
        setErrors({ postcode: 'Could not validate postcode — check and try again' })
        return false
      }
      setDelivery({ label: data.label, cost: data.zone.shippingCost, zoneId: data.zone.id })
      return true
    } catch {
      setErrors({ postcode: 'Delivery estimate unavailable — please try again' })
      return false
    }
  }

  const handleNext = async () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2) {
      const ok = await validateStep2()
      if (ok) setStep(3)
    }
  }

  const handlePlace = async () => {
    if (!deliveryInfo) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          identity,
          address: { ...address, name: identity.name, country: 'GB' },
          deliveryZoneId: deliveryInfo.zoneId,
          deliveryLabel:  deliveryInfo.label,
          shippingCost:   deliveryInfo.cost,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')
      clearCart()
      router.push(`/order/${data.orderId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const total = subtotal + (deliveryInfo?.cost ?? 0)

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container-content max-w-5xl">
        <h1 className="font-serif text-3xl text-brand-green mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center mb-10 gap-0">
          {STEPS.map((label, i) => {
            const s = (i + 1) as Step
            const done = step > s
            const active = step === s
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-brand-gold text-white' : active ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${active ? 'text-brand-green font-medium' : 'text-brand-sage'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 ${done ? 'bg-brand-gold' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">

            {/* Step 1 */}
            {step === 1 && (
              <div className="card p-6 space-y-6">
                <h2 className="font-serif text-xl text-brand-green">How are you checking out?</h2>

                <div className="grid grid-cols-2 gap-3">
                  {(['guest', 'signup'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setIdentity(id => ({ ...id, mode }))}
                      className={`p-4 rounded-card border text-left transition-colors ${identity.mode === mode ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:border-brand-sage'}`}
                    >
                      <p className="font-medium text-sm text-brand-charcoal capitalize">
                        {mode === 'guest' ? 'Continue as Guest' : 'Create an Account'}
                      </p>
                      <p className="text-xs text-brand-sage mt-1">
                        {mode === 'guest'
                          ? 'Quick checkout, no account needed'
                          : 'Save your details for future orders'}
                      </p>
                    </button>
                  ))}
                </div>

                <Input
                  label="Full Name"
                  required
                  value={identity.name}
                  onChange={e => setIdentity(id => ({ ...id, name: e.target.value }))}
                  error={errors.name}
                  placeholder="Jane Smith"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={identity.email}
                  onChange={e => setIdentity(id => ({ ...id, email: e.target.value }))}
                  error={errors.email}
                  placeholder="jane@example.com"
                />
                {identity.mode === 'signup' && (
                  <Input
                    label="Password"
                    type="password"
                    required
                    value={identity.password}
                    onChange={e => setIdentity(id => ({ ...id, password: e.target.value }))}
                    error={errors.password}
                    placeholder="At least 8 characters"
                  />
                )}
                <Button onClick={handleNext} className="w-full">Continue to Delivery</Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-serif text-xl text-brand-green">Delivery Address</h2>
                <Input
                  label="Address Line 1"
                  required
                  value={address.line1}
                  onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                  error={errors.line1}
                  placeholder="12 Baker Street"
                />
                <Input
                  label="Address Line 2"
                  value={address.line2}
                  onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                  placeholder="Flat 3 (optional)"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    required
                    value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    error={errors.city}
                    placeholder="London"
                  />
                  <Input
                    label="County"
                    value={address.county}
                    onChange={e => setAddress(a => ({ ...a, county: e.target.value }))}
                    placeholder="Greater London"
                  />
                </div>
                <Input
                  label="Postcode"
                  required
                  value={address.postcode}
                  onChange={e => setAddress(a => ({ ...a, postcode: e.target.value }))}
                  error={errors.postcode}
                  placeholder="EC1A 1BB"
                />
                <p className="text-xs text-brand-sage">
                  We'll validate your postcode and calculate delivery on the next step.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={handleNext} className="flex-1">Review Order</Button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && deliveryInfo && (
              <div className="card p-6 space-y-6">
                <h2 className="font-serif text-xl text-brand-green">Review Your Order</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-sage">Name</span>
                    <span className="font-medium">{identity.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-sage">Email</span>
                    <span className="font-medium">{identity.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-sage">Delivery to</span>
                    <span className="font-medium text-right max-w-xs">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.postcode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-sage">Estimated delivery</span>
                    <span className="font-medium text-brand-green">{deliveryInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-sage">Payment</span>
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                </div>

                <p className="text-xs text-brand-sage border-t pt-4">
                  By placing this order you agree to our Terms & Conditions. Your order will be
                  dispatched within 1–2 working days and payment is collected upon delivery.
                </p>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button onClick={handlePlace} loading={submitting} className="flex-1">
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="card p-5 h-fit space-y-4">
            <h2 className="font-serif text-lg text-brand-green">Your Bag</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-12 h-14 shrink-0 rounded bg-gray-50 overflow-hidden">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-charcoal leading-snug line-clamp-2">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-brand-sage">Qty: {item.qty}</p>
                    <p className="text-xs font-semibold mt-0.5">{formatPrice(item.product.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-sage">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-sage">
                <span>Shipping</span>
                <span>{deliveryInfo ? (deliveryInfo.cost === 0 ? 'Free' : formatPrice(deliveryInfo.cost)) : '—'}</span>
              </div>
              <div className="flex justify-between font-semibold text-brand-charcoal border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
