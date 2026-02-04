'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ImageOff, SlidersHorizontal, Heart, ChevronDown, Check, X } from 'lucide-react';
import Link from 'next/link';

// Interface mein categories add kar di hain filtering ke liye
interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  imageUrls: string[];
  categories: string[]; 
}

interface ProductTemplateProps {
  targetCategory?: string; // Optional: Agar category pass nahi karenge to saare products dikhayega
  pageTitle: string;
}

const API_ROUTE = '/api/products';
const FAVORITE_API = '/api/favorites';

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 animate-pulse p-10">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col">
        <div className="aspect-[3/4] bg-gray-100 rounded-sm mb-3"></div>
        <div className="h-2 bg-gray-100 w-1/3 mb-2 mx-auto"></div>
        <div className="h-3 bg-gray-100 w-2/3 mx-auto"></div>
      </div>
    ))}
  </div>
);

const ProductTemplate = ({ targetCategory, pageTitle }: ProductTemplateProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cols, setCols] = useState(4);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch and Filter Logic
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_ROUTE);
        const data: Product[] = await res.json();
        
        // Agar targetCategory di gayi hai to filter karo, warna pura data dikhao
        if (targetCategory) {
          const filtered = data.filter(p => 
            p.categories && p.categories.includes(targetCategory)
          );
          setProducts(filtered);
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [targetCategory]);

  // Favorites logic (Same as before)
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(FAVORITE_API);
        const data = await res.json();
        if (!data.error) {
          setFavorites(data.map((f: any) => f.product.id));
        }
      } catch (err) { console.error(err); }
    };
    fetchFavorites();
  }, []);

  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (sortBy === 'low-to-high') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'high-to-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, sortBy]);

  const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (processingIds.includes(productId)) return;
    setProcessingIds(prev => [...prev, productId]);

    try {
      const action = favorites.includes(productId) ? 'remove' : 'add';
      const res = await fetch(FAVORITE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });
      const data = await res.json();
      if (!data.error) {
        if (action === 'add') setFavorites(prev => [...prev, productId]);
        else setFavorites(prev => prev.filter(id => id !== productId));
      } else { setShowAuthModal(true); }
    } catch (err) { console.error(err); } finally {
      setProcessingIds(prev => prev.filter(id => id !== productId));
    }
  };

  return (
    <div className="w-full bg-white font-sans text-[#1a1a1a]">
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-32">
          <div className="fixed inset-0 bg-rose-900/10 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-sm p-10 text-center shadow-xl rounded-2xl border border-rose-50">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-rose-300 hover:text-rose-500"><X size={22} /></button>
            <Heart size={32} className="mx-auto mb-6 text-pink-500 fill-pink-500/20" />
            <h2 className="text-[16px] uppercase tracking-widest font-semibold mb-3">Save to Wishlist</h2>
            <Link href="/login" className="block bg-pink-500 text-white text-[12px] uppercase tracking-widest py-4 rounded-full font-bold">Sign In Now</Link>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-5 flex items-center justify-between">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-[10px] uppercase font-bold">
              <SlidersHorizontal size={14} /> Sort <ChevronDown size={12} />
            </button>
            {showFilters && (
              <div className="absolute top-full left-0 mt-4 w-56 bg-white border shadow-xl py-3 rounded-sm">
                {['Recommended', 'Price: Low to High', 'Price: High to Low'].map((label, idx) => {
                  const id = ['default', 'low-to-high', 'high-to-low'][idx];
                  return (
                    <button key={id} onClick={() => { setSortBy(id as any); setShowFilters(false); }} className="w-full flex items-center justify-between px-5 py-3 text-[10px] uppercase hover:bg-gray-50">
                      <span className={sortBy === id ? 'font-bold' : 'text-gray-500'}>{label}</span>
                      {sortBy === id && <Check size={12} />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-[18px] md:text-[24px] tracking-[0.5em] uppercase font-extralight">{pageTitle}</h1>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {[6, 4, 2].map(num => (
              <button key={num} onClick={() => setCols(num)} className={`p-1 transition-all ${cols === num ? 'opacity-100' : 'opacity-20'}`}>
                <div className={`grid ${num === 6 ? 'grid-cols-3' : num === 4 ? 'grid-cols-2' : 'flex'} gap-0.5`}>
                  {[...Array(num === 2 ? 2 : num)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black"></div>)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* GRID SECTION */}
      <main className="max-w-[1600px] mx-auto px-2 md:px-10 py-8">
        {loading ? <LoadingSkeleton /> : (
          <div className={`grid transition-all duration-700 ${
            cols === 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4' : 
            cols === 4 ? 'grid-cols-2 lg:grid-cols-4 gap-10' : 'grid-cols-2 gap-12'
          }`}>
            {sortedProducts.map((product) => (
              <div key={product.id} className="group flex flex-col relative">
                <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
                  <img src={product.imageUrls[0]} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {targetCategory === "NEW IN" && <div className="absolute top-3 left-3 bg-black text-white text-[8px] px-2 py-1 uppercase">New</div>}
                </Link>
                <button onClick={(e) => toggleFavorite(e, product.id)} className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                  <Heart size={18} className={favorites.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                </button>
                <div className="mt-4 text-center px-2">
                  <span className="text-[9px] tracking-widest uppercase text-gray-400 block mb-1">{product.brand || 'Elite'}</span>
                  <h3 className="text-[11px] tracking-widest uppercase font-light line-clamp-1">{product.name}</h3>
                  <p className="mt-2 text-[13px] font-medium italic">{product.price} USDT</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductTemplate;