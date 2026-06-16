"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Store, ShoppingBag } from "lucide-react";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<"shop" | "sell">("shop");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputCls = "w-full p-3.5 bg-[#FAF7F2] rounded-xl font-medium border border-[#E8D5C4] focus:border-[#C9184A] outline-none transition-all text-sm text-[#1C1C1E]";
  const labelCls = "text-[9px] font-black uppercase tracking-[0.25em] text-[#C9184A] mb-1.5 block";

  const shopContacts = [
    { Icon: Mail, label: "Email", value: "support@brand.com", href: "mailto:support@brand.com" },
    { Icon: Phone, label: "Phone / WhatsApp", value: "+92 300 1234567", href: "tel:+923001234567" },
    { Icon: MapPin, label: "Address", value: "Block 7, Clifton, Karachi", href: null },
    { Icon: Clock, label: "Hours", value: "Mon – Sat: 10 AM – 7 PM (PKT)", href: null },
  ];
  const sellContacts = [
    { Icon: Mail, label: "Seller Email", value: "sellers@brand.com", href: "mailto:sellers@brand.com" },
    { Icon: Phone, label: "Seller Hotline", value: "+92 301 9876543", href: "tel:+923019876543" },
    { Icon: Clock, label: "Response Time", value: "Within 12 hours", href: null },
  ];
  const contacts = activeTab === "shop" ? shopContacts : sellContacts;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans">

      {/* ── HERO ── */}
      <div className="bg-[#1C1C1E]">
        <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#C9184A] font-black mb-5">
              <span className="w-8 h-px bg-[#C9184A]" /> We Are Here For You
            </span>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-none" style={{fontStyle:'italic'}}>
              Con<span className="text-[#C9184A]">tact</span>
            </h1>
            <p className="text-[#9e9890] text-sm mt-5 max-w-sm font-medium leading-relaxed">
              Whether you're a shopper or a seller — we're always available to help.
            </p>
          </div>
          {/* Tab switcher inside hero */}
          <div className="flex gap-3 md:justify-end">
            {(["shop", "sell"] as const).map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-[#C9184A] text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}>
                {tab === "shop" ? <ShoppingBag size={12} /> : <Store size={12} />}
                {tab === "shop" ? "Shop Support" : "Seller Support"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">

        {/* ── LEFT: CONTACT INFO ── */}
        <div className="space-y-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9184A] mb-1">
              {activeTab === "shop" ? "Customer Support" : "Seller Support"}
            </p>
            <h2 className="text-3xl font-black text-[#1C1C1E] leading-tight">
              {activeTab === "shop" ? "Shop\nEnquiries" : "Seller\nEnquiries"}
            </h2>
          </div>

          <div className="space-y-3">
            {contacts.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 bg-white border border-[#E8D5C4] rounded-2xl p-4 hover:border-[#C9184A]/40 hover:shadow-sm transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#F2E8E0] flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[#C9184A]" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9184A]/70 mb-0.5">{label}</p>
                  {href
                    ? <a href={href} className="font-bold text-[#1C1C1E] hover:text-[#C9184A] transition-colors text-sm">{value}</a>
                    : <p className="font-bold text-[#1C1C1E] text-sm">{value}</p>}
                </div>
              </div>
            ))}
          </div>

          {activeTab === "shop" ? (
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9184A] mb-3">Find Us On</p>
              <div className="flex gap-2">
                {[{ name: "Instagram", href: "#" }, { name: "Facebook", href: "#" }, { name: "WhatsApp", href: "https://wa.me/923001234567" }].map(s => (
                  <a key={s.name} href={s.href}
                    className="px-4 py-2 bg-white border border-[#E8D5C4] rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-[#C9184A] hover:text-white hover:border-[#C9184A] transition-all">
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9184A] mb-3">Quick Links</p>
              <div className="space-y-2">
                {[
                  { label: "Start Selling", href: "/sell_product" },
                  { label: "Add a Product", href: "/add-product" },
                  { label: "My Products", href: "/my-products" },
                  { label: "KYC Verification", href: "/kyc" },
                ].map(({ label, href }) => (
                  <a key={label} href={href}
                    className="flex items-center justify-between px-5 py-3 rounded-xl bg-white border border-[#E8D5C4] hover:border-[#C9184A]/50 hover:bg-[#F2E8E0] transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1C1C1E]">{label}</span>
                    <span className="text-[#C9184A] opacity-0 group-hover:opacity-100 transition-opacity font-black text-sm">→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: FORM ── */}
        <div>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center bg-[#1C1C1E] rounded-[2rem] p-12">
              <div className="w-14 h-14 bg-[#C9184A] rounded-full flex items-center justify-center mb-6">
                <Send size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{activeTab === "shop" ? "Message Sent!" : "Request Received!"}</h3>
              <p className="text-[#9e9890] font-medium text-sm mb-8">
                {activeTab === "shop" ? "We'll reply within 24 hours." : "Our seller team responds within 12 hours."}
              </p>
              <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="bg-[#C9184A] text-white font-black px-8 py-3 rounded-full text-[10px] uppercase tracking-widest hover:bg-[#a01238] transition-colors">
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-[#E8D5C4] rounded-[2rem] p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name</label>
                  <input required type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inputCls} placeholder="Ayesha Khan" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input required type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={inputCls} placeholder="you@email.com" />
                </div>
              </div>
              <div>
                <label className={labelCls}>{activeTab === "shop" ? "Subject" : "Issue Type"}</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inputCls}>
                  <option value="">Select...</option>
                  {activeTab === "shop" ? (
                    <>
                      <option>Order Status</option>
                      <option>Return / Refund</option>
                      <option>Product Question</option>
                      <option>Delivery Issue</option>
                      <option>Other</option>
                    </>
                  ) : (
                    <>
                      <option>KYC Verification</option>
                      <option>Product Listing Issue</option>
                      <option>Payout / Payment</option>
                      <option>Account Issue</option>
                      <option>Policy Question</option>
                      <option>Other</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className={labelCls}>Message</label>
                <textarea required rows={5} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder={activeTab === "shop" ? "Tell us how we can help..." : "Describe your issue..."} />
              </div>
              <button type="submit"
                className={`w-full text-white font-black py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 text-[10px] transition-colors ${
                  activeTab === "shop" ? "bg-[#1C1C1E] hover:bg-[#C9184A]" : "bg-[#C9184A] hover:bg-[#a01238]"
                }`}>
                <Send size={13} /> {activeTab === "shop" ? "Send Message" : "Send to Seller Support"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── MAP ── */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9184A] mb-5">Our Location</p>
        <div className="w-full h-64 rounded-[1.5rem] overflow-hidden border border-[#E8D5C4]">
          <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.2916985!2d67.0300!3d24.8138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQ4JzQ5LjciTiA2N8KwMDEnNDguMCJF!5e0!3m2!1sen!2spk!4v1234567890"
            allowFullScreen referrerPolicy="no-referrer-when-downgrade" title="Our Location" />
        </div>
      </div>
    </div>
  );
}
