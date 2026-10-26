"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { formatPrice, formatDate, shortId } from "@/lib/format";
import { paymentLabel } from "@/lib/site";
import StatusBadge from "@/component/ui/StatusBadge";
import { PageHeader, StatCard, Spinner } from "../ui";
import type { TabKey } from "../dashboard-client";

interface Stats {
  users: { total: number; today: number };
  products: { total: number; published: number; outOfStock: number; lowStock: { id: string; name: string; stock: number; imageUrls: string[]; categories: string[] }[] };
  orders: { byStatus: Record<string, number>; today: number };
  revenue: { total: number; month: number; today: number };
  kyc: { pending: number; approved: number };
  pendingReviews: number;
  unreadMessages: number;
  recentOrders: { id: string; status: string; totalAmount: number; paymentMethod: string; fullName: string; createdAt: string; items: { quantity: number }[]; user: { name: string | null; email: string } }[];
  series: { date: string; revenue: number; orders: number }[];
  topSelling: { name: string; quantity: number }[];
}

export default function OverviewTab({ onNavigate }: { onNavigate: (t: TabKey) => void }) {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setS)
      .catch(() => setErr(true));
  }, []);

  if (err) return <p className="text-sm text-oxblood">Could not load statistics.</p>;
  if (!s) return <Spinner />;

  const maxRev = Math.max(1, ...s.series.map((d) => d.revenue));
  const maxQty = Math.max(1, ...s.topSelling.map((t) => t.quantity));

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" subtitle={`Live numbers from the database · ${formatDate(new Date(), true)}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (all time)" value={formatPrice(s.revenue.total)} hint={`${formatPrice(s.revenue.month)} this month`} accent="bg-brass" />
        <StatCard label="Orders" value={s.orders.byStatus.ALL} hint={`${s.orders.today} today · ${s.orders.byStatus.PENDING} pending`} />
        <StatCard label="Customers" value={s.users.total} hint={`${s.users.today} new today`} accent="bg-[#1F2A44]" />
        <StatCard label="Products" value={s.products.published} hint={`${s.products.total} total · ${s.products.outOfStock} out of stock`} accent="bg-success" />
      </div>

      {/* Attention row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { k: "orders" as TabKey, label: "Pending orders", n: s.orders.byStatus.PENDING },
          { k: "kyc" as TabKey, label: "KYC awaiting review", n: s.kyc.pending },
          { k: "reviews" as TabKey, label: "Reviews to moderate", n: s.pendingReviews },
          { k: "messages" as TabKey, label: "Unread messages", n: s.unreadMessages },
        ].map((a) => (
          <button key={a.k} onClick={() => onNavigate(a.k)} className={`card p-4 flex items-center justify-between text-left hover:border-ink transition-colors ${a.n > 0 ? "" : "opacity-60"}`}>
            <div>
              <p className="text-xs text-stone">{a.label}</p>
              <p className="font-serif text-2xl">{a.n}</p>
            </div>
            <ArrowRight size={16} className="text-stone" />
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[10px] text-stone">Revenue · last 30 days</p>
              <p className="font-serif text-2xl mt-1">{formatPrice(s.series.reduce((a, d) => a + d.revenue, 0))}</p>
            </div>
            <p className="text-xs text-stone">{s.series.reduce((a, d) => a + d.orders, 0)} orders</p>
          </div>
          <div className="flex items-end gap-[3px] h-40">
            {s.series.map((d) => (
              <div key={d.date} className="flex-1 group relative">
                <div className="w-full bg-ink/80 group-hover:bg-brass transition-colors" style={{ height: `${Math.max(2, (d.revenue / maxRev) * 100)}%` }} />
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-ink text-bone text-[10px] px-2 py-1 whitespace-nowrap z-10">
                  {formatDate(d.date)} · {formatPrice(d.revenue)} · {d.orders} order{d.orders === 1 ? "" : "s"}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-stone mt-2">
            <span>{formatDate(s.series[0].date)}</span>
            <span>{formatDate(s.series[s.series.length - 1].date)}</span>
          </div>
        </div>

        {/* Top sellers */}
        <div className="card p-6">
          <p className="eyebrow text-[10px] text-stone mb-5">Best sellers</p>
          {s.topSelling.length === 0 ? (
            <p className="text-sm text-stone">No sales yet.</p>
          ) : (
            <ul className="space-y-4">
              {s.topSelling.map((t) => (
                <li key={t.name}>
                  <div className="flex justify-between text-sm mb-1"><span className="truncate pr-3">{t.name}</span><span className="text-stone">{t.quantity}</span></div>
                  <div className="h-1.5 bg-bone-2"><div className="h-full bg-brass" style={{ width: `${(t.quantity / maxQty) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-bone-3">
            <p className="eyebrow text-[10px] text-stone">Recent orders</p>
            <button onClick={() => onNavigate("orders")} className="text-xs link-underline">View all</button>
          </div>
          {s.recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-stone">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-[0.2em] text-stone">
                  <tr className="border-b border-bone-3"><th className="text-left px-6 py-3 font-medium">Order</th><th className="text-left px-4 py-3 font-medium">Customer</th><th className="text-left px-4 py-3 font-medium">Payment</th><th className="text-right px-4 py-3 font-medium">Total</th><th className="text-left px-6 py-3 font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-bone-3">
                  {s.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-bone-2/50">
                      <td className="px-6 py-3"><p className="font-mono text-xs">#{shortId(o.id)}</p><p className="text-[11px] text-stone">{formatDate(o.createdAt, true)}</p></td>
                      <td className="px-4 py-3"><p>{o.fullName}</p><p className="text-[11px] text-stone">{o.user.email}</p></td>
                      <td className="px-4 py-3 text-xs">{paymentLabel(o.paymentMethod)}</td>
                      <td className="px-4 py-3 text-right">{formatPrice(o.totalAmount)}</td>
                      <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="eyebrow text-[10px] text-stone">Low stock</p>
            <button onClick={() => onNavigate("products")} className="text-xs link-underline">Inventory</button>
          </div>
          {s.products.lowStock.length === 0 && s.products.outOfStock === 0 ? (
            <p className="text-sm text-stone">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {s.products.outOfStock > 0 && (
                <li className="flex items-center gap-2 text-xs text-oxblood"><AlertTriangle size={14} /> {s.products.outOfStock} product{s.products.outOfStock === 1 ? "" : "s"} out of stock</li>
              )}
              {s.products.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="h-12 w-9 bg-bone-2 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.imageUrls[0] && <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm truncate">{p.name}</p><p className="text-[11px] text-stone">{p.categories[0]}</p></div>
                  <span className="text-xs font-semibold text-oxblood">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
