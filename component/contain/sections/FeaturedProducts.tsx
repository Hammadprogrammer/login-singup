'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ImageOff, ArrowRight } from 'lucide-react';

interface FeaturedProduct {
  id: number;
  title: string;
  price: string | null;
  image: string | null;
  brand: string | null;
  link: string | null;
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/featured-product')
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-zinc-100 rounded-sm mb-3" />
              <div className="h-2 bg-zinc-100 w-1/3 mx-auto mb-2" />
              <div className="h-3 bg-zinc-100 w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
      <h2 className="text-center text-[22px] md:text-[26px] font-semibold tracking-tight text-zinc-900 mb-12">
        Featured Products
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
        {products.map((p) => (
          <Link key={p.id} href={p.link || '/'} className="group flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f7f7]">
              {p.image ? (
                <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-200"><ImageOff size={24} /></div>
              )}
            </div>
            <div className="mt-4 text-center px-2">
              <span className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-zinc-400 block mb-1">{p.brand || 'Featured'}</span>
              <h3 className="text-[10px] md:text-[12px] tracking-widest uppercase font-light text-zinc-800 line-clamp-1">{p.title}</h3>
              {p.price && <p className="mt-2 text-[11px] md:text-[14px] font-medium italic text-zinc-600">{p.price}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* See all products button */}
      <div className="flex justify-center mt-12">
        <Link
          href="/new-in"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-800 transition-colors hover:border-pink-500 hover:text-pink-600"
        >
          See all products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
