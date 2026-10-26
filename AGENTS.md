# MONARCH — men's fashion store (Next.js 16 + Prisma + PostgreSQL)

## Commands
- `npm run dev` — dev server (Turbopack) on http://localhost:3000
- `npm run typecheck` — `tsc --noEmit` (primary fast check; `next lint` is not configured)
- `npm run build` — production build; runs TypeScript as well
- `npm run create-admin` — provision/upgrade the ADMIN user from `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- `npm run seed-store` — upload `/public/images/mens/*` to Cloudinary `mens_store/site` and set hero/category content (idempotent). `--skip-stock` leaves product stock untouched.
- Schema changes: edit `prisma/schema.prisma` then `npx prisma db push` (the project uses db push; `prisma/migrations` is historical and out of date). Stop the dev server first on Windows or `prisma generate` fails with EPERM on the engine DLL.

## Architecture
- `lib/site.ts` — single source of truth: brand, categories (Shirts/Trousers/Shoes), sizes, colours, order statuses, payment methods, shipping rule, Cloudinary folders.
- `lib/auth.ts` — JWT cookie auth (`token`, httpOnly). Use `requireUser(req)` / `requireAdmin(req)` in route handlers.
- `lib/rate-limit.ts` — in-memory sliding window limiter (`enforceRateLimit`). Single-instance only; swap for Redis if scaling out.
- `lib/validate.ts` — input sanitizers (`cleanText`, `normalizeEmail`, `isUuid`, `validateImageFile`, honeypot).
- `lib/cloudinary.ts` — all uploads go under `mens_store/`. KYC documents use `uploadPrivateImage` (type `authenticated`, public_id stored) and are only viewable via `signedPrivateUrl` (15 min) from `/api/admin/kyc`.
- `proxy.ts` — auth redirects for `/dashboard`, `/checkout`, `/orders`, `/kyc` + Origin/Referer check on mutating `/api/*` requests (CSRF).
- Orders: `POST /api/orders` builds the order from the **server-side cart** only (prices from DB, stock decremented atomically in a Serializable transaction, `idempotencyKey` dedupes retries, cart cleared on commit, emails best-effort).
- Order statuses shown in admin: PENDING / PROCESSING / COMPLETED / CANCELLED. Legacy PAID/SHIPPED → PROCESSING, DELIVERED → COMPLETED via `normalizeOrderStatus`.
- Admin panel: `component/dashboard/*` (tabs: overview, orders, products/inventory, customers, reviews, kyc, messages, home content). Stats come from `/api/dashboard/stats`.
- Legacy Prisma models kept for non-destructive compatibility but no longer used by the UI: PromoBanner, SaleBanner, InspirationImage, BlogPost, Testimonial, FeaturedProduct, Favorite, SearchLog. `HomeSlider` + `Category` back the home hero/tiles via `/api/home`.

## Conventions
- Tailwind v4: custom reusable classes (`btn-ink`, `field`, `card`, `label`…) are declared with `@utility` in `app/globals.css` so they can be `@apply`'d.
- Theme tokens: `ink` (near-black), `bone` (warm off-white), `brass` (gold accent), `oxblood` (danger/emphasis). Serif display font via `--font-serif` (Cormorant Garamond).
- Never return `user`/owner relations, password hashes, reset codes or KYC image identifiers to non-admin clients.
- Product writes are admin-only. Customers cannot create products.
