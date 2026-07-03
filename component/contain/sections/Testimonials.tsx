'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Reveal from '@/sharecomponent/anim/Reveal';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  brand: string | null;
  isActive?: boolean;
}

const Testimonials: React.FC = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/testimonial')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Testimonial[]) => setItems(data.filter((t) => t.isActive !== false)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [items.length, next]);

  if (loading || items.length === 0) return null;

  const active = items[index];

  return (
    <section className="bg-[#9a8478] py-20 md:py-24">
      <Reveal className="max-w-3xl mx-auto px-6 text-center text-white">
        <div className="text-5xl font-serif leading-none mb-6 opacity-40">&ldquo;</div>
        <p key={active.id} className="text-lg md:text-2xl font-light leading-relaxed italic transition-opacity duration-500">
          {active.quote}
        </p>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">{active.author}</p>
          {active.brand && <p className="text-xs text-white/70 mt-1">{active.brand}</p>}
        </div>

        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
};

export default Testimonials;
