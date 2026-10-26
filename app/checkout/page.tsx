"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Lock, CheckCircle2, Banknote, Landmark } from "lucide-react";
import { formatPrice, shortId } from "@/lib/format";
import { PAYMENT_METHODS, shippingFor, type PaymentMethod } from "@/lib/site";
import { notifySessionChange, useSession } from "@/lib/use-session";
import { toast } from "@/component/ui/Toast";

interface CartItem {
  id: number;
  quantity: number;
  size: string | null;
  product: { id: string; name: string; price: number; stock: number; imageUrls: string[] };
}

const PAYMENT_ICON = { cod: Banknote, bank_transfer: Landmark } as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; totalAmount: number; email: string } | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "", city: "", postalCode: "", country: "Pakistan", notes: "" });

  // One token per checkout session — the server de-duplicates on it.
  const idempotencyKey = useMemo(() => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : ""), []);

  useEffect(() => {
    fetch("/api/cart", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login?redirect=/checkout");
          return [];
        }
        return r.ok ? r.json() : [];
      })
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, fullName: f.fullName || user.name || "", email: f.email || user.email }));
  }, [user]);

  const subtotal = items.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) return setError("Your bag is empty.");
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paymentMethod: payment, idempotencyKey }),
      });
      if (res.status === 401) return router.replace("/login?redirect=/checkout");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order.");
        return;
      }
      setPlaced({ id: data.id, totalAmount: data.totalAmount, email: data.email });
      notifySessionChange();
      toast.success("Order placed — thank you!");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading || sessionLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>;
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center animate-fade-up">
        <CheckCircle2 size={48} strokeWidth={1} className="mx-auto text-success mb-6" />
        <p className="eyebrow text-brass mb-3">Order confirmed</p>
        <h1 className="display text-4xl lg:text-5xl mb-4">Thank you, {form.fullName.split(" ")[0]}.</h1>
        <p className="text-ink-3 leading-relaxed mb-2">
          Order <span className="font-mono text-ink">#{shortId(placed.id)}</span> for <strong>{formatPrice(placed.totalAmount)}</strong> has been placed.
        </p>
        <p className="text-sm text-stone mb-10">A confirmation has been sent to {placed.email}. {payment === "bank_transfer" ? "Bank details will follow by email." : "Please keep cash ready at delivery."}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/orders" className="btn-ink">View order history</Link>
          <Link href="/" className="btn-outline">Back to home</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <h1 className="display text-4xl mb-3">Your bag is empty</h1>
        <p className="text-sm text-stone mb-8">Add something you love before checking out.</p>
        <Link href="/shirts" className="btn-ink">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 lg:py-16">
      <Link href="/cart" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone hover:text-ink mb-8">
        <ChevronLeft size={14} /> Back to bag
      </Link>

      <form onSubmit={submit} className="grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-7 space-y-14">
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="font-serif text-3xl text-brass">01</span>
              <h2 className="display text-3xl">Delivery details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
              <div className="sm:col-span-2"><label className="label">Full name</label><input required minLength={2} maxLength={100} value={form.fullName} onChange={set("fullName")} className="field" placeholder="Your full name" autoComplete="name" /></div>
              <div><label className="label">Email</label><input required type="email" value={form.email} onChange={set("email")} className="field" placeholder="you@example.com" autoComplete="email" /></div>
              <div><label className="label">Phone</label><input required value={form.phone} onChange={set("phone")} className="field" placeholder="+92 3xx xxxxxxx" autoComplete="tel" inputMode="tel" /></div>
              <div className="sm:col-span-2"><label className="label">Street address</label><input required minLength={5} maxLength={250} value={form.address} onChange={set("address")} className="field" placeholder="House, street, area" autoComplete="street-address" /></div>
              <div><label className="label">City</label><input required maxLength={80} value={form.city} onChange={set("city")} className="field" placeholder="City" autoComplete="address-level2" /></div>
              <div><label className="label">Postal code <span className="text-stone normal-case tracking-normal">(optional)</span></label><input maxLength={20} value={form.postalCode} onChange={set("postalCode")} className="field" placeholder="Postal code" autoComplete="postal-code" /></div>
              <div className="sm:col-span-2"><label className="label">Country</label><input required maxLength={80} value={form.country} onChange={set("country")} className="field" autoComplete="country-name" /></div>
              <div className="sm:col-span-2"><label className="label">Order notes <span className="text-stone normal-case tracking-normal">(optional)</span></label><textarea maxLength={500} rows={2} value={form.notes} onChange={set("notes")} className="field resize-none" placeholder="Delivery instructions, gift message…" /></div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="font-serif text-3xl text-brass">02</span>
              <h2 className="display text-3xl">Payment</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {PAYMENT_METHODS.map((m) => {
                const Icon = PAYMENT_ICON[m.value];
                const active = payment === m.value;
                return (
                  <button type="button" key={m.value} onClick={() => setPayment(m.value)} className={`text-left p-5 border transition-all ${active ? "border-ink bg-white shadow-[0_12px_30px_-20px_rgba(0,0,0,0.4)]" : "border-bone-3 hover:border-ink/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={20} className={active ? "text-brass" : "text-stone"} />
                      <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${active ? "border-ink" : "border-bone-3"}`}>{active && <span className="h-2 w-2 rounded-full bg-ink" />}</span>
                    </div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-stone mt-1 leading-relaxed">{m.hint}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="card p-7 lg:p-9 lg:sticky lg:top-32">
            <p className="eyebrow text-[10px] mb-6">Order summary</p>
            <ul className="space-y-5 max-h-[360px] overflow-y-auto pr-2">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-bone-2 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.product.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">{i.product.name}</p>
                    <p className="text-xs text-stone mt-1">{i.size ? `Size ${i.size} · ` : ""}Qty {i.quantity}</p>
                  </div>
                  <p className="text-sm">{formatPrice(i.product.price * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="divider my-6" />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            </div>
            <div className="divider my-6" />
            <div className="flex justify-between items-end mb-6">
              <span className="eyebrow text-[10px]">Total</span>
              <span className="text-2xl">{formatPrice(total)}</span>
            </div>

            {error && <p className="text-sm text-oxblood bg-oxblood/5 border border-oxblood/20 px-4 py-3 mb-4">{error}</p>}

            <button type="submit" disabled={placing} className="btn-ink w-full">
              {placing ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
              {placing ? "Placing order…" : `Place order · ${formatPrice(total)}`}
            </button>
            <p className="text-[11px] text-stone text-center mt-4 leading-relaxed">Prices and stock are verified on our servers when you place the order. No card details are collected.</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
