"use client";

import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusColor: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PAID: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function OrdersTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/api/dashboard/orders?status=${filter}`
        : "/api/dashboard/orders";
      const res = await fetch(url);
      if (!res.ok) {
        setData({ stats: {}, orders: [] });
        return;
      }
      const text = await res.text();
      setData(text ? JSON.parse(text) : { stats: {}, orders: [] });
    } catch {
      setData({ stats: {}, orders: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/dashboard/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setData((prev: any) => ({
        ...prev,
        orders: prev.orders.map((o: any) => (o.id === id ? { ...o, status } : o)),
      }));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-950 text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const orders = data?.orders || [];

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="text-blue-500" /> Orders
        </h1>
        <p className="text-slate-500 text-sm mt-1">All customer orders across the store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders ?? 0} color="text-blue-400" />
        <StatCard icon={TrendingUp} label="Today" value={stats.todayOrders ?? 0} color="text-emerald-400" />
        <StatCard icon={DollarSign} label="Revenue (USDT)" value={(stats.totalRevenue ?? 0).toFixed(2)} color="text-amber-400" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingOrders ?? 0} color="text-orange-400" />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-lg text-xs font-bold ${!filter ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${filter === s ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="p-10 text-center text-slate-600 text-sm bg-slate-900 rounded-xl border border-slate-800">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div>
                  <p className="text-white font-bold">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">{fmtDate(o.createdAt)}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {o.user?.name || "Unknown"} · {o.user?.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">USDT {o.totalAmount.toFixed(2)}</span>
                  <select
                    value={o.status}
                    disabled={updating === o.id}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`text-[11px] font-bold rounded-lg border px-2 py-1.5 bg-slate-950 outline-none ${statusColor[o.status] || ""}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1 border-t border-slate-800 pt-3">
                {o.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between text-xs text-slate-400">
                    <span>
                      {it.name} {it.size ? `(${it.size})` : ""} × {it.quantity}
                    </span>
                    <span>USDT {(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-600 mt-3">
                Ship to: {o.fullName}, {o.address}, {o.city}, {o.country}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <Icon size={16} className={color} />
      </div>
      <h2 className="text-2xl font-bold text-white mt-2">{value}</h2>
    </div>
  );
}
