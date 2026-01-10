'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ImageOff, SlidersHorizontal, Heart, ChevronDown, Check, X } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  imageUrls: string[];
}

const API_ROUTE = '/api/products';
const FAVORITE_API = '/api/favorites';

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col">
        <div className="aspect-[3/4] bg-gray-100 rounded-sm mb-3"></div>
        <div className="h-2 bg-gray-100 w-1/3 mb-2 mx-auto"></div>
        <div className="h-3 bg-gray-100 w-2/3 mx-auto"></div>
      </div>
    ))}
  </div>
);

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cols, setCols] = useState(4); // Grid columns state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_ROUTE);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch(FAVORITE_API);
        const data = await res.json();
        if (!data.error) {
          const favIds = data.map((f: any) => f.product.id);
          setFavorites(favIds);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, []);

  // Dropdown close logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedProducts = useMemo(() => {
    let result = [...products];
    if (sortBy === 'low-to-high') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'high-to-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, sortBy]);

  const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); // Link click prevent karne ke liye
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
      } else {
        setShowAuthModal(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== productId));
    }
  };

  const sortOptions = [
    { id: 'default', label: 'Recommended' },
    { id: 'low-to-high', label: 'Price: Low to High' },
    { id: 'high-to-low', label: 'Price: High to Low' }
  ];

  return (
    <div className="w-full bg-white font-sans text-[#1a1a1a]">
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 pt-32"> 
          <div className="fixed inset-0 bg-rose-900/10 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-sm p-10 text-center shadow-[0_20px_50px_rgba(255,182,193,0.3)] rounded-2xl animate-in fade-in zoom-in duration-500 border border-rose-50">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-rose-300 hover:text-rose-500 transition-colors">
              <X size={22} strokeWidth={1.5} />
             
            </button>
            <div className="relative mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-rose-50 rounded-full">
              <Heart size={32} className="text-pink-500 fill-pink-500/20" strokeWidth={1.5} />
            </div>
            <h2 className="text-[16px] uppercase tracking-[0.2em] font-semibold mb-3 text-rose-950">Save to Wishlist</h2>
            <p className="text-[13px] text-rose-700/70 leading-relaxed mb-8 font-normal italic">
              "Join our community of style. Sign in to keep your favorite pieces."
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/login" className="bg-pink-500 text-white text-[12px] uppercase tracking-widest py-4 rounded-full hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all font-bold active:scale-95 text-center">
                Sign In Now
              </Link>
              <button onClick={() => setShowAuthModal(false)} className="text-[11px] uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors py-2 font-medium">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-5 flex items-center justify-between">
          
          {/* SORT DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
              <SlidersHorizontal size={14} className={showFilters ? 'rotate-90 transition-transform' : ''} />
              <span>Sort By</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {showFilters && (
              <div className="absolute top-full left-0 mt-4 w-56 bg-white border border-gray-100 shadow-xl py-3 rounded-sm animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map((option) => (
                  <button key={option.id} onClick={() => { setSortBy(option.id as any); setShowFilters(false); }} className="w-full flex items-center justify-between px-5 py-3 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors">
                    <span className={sortBy === option.id ? 'font-bold' : 'font-light text-gray-500'}>{option.label}</span>
                    {sortBy === option.id && <Check size={12} className="text-black" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LOGO */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-[18px] md:text-[26px] tracking-[0.5em] uppercase font-extralight bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">Ski Trip</h1>
          </div>

          {/* COLUMN SELECTOR (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-6">
             {/* 6 Columns */}
             <button onClick={() => setCols(6)} className={`p-1 transition-all ${cols === 6 ? 'opacity-100 scale-110' : 'opacity-20 hover:opacity-50'}`}>
              <div className="grid grid-cols-3 gap-0.5">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 bg-black"></div>)}
              </div>
            </button>

            {/* 4 Columns */}
            <button onClick={() => setCols(4)} className={`p-1 transition-all ${cols === 4 ? 'opacity-100 scale-110' : 'opacity-20 hover:opacity-50'}`}>
              <div className="grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black"></div>)}
              </div>
            </button>

            {/* 2 Columns */}
            <button onClick={() => setCols(2)} className={`p-1 transition-all ${cols === 2 ? 'opacity-100 scale-110' : 'opacity-20 hover:opacity-50'}`}>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-4 bg-black"></div>
                <div className="w-2.5 h-4 bg-black"></div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* GRID */}
      <main className="max-w-[1600px] mx-auto px-2 md:px-10 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className={`grid transition-all duration-700 ease-in-out ${
            cols === 6 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-2 gap-y-8 md:gap-x-4 md:gap-y-12'
            : cols === 4 
            ? 'grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-10 md:gap-x-10 md:gap-y-20' 
            : 'grid-cols-2 gap-x-2 gap-y-10 md:gap-x-12 md:gap-y-24'
          }`}>
            {sortedProducts.map((product) => {
              const isProcessing = processingIds.includes(product.id);
              const isFavorited = favorites.includes(product.id);

              return (
                <div key={product.id} className="group flex flex-col relative">
                  <Link href={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
                    {product.imageUrls?.[0] ? (
                      <>
                        <img src={product.imageUrls[0]} alt={product.name} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${product.imageUrls[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />
                        {product.imageUrls[1] && (
                          <img src={product.imageUrls[1]} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out scale-105 group-hover:scale-100" />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-200"><ImageOff size={24} /></div>
                    )}
                  </Link>

                  {/* FAVORITE BUTTON */}
                  <button
                    onClick={(e) => toggleFavorite(e, product.id)}
                    disabled={isProcessing}
                    className={`absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all 
                      bg-white/80 backdrop-blur-sm border border-pink-100/50 hover:bg-white
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:scale-110 shadow-sm'}`}
                  >
                    <Heart 
                      size={18} 
                      className={`transition-colors duration-300 ${isFavorited ? 'text-[#f43f5e] fill-[#f43f5e]' : 'text-gray-400'}`} 
                      strokeWidth={2} 
                    />
                  </button>

                  <div className="mt-4 text-center px-2">
                    <span className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-gray-400 block mb-1">{product.brand || 'Elite Winter'}</span>
                    <h3 className="text-[10px] md:text-[12px] tracking-widest uppercase font-light text-gray-800 line-clamp-1">{product.name}</h3>
                    <p className="mt-3 text-[11px] md:text-[14px] font-medium italic text-gray-600">{product.price} USDT</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductGrid;