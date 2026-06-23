"use client";

import Link from "next/link";
import { Truck, ShieldCheck, Gem, Headset, ArrowRight } from "lucide-react";
import Reveal, { StaggerGroup, StaggerItem } from "@/sharecomponent/anim/Reveal";

const categories = [
  { title: "Ready To Wear", sub: "Everyday & Occasion", href: "/ready-to-wear", img: "/aaa.webp" },
  { title: "Couture", sub: "Bridal & Evening", href: "/couture", img: "/aaa.webp" },
  { title: "Unstitched", sub: "Premium Fabrics", href: "/unstitched", img: "/aaa.webp" },
];

const promises = [
  { Icon: Truck, title: "Complimentary Shipping", text: "On all orders, delivered with care." },
  { Icon: ShieldCheck, title: "Secure Payments", text: "Encrypted & protected checkout." },
  { Icon: Gem, title: "Artisan Crafted", text: "Hand-finished, premium materials." },
  { Icon: Headset, title: "Concierge Support", text: "Personal styling, anytime." },
];

export default function HomeSections() {
  return (
    <div className="bg-white text-[#2b1d24]">
      {/* CATEGORIES */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-10 py-24">
        <Reveal className="text-center mb-14">
          <p className="eyebrow mb-4">Explore</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-5">Shop By Category</h2>
          <div className="divider-gold mx-auto" />
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <StaggerItem key={cat.title}>
              <Link href={cat.href} className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-[rgba(224,122,154,0.2)]">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2b1d24]/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-center text-white">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-[#f7c5d6] font-semibold mb-2">{cat.sub}</p>
                  <h3 className="font-serif text-2xl md:text-3xl mb-4">{cat.title}</h3>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    Discover <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="relative py-28 overflow-hidden border-y border-[rgba(224,122,154,0.22)] bg-[#fff7fa]">
        <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_30%_50%,rgba(247,197,214,0.4),transparent_55%)]" />
        <Reveal className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="eyebrow mb-5">The Maison Philosophy</p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-7">
            Where <span className="italic text-gold-grad">Heritage</span> Meets the Modern Silhouette
          </h2>
          <p className="text-[#8a7682] leading-relaxed mb-10 max-w-xl mx-auto">
            Every piece is a quiet statement — designed in-house, crafted by master artisans, and made to be
            treasured season after season.
          </p>
          <Link href="/about" className="btn-outline">Our Story</Link>
        </Reveal>
      </section>

      {/* PROMISES */}
      <section className="max-w-[1600px] mx-auto px-4 md:px-10 py-24">
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {promises.map(({ Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="text-center px-2">
                <div className="mx-auto mb-5 w-14 h-14 flex items-center justify-center rounded-full border border-[rgba(224,122,154,0.35)] text-[#c75d80] anim-float">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <h4 className="text-[12px] uppercase tracking-[0.18em] font-semibold mb-2">{title}</h4>
                <p className="text-[13px] text-[#8a7682] leading-relaxed">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}
