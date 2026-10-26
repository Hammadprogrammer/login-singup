"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { SITE } from "@/lib/site";
import Reveal from "@/component/ui/Reveal";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Could not send your message.");
      setDone(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-20">
      <Reveal className="mb-14 max-w-2xl">
        <p className="eyebrow text-brass mb-3">Contact</p>
        <h1 className="display text-5xl lg:text-6xl mb-5">We&apos;d love to hear from you.</h1>
        <p className="text-ink-3 leading-relaxed">Questions about fit, an order, or a bulk request for your team? Send a note and we&apos;ll reply within one business day.</p>
      </Reveal>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <Reveal className="lg:col-span-4 space-y-8">
          {[
            { icon: Mail, label: "Email", value: SITE.supportEmail, href: `mailto:${SITE.supportEmail}` },
            { icon: Phone, label: "Phone / WhatsApp", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
            { icon: MapPin, label: "Studio", value: SITE.address },
            { icon: Clock, label: "Hours", value: "Mon–Sat · 10:00–20:00" },
          ].map((c) => (
            <div key={c.label} className="flex gap-4">
              <div className="h-11 w-11 shrink-0 border border-bone-3 flex items-center justify-center"><c.icon size={18} strokeWidth={1.5} className="text-brass" /></div>
              <div>
                <p className="eyebrow text-[10px] text-stone mb-1">{c.label}</p>
                {c.href ? <a href={c.href} className="text-sm hover:text-brass transition-colors">{c.value}</a> : <p className="text-sm">{c.value}</p>}
              </div>
            </div>
          ))}
          <div className="relative aspect-[4/3] overflow-hidden bg-bone-2 mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mens/about-1.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-8">
          {done ? (
            <div className="card p-12 text-center animate-fade-up">
              <CheckCircle2 size={44} strokeWidth={1} className="mx-auto text-success mb-5" />
              <h2 className="display text-3xl mb-2">Message sent</h2>
              <p className="text-sm text-stone">{done}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="card p-7 lg:p-10 space-y-6">
              {/* Honeypot — hidden from humans, filled by bots */}
              <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden>
                <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div><label className="label">Name</label><input required minLength={2} maxLength={100} value={form.name} onChange={set("name")} className="field" placeholder="Your name" autoComplete="name" /></div>
                <div><label className="label">Email</label><input required type="email" value={form.email} onChange={set("email")} className="field" placeholder="you@example.com" autoComplete="email" /></div>
              </div>
              <div><label className="label">Subject <span className="text-stone normal-case tracking-normal">(optional)</span></label><input maxLength={120} value={form.subject} onChange={set("subject")} className="field" placeholder="Sizing help, order question…" /></div>
              <div><label className="label">Message</label><textarea required minLength={10} maxLength={3000} rows={6} value={form.message} onChange={set("message")} className="field resize-none" placeholder="How can we help?" /></div>
              {error && <p className="text-sm text-oxblood">{error}</p>}
              <button type="submit" disabled={sending} className="btn-ink">
                {sending && <Loader2 size={14} className="animate-spin" />} Send message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
