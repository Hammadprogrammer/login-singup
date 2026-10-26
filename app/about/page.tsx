import type { Metadata } from "next";
import Link from "next/link";
import { Scissors, Leaf, Truck, RotateCcw, ShieldCheck, Ruler } from "lucide-react";
import Reveal from "@/component/ui/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About", description: `The story, craft and promises behind ${SITE.name}.` };

const VALUES = [
  { icon: Scissors, title: "Cut with intent", text: "Patterns refined over dozens of fittings so the shoulder sits clean and the leg falls straight." },
  { icon: Leaf, title: "Honest fabrics", text: "Long-staple cottons, Irish linen, full-grain leather. Materials chosen for how they age, not how they photograph." },
  { icon: Ruler, title: "Fit guidance", text: "Every product lists real measurements. Still unsure? Our team will size you over a quick call." },
];

const PROMISES = [
  { icon: Truck, title: "Delivery", text: `Free shipping on orders over $${SITE.freeShippingOver}. Dispatched within 24 hours, delivered in 3–5 working days across Pakistan.` },
  { icon: RotateCcw, title: "Returns", text: "14 days to return unworn pieces with tags attached. Exchanges for size are always free." },
  { icon: ShieldCheck, title: "Payment & privacy", text: "Pay cash on delivery or by bank transfer. We never store card details and your documents are encrypted and access-controlled." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-bone">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/mens/about-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-24 lg:py-36">
          <p className="eyebrow text-brass-2 mb-4 animate-fade-up">About {SITE.name}</p>
          <h1 className="display text-5xl lg:text-7xl max-w-3xl animate-fade-up delay-100">A smaller wardrobe, made to a higher standard.</h1>
          <p className="mt-6 max-w-xl text-bone/70 leading-relaxed animate-fade-up delay-200">
            We started with a simple frustration: good men&apos;s basics were either overpriced or under-made. {SITE.name} exists to close that gap with three things — shirts, trousers and shoes — done properly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-bone-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/mens/about-2.jpg" alt="Menswear essentials" className="absolute inset-0 h-full w-full object-cover" />
        </Reveal>
        <Reveal delay={150} className="space-y-6">
          <p className="eyebrow text-brass">Our story</p>
          <h2 className="display text-4xl lg:text-5xl">Built in Lahore. Worn everywhere.</h2>
          <p className="text-ink-3 leading-relaxed">
            Our studio sits a few streets from the tailors who taught us the trade. Every season we develop a tight edit of pieces, sample them on real bodies, and only release what we would wear ourselves.
          </p>
          <p className="text-ink-3 leading-relaxed">
            We don&apos;t chase trends or drop fifty new styles a month. We make a shirt you reach for every week, a trouser that survives the commute and the dinner, and shoes that get better with polish.
          </p>
          <div className="brass-rule" />
          <dl className="grid grid-cols-3 gap-6">
            {[["3", "Core categories"], ["100%", "Quality-checked"], ["14d", "Easy returns"]].map(([v, l]) => (
              <div key={l}>
                <dt className="font-serif text-4xl">{v}</dt>
                <dd className="text-xs uppercase tracking-[0.2em] text-stone mt-1">{l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="bg-bone-2/60 border-y border-bone-3">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20 lg:py-24">
          <Reveal className="mb-12 text-center">
            <p className="eyebrow text-brass mb-3">What we stand for</p>
            <h2 className="display text-4xl lg:text-5xl">Three rules we never break</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 120} className="card p-8">
                <v.icon size={24} strokeWidth={1.5} className="text-brass mb-6" />
                <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
                <p className="text-sm text-ink-3 leading-relaxed">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20 lg:py-24">
        <Reveal className="mb-12">
          <p className="eyebrow text-brass mb-3">Shipping, returns & security</p>
          <h2 className="display text-4xl lg:text-5xl">Our promises to you</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-10">
          {PROMISES.map((p, i) => (
            <Reveal key={p.title} delay={i * 100} className="flex gap-5">
              <div className="h-12 w-12 shrink-0 border border-bone-3 flex items-center justify-center"><p.icon size={20} strokeWidth={1.5} className="text-brass" /></div>
              <div>
                <h3 className="font-medium mb-2">{p.title}</h3>
                <p className="text-sm text-ink-3 leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 lg:px-10 pb-8">
        <Reveal className="bg-ink text-bone p-10 lg:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <p className="eyebrow text-brass-2 mb-3">Need a hand with sizing?</p>
            <h2 className="display text-3xl lg:text-4xl">Talk to someone who&apos;s measured a thousand shoulders.</h2>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link href="/contact" className="btn-bone">Contact us</Link>
            <Link href="/shirts" className="btn-outline-bone">Shop the edit</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
