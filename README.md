# Aarrikka — Ancient Skincare, Modern Skin

A full-stack D2C skincare e-commerce website built with Next.js 14, PostgreSQL (Supabase), Prisma, and NextAuth. Live at **[aarikka.vercel.app](https://aarikka.vercel.app)**.

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
| Database | PostgreSQL via Supabase | Managed hosting, PgBouncer pooling, free tier |
| ORM | Prisma | Schema-as-code, type-safe queries |
| Auth | NextAuth.js (Credentials) | Email/password with role-based admin guard |
| Styling | Tailwind CSS | Custom design tokens, no UI kit dependencies |
| Postcode API | postcodes.io | Free UK postcode → region lookup, no API key needed |
| Hosting | Vercel + Supabase | Purpose-built for Next.js; free tiers sufficient for V1 |

---

## Features

### Storefront
- Editorial hero with dark overlay, brand origin statement
- Anti-greenwashing section — three evidence-backed differentiators with source citations
- Brand origin timeline (600 BCE → today)
- Category grid pulled from database
- Bestsellers strip with star ratings
- Trust bar (certifications, sourcing, dermatologist association)
- Social proof section with professional-demographic testimonials

### Category & Product Pages
- Server-rendered category listing pages (`/category/[slug]`)
- Product detail with image gallery, ingredient cards showing historical source + origin region + skin benefit
- UK postcode delivery estimator — enter postcode, get region-specific delivery window and cost in real time
- Add to cart with session-based persistence (no login required)
- Reviews section with star breakdown and verified purchase badges

### Cart & Checkout
- Persistent cart via UUID session cookie (survives page refresh, no account needed)
- Three-step checkout:
  - **Step 1** — Identity: Guest (name + email only) or Sign Up (creates account)
  - **Step 2** — Delivery: Address form with live postcode validation
  - **Step 3** — Review & Place: Full order summary, Cash on Delivery, order saved as `PENDING`
- Order confirmation page with human-readable reference (e.g. `ARK-00123`) and delivery estimate

### Admin Panel (`/admin`)
- Dashboard: orders today, revenue MTD, low-stock alerts
- Product CRUD with featured ingredient management
- Order management: list view, detail view, status updates (PENDING → PROCESSING → SHIPPED → DELIVERED)
- Delivery zone editor: update region → days → cost mapping without touching code
- Role-protected via middleware (ADMIN role required)

---

## Data Model Highlights

The schema has a few intentional decisions worth explaining:

**Money is stored in pence (integers).** `price: Int` means £24.99 is stored as `2499`. This completely avoids floating-point rounding errors — a real problem when you're doing subtotals across cart items.

**Order shipping address is a JSON snapshot, not a foreign key.** `shippingAddress: Json` on `Order` means the delivery address is frozen at order time. If a user later edits their profile address, it doesn't silently change their order history.

**Ingredient is a shared library model.** Rather than storing ingredient info as a text blob per product, `Ingredient` is its own table linked via `ProductIngredient` with an `isFeatured` flag. This means historical source data is consistent across products and manageable from the admin panel.

**Cart uses anonymous session IDs.** `CartItem` has a `sessionId` (UUID stored in localStorage) rather than requiring login. The `@@unique([sessionId, productId])` constraint prevents duplicate line items — updating quantity uses an upsert.

**DeliveryZone is admin-configurable.** Delivery windows and costs live in the database, not in code. The admin panel exposes an editor so pricing can change without a deployment.

---

## How It Was Built — The Real Journey

This project was built without a local Node.js installation. All 59 source files were written directly and pushed to GitHub, with Vercel handling the build. That constraint exposed a series of real-world problems worth documenting.

### Problem 1 — `next.config.ts` not supported on Node v24

Next.js 14.2.x does not support TypeScript config files. The error was:

```
Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'
```

**Fix:** Deleted `next.config.ts`, created `next.config.mjs` using JSDoc type annotations instead of TypeScript imports:

```js
/** @type {import('next').NextConfig} */
const nextConfig = { ... }
export default nextConfig
```

---

### Problem 2 — Seed script JSON quoting broken on zsh

The original `package.json` seed script passed `--compiler-options '{"module":"CommonJS"}'` inline. On zsh, the shell strips the inner quotes and `ts-node` gets malformed JSON.

**Fix:** Moved the compiler options into `package.json` root as a `ts-node` config key:

```json
"ts-node": {
  "compilerOptions": { "module": "CommonJS" }
}
```

Simplified the script to just:

```json
"db:seed": "ts-node prisma/seed.ts"
```

---

### Problem 3 — Prisma "prepared statement does not exist" (PgBouncer)

Every Prisma query was failing with error code `26000`:

```
prepared statement "s0" does not exist
```

**Root cause:** Supabase's transaction pooler (port 6543) uses PgBouncer in transaction mode. PgBouncer doesn't support PostgreSQL prepared statements, which Prisma uses by default.

**Fix:** Append `?pgbouncer=true` to the `DATABASE_URL`:

```
postgresql://...@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

The `DIRECT_URL` (port 5432, session pooler) is used by Prisma for migrations only and doesn't need this flag. This dual-URL setup is standard for Prisma + Supabase.

---

### Problem 4 — Vercel build failing: `eslint-config-next` version conflict

```
npm error ERESOLVE could not resolve
eslint-config-next@16.2.4 requires peer eslint@">=9.0.0"
but project has eslint@8.57.1
```

**Root cause:** `package.json` had `"eslint-config-next": "^16.2.4"` — the Next.js 16 version — but the project uses Next.js 14 which ships with eslint@8.

**Fix:** Pin to the matching version:

```json
"eslint-config-next": "14.2.5"
```

---

### Problem 5 — TypeScript error: `user.role` cast failing in NextAuth callback

```
Type error: Conversion of type 'User | AdapterUser' to type '{ role: string; }'
may be a mistake because neither type sufficiently overlaps with the other.
```

**Root cause:** NextAuth's `User` type doesn't include `role` — it's a custom field. TypeScript rightly rejects the direct cast.

**Fix:** Double-cast through `unknown`:

```ts
token.role = (user as unknown as { role: string }).role
```

---

### Problem 6 — Vercel `DATABASE_URL` missing at build time

Vercel builds failed with:

```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://`
```

**Root cause:** `.env` is (correctly) gitignored. Environment variables need to be set explicitly in the Vercel dashboard under Settings → Environment Variables.

**Fix:** Added `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as Vercel environment variables, then redeployed.

---

### Problem 7 — `NEXTAUTH_URL` empty causes `Invalid URL` during static generation

```
TypeError: Invalid URL
  at new URL (node:internal/url:819:25)
```

**Root cause:** NextAuth constructs callback URLs using `NEXTAUTH_URL`. If it's undefined during `next build`, the `new URL('')` call throws. The `/login` page was failing to prerender.

**Fix:** Set `NEXTAUTH_URL` to the deployed Vercel URL in environment variables:

```
NEXTAUTH_URL=https://aarikka.vercel.app
```

---

## Local Setup

```bash
git clone https://github.com/elmopps/Aarikka-D2C-Skincare-Brand.git
cd Aarikka-D2C-Skincare-Brand

# Install dependencies
npm install

# Create .env (copy values from Supabase + generate NEXTAUTH_SECRET)
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

- Payment gateway (Stripe integration planned for V2)
- Product filtering and sorting on category pages
- Image uploads via admin panel (products use Unsplash URLs in V1)
- Email notifications on order placement or status change
- Customer account dashboard (order history, address book)

---

## Deployment

Hosted on **Vercel** (frontend) + **Supabase** (PostgreSQL). Vercel auto-deploys on every push to `main`.

After deploy, run the seed once against the production database:

```bash
npm run db:seed
```

This is a one-time step. The seed is idempotent for categories and ingredients (uses upsert) but will add duplicate products if run more than once — run it once on a fresh database.
