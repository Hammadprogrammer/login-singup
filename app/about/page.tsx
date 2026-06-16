import React from "react";
import { Heart, Star, Users, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans">

      {/* ── HERO ── split layout */}
      <div className="bg-[#1C1C1E] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-0 grid md:grid-cols-2 min-h-[520px]">
          {/* left text */}
          <div className="flex flex-col justify-center py-20 pr-10">
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-6">
              <span className="w-8 h-px bg-[#C9184A]" /> Est. 2020 · Karachi, Pakistan
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6" style={{fontStyle:'italic'}}>
              Clothing<br /><span className="text-[#C9184A]">Brand</span>
            </h1>
            <p className="text-[#a0998e] text-sm leading-relaxed max-w-sm font-medium">
              Timeless silhouettes. Modern craftsmanship. Built for women who carry tradition forward.
            </p>
          </div>
          {/* right image */}
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1558171813-4882838d9d4a?w=900&q=80"
              alt="Brand"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#1C1C1E]/80" />
          </div>
        </div>
      </div>

      {/* ── STATS TICKER ── */}
      <div className="bg-[#C9184A]">
        <div className="max-w-5xl mx-auto px-6 py-7 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          {[
            { label: "Happy Customers", value: "25K+" },
            { label: "Products Listed", value: "1,200+" },
            { label: "Active Sellers", value: "400+" },
            { label: "Cities Served", value: "50+" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-4">
              {i > 0 && <span className="hidden md:block w-px h-8 bg-white/30" />}
              <div>
                <p className="text-3xl font-black text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-white/70 uppercase tracking-[0.2em] font-bold mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STORY ── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3 space-y-5">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black">Our Story</p>
            <h2 className="text-5xl font-black text-[#1C1C1E] leading-tight">Where It<br />All Began</h2>
            <div className="w-12 h-1 bg-[#C9184A] rounded-full" />
            <p className="text-[#6b6560] font-medium leading-relaxed text-sm">
              Clothing Brand started with one belief: every woman deserves to wear something extraordinary. Born in Karachi with three designers and a small studio, we fused South Asian heritage with modern silhouettes.
            </p>
            <p className="text-[#6b6560] font-medium leading-relaxed text-sm">
              Today we are a full marketplace — empowering independent designers and artisans across Pakistan to sell, grow, and reach customers nationwide and globally.
            </p>
          </div>
          <div className="md:col-span-2 relative">
            <div className="rounded-[2rem] overflow-hidden aspect-[3/4]">
              <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80" alt="Story" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -right-4 bg-[#C9184A] text-white rounded-2xl px-5 py-4 shadow-xl">
              <p className="text-2xl font-black leading-none">5+</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Yrs of Craft</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSION / VISION ── alternating cards */}
      <div className="bg-[#F2E8E0]">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
          <div className="bg-[#1C1C1E] rounded-[2rem] p-10 flex flex-col gap-5">
            <div className="w-10 h-10 rounded-xl bg-[#C9184A] flex items-center justify-center">
              <Heart size={18} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wide">Our Mission</h3>
            <p className="text-[#9e9890] text-sm font-medium leading-relaxed">
              Celebrate the modern Pakistani woman — clothing that honours her roots while embracing her ambitions, offering quality, accessibility, and beauty in equal measure.
            </p>
          </div>
          <div className="bg-white rounded-[2rem] p-10 flex flex-col gap-5 border border-[#E8D5C4]">
            <div className="w-10 h-10 rounded-xl bg-[#C9184A] flex items-center justify-center">
              <Star size={18} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-[#1C1C1E] uppercase tracking-wide">Our Vision</h3>
            <p className="text-[#7a716a] text-sm font-medium leading-relaxed">
              Pakistan's most trusted fashion marketplace — where buyers find curated quality pieces, and independent sellers build sustainable businesses.
            </p>
          </div>
        </div>
      </div>

      {/* ── TWO WORLDS ── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-3">What We Offer</p>
          <h2 className="text-5xl font-black text-[#1C1C1E] leading-tight">Two Worlds,<br />One Platform</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              label: "SHOP",
              desc: "Browse ready-to-wear, couture, unstitched & accessories from hundreds of verified brands.",
              href: "/",
              img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=80",
              Icon: ShoppingBag,
            },
            {
              label: "SELL",
              desc: "Join 400+ sellers. List creations, reach thousands of customers, grow your fashion business.",
              href: "/sell_product",
              img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=900&q=80",
              Icon: Users,
            },
          ].map((item) => (
            <div key={item.label} className="group relative rounded-[2rem] overflow-hidden h-80 cursor-pointer">
              <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <item.Icon size={16} className="text-[#C9184A]" />
                  <span className="text-[10px] text-[#C9184A] font-black uppercase tracking-[0.3em]">{item.label}</span>
                </div>
                <p className="text-white/80 text-sm font-medium leading-snug max-w-xs">{item.desc}</p>
                <Link href={item.href} className="mt-2 inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                  Explore <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VALUES ── numbered list style */}
      <div className="bg-[#1C1C1E]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-3">What Drives Us</p>
          <h2 className="text-4xl font-black text-white mb-14">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { num: "01", title: "Quality First", desc: "Every product goes through a quality check. We work only with fabrics and artisans that meet our standards." },
              { num: "02", title: "Community Driven", desc: "From small-town tailors to professional designers — we uplift every talent and give them a national platform." },
              { num: "03", title: "Full Transparency", desc: "Honest pricing, clear policies, zero hidden fees. What you see is what you get — for buyers and sellers alike." },
            ].map((v) => (
              <div key={v.num} className="border border-white/10 rounded-[1.5rem] p-8 hover:border-[#C9184A]/50 hover:bg-white/5 transition-all group">
                <p className="text-5xl font-black text-white/10 group-hover:text-[#C9184A]/30 transition-colors mb-6 leading-none">{v.num}</p>
                <h3 className="text-white font-black uppercase tracking-wide mb-3 text-sm">{v.title}</h3>
                <p className="text-[#9e9890] text-xs font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-2">The People Behind It</p>
            <h2 className="text-4xl font-black text-[#1C1C1E]">Our Team</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { name: "Zara Ali", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80" },
            { name: "Hamza Sheikh", role: "Head of Tech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
            { name: "Sana Mirza", role: "Creative Director", img: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&q=80" },
            { name: "Usman Raza", role: "Operations Lead", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
          ].map((m, i) => (
            <div key={m.name} className="group">
              <div className={`overflow-hidden mb-4 ${i % 2 === 0 ? "rounded-[2rem]" : "rounded-[0.75rem]"} aspect-square`}>
                <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="font-black text-[#1C1C1E] text-sm uppercase tracking-wide">{m.name}</p>
              <p className="text-[10px] text-[#C9184A] font-black uppercase tracking-[0.2em] mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-[#C9184A]">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-white/60" />
              <p className="text-[10px] tracking-[0.35em] uppercase text-white/70 font-black">Be Part of It</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Join Our<br />World</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="bg-white text-[#C9184A] font-black px-8 py-4 rounded-full uppercase tracking-widest text-xs hover:bg-[#FAF7F2] transition-colors whitespace-nowrap">
              Explore Collections
            </Link>
            <Link href="/sell_product" className="bg-[#1C1C1E] text-white font-black px-8 py-4 rounded-full uppercase tracking-widest text-xs hover:bg-black transition-colors whitespace-nowrap">
              Start Selling
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
