'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PromoBanner {
  id: number;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  link: string | null;
  image: string | null;
  bgColor: string | null;
  size: string;
  order: number;
}

const PromoGrid: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/promo-banner');
        if (res.ok) {
          const data: PromoBanner[] = await res.json();
          setBanners(data);
        }
      } catch {
        // silent fail — section just won't render
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[260px] animate-pulse">
          <div className="md:row-span-2 bg-zinc-100 rounded-sm" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-100 rounded-sm" />
          ))}
        </div>
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[260px]">
        {banners.map((b) => {
          const isLarge = b.size === 'large';
          return (
            <Link
              key={b.id}
              href={b.link || '/'}
              className={`group relative overflow-hidden rounded-sm flex flex-col justify-between p-7 ${
                isLarge ? 'md:row-span-2' : ''
              }`}
              style={!b.image ? { backgroundColor: b.bgColor || '#9a8478' } : undefined}
            >
              {/* Background image + overlay */}
              {b.image && (
                <>
                  <img
                    src={b.image}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                </>
              )}

              {/* Content */}
              <div className={`relative z-10 ${!b.image ? 'text-center m-auto' : ''}`}>
                <h3
                  className={`font-semibold tracking-tight text-white drop-shadow-sm ${
                    !b.image ? 'text-3xl md:text-4xl tracking-[0.15em] uppercase' : 'text-lg md:text-xl'
                  }`}
                >
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="mt-1 text-[13px] font-medium text-white/80">{b.subtitle}</p>
                )}
              </div>

              {b.buttonText && (
                <div className={`relative z-10 ${!b.image ? 'text-center' : ''}`}>
                  <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-white border-b border-white/60 pb-1 transition-all group-hover:gap-3">
                    {b.buttonText} <ArrowRight size={13} />
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PromoGrid;
