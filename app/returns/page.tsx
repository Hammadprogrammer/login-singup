import React from "react";
import { RotateCcw, CheckCircle2, XCircle, ArrowRight, Mail } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans">

      {/* ── HERO ── */}
      <div className="bg-[#1C1C1E]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-5">
            <span className="w-8 h-px bg-[#C9184A]" /> Hassle-Free
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-white leading-none mb-5" style={{fontStyle:'italic'}}>
            Re<span className="text-[#C9184A]">turns</span>
          </h1>
          <p className="text-[#9e9890] text-sm max-w-md font-medium leading-relaxed mb-8">
            We stand behind every stitch. Not happy? We make it right.
          </p>
          <div className="flex flex-wrap gap-3">
            {["✦ 7-Day Returns", "✦ Free Pickup (Karachi)", "✦ Full Refund or Exchange"].map(t => (
              <span key={t} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9184A] bg-white/5 border border-white/10 px-4 py-2 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* ── HOW TO RETURN ── */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#C9184A] flex items-center justify-center flex-shrink-0">
              <RotateCcw size={15} className="text-white" />
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black">How to Return</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Initiate", desc: "Email returns@brand.com with your order number within 7 days." },
              { step: "02", title: "Confirm", desc: "We review and send you authorization within 24 hours." },
              { step: "03", title: "Ship Back", desc: "Pack securely. Drop off or schedule free pickup (Karachi)." },
              { step: "04", title: "Refunded", desc: "Once received & inspected, refund/exchange in 3–5 days." },
            ].map((s, i) => (
              <div key={s.step} className={`rounded-[1.5rem] p-7 ${i % 2 === 0 ? "bg-white border border-[#E8D5C4]" : "bg-[#F2E8E0]"} hover:shadow-md transition-shadow`}>
                <p className="text-5xl font-black text-[#E8D5C4] leading-none mb-4">{s.step}</p>
                <h3 className="font-black uppercase tracking-wide mb-2 text-[#1C1C1E] text-sm">{s.title}</h3>
                <p className="text-[10px] text-[#7a716a] font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ELIGIBILITY ── */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1C1C1E] rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#C9184A] flex items-center justify-center">
                <CheckCircle2 size={15} className="text-white" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black">Eligible for Return</p>
            </div>
            <ul className="space-y-4">
              {[
                "Item received in damaged condition",
                "Wrong item delivered",
                "Stitching defect or quality issue",
                "Size mismatch (unworn, tags intact)",
                "Item not as described on website",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight size={12} className="mt-0.5 text-[#C9184A] flex-shrink-0" />
                  <span className="text-[#c8c0b8] font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#F2E8E0] rounded-[2rem] p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#1C1C1E] flex items-center justify-center">
                <XCircle size={15} className="text-white" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#1C1C1E] font-black">Not Eligible</p>
            </div>
            <ul className="space-y-4">
              {[
                "Items worn, washed, or altered",
                "Tags removed or missing",
                "Sale / discounted items",
                "Custom stitched orders",
                "Returns requested after 7 days",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight size={12} className="mt-0.5 text-[#1C1C1E]/40 flex-shrink-0" />
                  <span className="text-[#6b6560] font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── REFUND OPTIONS ── */}
        <section>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black mb-8">Refund Options</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { type: "Store Credit", time: "Instant", desc: "Full value as store credit — processed same day on your account.", highlight: true },
              { type: "Exchange", time: "3–5 Days", desc: "Replacement dispatched after receiving & inspecting the original.", highlight: false },
              { type: "Bank Refund", time: "5–7 Days", desc: "Refunded to original payment method. Bank processing times apply.", highlight: false },
            ].map((r) => (
              <div key={r.type} className={`rounded-[1.5rem] p-8 ${r.highlight ? "bg-[#C9184A] text-white" : "bg-white border border-[#E8D5C4]"}`}>
                <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${r.highlight ? "bg-white/20 text-white" : "bg-[#F2E8E0] text-[#C9184A]"}`}>{r.time}</span>
                <h3 className={`font-black uppercase tracking-wide text-lg mb-3 ${r.highlight ? "text-white" : "text-[#1C1C1E]"}`}>{r.type}</h3>
                <p className={`text-sm font-medium leading-relaxed ${r.highlight ? "text-white/80" : "text-[#9e9890]"}`}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="bg-[#1C1C1E] rounded-[2rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9184A] font-black mb-3">Start a Return</p>
            <h3 className="text-3xl font-black text-white">Ready to return?</h3>
            <p className="text-[#9e9890] font-medium mt-2 text-sm">Have your order number ready. We respond within 24 hours.</p>
          </div>
          <a href="mailto:returns@brand.com"
            className="inline-flex items-center gap-3 bg-[#C9184A] text-white font-black px-8 py-4 rounded-full uppercase tracking-widest text-xs hover:bg-[#a01238] transition-colors whitespace-nowrap flex-shrink-0">
            <Mail size={14} /> returns@brand.com
          </a>
        </div>

      </div>
    </div>
  );
}
