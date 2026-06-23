'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Reveal, { StaggerGroup, StaggerItem } from '@/sharecomponent/anim/Reveal';

interface SaleBanner {
  id: number;
  image: string | null;
  heading: string;
  subheading: string | null;
  buttonText: string | null;
  link: string | null;
}

interface Inspiration {
  id: number;
  image: string;
  link: string | null;
}

const SaleShowcase: React.FC = () => {
  const [banner, setBanner] = useState<SaleBanner | null>(null);
  const [inspiration, setInspiration] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/sale-banner').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/dashboard/inspiration').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([banners, insp]) => {
        setBanner(Array.isArray(banners) && banners.length > 0 ? banners[0] : null);
        setInspiration(Array.isArray(insp) ? insp : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!banner && inspiration.length === 0) return null;

  return (
    <section className="w-full">
      {/* SALE BANNER */}
      {banner && (
        <div
          className="relative w-full min-h-[420px] md:min-h-[520px] flex items-center bg-zinc-900 bg-cover bg-center bg-fixed"
          style={banner.image ? { backgroundImage: `url(${banner.image})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 md:px-12 flex justify-end">
            <Reveal direction="left" className="bg-white/95 backdrop-blur-sm p-8 md:p-12 max-w-md shadow-2xl">
              <p className="text-[11px] tracking-[0.3em] uppercase text-pink-600 font-bold mb-3">Limited Time</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">{banner.heading}</h2>
              {banner.subheading && (
                <p className="mt-4 text-sm text-zinc-600 leading-relaxed">{banner.subheading}</p>
              )}
              {banner.buttonText && (
                <Link href={banner.link || '/'} className="mt-8 inline-flex items-center gap-2 bg-zinc-900 text-white text-[12px] font-bold uppercase tracking-[0.15em] px-7 py-3.5 rounded-full hover:bg-pink-600 transition-colors">
                  {banner.buttonText} <ArrowRight size={14} />
                </Link>
              )}
            </Reveal>
          </div>
        </div>
      )}

      {/* INSPIRATION GRID */}
      {inspiration.length > 0 && (
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-5 gap-0">
          {inspiration.map((img) => (
            <StaggerItem key={img.id}>
            <Link href={img.link || '/'} className="group relative block aspect-square overflow-hidden bg-zinc-100">
              <img src={img.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </section>
  );
};

export default SaleShowcase;
