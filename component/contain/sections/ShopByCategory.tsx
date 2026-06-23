'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Reveal, { StaggerGroup, StaggerItem } from '@/sharecomponent/anim/Reveal';

interface Category {
  id: number;
  name: string;
  image: string | null;
  link: string | null;
}

const ShopByCategory: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/category')
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="flex justify-center gap-8 animate-pulse">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-20 h-20 rounded-full bg-zinc-100" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-16">
      <Reveal>
        <h2 className="text-center text-[22px] md:text-[26px] font-semibold tracking-tight text-zinc-900 mb-12">
          Shop by Category
        </h2>
      </Reveal>
      <StaggerGroup className="flex flex-wrap justify-center gap-x-8 gap-y-10 md:gap-x-12">
        {items.map((c) => (
          <StaggerItem key={c.id}>
          <Link href={c.link || '/'} className="group flex flex-col items-center w-20 md:w-24">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-100 ring-1 ring-zinc-200 transition-all duration-300 group-hover:ring-2 group-hover:ring-zinc-900">
              {c.image ? (
                <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-zinc-200" />
              )}
            </div>
            <span className="mt-3 text-[11px] md:text-xs font-medium text-zinc-700 text-center tracking-wide line-clamp-1 group-hover:text-zinc-900">
              {c.name}
            </span>
          </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
};

export default ShopByCategory;
