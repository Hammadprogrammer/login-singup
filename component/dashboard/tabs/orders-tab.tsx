"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCcw, Loader2, Printer } from "lucide-react";
import { formatPrice, formatDate, shortId } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS, normalizeOrderStatus, paymentLabel, type OrderStatusValue } from "@/lib/site";
import StatusBadge from "@/component/ui/StatusBadge";
import { toast } from "@/component/ui/Toast";
import { PageHeader, StatCard, Spinner, Empty, Modal, Tabs, Pagination } from "../ui";

type Filter = "ALL" | OrderStatusValue;

interface Item { id: number; productId: string | null; name: string; price: number; quantity: number; size: string | null; imageUrl: string | null }
interface Order {
  id: string; status: string; paymentMethod: string; totalAmount: number; fullName: string; email: string; phone: string | null;
  address: string; city: string; postalCode: string | null; country: string; notes: string | null; createdAt: string; updatedAt: string;
  items: Item[]; user: { id: number; name: string | null; email: string; createdAt: string; kyc: { status: string } | null } | null;
}
interface Data {
  stats: { totalOrders: number; todayOrders: number; totalRevenue: number; monthRevenue: number; byStatus: Record<Filter, number> };
  orders: Order[];
  pagination: { page: number; pages: number; total: number };
}

