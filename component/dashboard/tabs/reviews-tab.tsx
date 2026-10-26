"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, Check, Trash2, EyeOff } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "@/component/ui/Toast";
import { PageHeader, StatCard, Spinner, Empty, Tabs } from "../ui";

interface Review {
  id: number; rating: number; title: string | null; comment: string; isApproved: boolean; createdAt: string;
  user: { id: number; name: string | null; email: string }; product: { id: string; name: string; imageUrls: string[] } | null;
}
type Filter = "pending" | "approved" | "all";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/reviews?all=1", { cache: "no-store" });
      const d = await r.json();
      setReviews(d.reviews || []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: number, action: "approve" | "hide" | "delete") => {
    setBusy(id);
    try {
      const r =
        action === "delete"
          ? await fetch("/api/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
          : await fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isApproved: action === "approve" }) });
      if (!r.ok) return toast.error("Action failed");
      if (action === "delete") setReviews((p) => p.filter((x) => x.id !== id));
      else setReviews((p) => p.map((x) => (x.id === id ? { ...x, isApproved: action === "approve" } : x)));
      toast.success(action === "approve" ? "Review published" : action === "hide" ? "Review hidden" : "Review deleted");
    } finally {
      setBusy(null);
    }
  };

  const pending = reviews.filter((r) => !r.isApproved);
  const approved = reviews.filter((r) => r.isApproved);
  const visible = filter === "pending" ? pending : filter === "approved" ? approved : reviews;
  const avg = approved.length ? approved.reduce((a, r) => a + r.rating, 0) / approved.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" subtitle="Moderate customer reviews before they appear on the storefront." />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Awaiting approval" value={pending.length} accent="bg-brass" />
        <StatCard label="Published" value={approved.length} accent="bg-success" />
        <StatCard label="Average rating" value={avg ? avg.toFixed(1) : "—"} />
      </div>
      <Tabs<Filter> value={filter} onChange={setFilter} items={[{ key: "pending", label: "Pending", count: pending.length }, { key: "approved", label: "Published", count: approved.length }, { key: "all", label: "All", count: reviews.length }]} />

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <Empty title="Nothing here" text={filter === "pending" ? "All caught up — no reviews waiting." : "No reviews yet."} />
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {visible.map((r) => (
            <li key={r.id} className={`card p-5 flex flex-col ${busy === r.id ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex text-brass">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < r.rating ? "currentColor" : "none"} />)}</div>
                  {r.title && <p className="font-medium mt-1.5">{r.title}</p>}
                </div>
                <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider ${r.isApproved ? "border-success/40 text-success" : "border-brass text-[#7a5f2a]"}`}>{r.isApproved ? "Live" : "Pending"}</span>
              </div>
              <p className="text-sm text-ink-3 leading-relaxed flex-1">{r.comment}</p>
              <div className="mt-4 pt-4 border-t border-bone-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-stone">
                  <p>{r.user.name || "Customer"} · {r.user.email}</p>
                  <p>{formatDate(r.createdAt, true)}{r.product ? ` · on ${r.product.name}` : " · store review"}</p>
                </div>
                <div className="flex gap-1">
                  {r.isApproved ? (
                    <button onClick={() => act(r.id, "hide")} className="p-2 border border-bone-3 hover:border-ink" title="Hide"><EyeOff size={14} /></button>
                  ) : (
                    <button onClick={() => act(r.id, "approve")} className="p-2 bg-ink text-bone hover:bg-ink-2" title="Approve"><Check size={14} /></button>
                  )}
                  <button onClick={() => act(r.id, "delete")} className="p-2 border border-bone-3 text-oxblood hover:border-oxblood" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
