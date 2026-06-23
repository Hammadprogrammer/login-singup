"use client";

import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ImageIcon, 
  ShieldCheck,
  TrendingUp,
  Activity,
  ShoppingBag,
  BarChart3,
  LayoutGrid,
  Shapes,
  Star,
  Megaphone,
  Images,
  Newspaper,
  Quote
} from "lucide-react";

interface Stats {
  totalUsers: number;
  todayUsers: number;
  totalProducts: number;
  totalSliders: number;
  totalOrders: number;
  pendingKYC: number;
  approvedKYC: number;
}

export default function OverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    todayUsers: 0,
    totalProducts: 0,
    totalSliders: 0,
    totalOrders: 0,
    pendingKYC: 0,
    approvedKYC: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely parse a response: returns fallback when the body is empty,
    // the request failed, or the JSON is invalid. This prevents the
    // "Unexpected end of JSON input" crash on non-OK / empty responses.
    const safeJson = async <T,>(res: Response, fallback: T): Promise<T> => {
      try {
        if (!res.ok) return fallback;
        const text = await res.text();
        if (!text) return fallback;
        return JSON.parse(text) as T;
      } catch {
        return fallback;
      }
    };

    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, kycRes, slidersRes, ordersRes] = await Promise.all([
          fetch("/api/dashboard/user-stats"),
          fetch("/api/products"),
          fetch("/api/admin/kyc"),
          fetch("/api/dashboard/homeslider"),
          fetch("/api/dashboard/orders"),
        ]);

        const usersData = await safeJson<any>(usersRes, {});
        const productsData = await safeJson<any[]>(productsRes, []);
        const kycData = await safeJson<any[]>(kycRes, []);
        const slidersData = await safeJson<any[]>(slidersRes, []);
        const ordersData = await safeJson<any>(ordersRes, {});

        setStats({
          totalUsers: usersData.totalUsers || 0,
          todayUsers: usersData.todayUsers || 0,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalSliders: Array.isArray(slidersData) ? slidersData.length : 0,
          totalOrders: ordersData.stats?.total || 0,
          pendingKYC: Array.isArray(kycData)
            ? kycData.filter((k: any) => k.status === "PENDING").length
            : 0,
          approvedKYC: Array.isArray(kycData)
            ? kycData.filter((k: any) => k.status === "APPROVED").length
            : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      key: "users",
      title: "Total Users",
      value: stats.totalUsers,
      subtext: `${stats.todayUsers} new today`,
      icon: Users,
      color: "blue",
      gradient: "from-blue-500 to-cyan-400",
      onClick: () => onTabChange("users"),
    },
    {
      key: "products",
      title: "Products",
      value: stats.totalProducts,
      subtext: "In catalog",
      icon: Package,
      color: "purple",
      gradient: "from-purple-500 to-pink-400",
      onClick: () => onTabChange("products"),
    },
    {
      key: "sliders",
      title: "Home Sliders",
      value: stats.totalSliders,
      subtext: "Active banners",
      icon: ImageIcon,
      color: "amber",
      gradient: "from-amber-500 to-orange-400",
      onClick: () => onTabChange("sliders"),
    },
    {
      key: "orders",
      title: "Total Orders",
      value: stats.totalOrders,
      subtext: "All time orders",
      icon: TrendingUp,
      color: "rose",
      gradient: "from-rose-500 to-pink-400",
      onClick: () => onTabChange("orders"),
    },
    {
      key: "kyc",
      title: "KYC Pending",
      value: stats.pendingKYC,
      subtext: `${stats.approvedKYC} approved total`,
      icon: ShieldCheck,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-400",
      onClick: () => onTabChange("kyc"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl p-6 md:p-8 border border-indigo-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-2xl">
            <LayoutDashboard className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage your platform efficiently</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.key}
            onClick={card.onClick}
            className="group relative overflow-hidden bg-[#161f32] rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <div className={`absolute top-0 right-0 p-3 bg-gradient-to-br ${card.gradient} rounded-bl-3xl opacity-80 group-hover:opacity-100 transition-opacity`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                {card.title}
              </p>
              <p className="text-4xl font-black text-white mb-1">{card.value}</p>
              <p className="text-xs text-slate-400">{card.subtext}</p>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${card.gradient} w-0 group-hover:w-full transition-all duration-500`} />
          </button>
        ))}
      </div>

      {/* Quick Actions - all tabs */}
      <div className="bg-[#161f32] rounded-2xl border border-slate-800 p-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity size={14} /> Quick Navigation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Products", tab: "products", icon: Package, color: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" },
            { label: "Orders", tab: "orders", icon: ShoppingBag, color: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" },
            { label: "Analytics", tab: "analytics", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20" },
            { label: "Home Sliders", tab: "sliders", icon: ImageIcon, color: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" },
            { label: "Promo Banners", tab: "promos", icon: LayoutGrid, color: "bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20" },
            { label: "Categories", tab: "categories", icon: Shapes, color: "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" },
            { label: "Featured", tab: "featured", icon: Star, color: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" },
            { label: "Sale Banner", tab: "saleBanner", icon: Megaphone, color: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" },
            { label: "Inspiration", tab: "inspiration", icon: Images, color: "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20" },
            { label: "Blog", tab: "blog", icon: Newspaper, color: "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20" },
            { label: "Testimonials", tab: "testimonials", icon: Quote, color: "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20" },
            { label: "Users", tab: "users", icon: Users, color: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" },
            { label: "KYC", tab: "kyc", icon: ShieldCheck, color: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => onTabChange(action.tab)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-xs font-bold transition-all ${action.color}`}
            >
              <action.icon size={20} />
              <span className="text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="flex items-center justify-between bg-[#0b1120] rounded-xl p-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-bold">SYSTEM ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <TrendingUp size={14} />
          <span>All services operational</span>
        </div>
      </div>
    </div>
  );
}
