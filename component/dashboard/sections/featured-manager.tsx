'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, Loader2, ImageOff, Search } from 'lucide-react';

interface AdminProduct {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

export const FeaturedManager = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/featured?all=1');
      if (!res.ok) throw new Error('Failed to fetch products');
      setProducts(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggle = async (p: AdminProduct) => {
    setBusy(p.id);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, isFeatured: !p.isFeatured }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || b.message || 'Update failed');
      }
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: !x.isFeatured } : x));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const featuredCount = products.filter(p => p.isFeatured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl"><Star className="w-6 h-6 text-indigo-400" /></div>
        <div>
          <h2 className="text-xl font-black text-white">Featured Products</h2>
          <p className="text-slate-400 text-sm">Star products to show them in the homepage &ldquo;Featured Products&rdquo; section. ({featuredCount} featured)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-red-400 text-sm font-medium">{error}</div>
      )}

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0b1120] border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-2xl">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className={`bg-[#0f172a] border rounded-2xl overflow-hidden shadow-sm transition ${p.isFeatured ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800'}`}>
              <div className="aspect-[3/4] bg-[#0b1120] relative">
                {p.imageUrls?.[0]
                  ? <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full text-slate-700"><ImageOff size={24} /></div>}
                {!p.isPublished && (
                  <span className="absolute top-2 left-2 text-[8px] font-black uppercase bg-slate-700 text-white px-2 py-0.5 rounded-full">Draft</span>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                <p className="text-xs text-slate-400 mb-3">{p.price} USDT</p>
                <button
                  onClick={() => toggle(p)}
                  disabled={busy === p.id}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                    p.isFeatured ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {busy === p.id ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className={p.isFeatured ? 'fill-white' : ''} />}
                  {p.isFeatured ? 'Featured' : 'Make Featured'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedManager;
