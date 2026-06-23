"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  ShoppingBag,
  Search,
  Eye,
  Package,
  Mail,
  ShieldCheck,
  Calendar,
} from "lucide-react";

type TabKey = "account" | "orders" | "searches" | "views" | "products";

interface Props {
  userId: number;
  onClose: () => void;
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Account", icon: Mail },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "searches", label: "Searches", icon: Search },
  { key: "views", label: "Viewed", icon: Eye },
  { key: "products", label: "Listings", icon: Package },
];

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UserDetailModal({ userId, onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("account");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/dashboard/user-detail?id=${userId}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load user details");
        }
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold uppercase">
              {data?.user?.name?.[0] || data?.user?.email?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-white font-bold">
                {data?.user?.name || "User"}{" "}
                {data?.user?.role === "ADMIN" && (
                  <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full align-middle">
                    ADMIN
                  </span>
                )}
              </h2>
              <p className="text-slate-500 text-xs">{data?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-20 text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Stat strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-slate-800 border-b border-slate-800">
              <Stat label="Orders" value={data.stats.orderCount} />
              <Stat label="Spent (USDT)" value={data.stats.totalSpent.toFixed(2)} />
              <Stat label="Searches" value={data.stats.searchCount} />
              <Stat label="Views" value={data.stats.viewCount} />
              <Stat label="Listings" value={data.stats.productCount} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 bg-slate-950/50 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    tab === t.key
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 text-sm">
              {tab === "account" && <AccountTab user={data.user} />}
              {tab === "orders" && <OrdersTab orders={data.orders} />}
              {tab === "searches" && <SearchesTab searches={data.searches} />}
              {tab === "views" && <ViewsTab views={data.views} />}
              {tab === "products" && <ProductsTab products={data.products} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-900 p-4 text-center">
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function AccountTab({ user }: { user: any }) {
  return (
    <div className="space-y-3 text-slate-300">
      <Row icon={Mail} label="Email" value={user.email} />
      <Row icon={ShieldCheck} label="Role" value={user.role} />
      <Row icon={Package} label="Provider" value={user.provider} />
      <Row icon={Calendar} label="Joined" value={fmtDate(user.createdAt)} />
      <Row
        icon={ShieldCheck}
        label="KYC"
        value={user.kyc ? `${user.kyc.status} (${user.kyc.documentType})` : "Not submitted"}
      />
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-800/40 rounded-lg px-4 py-3">
      <Icon size={16} className="text-blue-400" />
      <span className="text-slate-500 w-24 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-slate-600 py-10">{text}</p>;
}

function OrdersTab({ orders }: { orders: any[] }) {
  if (!orders.length) return <Empty text="No orders placed yet." />;
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white font-bold">#{o.id.slice(0, 8)}</p>
              <p className="text-xs text-slate-500">{fmtDate(o.createdAt)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold">
                {o.status}
              </span>
              <p className="text-white font-bold mt-1">USDT {o.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1">
            {o.items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-xs text-slate-400">
                <span>
                  {it.name} {it.size ? `(${it.size})` : ""} × {it.quantity}
                </span>
                <span>USDT {(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-3 border-t border-slate-800 pt-2">
            Ship to: {o.fullName}, {o.address}, {o.city}, {o.country}
          </p>
        </div>
      ))}
    </div>
  );
}

function SearchesTab({ searches }: { searches: any[] }) {
  if (!searches.length) return <Empty text="No search activity recorded." />;
  return (
    <div className="space-y-2">
      {searches.map((s) => (
        <div key={s.id} className="flex justify-between items-center bg-slate-800/40 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <Search size={14} className="text-slate-500" />
            <span className="text-white">&quot;{s.query}&quot;</span>
            <span className="text-[10px] text-slate-500">{s.resultCount} results</span>
          </div>
          <span className="text-xs text-slate-600">{fmtDate(s.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}

function ViewsTab({ views }: { views: any[] }) {
  if (!views.length) return <Empty text="No product views recorded." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {views.map((v) => (
        <div key={v.id} className="flex items-center gap-3 bg-slate-800/40 rounded-lg p-3">
          <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
            {v.product?.imageUrls?.[0] && (
              <img src={v.product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm truncate">{v.product?.name || "Deleted product"}</p>
            <p className="text-xs text-slate-500">{fmtDate(v.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsTab({ products }: { products: any[] }) {
  if (!products.length) return <Empty text="This user has not listed any products." />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 bg-slate-800/40 rounded-lg p-3">
          <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
            {p.imageUrls?.[0] && (
              <img src={p.imageUrls[0]} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm truncate">{p.name}</p>
            <p className="text-xs text-blue-400 font-bold">USDT {p.price}</p>
          </div>
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-bold ${
              p.isPublished
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {p.isPublished ? "LIVE" : "DRAFT"}
          </span>
        </div>
      ))}
    </div>
  );
}
