import { prisma } from '@/lib/prisma'

interface PostcodesIOResult {
  status: number
  result: {
    region: string
    admin_district: string
  } | null
}

export async function getDeliveryEstimate(postcode: string) {
  const clean = postcode.replace(/\s+/g, '').toUpperCase()

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`)
    if (!res.ok) return null
    const data: PostcodesIOResult = await res.json()
    if (data.status !== 200 || !data.result) return null

    const region = data.result.region || data.result.admin_district

    const zone = await prisma.deliveryZone.findFirst({
      where: { regions: { has: region } },
    })

    if (!zone) {
      const fallback = await prisma.deliveryZone.findFirst({
        where: { name: 'Rest of UK' },
      })
      return fallback
        ? {
            zone: fallback,
            label: `${fallback.minDays}–${fallback.maxDays} working days`,
          }
        : null
    }

    return {
      zone,
      label: `${zone.minDays}–${zone.maxDays} working days`,
    }
  } catch {
    return null
  }
}
