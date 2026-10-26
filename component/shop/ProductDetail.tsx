"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Loader2, Truck, RotateCcw, ShieldCheck, Minus, Plus, Star, ChevronDown } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { COLORS, SITE } from "@/lib/site";
import { notifySessionChange } from "@/lib/use-session";
import { toast } from "@/component/ui/Toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrls: string[];
  categories: string[];
  subCategories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  user: { name: string | null };
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-bone-3">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-4 text-left">
        <span className="eyebrow text-[10px]">{title}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-500 ${open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden text-sm text-ink-3 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function ProductDetail({ product, sizeLabel, reviews }: { product: Product; sizeLabel: string; reviews: Review[] }) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string>(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("details");

  const soldOut = product.stock <= 0;
  const maxQty = Math.min(10, Math.max(1, product.stock));

  useEffect(() => {
    // Best-effort view tracking (powers admin analytics).
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "view", productId: product.id }) }).catch(() => {});
  }, [product.id]);

  const addToBag = async (goToCheckout = false) => {
    if (product.sizes.length > 0 && !size) {
      toast.error(`Please select a ${sizeLabel.toLowerCase()}`);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, size, quantity: qty }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=/product/${product.id}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not add to bag");
        return;
      }
      notifySessionChange();
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      if (goToCheckout) router.push("/checkout");
      else toast.success(`${product.name} added to your bag`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <Accordion title={title} open={openSection === id} onToggle={() => setOpenSection(openSection === id ? null : id)}>
      {children}
    </Accordion>
  );

  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
      {/* Gallery */}
      <div className="lg:col-span-7">
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar md:w-20">
            {product.imageUrls.map((u, i) => (
              <button key={u} onClick={() => setActive(i)} className={`relative aspect-[3/4] w-16 md:w-full shrink-0 overflow-hidden transition-all ${active === i ? "ring-1 ring-ink ring-offset-2 ring-offset-bone" : "opacity-60 hover:opacity-100"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-bone-2">
            {product.imageUrls.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={u} alt={product.name} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${active === i ? "opacity-100" : "opacity-0"}`} />
            ))}
            {soldOut && <span className="absolute top-4 left-4 bg-ink text-bone eyebrow text-[10px] px-3 py-1.5">Sold out</span>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="lg:col-span-5 lg:sticky lg:top-32 self-start space-y-8">
        <div>
          <p className="eyebrow text-brass mb-3">{product.brands[0] || product.subCategories[0] || product.categories[0]}</p>
          <h1 className="display text-4xl lg:text-5xl mb-4">{product.name}</h1>
          <div className="flex items-center gap-4">
            <p className="text-xl">{formatPrice(product.price)}</p>
            {reviews.length > 0 && (
              <a href="#reviews" className="flex items-center gap-1.5 text-xs text-stone hover:text-ink">
                <Star size={14} className="text-brass" fill="currentColor" /> {avg.toFixed(1)} ({reviews.length})
              </a>
            )}
          </div>
        </div>

        {product.colors.length > 0 && (
          <div>
            <p className="eyebrow text-[10px] text-stone mb-3">Colour</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const hex = COLORS.find((x) => x.name === c)?.hex;
                return (
                  <span key={c} className="flex items-center gap-2 text-xs border border-bone-3 px-3 py-1.5">
                    <span className="h-3 w-3 rounded-full border border-ink/10" style={{ background: hex || "#999" }} />
                    {c}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {product.sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow text-[10px] text-stone">{sizeLabel}</p>
              <span className="text-xs text-stone">{size ? `Selected: ${size}` : "Select one"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  disabled={soldOut}
                  onClick={() => setSize(s)}
                  className={`min-w-[52px] px-4 py-3 text-sm border transition-all ${size === s ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"} disabled:opacity-40`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-stretch gap-3">
          <div className="flex items-center border border-bone-3">
            <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3 hover:bg-bone-2 disabled:opacity-40" disabled={soldOut}><Minus size={14} /></button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button aria-label="Increase" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="px-3 py-3 hover:bg-bone-2 disabled:opacity-40" disabled={soldOut || qty >= maxQty}><Plus size={14} /></button>
          </div>
          <button onClick={() => addToBag(false)} disabled={adding || soldOut} className="btn-ink flex-1">
            {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            {soldOut ? "Sold out" : added ? "Added" : "Add to bag"}
          </button>
        </div>
        {!soldOut && (
          <button onClick={() => addToBag(true)} disabled={adding} className="btn-outline w-full -mt-4">Buy now</button>
        )}
        {!soldOut && product.stock <= 5 && <p className="text-xs text-oxblood -mt-4">Only {product.stock} left in stock.</p>}

        <div>
          <Section id="details" title="Details">
            <p className="whitespace-pre-line">{product.description || "Thoughtfully constructed from premium materials with a clean, modern fit."}</p>
          </Section>
          <Section id="shipping" title="Shipping & returns">
            <ul className="space-y-2">
              <li className="flex gap-3"><Truck size={16} className="text-brass shrink-0" /> Free shipping on orders over {formatPrice(SITE.freeShippingOver)}. Delivered in 3–5 working days.</li>
              <li className="flex gap-3"><RotateCcw size={16} className="text-brass shrink-0" /> 14-day returns on unworn items with tags attached.</li>
              <li className="flex gap-3"><ShieldCheck size={16} className="text-brass shrink-0" /> Cash on delivery or bank transfer — no card details stored.</li>
            </ul>
          </Section>
          <Section id="care" title="Fabric & care">
            <p>Wash cold with similar colours, hang to dry, warm iron if needed. Leather goods: wipe clean, condition monthly, store with shoe trees.</p>
          </Section>
        </div>

        <div id="reviews" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow text-[10px]">Reviews ({reviews.length})</p>
            <Link href={`/reviews?productId=${product.id}`} className="text-xs link-underline">Write a review</Link>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-stone">No reviews yet for this piece.</p>
          ) : (
            <ul className="space-y-5">
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id} className="border-b border-bone-3 pb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex text-brass">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />)}</div>
                    <span className="text-[11px] text-stone">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium">{r.title}</p>}
                  <p className="text-sm text-ink-3 leading-relaxed">{r.comment}</p>
                  <p className="text-[11px] text-stone mt-2">{r.user.name || "Verified customer"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
