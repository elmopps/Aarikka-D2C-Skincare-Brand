import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import { TrustBar } from '@/components/storefront/TrustBar'
import { ProductCard } from '@/components/storefront/ProductCard'
import { StarRating } from '@/components/ui/star-rating'
import { ArrowRight, Quote } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Aarikka Elixirs — Ancient Skincare, Modern Skin',
}

async function getData() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ include: { products: { take: 1 } } }),
    prisma.product.findMany({
      where: { featured: true },
      take: 4,
      include: { reviews: { select: { rating: true } } },
    }),
  ])
  return { categories, featured }
}

const differentiators = [
  {
    title:  'Named, Not Vague',
    body:   'We don\'t say "inspired by nature". We name the text, the century, and the civilisation. Every formula is sourced from a verifiable historical record.',
    source: 'Charaka Samhita, 600 BCE',
  },
  {
    title:  'Certified Organic, Fully Traceable',
    body:   'Each ingredient is certified organic and traceable to its region of origin. No synthetic fillers, no greenwashing — the label says exactly what\'s inside.',
    source: 'Certified by Soil Association',
  },
  {
    title:  'Dermatologist-Reviewed Formulations',
    body:   'Ancient wisdom meets modern skin science. Every product is reviewed by dermatologists to confirm efficacy and safety for contemporary skin types.',
    source: 'Reviewed by clinical dermatologists',
  },
]

const testimonials = [
  {
    name:   'Priya M., Marketing Director',
    rating: 5,
    text:   'I\'ve tried every premium organic brand. Aarikka Elixirs is the first one that actually tells me *why* an ingredient works — not just that it\'s "natural". The Kumkumadi oil has transformed my skin.',
  },
  {
    name:   'James T., Consultant',
    rating: 5,
    text:   'Sceptical at first — too many brands claim "ancient" without evidence. The ingredient sourcing notes convinced me. Three months in and my skin has never been better.',
  },
  {
    name:   'Sophie R., GP',
    rating: 4,
    text:   'As a doctor I appreciate the transparency. They reference the actual texts, cite the science. The formulations are clean and the results are real.',
  },
]

export default async function HomePage() {
  const { categories, featured } = await getData()

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-brand-green" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green/60 via-brand-green/40 to-brand-green/80" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-brand-gold text-xs uppercase tracking-[0.3em] mb-6">
            Ancient Wisdom. Modern Skin.
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold leading-tight mb-6">
            Formulated from<br />3,000-year-old recipes.
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
            Not "inspired by nature" — referenced in the Charaka Samhita, the Ebers Papyrus,
            the Ashtanga Hridayam. Every ingredient traced to its source.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/category/face-oils" className="btn-primary text-base px-8 py-4">
              Shop Face Oils
            </Link>
            <Link href="#story" className="btn-secondary border-white text-white hover:bg-white hover:text-brand-green text-base px-8 py-4">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Anti-greenwashing */}
      <section className="section-padding bg-white">
        <div className="container-content">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-3">Why Aarikka Elixirs?</p>
            <h2 className="font-serif text-4xl text-brand-green mb-4">
              Not another "organic" brand.
            </h2>
            <p className="text-brand-charcoal/70 leading-relaxed">
              The organic skincare market is full of vague claims. "Natural", "clean", "inspired by nature."
              We built Aarikka Elixirs because we were tired of being sold adjectives. Here's what we actually do differently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {differentiators.map(d => (
              <div key={d.title} className="relative p-6 border border-brand-gold/20 rounded-card">
                <div className="absolute top-0 left-6 -translate-y-1/2 bg-brand-gold text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  Evidence
                </div>
                <h3 className="font-serif text-xl text-brand-green mb-3 mt-2">{d.title}</h3>
                <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-4">{d.body}</p>
                <p className="text-xs text-brand-gold italic">{d.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section id="story" className="section-padding bg-brand-green text-white">
        <div className="container-content">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-gold text-xs uppercase tracking-widest mb-4">Our Origin</p>
              <h2 className="font-serif text-4xl font-semibold mb-6 leading-tight">
                The recipes existed.<br />We found them.
              </h2>
              <div className="space-y-4 text-white/80 text-sm leading-relaxed">
                <p>
                  Ancient Ayurvedic physicians documented skincare formulations with a specificity that
                  modern brands rarely match. The Charaka Samhita (600 BCE) describes turmeric paste
                  for brightening. The Ashtanga Hridayam (7th century CE) details Kumkumadi tailam —
                  a saffron-based oil that took decades of scholarship to properly interpret.
                </p>
                <p>
                  We worked with Ayurvedic scholars and dermatologists to translate these formulations
                  into modern skincare. Not "inspired by" — actually derived from. Then we had
                  each one clinically reviewed to confirm it's safe and effective for contemporary skin.
                </p>
                <p>
                  The result is Aarikka Elixirs: a skincare range where every product has a verifiable origin,
                  an honest ingredient list, and a genuine reason to exist.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {[
                { year: '600 BCE',        event: 'Charaka Samhita documents turmeric and neem for skin health' },
                { year: '1550 BCE',       event: 'Ebers Papyrus describes black seed as a universal remedy' },
                { year: '7th Century CE', event: 'Ashtanga Hridayam codifies the Kumkumadi tailam formula' },
                { year: '16th Century',   event: 'Bhavaprakasa Nighantu classifies bakuchiol as skin-restoring' },
                { year: 'Today',          event: 'Aarikka Elixirs translates these texts into modern, certified formulations' },
              ].map(item => (
                <div key={item.year} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <div className="w-px flex-1 bg-brand-gold/20 mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-brand-gold text-xs font-medium mb-1">{item.year}</p>
                    <p className="text-white/80 text-sm">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-brand-cream">
        <div className="container-content">
          <div className="text-center mb-10">
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-2">Shop by Category</p>
            <h2 className="font-serif text-3xl text-brand-green">Every skin need. One ancient source.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-card bg-brand-green aspect-[3/4]"
              >
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                  />
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 className="font-serif text-white text-base font-semibold leading-tight">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                    Shop <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {featured.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-content">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-brand-gold text-xs uppercase tracking-widest mb-2">Most Loved</p>
                <h2 className="font-serif text-3xl text-brand-green">Bestsellers</h2>
              </div>
              <Link href="/category/face-oils" className="text-sm text-brand-sage hover:text-brand-green flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="section-padding bg-brand-cream">
        <div className="container-content">
          <div className="text-center mb-10">
            <p className="text-brand-gold text-xs uppercase tracking-widest mb-2">From Our Customers</p>
            <h2 className="font-serif text-3xl text-brand-green">What professionals say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-card p-6 space-y-4">
                <Quote className="w-6 h-6 text-brand-gold/40" />
                <StarRating rating={t.rating} size="sm" />
                <p className="text-sm text-brand-charcoal/80 leading-relaxed italic">"{t.text}"</p>
                <p className="text-xs font-medium text-brand-sage">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
