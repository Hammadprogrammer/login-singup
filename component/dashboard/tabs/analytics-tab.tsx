"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Eye, BarChart3, TrendingUp } from "lucide-react";

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/analytics");
        if (!res.ok) {
          setData({ stats: {}, topSearches: [], recentSearches: [], topViewed: [] });
          return;
        }
        const text = await res.text();
        setData(text ? JSON.parse(text) : { stats: {}, topSearches: [], recentSearches: [], topViewed: [] });
      } catch {
        setData({ stats: {}, topSearches: [], recentSearches: [], topViewed: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-slate-950 text-blue-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { stats = {}, topSearches = [], recentSearches = [], topViewed = [] } = data || {};
  const maxSearch = Math.max(1, ...topSearches.map((s: any) => s.count));
  const maxView = Math.max(1, ...topViewed.map((v: any) => v.views));

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="text-blue-500" /> Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          What users search for and which products they view.
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Searches</p>
            <Search size={16} className="text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mt-2">{stats.totalSearches ?? 0}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Product Views</p>
            <Eye size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mt-2">{stats.totalViews ?? 0}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top searches */}
        <Panel title="Top Searches" icon={Search}>
          {topSearches.length === 0 ? (
            <Empty text="No searches recorded yet." />
          ) : (
            <div className="space-y-3">
              {topSearches.map((s: any) => (
                <div key={s.query}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white truncate">{s.query}</span>
                    <span className="text-slate-500">{s.count}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(s.count / maxSearch) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Most viewed products */}
        <Panel title="Most Viewed Products" icon={TrendingUp}>
          {topViewed.length === 0 ? (
            <Empty text="No product views recorded yet." />
          ) : (
            <div className="space-y-3">
              {topViewed.map((v: any) => (
                <div key={v.productId} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                    {v.product?.imageUrls?.[0] && (
                      <img src={v.product.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{v.product?.name || "Deleted product"}</p>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(v.views / maxView) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{v.views} views</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Recent searches */}
      <Panel title="Recent Searches" icon={Search}>
        {recentSearches.length === 0 ? (
          <Empty text="No recent search activity." />
        ) : (
          <div className="space-y-2">
            {recentSearches.map((s: any) => (
              <div key={s.id} className="flex justify-between items-center bg-slate-800/40 rounded-lg px-4 py-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-white">&quot;{s.query}&quot;</span>
                  <span className="text-slate-500">{s.user?.email || "Guest"}</span>
                </div>
                <span className="text-slate-600">{fmtDate(s.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
        <Icon size={16} className="text-blue-400" /> {title}
      </h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-center text-slate-600 py-6 text-sm">{text}</p>;
}
