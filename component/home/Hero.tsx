"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";

const SLIDES = [
  { eyebrow: "Autumn / Winter", title: "Dress with intent.", copy: "Tailored shirts, sharp trousers and leather shoes — built for the man who notices the details." , cta: { label: "Shop shirts", href: "/shirts" } },
  { eyebrow: "The Tailoring Edit", title: "Cut close. Worn easy.", copy: "Structured shoulders, clean lines and fabrics that hold their shape through long days.", cta: { label: "Shop trousers", href: "/trousers" } },
  { eyebrow: "Footwear", title: "Finish the look.", copy: "Hand-finished oxfords, loafers and boots in full-grain leather.", cta: { label: "Shop shoes", href: "/shoes" } },
];

export default function Hero({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  const slides = SLIDES.map((s, idx) => ({ ...s, image: images.length ? images[idx % images.length] : null }));

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden bg-ink text-bone">
      {slides.map((s, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-[1400ms] ${idx === i ? "opacity-100" : "opacity-0"}`} aria-hidden={idx !== i}>
          {s.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.image} alt="" className={`h-full w-full object-cover object-top ${idx === i ? "animate-ken-burns" : ""}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        </div>
      ))}

      <div className="relative z-10 h-full mx-auto max-w-[1440px] px-6 lg:px-10 flex flex-col justify-end pb-20 lg:pb-28">
        <div key={i} className="max-w-2xl space-y-6">
          <p className="eyebrow text-brass-2 animate-fade-up">{slides[i].eyebrow}</p>
          <h1 className="display text-5xl sm:text-6xl lg:text-8xl animate-fade-up delay-100">{slides[i].title}</h1>
          <p className="text-bone/75 text-base lg:text-lg max-w-lg leading-relaxed animate-fade-up delay-200">{slides[i].copy}</p>
          <div className="flex flex-wrap gap-3 pt-2 animate-fade-up delay-300">
            <Link href={slides[i].cta.href} className="btn-bone">{slides[i].cta.label}</Link>
            <Link href="/about" className="btn-outline-bone">Our story</Link>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button key={idx} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} className="group py-2">
                <span className={`block h-px transition-all duration-500 ${idx === i ? "w-12 bg-brass-2" : "w-6 bg-bone/40 group-hover:bg-bone/70"}`} />
              </button>
            ))}
          </div>
          <p className="eyebrow text-[9px] text-bone/50">{String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</p>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 lg:right-10 z-10 hidden md:block">
        <p className="font-serif italic text-bone/60 text-sm">{SITE.tagline}</p>
      </div>
    </section>
  );
}
