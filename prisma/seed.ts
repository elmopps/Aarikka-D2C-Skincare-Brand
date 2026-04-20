import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin user ──────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@aarrikka.com' },
    update: {},
    create: {
      email:        'admin@aarrikka.com',
      name:         'Admin',
      passwordHash: await bcrypt.hash('aarrikka-admin-2024', 12),
      role:         'ADMIN',
    },
  })

  // ── Delivery Zones ──────────────────────────────────────────
  const zones = await Promise.all([
    prisma.deliveryZone.upsert({
      where: { id: 'zone-london' },
      update: {},
      create: { id: 'zone-london', name: 'London', regions: ['London'], minDays: 1, maxDays: 2, shippingCost: 399 },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'zone-south' },
      update: {},
      create: { id: 'zone-south', name: 'South England', regions: ['South East', 'South West', 'East of England', 'East Midlands', 'West Midlands'], minDays: 2, maxDays: 3, shippingCost: 499 },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'zone-north' },
      update: {},
      create: { id: 'zone-north', name: 'North England', regions: ['Yorkshire and The Humber', 'North West', 'North East'], minDays: 2, maxDays: 4, shippingCost: 499 },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'zone-scotland' },
      update: {},
      create: { id: 'zone-scotland', name: 'Scotland', regions: ['Scotland'], minDays: 3, maxDays: 5, shippingCost: 599 },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'zone-wales-ni' },
      update: {},
      create: { id: 'zone-wales-ni', name: 'Wales & Northern Ireland', regions: ['Wales', 'Northern Ireland'], minDays: 3, maxDays: 5, shippingCost: 599 },
    }),
    prisma.deliveryZone.upsert({
      where: { id: 'zone-rest' },
      update: {},
      create: { id: 'zone-rest', name: 'Rest of UK', regions: [], minDays: 3, maxDays: 6, shippingCost: 599 },
    }),
  ])
  console.log('✓ Delivery zones')

  // ── Categories ──────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'cleansers' },
      update: {},
      create: {
        slug: 'cleansers', name: 'Cleansers & Face Washes',
        description: 'Gentle cleansers drawn from ancient purification rituals. Remove impurities without stripping your skin\'s natural oils.',
        imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'moisturisers' },
      update: {},
      create: {
        slug: 'moisturisers', name: 'Moisturisers & Face Creams',
        description: 'Deep hydration formulated from botanicals mentioned in the Charaka Samhita and Persian medical texts.',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'face-oils' },
      update: {},
      create: {
        slug: 'face-oils', name: 'Face Oils & Serums',
        description: 'Concentrated elixirs rooted in Ayurvedic tailam traditions. Our most potent formulations.',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'face-masks' },
      update: {},
      create: {
        slug: 'face-masks', name: 'Face Masks & Treatments',
        description: 'Weekly rituals inspired by traditional udvartana and lepa treatments. Deep treatment for radiant skin.',
        imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'eye-lip-care' },
      update: {},
      create: {
        slug: 'eye-lip-care', name: 'Eye & Lip Care',
        description: 'Delicate formulas for your most expressive features, traced to ancient texts on facial rejuvenation.',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      },
    }),
  ])
  console.log('✓ Categories')

  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // ── Ingredients ─────────────────────────────────────────────
  const ingredients = await Promise.all([
    prisma.ingredient.upsert({ where: { id: 'ing-turmeric' }, update: {}, create: { id: 'ing-turmeric', name: 'Turmeric (Haridra)', historicalSource: 'Charaka Samhita, 600 BCE', originRegion: 'Kerala, India', skinBenefit: 'Powerful anti-inflammatory and brightening agent. Inhibits melanin production for an even complexion.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-kumkumadi' }, update: {}, create: { id: 'ing-kumkumadi', name: 'Kumkumadi (Saffron blend)', historicalSource: 'Ashtanga Hridayam, 7th Century CE', originRegion: 'Kashmir, India', skinBenefit: 'A 16-ingredient saffron tailam historically prescribed for brightening, reducing blemishes, and improving skin lustre.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-neem' }, update: {}, create: { id: 'ing-neem', name: 'Neem (Nimba)', historicalSource: 'Atharva Veda, 1500 BCE', originRegion: 'Rajasthan, India', skinBenefit: 'Antibacterial and antifungal properties cited across Vedic medicine. Clears breakouts and controls excess sebum.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-sandalwood' }, update: {}, create: { id: 'ing-sandalwood', name: 'Sandalwood (Chandan)', historicalSource: 'Sushruta Samhita, 600 BCE', originRegion: 'Mysore, Karnataka, India', skinBenefit: 'Cooling and anti-inflammatory. Documented for reducing redness, tightening pores, and even skin tone.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-saffron' }, update: {}, create: { id: 'ing-saffron', name: 'Saffron (Kesar)', historicalSource: 'Persian Pharmacopoeia, Ibn Sina, 1025 CE', originRegion: 'Kashmir, India & Iran', skinBenefit: 'Rich in crocin and safranal. Historically documented for skin brightening, anti-ageing, and glow enhancement.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-brahmi' }, update: {}, create: { id: 'ing-brahmi', name: 'Brahmi (Gotu Kola)', historicalSource: 'Charaka Samhita, 600 BCE', originRegion: 'Sri Lanka & South India', skinBenefit: 'Stimulates collagen synthesis. Ancient texts describe its use for wound healing and skin rejuvenation.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-ashwagandha' }, update: {}, create: { id: 'ing-ashwagandha', name: 'Ashwagandha (Withania somnifera)', historicalSource: 'Charaka Samhita, 600 BCE', originRegion: 'Madhya Pradesh, India', skinBenefit: 'Adaptogenic. Reduces cortisol-induced skin damage. Boosts collagen production and protects against UV stress.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-blackseed' }, update: {}, create: { id: 'ing-blackseed', name: 'Black Seed (Nigella Sativa)', historicalSource: 'Ebers Papyrus, 1550 BCE', originRegion: 'Egypt & Ethiopia', skinBenefit: 'The Ebers Papyrus references black seed oil for skin conditions. Rich in thymoquinone — potent anti-inflammatory and antioxidant.' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-bakuchiol' }, update: {}, create: { id: 'ing-bakuchiol', name: 'Bakuchiol (Babchi)', historicalSource: 'Bhavaprakasa Nighantu, 16th Century CE', originRegion: 'Rajasthan & Gujarat, India', skinBenefit: 'Plant-based retinol equivalent. Stimulates cell turnover and collagen without retinol\'s irritation. Classified in Ayurveda as a rasayana (rejuvenator).' } }),
    prisma.ingredient.upsert({ where: { id: 'ing-multanimitti' }, update: {}, create: { id: 'ing-multanimitti', name: 'Multani Mitti (Fuller\'s Earth)', historicalSource: 'Unani Medicine texts, Mughal period, 16th Century CE', originRegion: 'Multan, Pakistan & Rajasthan', skinBenefit: 'Clay-based absorbent documented in Unani medicine. Draws out impurities, tightens pores, and controls oil production.' } }),
  ])
  console.log('✓ Ingredients')

  const ingMap = Object.fromEntries(ingredients.map(i => [i.id, i.id]))

  // ── Products ────────────────────────────────────────────────
  const productData = [
    // Cleansers
    {
      slug: 'kumkumadi-cleansing-milk', name: 'Kumkumadi Cleansing Milk', sku: 'ARK-CLN-001',
      categoryId: catMap['cleansers'], price: 2800, stock: 45, featured: true,
      shortDescription: 'A luxurious milk cleanser with 8-ingredient Kumkumadi blend. Melts away makeup and impurities while leaving skin soft and luminous.',
      description: 'Inspired by the traditional Kumkumadi tailam, this milk cleanser adapts the ancient 16-ingredient formula into a modern, everyday cleanse. Saffron, sandalwood, and vetiver work together to purify without stripping.\n\nApply to dry skin, massage gently, and rinse with warm water. Suitable for all skin types.',
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-kumkumadi'], featured: true },
        { id: ingMap['ing-sandalwood'], featured: true },
      ],
    },
    {
      slug: 'neem-turmeric-face-wash', name: 'Neem & Turmeric Face Wash', sku: 'ARK-CLN-002',
      categoryId: catMap['cleansers'], price: 2200, stock: 62, featured: false,
      shortDescription: 'A clarifying gel cleanser combining Vedic neem and turmeric. For oily and breakout-prone skin.',
      description: 'Neem (Nimba) has been documented in the Atharva Veda since 1500 BCE as a purifying agent. Combined with turmeric\'s anti-inflammatory properties, this gel wash clears breakouts, controls excess oil, and leaves skin visibly clearer.\n\nUse morning and evening. Lather on wet skin, massage for 30 seconds, rinse thoroughly.',
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-neem'], featured: true },
        { id: ingMap['ing-turmeric'], featured: true },
      ],
    },
    {
      slug: 'rose-sandalwood-micellar-water', name: 'Rose & Sandalwood Micellar Water', sku: 'ARK-CLN-003',
      categoryId: catMap['cleansers'], price: 2400, stock: 38, featured: false,
      shortDescription: 'Effortless micellar cleansing with cooling sandalwood and rose. No rinse required.',
      description: 'Sandalwood\'s cooling and anti-inflammatory properties, documented in the Sushruta Samhita, are the hero of this no-rinse micellar water. Rose water — referenced in Persian pharmacopoeias — soothes and tones simultaneously.\n\nSaturate a cotton pad and sweep across the face. No rinsing needed.',
      images: ['https://images.unsplash.com/photo-1570194065650-d99fb4cb7300?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-sandalwood'], featured: true },
      ],
    },
    // Moisturisers
    {
      slug: 'ashwagandha-night-cream', name: 'Ashwagandha Night Cream', sku: 'ARK-MST-001',
      categoryId: catMap['moisturisers'], price: 4500, stock: 28, featured: true,
      shortDescription: 'A rich night cream with adaptogenic ashwagandha and brahmi. Rebuilds collagen while you sleep.',
      description: 'Ashwagandha has been a cornerstone of Ayurvedic rasayana (rejuvenation) therapy since 600 BCE. This night cream harnesses its cortisol-reducing, collagen-stimulating properties alongside brahmi for overnight skin repair.\n\nApply to clean skin each evening. Massage gently upward. Rinse in the morning.',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-ashwagandha'], featured: true },
        { id: ingMap['ing-brahmi'], featured: true },
      ],
    },
    {
      slug: 'saffron-honey-day-moisturiser', name: 'Saffron & Honey Day Moisturiser', sku: 'ARK-MST-002',
      categoryId: catMap['moisturisers'], price: 3800, stock: 35, featured: true,
      shortDescription: 'Brightening day moisturiser with Persian saffron. Protects, hydrates, and enhances your skin\'s natural glow.',
      description: 'Saffron\'s brightening properties were documented by Ibn Sina in his Canon of Medicine (1025 CE). This lightweight day moisturiser delivers saffron\'s crocin and safranal alongside wild honey for deep hydration.\n\nApply after cleansing each morning. Absorbs quickly. Can be worn under SPF.',
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-saffron'], featured: true },
      ],
    },
    {
      slug: 'brahmi-hydrating-gel', name: 'Brahmi Hydrating Gel', sku: 'ARK-MST-003',
      categoryId: catMap['moisturisers'], price: 3200, stock: 50, featured: false,
      shortDescription: 'A lightweight gel moisturiser with brahmi and rose water. Ideal for oily or combination skin.',
      description: 'Brahmi (Gotu Kola) was prescribed in the Charaka Samhita for skin rejuvenation and wound healing. This oil-free gel delivers brahmi\'s collagen-stimulating benefits in a featherlight formula that won\'t clog pores.\n\nApply morning and evening to clean skin. Works well as a primer base.',
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-brahmi'], featured: true },
      ],
    },
    // Face Oils
    {
      slug: 'kumkumadi-tailam-face-oil', name: 'Kumkumadi Tailam Face Oil', sku: 'ARK-OIL-001',
      categoryId: catMap['face-oils'], price: 5500, stock: 20, featured: true,
      shortDescription: 'Our hero product. The original 16-ingredient Kumkumadi tailam, faithfully translated from the Ashtanga Hridayam.',
      description: 'The Ashtanga Hridayam (7th century CE) details the Kumkumadi tailam as an oil of exceptional skin-brightening and rejuvenating properties. Ours contains all 16 classical ingredients including saffron, sandalwood, vetiver, lotus, and red sandalwood in sesame oil base — as the text specifies.\n\nApply 3–4 drops to clean skin at night. Massage upward and inward. Results visible in 4 weeks.',
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-kumkumadi'], featured: true },
        { id: ingMap['ing-saffron'], featured: true },
        { id: ingMap['ing-sandalwood'], featured: true },
      ],
    },
    {
      slug: 'black-seed-argan-facial-oil', name: 'Black Seed & Argan Facial Oil', sku: 'ARK-OIL-002',
      categoryId: catMap['face-oils'], price: 4800, stock: 24, featured: false,
      shortDescription: 'Egyptian black seed meets Moroccan argan. Anti-inflammatory and intensely nourishing.',
      description: 'Black seed oil appears in the Ebers Papyrus (1550 BCE) — one of the oldest medical documents known — as a remedy for skin conditions. Blended with cold-pressed argan, this oil calms inflammation, reduces redness, and deeply nourishes.\n\nApply 2–3 drops morning or evening. Suitable for sensitive and reactive skin.',
      images: ['https://images.unsplash.com/photo-1570194065650-d99fb4cb7300?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-blackseed'], featured: true },
      ],
    },
    {
      slug: 'rosehip-bakuchiol-serum', name: 'Rosehip & Bakuchiol Serum', sku: 'ARK-OIL-003',
      categoryId: catMap['face-oils'], price: 4200, stock: 30, featured: false,
      shortDescription: 'Plant-based retinol alternative. Bakuchiol from Bhavaprakasa Nighantu with rosehip for cell renewal.',
      description: 'The Bhavaprakasa Nighantu (16th century CE) classifies bakuchiol (babchi) as a rasayana — a substance that promotes longevity and rejuvenation. Modern science confirms it stimulates retinol receptors without irritation.\n\nApply 3–5 drops to clean skin at night. Avoid mixing with active acids.',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-bakuchiol'], featured: true },
      ],
    },
    // Face Masks
    {
      slug: 'multani-mitti-purifying-mask', name: 'Multani Mitti Purifying Mask', sku: 'ARK-MSK-001',
      categoryId: catMap['face-masks'], price: 2600, stock: 55, featured: false,
      shortDescription: 'A deep-cleansing clay mask with Fuller\'s Earth and neem. Draws out impurities and tightens pores.',
      description: 'Multani mitti (Fuller\'s Earth) has been used in Unani medicine since the Mughal period for its extraordinary absorptive properties. This weekly mask combines it with neem and turmeric to deeply purify, tighten pores, and control oil.\n\nApply a thin layer to clean skin. Leave 15 minutes. Rinse with warm water. Use once or twice weekly.',
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-multanimitti'], featured: true },
        { id: ingMap['ing-neem'], featured: false },
      ],
    },
    {
      slug: 'turmeric-sandalwood-glow-mask', name: 'Turmeric & Sandalwood Glow Mask', sku: 'ARK-MSK-002',
      categoryId: catMap['face-masks'], price: 3000, stock: 40, featured: true,
      shortDescription: 'The original Vedic glow treatment. Turmeric and sandalwood for a visible brightness boost.',
      description: 'This mask is directly inspired by the haldi (turmeric paste) treatments documented in the Charaka Samhita. Turmeric\'s curcumin inhibits melanin production while sandalwood soothes and cools.\n\nApply evening. Leave 20 minutes. Expect mild yellow tinge that fades overnight.',
      images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-turmeric'], featured: true },
        { id: ingMap['ing-sandalwood'], featured: true },
      ],
    },
    {
      slug: 'chandan-rose-hydrating-mask', name: 'Chandan & Rose Hydrating Mask', sku: 'ARK-MSK-003',
      categoryId: catMap['face-masks'], price: 2800, stock: 48, featured: false,
      shortDescription: 'An intensely hydrating overnight mask with sandalwood and rose. Wakes up dry skin.',
      description: 'Sandalwood\'s cooling, anti-inflammatory properties combined with rose water — referenced in Persian pharmacopoeias since the 10th century — make this an ideal overnight mask for dry and dehydrated skin.\n\nApply a generous layer at night as the last skincare step. Wake up to plump, soft skin.',
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-sandalwood'], featured: true },
      ],
    },
    // Eye & Lip
    {
      slug: 'almond-saffron-eye-cream', name: 'Almond & Saffron Eye Cream', sku: 'ARK-EYE-001',
      categoryId: catMap['eye-lip-care'], price: 3800, stock: 22, featured: false,
      shortDescription: 'Brightens dark circles and firms the delicate eye area with Persian saffron and sweet almond.',
      description: 'Ibn Sina\'s Canon of Medicine references saffron for reducing dark discolouration. Combined with sweet almond oil — rich in Vitamin E — this lightweight eye cream targets dark circles, puffiness, and fine lines.\n\nApply a rice-grain amount to each eye area morning and evening. Pat gently with ring finger.',
      images: ['https://images.unsplash.com/photo-1570194065650-d99fb4cb7300?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-saffron'], featured: true },
      ],
    },
    {
      slug: 'kumkumadi-lip-serum', name: 'Kumkumadi Lip Serum', sku: 'ARK-EYE-002',
      categoryId: catMap['eye-lip-care'], price: 2200, stock: 60, featured: false,
      shortDescription: 'Plumps and brightens lips with a miniature Kumkumadi blend. Fades pigmentation.',
      description: 'A concentrated lip treatment using a simplified Kumkumadi formula. Saffron and sandalwood address lip pigmentation while the oil base intensely nourishes and plumps.\n\nApply day and night directly to lips. Can be worn over lipstick as a plumping gloss.',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-kumkumadi'], featured: true },
      ],
    },
    {
      slug: 'kohl-castor-lash-serum', name: 'Kohl & Castor Lash Serum', sku: 'ARK-EYE-003',
      categoryId: catMap['eye-lip-care'], price: 2800, stock: 35, featured: false,
      shortDescription: 'Strengthens and lengthens lashes with castor oil and kohl-infused botanicals.',
      description: 'Kohl has been used around the eyes for thousands of years across Egyptian, Indian, and Arab cultures — with documented references in the Sushruta Samhita and ancient Egyptian texts. This lash serum takes its inspiration from those traditions using castor oil for growth and strength.\n\nApply along lash line and brows each evening before bed.',
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80'],
      ingredients: [
        { id: ingMap['ing-sandalwood'], featured: false },
      ],
    },
  ]

  for (const p of productData) {
    const { ingredients: ings, ...data } = p
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        ingredients: {
          create: ings.map(i => ({ ingredientId: i.id, isFeatured: i.featured })),
        },
      },
    })
  }
  console.log('✓ Products')

  // ── Sample reviews ──────────────────────────────────────────
  const products = await prisma.product.findMany({ take: 5 })
  const reviewData = [
    { rating: 5, guestName: 'Priya M.',  comment: 'The Kumkumadi oil has genuinely transformed my skin. I\'ve tried dozens of face oils. This is the first one that delivers what it promises.' },
    { rating: 5, guestName: 'James T.',  comment: 'The ingredient sourcing notes convinced me to try it. Three months in — my skin has never looked better. Will not be switching.' },
    { rating: 4, guestName: 'Sophie R.', comment: 'As a GP I appreciate the transparency. The turmeric mask left my skin glowing for days. Slight staining on my pillowcase — warn people to use an old one!' },
    { rating: 5, guestName: 'Neha K.',   comment: 'Finally a brand that explains *why* an ingredient works, not just that it\'s natural. The ashwagandha cream is extraordinary.' },
    { rating: 4, guestName: 'Mark D.',   comment: 'Sceptical at first. Genuinely impressed. The neem cleanser cleared my skin in two weeks. Packaging is beautiful.' },
  ]

  for (let i = 0; i < Math.min(reviewData.length, products.length); i++) {
    const existing = await prisma.review.findFirst({ where: { productId: products[i].id, guestName: reviewData[i].guestName } })
    if (!existing) {
      await prisma.review.create({
        data: { productId: products[i].id, ...reviewData[i] },
      })
    }
  }
  console.log('✓ Reviews')

  console.log('\n✅ Seed complete!')
  console.log('\nAdmin login:')
  console.log('  Email:    admin@aarrikka.com')
  console.log('  Password: aarrikka-admin-2024\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
