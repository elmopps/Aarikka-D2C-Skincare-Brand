# Aarrikka — Ancient Skincare, Modern Skin

A full-stack D2C skincare e-commerce website built with Next.js 14, PostgreSQL (Supabase), Prisma, and NextAuth. Live at **[aarikka.vercel.app](https://aarikka.vercel.app)**.

> **Course project** — Built as a hands-on exercise for the [Advanced AI Product Management for PMs](https://www.pmcurve.com/program/advanced-ai-for-pms) program by PMCurve. A 12-week course designed for Product Managers to learn how to build and lead AI products — from foundational concepts to deployment. This project covers the "build it yourself" module: taking a product idea from requirements all the way to a live, working website.

---

## What This Is

Aarrikka is a premium organic skincare brand whose differentiator is authenticity — every formulation is traced to a named historical text (the Charaka Samhita, the Ebers Papyrus, the Ashtanga Hridayam) rather than vague "inspired by nature" language. The target customer is a UK professional aged 28–45 who has been burned by greenwashing and researches before they buy.

The website is built to match that positioning: lead with evidence, not aesthetics. Every product page shows the ingredient's historical source, origin region, and dermatologist-reviewed skin benefit. The brand copy is specific, not adjective-heavy.

This repository is V1 — a complete, deployable storefront with cart, checkout, order confirmation, and a basic admin panel. No payment gateway (Cash on Delivery in V1).

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + SSG + API routes in one repo |
| Language | TypeScript | End-to-end type safety |
| Database | PostgreSQL via Supabase | Managed hosting, connection pooling, free tier |
| ORM | Prisma | Schema-as-code, type-safe queries |
| Auth | NextAuth.js (Credentials) | Email/password with role-based admin guard |
| Styling | Tailwind CSS | Custom design tokens, no heavy UI kit needed |
| Postcode API | postcodes.io | Free UK postcode → region lookup, no API key needed |
| Hosting | Vercel + Supabase | Purpose-built for Next.js; free tiers sufficient for V1 |

---

## Features

### Storefront
- Editorial hero with dark overlay and brand origin statement
- Anti-greenwashing section — three evidence-backed differentiators with source citations
- Brand origin timeline (600 BCE → today)
- Category grid pulled from database
- Bestsellers strip with star ratings
- Trust bar (certifications, sourcing, dermatologist association)
- Social proof section with professional-demographic testimonials

### Category & Product Pages
- Server-rendered category listing pages (`/category/[slug]`)
- Product detail with ingredient cards showing historical source, origin region, and skin benefit
- UK postcode delivery estimator — enter postcode, get region-specific delivery window and cost in real time
- Add to cart with session-based persistence (no login required)
- Reviews with star breakdown and verified purchase badges

### Cart & Checkout
- Persistent cart via UUID session cookie (survives page refresh, no account needed)
- Three-step checkout:
  - **Step 1** — Identity: Guest (name + email only) or Sign Up (creates account)
  - **Step 2** — Delivery: Address form with live postcode validation
  - **Step 3** — Review & Place: Full order summary, Cash on Delivery, order saved as `PENDING`
- Order confirmation with human-readable reference (e.g. `ARK-00123`) and delivery estimate

### Admin Panel (`/admin`)
- Dashboard: orders today, revenue MTD, low-stock alerts
- Product CRUD with featured ingredient management
- Order management: list view, detail view, status updates (PENDING → PROCESSING → SHIPPED → DELIVERED)
- Delivery zone editor: update region → days → cost mapping without touching code
- Role-protected via middleware (ADMIN role required)

---

## Data Model — Design Decisions

Coming from a PM background, what surprised me most was how much product thinking goes into data modelling. A few decisions I made consciously and learned from:

**Money stored in pence (integers), not pounds (decimals).** Floating-point arithmetic is unreliable for currency — `0.1 + 0.2` doesn't equal `0.3` in most programming languages. Storing `2499` instead of `24.99` eliminates that class of bug entirely. Simple rule: never trust a float with money.

**Order shipping address is a snapshot, not a link.** Rather than saving a reference to a user's address, the order stores a frozen copy of it as JSON. If the user updates their address later, their past orders still show where the package was actually sent. This was a direct product instinct — data that matters to a user's history shouldn't change under them.

**Ingredients are a shared library, not copy-pasted text.** Each ingredient (turmeric, saffron, neem) lives in its own database record with its historical source, origin region, and skin benefit. Products link to ingredients rather than duplicating the text. When the historical note needs updating, you change it in one place and it reflects everywhere. A classic normalisation win that also makes the admin panel cleaner.

**Cart works without an account.** A UUID is generated in the browser and stored in localStorage. Cart items in the database are keyed to that ID. No login friction at the top of the funnel — a deliberate product decision, not just a technical one.

**Delivery zones are admin-configurable.** Shipping windows and costs live in the database, not hardcoded in the app. A non-technical team member can update pricing from the admin panel without a deployment. That separation of content from code is something I hadn't thought about before starting this project.

---

## What I Learned Building This

This was my first time taking a product idea all the way to a live deployment. A few things I didn't expect to matter as much as they did:

### Full-stack means the full stack

The application code is only part of the picture. I hit issues with configuration files (Next.js 14 doesn't support TypeScript config files — you need `.mjs`), shell quoting (zsh handles inline JSON differently from bash), and dependency versioning (locking `eslint-config-next` to match the Next.js version, not whatever `npm install` decides). None of this is in any tutorial. It's just what production feels like.

### Database connections need to be managed, not assumed

Connecting a Next.js app (which spins up serverless functions per request) to PostgreSQL without care exhausts your database's connection limit quickly. Supabase uses PgBouncer — a connection pooler — which batches and reuses connections. But it comes with a constraint: it doesn't support PostgreSQL "prepared statements," which is Prisma's default. One flag in the connection string (`?pgbouncer=true`) solves it. The lesson: infrastructure has opinions, and understanding why matters more than just following setup guides.

### Types are a communication tool

TypeScript kept catching things that weren't bugs yet but would have been. The most instructive: NextAuth's built-in `User` type doesn't include a `role` field — because that's a custom extension. TypeScript forced me to be explicit about the assumption ("this user object has a role") rather than letting it quietly fail at runtime. I came in thinking types were just about catching typos. They're actually about making your assumptions visible.

### Deployment is its own discipline

The app worked locally. Then it didn't on Vercel, for three separate reasons — each one a different category of problem. Environment variables aren't deployed with your code (correctly — you don't want credentials in git). `NEXTAUTH_URL` needs to point to your actual deployed domain or auth breaks during the build itself. These aren't edge cases; they're standard deployment hygiene that you only learn by doing it.

### PM instincts translate

The decisions that felt most natural were the product ones buried inside the architecture: don't let historical data change retroactively, don't require account creation to shop, make ops-level config (delivery pricing) editable without code. These aren't engineering insights — they're just good product thinking applied one layer deeper than a spec doc.

---

## Local Setup

```bash
git clone https://github.com/elmopps/Aarikka-D2C-Skincare-Brand.git
cd Aarikka-D2C-Skincare-Brand

# Install dependencies
npm install

# Create .env (see Environment Variables section below)
cp .env.example .env

# Push schema to database
npm run db:push

# Seed with categories, products, ingredients, delivery zones
npm run db:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000`.

Admin login (after seeding): `admin@aarrikka.com` / `aarrikka-admin-2024`

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Connect → Transaction pooler (port 6543). Append `?pgbouncer=true` |
| `DIRECT_URL` | Supabase → Connect → Session pooler (port 5432) |
| `NEXTAUTH_SECRET` | Any 32-char random string. Generate at https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | Your deployment URL (e.g. `https://aarikka.vercel.app`) |

---

## Project Structure

```
app/
  (storefront)/          # Public-facing pages
    page.tsx             # Homepage
    category/[slug]/     # Product listing
    product/[slug]/      # Product detail
    cart/                # Cart
    checkout/            # 3-step checkout
    order/[id]/          # Order confirmation
  (admin)/admin/         # Admin panel (role-protected)
    dashboard/
    products/
    orders/
    delivery-zones/
  api/                   # All API routes
  login/

components/
  storefront/            # Public UI components
  admin/                 # Admin UI components
  ui/                    # Base components

lib/
  prisma.ts              # Prisma client singleton
  auth.ts                # NextAuth config
  postcode.ts            # postcodes.io helper
  cart-context.tsx       # Cart state (React context + localStorage)
  format.ts              # Currency + date formatters

prisma/
  schema.prisma
  seed.ts                # Full seed: categories, products, ingredients, zones, reviews
```

---

## What's Not In V1

- Payment gateway (Stripe planned for V2)
- Product filtering and sorting on category pages
- Image uploads via admin (products use Unsplash URLs in V1)
- Email notifications on order placement or status change
- Customer account dashboard (order history, address book)

---

## Deployment

Hosted on **Vercel** (frontend) + **Supabase** (PostgreSQL). Vercel auto-deploys on every push to `main`.

After the first deploy, run the seed once against the production database:

```bash
npm run db:seed
```

Run this once on a fresh database — it will add duplicate products if run again.
