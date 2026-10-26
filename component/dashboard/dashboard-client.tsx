"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, Users, Star, ShieldCheck, Image as ImageIcon, Mail, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { SITE } from "@/lib/site";
import OverviewTab from "./tabs/overview-tab";
import OrdersTab from "./tabs/orders-tab";
import ProductsTab from "./tabs/products-tab";
import CustomersTab from "./tabs/customers-tab";
import ReviewsTab from "./tabs/reviews-tab";
import KYCTab from "./tabs/kyc-tab";
import HomeContentTab from "./tabs/home-content-tab";
import MessagesTab from "./tabs/messages-tab";

export type TabKey = "overview" | "orders" | "products" | "customers" | "reviews" | "kyc" | "home" | "messages";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Inventory", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "kyc", label: "KYC", icon: ShieldCheck },
  { key: "messages", label: "Messages", icon: Mail },
  { key: "home", label: "Home content", icon: ImageIcon },
];

export default function DashboardClient({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badges, setBadges] = useState<Partial<Record<TabKey, number>>>({});

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabKey;
    if (TABS.some((t) => t.key === hash)) setTab(hash);
  }, []);

  useEffect(() => {
    window.location.hash = tab;
    setMobileOpen(false);
  }, [tab]);

  const refreshBadges = async () => {
    try {
      const r = await fetch("/api/dashboard/stats", { cache: "no-store" });
      if (!r.ok) return;
      const s = await r.json();
      setBadges({ orders: s.orders?.byStatus?.PENDING, kyc: s.kyc?.pending, reviews: s.pendingReviews, messages: s.unreadMessages });
    } catch {}
  };

  useEffect(() => {
    refreshBadges();
    const t = setInterval(refreshBadges, 60_000);
    return () => clearInterval(t);
  }, [tab]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const nav = (
    <ul className="space-y-0.5">
      {TABS.map((t) => (
        <li key={t.key}>
          <button
            onClick={() => setTab(t.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${tab === t.key ? "bg-bone text-ink" : "text-bone/70 hover:bg-white/5 hover:text-bone"}`}
          >
            <t.icon size={17} strokeWidth={1.6} />
            <span className="flex-1 text-left">{t.label}</span>
            {!!badges[t.key] && <span className={`text-[10px] px-1.5 py-0.5 ${tab === t.key ? "bg-ink text-bone" : "bg-brass text-ink"}`}>{badges[t.key]}</span>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-bone text-ink flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-ink text-bone sticky top-0 h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-serif text-2xl tracking-[0.35em]">{SITE.name}</p>
          <p className="eyebrow text-brass-2 text-[9px] mt-1">Admin panel</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">{nav}</nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="text-[11px] text-bone/50 truncate px-1">{adminEmail}</p>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-bone/70 hover:text-bone"><ExternalLink size={14} /> View storefront</Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-bone/70 hover:text-bone"><LogOut size={14} /> Sign out</button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-40 bg-ink text-bone flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileOpen(true)} aria-label="Menu"><Menu size={22} /></button>
          <p className="font-serif tracking-[0.35em]">{SITE.name}</p>
          <button onClick={logout} aria-label="Sign out"><LogOut size={18} /></button>
        </header>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-ink/60" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-ink text-bone p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-6 px-2">
                <p className="font-serif tracking-[0.35em]">{SITE.name}</p>
                <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
              </div>
              {nav}
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1500px] w-full mx-auto">
          {tab === "overview" && <OverviewTab onNavigate={setTab} />}
          {tab === "orders" && <OrdersTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "customers" && <CustomersTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "kyc" && <KYCTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "home" && <HomeContentTab />}
        </main>
      </div>
    </div>
  );
}
