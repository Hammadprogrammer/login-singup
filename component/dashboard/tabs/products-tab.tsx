"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, ImagePlus, X, Star, Eye, EyeOff } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { CATEGORIES, COLORS, getCategoryByName } from "@/lib/site";
import { toast } from "@/component/ui/Toast";
import { PageHeader, StatCard, Spinner, Empty, Modal, Field } from "../ui";

interface Product {
  id: string; name: string; description: string | null; price: number; stock: number; imageUrls: string[];
  categories: string[]; subCategories: string[]; brands: string[]; colors: string[]; sizes: string[];
  isPublished: boolean; isFeatured: boolean; createdAt: string; updatedAt: string;
}

const EMPTY_FORM = { id: "", name: "", description: "", price: "", stock: "0", category: CATEGORIES[0].name, subCategory: "", brand: "", sizes: [] as string[], colors: [] as string[], isPublished: true, isFeatured: false, imageUrls: [] as string[] };

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | "low" | "out">("");
  const [editing, setEditing] = useState<typeof EMPTY_FORM | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/products?all=1&limit=200", { cache: "no-store" });
      setProducts(r.ok ? await r.json() : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.brands.join(" ").toLowerCase().includes(term) || p.subCategories.join(" ").toLowerCase().includes(term)) &&
        (!cat || p.categories.includes(cat)) &&
        (!stockFilter || (stockFilter === "out" ? p.stock === 0 : p.stock > 0 && p.stock <= 5))
    );
  }, [products, q, cat, stockFilter]);

  const stats = {
    total: products.length,
    published: products.filter((p) => p.isPublished).length,
    low: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    out: products.filter((p) => p.stock === 0).length,
    value: products.reduce((a, p) => a + p.price * p.stock, 0),
  };

  const quick = async (id: string, patch: Record<string, unknown>) => {
    setBusyId(id);
    try {
      const r = await fetch("/api/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Update failed");
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...d } : p)));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      const r = await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      if (!r.ok) return toast.error((await r.json()).error || "Delete failed");
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = (p: Product) =>
    setEditing({
      id: p.id, name: p.name, description: p.description || "", price: String(p.price), stock: String(p.stock),
      category: p.categories[0] || CATEGORIES[0].name, subCategory: p.subCategories[0] || "", brand: p.brands[0] || "",
      sizes: p.sizes, colors: p.colors, isPublished: p.isPublished, isFeatured: p.isFeatured, imageUrls: p.imageUrls,
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Shirts, trousers and shoes — prices, stock and visibility."
        action={<button onClick={() => setEditing({ ...EMPTY_FORM })} className="btn-ink py-2.5 px-5 text-[10px]"><Plus size={14} /> Add product</button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Products" value={stats.total} hint={`${stats.published} published`} />
        <StatCard label="Stock value" value={formatPrice(stats.value)} hint="Price × units on hand" accent="bg-brass" />
        <StatCard label="Low stock" value={stats.low} hint="5 or fewer units" accent="bg-[#1F2A44]" />
        <StatCard label="Out of stock" value={stats.out} accent="bg-oxblood" />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, brand, type…" className="field-box pl-10" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field-box">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)} className="field-box">
          <option value="">Any stock level</option>
          <option value="low">Low stock (≤5)</option>
          <option value="out">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <Empty title={products.length === 0 ? "No products yet" : "No matches"} text={products.length === 0 ? "Add your first shirt, trouser or pair of shoes." : "Adjust the search or filters."} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-stone bg-bone-2/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Sizes</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Visibility</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-3">
                {visible.map((p) => (
                  <tr key={p.id} className={`hover:bg-bone-2/40 ${busyId === p.id ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-11 bg-bone-2 overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.imageUrls[0] && <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{p.name}</p>
                          <p className="text-[11px] text-stone">{p.brands[0] || "—"} · updated {formatDate(p.updatedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><p>{p.categories[0]}</p><p className="text-[11px] text-stone">{p.subCategories[0] || "—"}</p></td>
                    <td className="px-4 py-3 text-xs text-ink-3">{p.sizes.join(" · ")}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <StockInput value={p.stock} onCommit={(n) => quick(p.id, { stock: n })} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title={p.isPublished ? "Published — click to hide" : "Hidden — click to publish"} onClick={() => quick(p.id, { isPublished: !p.isPublished })} className={`p-1.5 border ${p.isPublished ? "border-success/40 text-success" : "border-bone-3 text-stone"}`}>{p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                        <button title={p.isFeatured ? "Featured on home" : "Feature on home"} onClick={() => quick(p.id, { isFeatured: !p.isFeatured })} className={`p-1.5 border ${p.isFeatured ? "border-brass text-brass" : "border-bone-3 text-stone"}`}><Star size={14} fill={p.isFeatured ? "currentColor" : "none"} /></button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-bone-2" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => setDeleting(p)} className="p-2 hover:bg-oxblood/10 text-oxblood" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}

      {deleting && (
        <Modal title="Delete product" onClose={() => setDeleting(null)}>
          <p className="text-sm mb-6">Delete <strong>{deleting.name}</strong>? Its images are removed from Cloudinary. Past orders keep their line items.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleting(null)} className="btn-outline py-2.5 px-5 text-[10px]">Cancel</button>
            <button onClick={remove} disabled={busyId === deleting.id} className="btn py-2.5 px-5 text-[10px] bg-oxblood text-bone">{busyId === deleting.id && <Loader2 size={12} className="animate-spin" />} Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StockInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  const commit = () => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n) || n < 0) return setV(String(value));
    if (n !== value) onCommit(n);
  };
  return (
    <input
      type="number"
      min={0}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={`w-20 text-right field-box py-1.5 ${value === 0 ? "border-oxblood text-oxblood" : value <= 5 ? "border-brass" : ""}`}
    />
  );
}

function ProductForm({ initial, onClose, onSaved }: { initial: typeof EMPTY_FORM; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const def = getCategoryByName(form.category) || CATEGORIES[0];

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const toggle = (k: "sizes" | "colors", v: string) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const total = form.imageUrls.length + files.length + incoming.length;
    if (total > 6) return setError("A product can have at most 6 images");
    if (incoming.some((f) => f.size > 6 * 1024 * 1024)) return setError("Each image must be under 6 MB");
    setError(null);
    setFiles((p) => [...p, ...incoming]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.sizes.length === 0) return setError("Select at least one size");
    if (form.imageUrls.length + files.length === 0) return setError("Add at least one image");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      fd.append("subCategory", form.subCategory);
      fd.append("brand", form.brand);
      fd.append("sizes", form.sizes.join(","));
      fd.append("colors", form.colors.join(","));
      fd.append("isPublished", String(form.isPublished));
      fd.append("isFeatured", String(form.isFeatured));
      if (form.id) {
        fd.append("id", form.id);
        fd.append("imageUrls", form.imageUrls.join(","));
        files.forEach((f) => fd.append("newImages", f));
      } else {
        files.forEach((f) => fd.append("images", f));
      }
      const r = await fetch("/api/products", { method: form.id ? "PUT" : "POST", body: fd });
      const d = await r.json();
      if (!r.ok) return setError(d.error || "Save failed");
      toast.success(form.id ? "Product updated" : "Product created");
      onSaved();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={form.id ? "Edit product" : "New product"} onClose={onClose} wide>
      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <Field label="Name"><input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-box" placeholder="e.g. Oxford Cotton Shirt — White" /></Field>
          <Field label="Description"><textarea rows={4} maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field-box resize-none" placeholder="Fabric, fit, construction details…" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price"><input required type="number" min={1} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field-box" /></Field>
            <Field label="Stock (units)"><input required type="number" min={0} step={1} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="field-box" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "", sizes: [] })} className="field-box">
                {CATEGORIES.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="field-box">
                <option value="">—</option>
                {def.subCategories.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Brand / line" hint="Optional label shown above the product name"><input maxLength={60} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="field-box" placeholder="e.g. Monarch Tailoring" /></Field>
          <Field label={`${def.sizeLabel}s available`}>
            <div className="flex flex-wrap gap-2">
              {def.sizes.map((s) => (
                <button type="button" key={s} onClick={() => toggle("sizes", s)} className={`min-w-[44px] px-3 py-2 text-xs border ${form.sizes.includes(s) ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="Colours">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button type="button" key={c.name} onClick={() => toggle("colors", c.name)} className={`flex items-center gap-2 px-3 py-1.5 text-xs border ${form.colors.includes(c.name) ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: c.hex }} />{c.name}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="accent-ink w-4 h-4" /> Published (visible in store)</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-ink w-4 h-4" /> Featured on home page</label>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <p className="label">Images <span className="text-stone normal-case tracking-normal">({form.imageUrls.length + files.length}/6)</span></p>
          <div className="grid grid-cols-3 gap-2">
            {form.imageUrls.map((u) => (
              <div key={u} className="relative aspect-[3/4] bg-bone-2 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, imageUrls: form.imageUrls.filter((x) => x !== u) })} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
              </div>
            ))}
            {previews.map((u, i) => (
              <div key={u} className="relative aspect-[3/4] bg-bone-2 overflow-hidden group ring-1 ring-brass">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
              </div>
            ))}
            {form.imageUrls.length + files.length < 6 && (
              <button type="button" onClick={() => fileRef.current?.click()} className="aspect-[3/4] border border-dashed border-bone-3 hover:border-ink flex flex-col items-center justify-center text-stone hover:text-ink text-[10px] uppercase tracking-wider">
                <ImagePlus size={20} className="mb-2" /> Add
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <p className="text-[11px] text-stone">JPG, PNG, WEBP or AVIF · up to 6 MB each. First image is the cover. Uploaded to Cloudinary under <code>mens_store/products</code>.</p>

          {error && <p className="text-sm text-oxblood bg-oxblood/5 border border-oxblood/20 px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-3 text-[10px]">Cancel</button>
            <button type="submit" disabled={saving} className="btn-ink flex-1 py-3 text-[10px]">{saving && <Loader2 size={12} className="animate-spin" />} {form.id ? "Save changes" : "Create product"}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
