# MONARCH — Premium Men's Fashion Store

Next.js 16 (App Router) · Prisma + PostgreSQL · Cloudinary · Nodemailer (email OTP) · JWT cookie auth.

Catalogue: **Shirts · Trousers · Shoes**. Payments: cash on delivery / bank transfer.

## Setup

```bash
npm install                 # also runs prisma generate
npx prisma db push          # sync schema to your database (additive)
npm run create-admin        # creates the ADMIN user from ADMIN_EMAIL / ADMIN_PASSWORD
npm run seed-store          # uploads site imagery to Cloudinary (mens_store/site) + home content
npm run dev                 # http://localhost:3000
```

Required `.env` keys: `DATABASE_URL`, `JWT_SECRET` (32+ chars), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL`, `EMAIL_PASSWORD`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
Optional: `NEXT_PUBLIC_BASE_URL` (OAuth redirect base), `NEXT_PUBLIC_CURRENCY` (default `USD`),
`NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_PHONE`.

## Storefront
`/` home · `/shirts` `/trousers` `/shoes` collections · `/product/[id]` · `/search?q=` · `/about` · `/contact` · `/reviews`
· `/cart` · `/checkout` · `/orders` (history + cancel pending) · `/kyc` (identity verification) · `/login` `/signup` `/forgot`

## Admin panel (`/dashboard`, ADMIN role only)
Overview (real DB stats, 30-day revenue, low stock) · Orders (All / Pending / Processing / Completed / Cancelled, search,
date & payment filters, full order detail, status updates with restock on cancel) · Inventory (products, stock, publish,
feature, images → Cloudinary `mens_store/products`) · Customers · Reviews moderation · KYC review (signed, expiring
document links) · Contact inbox · Home content (hero + category images).

## Security notes
Rate limiting on auth/order/contact/review/KYC endpoints · Origin check on all mutating API calls (CSRF) · security headers
· server-side pricing & atomic stock reservation · idempotent checkout · honeypots on signup/contact · private
(authenticated) Cloudinary storage for KYC documents · admin-only product writes · no secrets or hashes ever returned.

See `AGENTS.md` for architecture and conventions.