export default function OrdersTab() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [payment, setPayment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (filter !== "ALL") p.set("status", filter);
    if (debounced) p.set("q", debounced);
    if (payment) p.set("payment", payment);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    try {
      const r = await fetch(`/api/dashboard/orders?${p}`, { cache: "no-store" });
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, [page, filter, debounced, payment, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [filter, debounced, payment, from, to]);

  const updateStatus = async (id: string, status: OrderStatusValue) => {
    setUpdating(id);
    try {
      const r = await fetch("/api/dashboard/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Update failed");
      toast.success(`Order #${shortId(id)} marked ${status.toLowerCase()}`);
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
      load();
    } finally {
      setUpdating(null);
    }
  };

  const stats = data?.stats;
  const counts = stats?.byStatus;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Every order placed by customers, straight from the database."
        action={<button onClick={load} className="btn-outline py-2 px-4 text-[10px]"><RefreshCcw size={13} className={loading ? "animate-spin" : ""} /> Refresh</button>}
      />

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total orders" value={stats.totalOrders} hint={`${stats.todayOrders} today`} />
          <StatCard label="Revenue" value={formatPrice(stats.totalRevenue)} hint="Excludes cancelled" accent="bg-brass" />
          <StatCard label="This month" value={formatPrice(stats.monthRevenue)} accent="bg-success" />
          <StatCard label="Pending" value={stats.byStatus.PENDING} hint="Need action" accent="bg-oxblood" />
        </div>
      )}

      <Tabs<Filter>
        value={filter}
        onChange={setFilter}
        items={[{ key: "ALL", label: "All", count: counts?.ALL }, ...ORDER_STATUSES.map((s) => ({ key: s as Filter, label: s.charAt(0) + s.slice(1).toLowerCase(), count: counts?.[s] }))]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order id, customer, email, phone, product…" className="field-box pl-10" />
        </div>
        <select value={payment} onChange={(e) => setPayment(e.target.value)} className="field-box">
          <option value="">All payment methods</option>
          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field-box" aria-label="From date" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field-box" aria-label="To date" />
        </div>
      </div>

      {loading && !data ? (
        <Spinner />
      ) : !data || data.orders.length === 0 ? (
        <Empty title="No orders match" text="Try another tab or clear the filters." />
      ) : (
        <div className={`card overflow-hidden ${loading ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-stone bg-bone-2/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Items</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-3">
                {data.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-bone-2/40 cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-5 py-3"><p className="font-mono text-xs">#{shortId(o.id)}</p><p className="text-[11px] text-stone">{formatDate(o.createdAt, true)}</p></td>
                    <td className="px-4 py-3"><p className="font-medium">{o.fullName}</p><p className="text-[11px] text-stone">{o.email}{o.phone ? ` · ${o.phone}` : ""}</p></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {o.items.slice(0, 3).map((it) => (
                            <div key={it.id} className="h-9 w-7 bg-bone-2 border border-white overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {it.imageUrl && <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-stone">{o.items.reduce((a, i) => a + i.quantity, 0)} pc</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{paymentLabel(o.paymentMethod)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={normalizeOrderStatus(o.status)}
                        disabled={updating === o.id}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatusValue)}
                        className="field-box py-1.5 text-[11px] uppercase tracking-wider w-auto"
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5">
            <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
          </div>
        </div>
      )}

      {selected && <OrderDetail order={selected} onClose={() => setSelected(null)} onStatus={updateStatus} busy={updating === selected.id} />}
    </div>
  );
}

function OrderDetail({ order: o, onClose, onStatus, busy }: { order: Order; onClose: () => void; onStatus: (id: string, s: OrderStatusValue) => void; busy: boolean }) {
  const merchandise = o.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shipping = Math.max(0, Math.round((o.totalAmount - merchandise) * 100) / 100);
  const current = normalizeOrderStatus(o.status);

  return (
    <Modal title={`Order #${shortId(o.id)}`} onClose={onClose} wide>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={o.status} />
              <span className="text-xs text-stone">Placed {formatDate(o.createdAt, true)}</span>
            </div>
            <button onClick={() => window.print()} className="btn-ghost text-[10px]"><Printer size={14} /> Print</button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-stone bg-bone-2/50">
                <tr><th className="text-left px-4 py-2.5 font-medium">Product</th><th className="text-left px-4 py-2.5 font-medium">Size</th><th className="text-right px-4 py-2.5 font-medium">Qty</th><th className="text-right px-4 py-2.5 font-medium">Price</th><th className="text-right px-4 py-2.5 font-medium">Line</th></tr>
              </thead>
              <tbody className="divide-y divide-bone-3">
                {o.items.map((it) => (
                  <tr key={it.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-11 bg-bone-2 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {it.imageUrl && <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div><p className="font-medium">{it.name}</p>{!it.productId && <p className="text-[10px] text-stone">Product since removed</p>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{it.size || "—"}</td>
                    <td className="px-4 py-3 text-right">{it.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(it.price)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm">
                <tr className="border-t border-bone-3"><td colSpan={4} className="px-4 py-2 text-right text-stone">Items</td><td className="px-4 py-2 text-right">{formatPrice(merchandise)}</td></tr>
                <tr><td colSpan={4} className="px-4 py-2 text-right text-stone">Shipping</td><td className="px-4 py-2 text-right">{shipping === 0 ? "Free" : formatPrice(shipping)}</td></tr>
                <tr className="border-t border-ink"><td colSpan={4} className="px-4 py-3 text-right font-medium">Total</td><td className="px-4 py-3 text-right font-serif text-xl">{formatPrice(o.totalAmount)}</td></tr>
              </tfoot>
            </table>
          </div>

          {o.notes && (
            <div className="card p-4">
              <p className="eyebrow text-[10px] text-stone mb-1">Customer notes</p>
              <p className="text-sm whitespace-pre-wrap">{o.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <p className="eyebrow text-[10px] text-stone mb-3">Update status</p>
            <div className="grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((s) => (
                <button key={s} disabled={busy || s === current} onClick={() => onStatus(o.id, s)} className={`py-2.5 text-[10px] uppercase tracking-[0.15em] border transition-colors disabled:opacity-40 ${s === current ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>
                  {busy && s !== current ? <Loader2 size={12} className="animate-spin mx-auto" /> : s}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone mt-3">Cancelling returns items to stock. The customer is emailed on each change.</p>
          </div>

          <div className="card p-5 text-sm space-y-1">
            <p className="eyebrow text-[10px] text-stone mb-2">Customer</p>
            <p className="font-medium">{o.fullName}</p>
            <p><a href={`mailto:${o.email}`} className="link-underline">{o.email}</a></p>
            {o.phone && <p><a href={`tel:${o.phone}`} className="link-underline">{o.phone}</a></p>}
            {o.user && (
              <div className="pt-3 mt-3 border-t border-bone-3 text-xs text-stone space-y-1">
                <p>Account #{o.user.id} · joined {formatDate(o.user.createdAt)}</p>
                <p>KYC: {o.user.kyc?.status ?? "Not submitted"}</p>
              </div>
            )}
          </div>

          <div className="card p-5 text-sm">
            <p className="eyebrow text-[10px] text-stone mb-2">Delivery address</p>
            <p>{o.address}</p>
            <p>{o.city}{o.postalCode ? ` ${o.postalCode}` : ""}</p>
            <p>{o.country}</p>
          </div>

          <div className="card p-5 text-sm">
            <p className="eyebrow text-[10px] text-stone mb-2">Payment</p>
            <p className="font-medium">{paymentLabel(o.paymentMethod)}</p>
            <p className="text-xs text-stone mt-1">{o.paymentMethod === "cod" ? "Collect cash on delivery." : "Confirm bank transfer before processing."}</p>
          </div>

          <p className="text-[11px] text-stone font-mono break-all">ID {o.id}</p>
        </div>
      </div>
    </Modal>
  );
}
