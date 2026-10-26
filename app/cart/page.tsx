"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Loader2, ShieldCheck, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { SITE, shippingFor } from "@/lib/site";
import { notifySessionChange } from "@/lib/use-session";
import { toast } from "@/component/ui/Toast";

interface CartItem {
  id: number;
  quantity: number;
  size: string | null;
  product: { id: string; name: string; price: number; stock: number; imageUrls: string[]; brands: string[]; categories: string[] };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [authed, setAuthed] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (item: CartItem, qty: number) => {
    if (qty < 1 || qty > 10) return;
    setBusy(item.id);
    const res = await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cartItemId: item.id, quantity: qty }) });
    if (res.ok) setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i)));
    else toast.error((await res.json()).error || "Could not update quantity");
    setBusy(null);
    notifySessionChange();
  };

  const remove = async (id: number) => {
    setBusy(id);
    await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setBusy(null);
    notifySessionChange();
  };

  const subtotal = items.reduce((a, i) => a + i.product.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const unavailable = items.filter((i) => i.product.stock < i.quantity);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-stone mb-6" />
        <h1 className="display text-4xl mb-3">Your bag</h1>
        <p className="text-sm text-stone mb-8">Sign in to see the items you&apos;ve saved and check out securely.</p>
        <Link href="/login?redirect=/cart" className="btn-ink w-full">Sign in</Link>
        <Link href="/signup" className="btn-ghost w-full justify-center mt-2">Create an account</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 lg:py-16">
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-bone-3">
        <div>
          <p className="eyebrow text-brass mb-3">Your bag</p>
          <h1 className="display text-4xl lg:text-5xl">{items.length} {items.length === 1 ? "item" : "items"}</h1>
        </div>
        <Link href="/shirts" className="btn-ghost link-underline hidden sm:inline-flex">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-stone mb-6" />
          <p className="font-serif text-2xl mb-2">Your bag is empty.</p>
          <p className="text-sm text-stone mb-8">Start with a shirt — everything else follows.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shirts" className="btn-ink">Shop shirts</Link>
            <Link href="/trousers" className="btn-outline">Shop trousers</Link>
            <Link href="/shoes" className="btn-outline">Shop shoes</Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <ul className="lg:col-span-8 divide-y divide-bone-3">
            {items.map((i) => {
              const short = i.product.stock < i.quantity;
              return (
                <li key={i.id} className={`py-7 flex gap-5 sm:gap-8 ${busy === i.id ? "opacity-60" : ""}`}>
                  <Link href={`/product/${i.product.id}`} className="w-24 sm:w-32 aspect-[3/4] bg-bone-2 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.product.imageUrls[0]} alt={i.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <p className="eyebrow text-[9px] text-stone mb-1">{i.product.brands[0] || i.product.categories[0]}</p>
                        <Link href={`/product/${i.product.id}`} className="font-medium hover:text-brass transition-colors leading-snug block truncate">{i.product.name}</Link>
                        {i.size && <p className="text-xs text-stone mt-1">Size {i.size}</p>}
                        {short && <p className="text-xs text-oxblood mt-1">Only {i.product.stock} available — reduce quantity.</p>}
                      </div>
                      <button aria-label="Remove" onClick={() => remove(i.id)} className="text-stone hover:text-oxblood transition-colors self-start"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center border border-bone-3">
                        <button aria-label="Decrease" onClick={() => updateQty(i, i.quantity - 1)} className="px-3 py-2 hover:bg-bone-2"><Minus size={12} /></button>
                        <span className="w-9 text-center text-sm">{i.quantity}</span>
                        <button aria-label="Increase" onClick={() => updateQty(i, i.quantity + 1)} className="px-3 py-2 hover:bg-bone-2" disabled={i.quantity >= Math.min(10, i.product.stock)}><Plus size={12} /></button>
                      </div>
                      <p className="font-medium">{formatPrice(i.product.price * i.quantity)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="lg:col-span-4">
            <div className="card p-7 lg:sticky lg:top-32 space-y-5">
              <p className="eyebrow text-[10px]">Summary</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                {shipping > 0 && <p className="text-xs text-stone">Add {formatPrice(SITE.freeShippingOver - subtotal)} more for free shipping.</p>}
              </div>
              <div className="divider" />
              <div className="flex justify-between items-end">
                <span className="eyebrow text-[10px]">Total</span>
                <span className="text-2xl">{formatPrice(subtotal + shipping)}</span>
              </div>
              <button onClick={() => router.push("/checkout")} disabled={unavailable.length > 0} className="btn-ink w-full">
                Checkout <ArrowRight size={14} />
              </button>
              {unavailable.length > 0 && <p className="text-xs text-oxblood text-center">Adjust quantities for out-of-stock items to continue.</p>}
              <ul className="text-[11px] text-stone space-y-2 pt-2">
                <li className="flex gap-2 items-center"><Truck size={14} className="text-brass" /> 3–5 working days delivery</li>
                <li className="flex gap-2 items-center"><ShieldCheck size={14} className="text-brass" /> Cash on delivery or bank transfer</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
