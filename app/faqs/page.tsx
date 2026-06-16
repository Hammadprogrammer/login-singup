"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqData = [
  {
    category: "Orders & Payments",
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our collections, select your item, choose size and add to cart. Checkout using your preferred payment method — card, bank transfer, or cash on delivery.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major debit/credit cards (Visa, Mastercard), bank transfers, JazzCash, EasyPaisa, and Cash on Delivery (COD) within Pakistan.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 2 hours of placement. After that, we begin processing and changes may not be possible. Please contact support immediately.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All transactions are encrypted via SSL. We do not store your card details on our servers.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "How long does delivery take?",
        a: "Domestic orders: 2–5 business days. Express (Karachi/Lahore/Islamabad): 1–2 days. International: 7–14 days depending on location.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! Orders above PKR 3,000 qualify for free standard domestic shipping.",
      },
      {
        q: "How do I track my order?",
        a: "Once dispatched, you will receive an email with your tracking number and a link to monitor your delivery in real-time.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes. We ship to UAE, KSA, UK, USA, Canada, Europe, and Australia. International shipping costs vary by region.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return window from the date of delivery for eligible items. Items must be unworn, unwashed, with tags intact.",
      },
      {
        q: "How do I start a return?",
        a: "Email returns@brand.com with your order number and reason. Our team will respond within 24 hours with instructions.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Absolutely. Size exchanges are handled free of charge, subject to stock availability. Initiate via email within 7 days.",
      },
      {
        q: "When will I get my refund?",
        a: "Store credit: instant. Exchanges: 3–5 days. Bank refunds: 5–7 business days after we receive and inspect the returned item.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      {
        q: "How do I find the right size?",
        a: "Each product page includes a detailed size guide with measurements in inches and cm. We recommend measuring yourself before ordering.",
      },
      {
        q: "Are your products stitched or unstitched?",
        a: "We offer both! Ready-to-wear items are fully stitched. Our Unstitched collection comes as fabric with suggested patterns.",
      },
      {
        q: "Do you offer custom stitching?",
        a: "Yes, for Couture and selected lines. Please contact us via the Contact page to discuss custom orders. Lead time is 3–6 weeks.",
      },
      {
        q: "Are product colors accurate on screen?",
        a: "We do our best to capture true colors. Minor variations may exist due to screen calibration differences. If unsure, contact us for fabric swatches.",
      },
    ],
  },
  {
    category: "Seller (SELL Section)",
    questions: [
      {
        q: "Who can sell on this platform?",
        a: "Any individual or business based in Pakistan can register as a seller. You must complete KYC verification before listing products.",
      },
      {
        q: "What is KYC and why is it required?",
        a: "KYC (Know Your Customer) is identity verification using your CNIC. It is required to maintain a safe and trusted marketplace for all buyers.",
      },
      {
        q: "How do I list a product for sale?",
        a: "After KYC approval, go to the SELL section, click 'Add Product', fill in the details, upload photos, and publish. Products go live after a quick review.",
      },
      {
        q: "When will I receive my payment for a sale?",
        a: "Seller payouts are processed every 7 days for completed orders. Funds are transferred to your registered bank account.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#E8D5C4] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start justify-between gap-4 py-5 group"
      >
        <span className={`font-black text-sm uppercase tracking-wide transition-colors ${
          open ? "text-[#C9184A]" : "text-[#1C1C1E] group-hover:text-[#C9184A]"
        }`}>
          {q}
        </span>
        <span className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
          open ? "bg-[#C9184A]" : "bg-[#F2E8E0]"
        }`}>
          {open
            ? <ChevronUp size={11} className="text-white" />
            : <ChevronDown size={11} className="text-[#C9184A]" />}
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-[#7a716a] font-medium text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState("Orders & Payments");

  const active = faqData.find((f) => f.category === activeCategory)!;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans">

      {/* ── HERO ── */}
      <div className="bg-[#1C1C1E]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-5">
            <span className="w-8 h-px bg-[#C9184A]" /> Help Center
          </span>
          <h1 className="text-6xl md:text-7xl font-black text-white leading-none" style={{fontStyle:'italic'}}>
            FA<span className="text-[#C9184A]">Qs</span>
          </h1>
          <p className="text-[#9e9890] text-sm mt-5 max-w-md font-medium leading-relaxed">
            Everything you need to know about shopping and selling with us.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-10">

          {/* ── SIDEBAR ── */}
          <aside className="md:w-56 flex-shrink-0">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9184A] mb-4">Categories</p>
            <nav className="space-y-1">
              {faqData.map((f) => (
                <button
                  key={f.category}
                  onClick={() => setActiveCategory(f.category)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                    activeCategory === f.category
                      ? "bg-[#C9184A] text-white"
                      : "text-[#7a716a] hover:bg-[#F2E8E0] hover:text-[#1C1C1E]"
                  }`}
                >
                  {f.category}
                </button>
              ))}
            </nav>

            <div className="mt-8 bg-[#1C1C1E] rounded-[1.5rem] p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9184A] mb-1">Still stuck?</p>
              <p className="text-sm font-bold text-white mb-4">Our team is here.</p>
              <a
                href="/contact"
                className="block text-center bg-[#C9184A] text-white text-[9px] font-black px-5 py-3 rounded-full uppercase tracking-widest hover:bg-[#a01238] transition-colors"
              >
                Contact Us
              </a>
            </div>
          </aside>

          {/* ── FAQ PANEL ── */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest text-[#1C1C1E]">{active.category}</h2>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C9184A] bg-[#F2E8E0] px-3 py-1.5 rounded-full">{active.questions.length} questions</span>
            </div>
            <div className="bg-white border border-[#E8D5C4] rounded-[1.5rem] px-8 shadow-sm">
              {active.questions.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
