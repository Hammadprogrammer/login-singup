"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import Reveal from "@/component/ui/Reveal";
import { toast } from "@/component/ui/Toast";

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  user: { name: string | null };
  product: { id: string; name: string; imageUrls: string[] } | null;
}

function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex text-brass">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i + 1)} className={onChange ? "hover:scale-110 transition-transform" : "cursor-default"} aria-label={`${i + 1} star`}>
          <Star size={size} fill={i < value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function ReviewsContent() {
  const params = useSearchParams();
  const productId = params.get("productId") || "";
  const { user, loading: sessionLoading } = useSession();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number>(0);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [sending, setSending] = useState(false);
  const [productName, setProductName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setAverage(d.average || 0);
        setCount(d.count || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/products?id=${productId}`).then((r) => (r.ok ? r.json() : null)).then((p) => setProductName(p?.name ?? null));
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: productId || null }),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Could not submit review");
      toast.success(data.message);
      setForm({ rating: 5, title: "", comment: "" });
    } finally {
      setSending(false);
    }
  };

  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  const visible = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12 lg:py-20">
      <Reveal className="mb-14 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-xl">
          <p className="eyebrow text-brass mb-3">Customer reviews</p>
          <h1 className="display text-5xl lg:text-6xl mb-4">Honest words from real customers.</h1>
          <p className="text-ink-3 leading-relaxed">Every review is from a registered customer and checked by our team before it&apos;s published.</p>
        </div>
        {count > 0 && (
          <div className="card p-6 flex items-center gap-6 shrink-0">
            <div className="text-center">
              <p className="font-serif text-5xl leading-none">{average.toFixed(1)}</p>
              <Stars value={Math.round(average)} />
              <p className="text-xs text-stone mt-1">{count} review{count === 1 ? "" : "s"}</p>
            </div>
            <ul className="space-y-1.5 w-40">
              {dist.map((d) => (
                <li key={d.n} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3 text-stone">{d.n}</span>
                  <div className="flex-1 h-1.5 bg-bone-2"><div className="h-full bg-brass" style={{ width: `${count ? (d.c / count) * 100 : 0}%` }} /></div>
                  <span className="w-5 text-right text-stone">{d.c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setFilter(0)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border ${!filter ? "bg-ink text-bone border-ink" : "border-bone-3"}`}>All</button>
            {[5, 4, 3, 2, 1].map((n) => (
              <button key={n} onClick={() => setFilter(filter === n ? 0 : n)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border flex items-center gap-1 ${filter === n ? "bg-ink text-bone border-ink" : "border-bone-3"}`}>{n} <Star size={10} fill="currentColor" /></button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-stone" /></div>
          ) : visible.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-serif text-2xl mb-2">No reviews here yet.</p>
              <p className="text-sm text-stone">Be the first to share your experience.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {visible.map((r, i) => (
                <Reveal key={r.id} as="li" delay={(i % 4) * 60} className="card p-7">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <Stars value={r.rating} />
                      {r.title && <p className="font-medium mt-2">{r.title}</p>}
                    </div>
                    <span className="text-[11px] text-stone whitespace-nowrap">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="font-serif text-lg leading-relaxed text-ink-2">&ldquo;{r.comment}&rdquo;</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="eyebrow text-[10px] text-stone">{r.user.name || "Verified customer"}</p>
                    {r.product && (
                      <Link href={`/product/${r.product.id}`} className="flex items-center gap-2 text-xs hover:text-brass">
                        {r.product.imageUrls[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.product.imageUrls[0]} alt="" className="h-8 w-6 object-cover" />
                        )}
                        <span className="truncate max-w-[160px]">{r.product.name}</span>
                      </Link>
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:col-span-5">
          <Reveal delay={150} className="card p-7 lg:p-9 lg:sticky lg:top-32">
            <p className="eyebrow text-[10px] mb-2">Write a review</p>
            {productName && <p className="text-sm text-ink-3 mb-4">Reviewing <span className="text-ink font-medium">{productName}</span></p>}
            {sessionLoading ? null : !user ? (
              <div className="space-y-4">
                <p className="text-sm text-stone">Sign in to leave a review. Only registered customers can post.</p>
                <Link href={`/login?redirect=/reviews${productId ? `?productId=${productId}` : ""}`} className="btn-ink w-full">Sign in</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label className="label">Your rating</label>
                  <Stars value={form.rating} size={24} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
                <div><label className="label">Title <span className="text-stone normal-case tracking-normal">(optional)</span></label><input maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="field" placeholder="Sums it up in a few words" /></div>
                <div><label className="label">Review</label><textarea required minLength={10} maxLength={1200} rows={5} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="field resize-none" placeholder="How does it fit? How has it worn?" /></div>
                <button type="submit" disabled={sending} className="btn-ink w-full">{sending && <Loader2 size={14} className="animate-spin" />} Submit review</button>
                <p className="text-[11px] text-stone leading-relaxed">Reviews are published after a quick moderation check. Posting as {user.name || user.email}.</p>
              </form>
            )}
          </Reveal>
        </aside>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>}>
      <ReviewsContent />
    </Suspense>
  );
}
