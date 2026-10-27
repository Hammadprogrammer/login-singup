import Link from "next/link";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Scissors, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import { SITE } from "@/lib/site";
import { loadHome, type HomeContent } from "@/lib/home";
import Hero from "@/component/home/Hero";
import Reveal from "@/component/ui/Reveal";
import ProductCard from "@/component/ui/ProductCard";

export const dynamic = "force-dynamic";

const EMPTY_HOME: HomeContent = { hero: [], categories: [], editorial: null, lookbook: [], sliderId: null };

async function getHomeData() {
  const [home, featured, latest, reviews, reviewAgg] = await Promise.all([
    loadHome().catch(() => EMPTY_HOME),
    prisma.product.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: "desc" }, take: 3, include: { user: { select: { name: true } } } }),
    prisma.review.aggregate({ where: { isApproved: true }, _avg: { rating: true }, _count: true }),
  ]);
  return { ...home, featured: featured.length >= 4 ? featured : latest, reviews, reviewAgg };
}

export default async function HomePage() {
  const { hero, categories, editorial, lookbook, featured, reviews, reviewAgg } = await getHomeData();

  return (
    <div className="-mt-16 lg:-mt-[144px]">
      <Hero images={hero} />

      {/* Promise strip */}
      <section className="border-b border-bone-3 bg-bone-2/60">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] uppercase tracking-[0.2em] text-ink-3">
          {[
            { icon: Truck, t: `Free shipping over $${SITE.freeShippingOver}` },
            { icon: RotateCcw, t: "14-day easy returns" },
            { icon: ShieldCheck, t: "Secure checkout" },
            { icon: Scissors, t: "Tailored fits" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-3"><Icon size={16} className="text-brass shrink-0" /><span>{t}</span></div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-20 lg:pt-28">
        <Reveal className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow text-brass mb-3">Shop by category</p>
            <h2 className="display text-4xl lg:text-5xl">The essentials, done properly.</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((c, idx) => (
            <Reveal key={c.slug} delay={idx * 120}>
              <Link href={`/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-ink zoom-media">
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-bone">
                  <p className="eyebrow text-brass-2 mb-2">0{idx + 1}</p>
                  <h3 className="display text-4xl mb-2">{c.name}</h3>
                  <p className="text-sm text-bone/70 max-w-xs leading-relaxed">{c.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-2 eyebrow text-[10px] text-bone group-hover:text-brass-2 transition-colors">
                    Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-24 lg:pt-32">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow text-brass mb-3">Curated for you</p>
            <h2 className="display text-4xl lg:text-5xl">This season&apos;s picks</h2>
          </div>
          <Link href="/search?q=" className="btn-ghost link-underline">View all products</Link>
        </Reveal>

        {featured.length === 0 ? (
          <div className="card p-16 text-center">
            <p className="font-serif text-2xl mb-2">The collection is being prepared.</p>
            <p className="text-sm text-stone">New arrivals will appear here as soon as they&apos;re added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6">
            {featured.map((p, idx) => (
              <Reveal key={p.id} delay={(idx % 4) * 80}>
                <ProductCard product={{ ...p, createdAt: p.createdAt.toISOString() }} priority={idx < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Editorial split */}
      <section className="mt-24 lg:mt-32 bg-ink text-bone">
        <div className="mx-auto max-w-[1440px] grid lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[640px] overflow-hidden bg-ink-2">
            {editorial && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editorial} alt="Menswear editorial" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </Reveal>
          <Reveal delay={150} className="flex flex-col justify-center px-8 py-16 lg:px-20">
            <p className="eyebrow text-brass-2 mb-4">Our philosophy</p>
            <h2 className="display text-4xl lg:text-6xl mb-6">Fewer pieces. Better made.</h2>
            <p className="text-bone/70 leading-relaxed max-w-md mb-4">
              We design a tight wardrobe of shirts, trousers and shoes that work together — so getting dressed takes seconds and looks like it took effort.
            </p>
            <p className="text-bone/70 leading-relaxed max-w-md mb-10">
              Every fabric is chosen for how it wears over years, not seasons. Every stitch is checked before it leaves our studio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/about" className="btn-bone">Read our story</Link>
              <Link href="/contact" className="btn-outline-bone">Book a fitting</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Lookbook strip */}
      {lookbook.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-24 lg:pt-32">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow text-brass mb-3">Lookbook</p>
            <h2 className="display text-4xl lg:text-5xl">Worn well.</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {lookbook.map((l, idx) => (
              <Reveal key={l.id} delay={idx * 100} className={idx === 2 ? "col-span-2 lg:col-span-1" : ""}>
                <Link href={l.link} className="group relative block aspect-[3/4] overflow-hidden bg-bone-2 zoom-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.image} alt={l.label} className="absolute inset-0 h-full w-full object-cover" />
                  {l.label && (
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink/70 to-transparent">
                      <p className="eyebrow text-bone text-[10px]">{l.label}</p>
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pt-24 lg:pt-32">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow text-brass mb-3">Customer reviews</p>
            <h2 className="display text-4xl lg:text-5xl">What they&apos;re saying</h2>
          </div>
          {reviewAgg._count > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex text-brass">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill={i < Math.round(reviewAgg._avg.rating ?? 0) ? "currentColor" : "none"} />)}</div>
              <p className="text-sm text-ink-3">{(reviewAgg._avg.rating ?? 0).toFixed(1)} · {reviewAgg._count} review{reviewAgg._count === 1 ? "" : "s"}</p>
            </div>
          )}
        </Reveal>
        {reviews.length === 0 ? (
          <Reveal className="card p-12 text-center">
            <p className="font-serif text-2xl mb-2">Be the first to leave a review.</p>
            <p className="text-sm text-stone mb-6">Tell other customers how your pieces fit and wear.</p>
            <Link href="/reviews" className="btn-outline">Write a review</Link>
          </Reveal>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {reviews.map((r, idx) => (
              <Reveal key={r.id} delay={idx * 100} className="card p-8 flex flex-col">
                <div className="flex text-brass mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />)}</div>
                {r.title && <p className="font-medium mb-2">{r.title}</p>}
                <p className="font-serif text-lg leading-relaxed text-ink-2 flex-1">&ldquo;{r.comment}&rdquo;</p>
                <p className="mt-6 eyebrow text-[10px] text-stone">{r.user.name || "Verified customer"}</p>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal className="text-center mt-10">
          <Link href="/reviews" className="btn-ghost link-underline">All reviews</Link>
        </Reveal>
      </section>
    </div>
  );
}
