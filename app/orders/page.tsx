"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Loader2, ChevronDown, MapPin, CreditCard, XCircle } from "lucide-react";
import { formatPrice, formatDate, shortId } from "@/lib/format";
import { normalizeOrderStatus, paymentLabel, type OrderStatusValue } from "@/lib/site";
import { toast } from "@/component/ui/Toast";
import StatusBadge from "@/component/ui/StatusBadge";

interface OrderItem { id: number; productId: string | null; name: string; price: number; quantity: number; size: string | null; imageUrl: string | null }
interface Order {
  id: string; status: string; paymentMethod: string; totalAmount: number; fullName: string; email: string; phone: string | null;
  address: string; city: string; postalCode: string | null; country: string; notes: string | null; createdAt: string; items: OrderItem[];
}

const STEPS: OrderStatusValue[] = ["PENDING", "PROCESSING", "COMPLETED"];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login?redirect=/orders");
          return [];
        }
        return r.ok ? r.json() : [];
      })
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setOrders(list);
        if (list[0]) setOpen(list[0].id);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this order? Items will be returned to stock.")) return;
    setCancelling(id);
    const res = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o)));
      toast.success("Order cancelled");
    } else toast.error(data.error || "Could not cancel");
    setCancelling(null);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-10 py-10 lg:py-16">
      <div className="mb-10 pb-6 border-b border-bone-3">
        <p className="eyebrow text-brass mb-3">Account</p>
        <h1 className="display text-4xl lg:text-5xl">Order history</h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center">
          <Package size={40} strokeWidth={1} className="mx-auto text-stone mb-6" />
          <p className="font-serif text-2xl mb-2">No orders yet.</p>
          <p className="text-sm text-stone mb-8">When you place an order it will appear here with live status updates.</p>
          <Link href="/shirts" className="btn-ink">Start shopping</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const s = normalizeOrderStatus(o.status);
            const isOpen = open === o.id;
            const stepIdx = s === "CANCELLED" ? -1 : STEPS.indexOf(s);
            const merchandise = o.items.reduce((a, i) => a + i.price * i.quantity, 0);
            const shipping = Math.max(0, Math.round((o.totalAmount - merchandise) * 100) / 100);
            return (
              <li key={o.id} className="card">
                <button onClick={() => setOpen(isOpen ? null : o.id)} className="w-full flex flex-wrap items-center gap-x-6 gap-y-3 p-5 lg:p-6 text-left">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((it) => (
                      <div key={it.id} className="h-14 w-11 bg-bone-2 border-2 border-white overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {it.imageUrl && <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-mono text-xs text-stone">#{shortId(o.id)}</p>
                    <p className="text-sm font-medium">{o.items.length} item{o.items.length === 1 ? "" : "s"} · {formatPrice(o.totalAmount)}</p>
                    <p className="text-xs text-stone">{formatDate(o.createdAt, true)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <ChevronDown size={18} className={`text-stone transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`grid transition-all duration-500 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-bone-3 p-5 lg:p-6 space-y-6">
                      {/* Progress */}
                      {stepIdx >= 0 ? (
                        <ol className="grid grid-cols-3 gap-2">
                          {STEPS.map((st, i) => (
                            <li key={st} className="text-center">
                              <div className={`h-1 mb-2 ${i <= stepIdx ? "bg-ink" : "bg-bone-3"}`} />
                              <p className={`text-[10px] uppercase tracking-[0.2em] ${i <= stepIdx ? "text-ink" : "text-stone"}`}>{st}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-oxblood flex items-center gap-2"><XCircle size={16} /> This order was cancelled.</p>
                      )}

                      <ul className="divide-y divide-bone-3">
                        {o.items.map((it) => (
                          <li key={it.id} className="py-3 flex items-center gap-4">
                            <div className="h-16 w-12 bg-bone-2 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {it.imageUrl && <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              {it.productId ? <Link href={`/product/${it.productId}`} className="text-sm font-medium hover:text-brass truncate block">{it.name}</Link> : <p className="text-sm font-medium truncate">{it.name}</p>}
                              <p className="text-xs text-stone">{it.size ? `Size ${it.size} · ` : ""}Qty {it.quantity}</p>
                            </div>
                            <p className="text-sm">{formatPrice(it.price * it.quantity)}</p>
                          </li>
                        ))}
                      </ul>

                      <div className="grid sm:grid-cols-2 gap-6 text-sm">
                        <div>
                          <p className="eyebrow text-[10px] text-stone mb-2 flex items-center gap-2"><MapPin size={12} /> Deliver to</p>
                          <p>{o.fullName}</p>
                          <p className="text-ink-3">{o.address}</p>
                          <p className="text-ink-3">{o.city}{o.postalCode ? ` ${o.postalCode}` : ""}, {o.country}</p>
                          {o.phone && <p className="text-ink-3">{o.phone}</p>}
                        </div>
                        <div>
                          <p className="eyebrow text-[10px] text-stone mb-2 flex items-center gap-2"><CreditCard size={12} /> Payment</p>
                          <p>{paymentLabel(o.paymentMethod)}</p>
                          <div className="mt-3 space-y-1 text-ink-3">
                            <p className="flex justify-between"><span>Items</span><span>{formatPrice(merchandise)}</span></p>
                            <p className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></p>
                            <p className="flex justify-between text-ink font-medium pt-1 border-t border-bone-3"><span>Total</span><span>{formatPrice(o.totalAmount)}</span></p>
                          </div>
                        </div>
                      </div>

                      {o.notes && <p className="text-xs text-stone">Notes: {o.notes}</p>}

                      {s === "PENDING" && (
                        <button onClick={() => cancel(o.id)} disabled={cancelling === o.id} className="btn-outline py-2.5 px-5 text-[10px]">
                          {cancelling === o.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Cancel order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
