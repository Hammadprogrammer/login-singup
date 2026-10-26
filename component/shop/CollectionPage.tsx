"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { CategoryDef } from "@/lib/site";
import ProductCard, { ProductCardSkeleton, type ProductSummary } from "@/component/ui/ProductCard";
import Reveal from "@/component/ui/Reveal";

type Sort = "new" | "price_asc" | "price_desc";

export default function CollectionPage({ category, query }: { category?: CategoryDef; query?: string }) {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [sort, setSort] = useState<Sort>("new");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ sort, limit: "120" });
    if (category) params.set("category", category.slug);
    if (sub) params.set("sub", sub);
    if (query) params.set("q", query);
    fetch(`/api/products?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => !cancelled && setProducts(Array.isArray(d) ? d : []))
      .catch(() => !cancelled && setProducts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [category, sub, sort, query]);

  const visible = useMemo(
    () => products.filter((p) => (!size || p.sizes.includes(size)) && (!inStockOnly || p.stock > 0)),
    [products, size, inStockOnly]
  );

  const sizes = category?.sizes ?? [];
  const subs = category?.subCategories ?? [];
  const activeCount = (sub ? 1 : 0) + (size ? 1 : 0) + (inStockOnly ? 1 : 0);

  const clear = () => {
    setSub("");
    setSize("");
    setInStockOnly(false);
  };

  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden bg-ink text-bone">
        {category && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
          </>
        )}
        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-20 lg:py-28">
          <p className="eyebrow text-brass-2 mb-4 animate-fade-up">{category ? "Collection" : "Search"}</p>
          <h1 className="display text-5xl lg:text-7xl animate-fade-up delay-100">
            {category ? category.title : query ? <>Results for &ldquo;{query}&rdquo;</> : "All products"}
          </h1>
          {category && <p className="mt-5 max-w-lg text-bone/70 leading-relaxed animate-fade-up delay-200">{category.blurb}</p>}
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 lg:py-14">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-bone-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setFiltersOpen((v) => !v)} className="lg:hidden btn-outline py-2.5 px-4">
              <SlidersHorizontal size={14} /> Filters {activeCount > 0 && `(${activeCount})`}
            </button>
            <p className="text-sm text-stone">{loading ? "Loading…" : `${visible.length} item${visible.length === 1 ? "" : "s"}`}</p>
          </div>

          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {subs.length > 0 && (
              <>
                <button onClick={() => setSub("")} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${!sub ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>All</button>
                {subs.map((s) => (
                  <button key={s} onClick={() => setSub(s === sub ? "" : s)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] border transition-colors ${sub === s ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>{s}</button>
                ))}
              </>
            )}
          </div>

          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field-box w-auto py-2.5 text-[11px] uppercase tracking-[0.2em]">
            <option value="new">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10 pt-8">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-8`}>
            <div className="flex items-center justify-between lg:hidden">
              <p className="eyebrow">Filters</p>
              <button onClick={() => setFiltersOpen(false)}><X size={18} /></button>
            </div>

            {subs.length > 0 && (
              <div className="lg:hidden">
                <p className="eyebrow text-[10px] text-stone mb-3">Type</p>
                <div className="flex flex-wrap gap-2">
                  {subs.map((s) => (
                    <button key={s} onClick={() => setSub(s === sub ? "" : s)} className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] border ${sub === s ? "bg-ink text-bone border-ink" : "border-bone-3"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <p className="eyebrow text-[10px] text-stone mb-3">{category?.sizeLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button key={s} onClick={() => setSize(s === size ? "" : s)} className={`min-w-[44px] px-3 py-2 text-xs border transition-colors ${size === s ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-ink w-4 h-4" />
              In stock only
            </label>

            {activeCount > 0 && <button onClick={clear} className="btn-ghost text-[10px] link-underline">Clear filters</button>}
          </aside>

          {/* Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 lg:gap-x-6">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : visible.length === 0 ? (
              <div className="card p-16 text-center">
                <p className="font-serif text-2xl mb-2">Nothing here yet.</p>
                <p className="text-sm text-stone mb-6">{activeCount > 0 ? "Try removing a filter." : "New pieces are added regularly — check back soon."}</p>
                {activeCount > 0 && <button onClick={clear} className="btn-outline">Clear filters</button>}
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 lg:gap-x-6">
                {visible.map((p, idx) => (
                  <Reveal key={p.id} delay={(idx % 3) * 70}>
                    <ProductCard product={p} priority={idx < 3} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
