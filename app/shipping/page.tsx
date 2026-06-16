import React from "react";
import { Truck, Clock, Globe, Package, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans">

      {/* ── HERO ── */}
      <div className="bg-[#1C1C1E]">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-5">
              <span className="w-8 h-px bg-[#C9184A]" /> Delivery Information
            </span>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-none" style={{fontStyle:'italic'}}>
              Ship<span className="text-[#C9184A]">ping</span>
            </h1>
            <p className="text-[#9e9890] text-sm mt-5 max-w-sm font-medium leading-relaxed">
              Fast, reliable delivery — from our hands to your door.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {[
              { label: "Nationwide", value: "2–5 Days" },
              { label: "Express", value: "1–2 Days" },
              { label: "International", value: "7–14 Days" },
              { label: "Free Above", value: "PKR 3K" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-2xl font-black text-[#C9184A] leading-none">{s.value}</p>
                <p className="text-[9px] text-white/50 uppercase tracking-[0.2em] font-bold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* ── DOMESTIC ── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#C9184A] flex items-center justify-center flex-shrink-0">
              <Truck size={16} className="text-white" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black">Domestic Shipping</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { title: "Standard Delivery", desc: "2–5 business days", price: "PKR 200", note: "Free on orders above PKR 3,000" },
              { title: "Express Delivery", desc: "1–2 business days", price: "PKR 450", note: "Karachi, Lahore & Islamabad only" },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-[#E8D5C4] rounded-[1.5rem] p-8 hover:border-[#C9184A]/40 hover:shadow-md transition-all group">
                <h3 className="text-lg font-black uppercase tracking-wide mb-2 text-[#1C1C1E]">{item.title}</h3>
                <p className="text-[#9e9890] font-medium mb-6 text-sm">{item.desc}</p>
                <p className="text-4xl font-black text-[#C9184A] mb-2 leading-none">{item.price}</p>
                <p className="text-[10px] text-[#C9184A]/70 font-black uppercase tracking-wider">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROCESSING STEPS ── */}
        <section className="bg-[#F2E8E0] rounded-[2rem] p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#C9184A] flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-white" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black">Processing Timeline</p>
          </div>
          <div className="flex flex-col md:flex-row gap-0">
            {[
              { step: "01", label: "Order Placed", desc: "We receive and verify your order within 2 hours." },
              { step: "02", label: "Packed", desc: "Orders are carefully packed within 1–2 business days." },
              { step: "03", label: "Delivered", desc: "Courier picks up and delivers to your doorstep." },
            ].map((s, i) => (
              <div key={s.step} className="flex-1 flex flex-col md:flex-row items-start gap-0">
                <div className="flex-1 p-6">
                  <p className="text-5xl font-black text-[#E8D5C4] leading-none mb-4">{s.step}</p>
                  <h3 className="font-black uppercase tracking-wide text-[#1C1C1E] mb-2 text-sm">{s.label}</h3>
                  <p className="text-[#7a716a] text-xs font-medium leading-relaxed">{s.desc}</p>
                </div>
                {i < 2 && <div className="hidden md:flex items-center self-center text-[#C9184A] text-2xl font-black px-2">→</div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERNATIONAL TABLE ── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#C9184A] flex items-center justify-center flex-shrink-0">
              <Globe size={16} className="text-white" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black">International Shipping</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-[2rem] overflow-hidden">
            <div className="grid grid-cols-3 px-7 py-4 border-b border-white/10">
              {["Region", "Delivery Time", "Cost"].map(h => (
                <p key={h} className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">{h}</p>
              ))}
            </div>
            {[
              ["Middle East (UAE, KSA)", "5–8 days", "PKR 2,500"],
              ["United Kingdom", "7–12 days", "PKR 4,000"],
              ["United States & Canada", "10–14 days", "PKR 5,000"],
              ["Europe", "10–14 days", "PKR 4,500"],
              ["Australia & NZ", "12–16 days", "PKR 5,500"],
            ].map(([region, time, cost], i) => (
              <div key={i} className="grid grid-cols-3 px-7 py-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                <p className="font-bold text-white text-sm">{region}</p>
                <p className="text-white/50 font-medium text-sm">{time}</p>
                <p className="font-black text-[#C9184A] text-sm">{cost}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRACKING ── */}
        <section className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-[#E8D5C4] rounded-[1.5rem] p-8">
            <div className="w-10 h-10 rounded-xl bg-[#F2E8E0] flex items-center justify-center mb-5">
              <CheckCircle size={20} className="text-[#C9184A]" />
            </div>
            <h3 className="font-black uppercase tracking-wide mb-3 text-[#1C1C1E]">Email Tracking</h3>
            <p className="text-[#9e9890] font-medium text-sm leading-relaxed">
              You will receive an email with a tracking number once your order is dispatched. Track in real time using the link.
            </p>
          </div>
          <div className="bg-[#C9184A] rounded-[1.5rem] p-8 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-5">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-wide mb-3 text-white">Need Help?</h3>
              <p className="text-white/80 font-medium text-sm leading-relaxed mb-6">
                Missing package or delay beyond estimate? Contact our support team right away.
              </p>
              <a href="/contact" className="inline-flex items-center gap-2 bg-white text-[#C9184A] text-xs font-black px-6 py-3 rounded-full uppercase tracking-widest hover:bg-[#FAF7F2] transition-colors">
                Contact Us <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
