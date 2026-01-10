'use client';

import React, { useEffect, useState } from 'react';
import { Heart, ImageOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  imageUrls: string[];
}

interface Favorite {
  id: number;
  product: Product;
}

const FAVORITE_API = '/api/favorites';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch(FAVORITE_API);
      const data = await res.json();
      if (!data.error) setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const toggleFavorite = async (productId: string) => {
    const prev = [...favorites];
    setFavorites(favorites.filter(f => f.product.id !== productId));

    try {
      const res = await fetch(FAVORITE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: 'remove' }),
      });
      const data = await res.json();
      if (data.error) setFavorites(prev);
    } catch {
      setFavorites(prev);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9FA]">
        <Heart className="text-rose-300 fill-rose-300 animate-pulse" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA]  overflow-x-hidden relative">
      {/* BACKGROUND DECORATION - Adjusted Opacity and Placement */}
      <div className="fixed -top-32 -right-24 w-[500px] h-[500px] bg-rose-200/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 -left-24 w-80 h-80 bg-pink-200/10 rounded-full blur-[100px] pointer-events-none" />

      {/* MAIN CONTAINER - Increased Top Padding (pt-32) */}
      <div className="max-w-7xl mx-auto px-6 pt-32 md:pt-40">
        
        {/* HEADER - Adjusted Margins */}
        <header className="text-center mb-20 md:mb-28">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[40px] mt-[30px] font-light tracking-tight text-rose-950 mb-4"
          >
             <span className="font-serif italic text-black">My Favorites</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="h-[1px] w-8 bg-rose-200" />
            <p className="text-[11px] md:text-[14px] uppercase tracking-[0.4em] text-rose-400 font-medium">
              {favorites.length} Saved Product
            </p>
            <div className="h-[1px] w-8 bg-rose-200" />
          </motion.div>
        </header>

        {/* EMPTY STATE */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-12"
          >
            <div className="relative bottom-[90px] w-full max-w-sm bg-white/60 p-10 text-center rounded-[2.5rem] border border-rose-50 backdrop-blur-md shadow-[0_20px_50px_rgba(255,182,193,0.15)]">
              <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-rose-50 rounded-full">
                <Heart
                  size={32}
                  className="text-pink-500 fill-pink-500/20"
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="text-[14px] uppercase tracking-[0.25em] font-bold mb-4 text-rose-950">
                Your boutique is empty
              </h2>

              <p className="text-[13px] text-rose-700/70 leading-relaxed mb-8 italic">
                “Fall in love with something special. <br/> Your wishlist is waiting.”
              </p>

              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="bg-pink-500 text-white text-[12px] uppercase tracking-widest py-4 rounded-full hover:bg-pink-600 shadow-lg shadow-pink-200 transition-all font-bold active:scale-95"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          /* PRODUCT GRID - Optimized Spacing */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 relative bottom-[60px] ">
            <AnimatePresence mode="popLayout">
              {favorites.map((fav, index) => {
                const product = fav.product;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >





                    <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-white border border-rose-100/50 shadow-sm group-hover:shadow-xl group-hover:shadow-rose-200/40 transition-all duration-500">
                     
                     
                     
                     
                     
                     
                      <Link href={`/product/${product.id}`}>
                        {product.imageUrls?.[0] ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-rose-200">
                            <ImageOff size={32} />
                          </div>
                        )}
                      </Link>

                      {/* Remove Button - Subtle glassmorphism */}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-6 text-center px-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-rose-300 block mb-2 font-medium">
                        {product.brand || 'Exclusive Selection'}
                      </span>
                      <h3 className="text-[15px] text-rose-950 mb-3 font-medium line-clamp-1">
                        <Link href={`/product/${product.id}`} className="hover:text-rose-500 transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-rose-100 shadow-sm">
                        <span className="text-sm font-bold text-rose-900">{product.price}</span>
                        <span className="text-[9px] font-bold text-rose-400 mt-0.5">USDT</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;