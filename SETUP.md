# Aarrikka — Setup Guide

## Prerequisites
- A **Supabase** account (free at supabase.com)
- A **Vercel** account (free at vercel.com)
- A **GitHub** account

---

## Step 1 — Set up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Give it a name (e.g. `aarrikka`), set a strong DB password, choose region `eu-west-2` (London)
3. Once created, go to **Settings → Database**
4. Under **Connection string**, select **Transaction** mode (port 6543) — copy it as `DATABASE_URL`
5. Under **Connection string**, select **Session** mode (port 5432) — copy it as `DIRECT_URL`

---

## Step 2 — Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
```

For `NEXTAUTH_SECRET`, generate one at: https://generate-secret.vercel.app/32

---

## Step 3 — Push to GitHub

1. Create a new repository on GitHub (e.g. `aarrikka`)
2. In the project folder, run:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/aarrikka.git
git push -u origin main
```

---

## Step 4 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your `aarrikka` repo
3. Under **Environment Variables**, add all 4 variables from Step 2
4. Click **Deploy**

---

## Step 5 — Run Database Migrations

After deployment succeeds, go to **Vercel → your project → Settings → Functions** and find the deployment URL.

Or run locally if you have Node installed:
```bash
npm install
npx prisma db push
npm run db:seed
```

Alternatively, run migrations via **Supabase SQL Editor**:
- Go to Supabase → SQL Editor
- Run the SQL that Prisma generates (you can get it by running `npx prisma migrate dev --create-only` locally)

---

## Step 6 — Access the Site

- **Storefront**: `https://your-domain.vercel.app`
- **Admin panel**: `https://your-domain.vercel.app/admin/dashboard`
- **Admin login**: `admin@aarrikka.com` / `aarrikka-admin-2024`

> **Important**: Change the admin password immediately after first login.

---

## Folder Structure Quick Reference

```
aarrikka/
├── app/
│   ├── (storefront)/        ← Public pages
│   ├── (admin)/admin/       ← Admin panel
│   ├── api/                 ← All API routes
│   └── login/               ← Sign in page
├── components/
│   ├── storefront/          ← Public UI components
│   ├── admin/               ← Admin UI
│   └── ui/                  ← Base components
├── lib/                     ← Utilities, auth, cart context
├── prisma/
│   ├── schema.prisma        ← Database schema
│   └── seed.ts              ← Sample data
└── SETUP.md                 ← This file
```

---

## Adding Products

1. Log in at `/login` with admin credentials
2. Go to Admin → Products → Add Product
3. Fill in name, SKU, price, description, images (Unsplash URLs work)
4. Select category and featured ingredients
5. Click Create Product — it appears on the storefront immediately

---

## Customising Delivery Zones

Go to Admin → Delivery Zones → Edit any zone to change:
- Minimum and maximum delivery days
- Shipping cost (in pounds)

Changes apply immediately to all product pages and checkout.
