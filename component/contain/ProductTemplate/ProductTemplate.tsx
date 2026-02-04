'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, Heart, ChevronDown, Check, X, ImageOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

// --- CONFIGURATION DATA ---
const BRAND_DATA: Record<string, string[]> = {
  "NEW IN": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire"],
  "READY TO WEAR": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire", "Gul Ahmed", "Limelight", "J.", "Generation"],
  "COUTURE": ["Elan", "Asim Jofa", "Faraz Manan", "HSY", "Zara Shahjahan", "Faiza Saqlain", "Tena Durrani"],
  "WINTER EDIT": ["Bareeze", "Nishat Linen", "Bonanza Satrangi", "Alkaram Studio"],
  "UNSTITCHED": ["Kayseria", "Firdous", "Bin Saeed", "Zellbury"],
  "ACCESSORIES": ["Gucci", "Rolex", "Charles & Keith", "Hublot", "Pandora", "Aldo"]
};

const COLOR_PALETTE = [
  { name: "Red", hex: "#FF0000" }, { name: "Orange", hex: "#FFA500" },
  { name: "Yellow", hex: "#FFFF00" }, { name: "Green", hex: "#008000" },
  { name: "Blue", hex: "#0000FF" }, { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" }, { name: "Brown", hex: "#A52A2A" },
  { name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" }, { name: "Navy", hex: "#000080" }
];

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "FREE SIZE"];

// --- GRID ICONS ---
const GridIcon = ({ cols, active }: { cols: number; active: boolean }) => {
  if (cols === 2) return (
    <div className="flex gap-0.5">
      <div className={`w-2.5 h-4 ${active ? 'bg-black' : 'bg-gray-200'}`}></div>
      <div className={`w-2.5 h-4 ${active ? 'bg-black' : 'bg-gray-200'}`}></div>
    </div>
  );
  if (cols === 4) return (
    <div className="grid grid-cols-2 gap-0.5">
      {[...Array(4)].map((_, i) => <div key={i} className={`w-1.5 h-1.5 ${active ? 'bg-black' : 'bg-gray-200'}`}></div>)}
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {[...Array(6)].map((_, i) => <div key={i} className={`w-1 h-1 ${active ? 'bg-black' : 'bg-gray-200'}`}></div>)}
    </div>
  );
};

interface Product {
  id: string;
  name: string;
  brands?: string[];
  price: number;
  imageUrls: string[];
  categories: string[];
  subCategories: string[];
  productTypes: string[];
  sizes?: string[];
  isPublished: boolean;
}

interface ProductTemplateProps {
  targetCategory?: string;
  targetSubCategory?: string;
  targetProductType?: string;
  pageTitle: string;
}

const ProductTemplate = ({ targetCategory, targetSubCategory, pageTitle }: ProductTemplateProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cols, setCols] = useState(4);
  const [showSort, setShowSort] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [processingFavs, setProcessingFavs] = useState<string[]>([]);
  
  const [sortBy, setSortBy] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice] = useState<number>(100000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, favRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/favorites')
        ]);
        
        const prodData = await prodRes.json();
        let filtered = prodData.filter((p: Product) => p.isPublished);
        if (targetCategory) filtered = filtered.filter((p: Product) => p.categories?.includes(targetCategory));
        if (targetSubCategory) filtered = filtered.filter((p: Product) => p.subCategories?.includes(targetSubCategory));
        
        setProducts(filtered);

        const favData = await favRes.json();
        if (!favData.error) setFavorites(favData.map((f: any) => f.productId || f.product?.id));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [targetCategory, targetSubCategory]);

  const toggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (processingFavs.includes(productId)) return;
    setProcessingFavs(prev => [...prev, productId]);

    try {
      const isFav = favorites.includes(productId);
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action: isFav ? 'remove' : 'add' }),
      });
      const data = await res.json();

      if (res.ok && !data.error) {
        setFavorites(prev => isFav ? prev.filter(id => id !== productId) : [...prev, productId]);
      } else if (res.status === 401 || data.error) {
        setShowAuthModal(true);
      }
    } catch (err) { console.error(err); } finally {
      setProcessingFavs(prev => prev.filter(id => id !== productId));
    }
  };

  const finalProducts = useMemo(() => {
    let result = products.filter(p => {
      const brandMatch = selectedBrands.length === 0 || p.brands?.some(b => selectedBrands.includes(b));
      const sizeMatch = selectedSizes.length === 0 || p.sizes?.some(s => selectedSizes.includes(s));
      return brandMatch && sizeMatch && p.price <= maxPrice;
    });

    if (sortBy === 'low-to-high') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'high-to-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, sortBy, selectedBrands, selectedSizes, maxPrice]);

  return (
    <div className="relative w-full bg-white text-black min-h-screen font-sans">
      
      {/* 1. AUTH MODAL - Highest Priority */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center px-4"> 
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-sm p-10 text-center shadow-2xl rounded-2xl border border-gray-100">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-black">
              <X size={22} strokeWidth={1.5} />
            </button>
            <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-rose-50 rounded-full">
              <Heart size={30} className="text-pink-500 fill-pink-500/10" />
            </div>
            <h2 className="text-[16px] uppercase tracking-[0.2em] font-semibold mb-2">Save to Wishlist</h2>
            <p className="text-[12px] text-gray-400 mb-8 italic">Sign in to keep your favorite pieces.</p>
            <Link href="/login" className="block w-full bg-black text-white text-[11px] uppercase tracking-widest py-4 rounded-full font-bold hover:bg-zinc-800 transition-all">
              Sign In Now
            </Link>
          </div>
        </div>
      )}

      {/* 2. SIDEBAR DRAWER - Above everything else */}
      <div className={`fixed inset-0 z-[11000] transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        <aside className={`absolute top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl transition-transform duration-500 ease-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full uppercase tracking-[0.15em] text-[11px] font-medium">
            <div className="flex items-center justify-between p-8 border-b">
              <span className="text-[14px] font-bold">Filters</span>
              <button onClick={() => setShowSidebar(false)}><X size={24} strokeWidth={1} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-12">
              <div>
                <h3 className="mb-6 border-l-2 border-black pl-3 font-bold">Designers</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(BRAND_DATA[targetCategory || "READY TO WEAR"] || BRAND_DATA["READY TO WEAR"]).map(brand => (
                    <button key={brand} onClick={() => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])} 
                      className={`text-left p-3 border text-[9px] transition-all ${selectedBrands.includes(brand) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}>
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-6 border-l-2 border-black pl-3 font-bold">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(size => (
                    <button key={size} onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                      className={`py-3 border text-[10px] text-center transition-all ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-6 border-l-2 border-black pl-3 font-bold">Palette</h3>
                <div className="grid grid-cols-4 gap-4">
                  {COLOR_PALETTE.map(color => (
                    <button key={color.name} onClick={() => setSelectedColors(prev => prev.includes(color.name) ? prev.filter(c => c !== color.name) : [...prev, color.name])}
                      className={`w-8 h-8 rounded-full border transition-all ${selectedColors.includes(color.name) ? 'ring-2 ring-black ring-offset-2' : 'border-gray-200'}`} style={{ backgroundColor: color.hex }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t grid grid-cols-2 gap-4">
              <button onClick={() => {setSelectedBrands([]); setSelectedColors([]); setSelectedSizes([]);}} className="py-4 border border-black uppercase font-bold text-[10px]">Reset</button>
              <button onClick={() => setShowSidebar(false)} className="py-4 bg-black text-white uppercase font-bold text-[10px]">Apply</button>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. STICKY NAV - Fixed Z-index to stay on top of products but below drawer */}
      <nav className="sticky top-0 z-[50] bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <button onClick={() => setShowSidebar(true)} className="flex items-center gap-3 text-[10px] md:text-[11px] uppercase tracking-widest font-black">
              <SlidersHorizontal size={16} /> Filter
            </button>
            <div className="relative">
              <button onClick={() => setShowSort(!showSort)} className="text-[10px] md:text-[11px] uppercase tracking-widest font-black flex items-center gap-2">
                Sort <ChevronDown size={14} className={showSort ? 'rotate-180 transition-transform' : ''} />
              </button>
              {showSort && (
                <div className="absolute top-full left-0 mt-5 w-56 bg-white border border-gray-100 shadow-2xl py-2">
                  {['default', 'low-to-high', 'high-to-low'].map((s) => (
                    <button key={s} onClick={() => {setSortBy(s as any); setShowSort(false);}} className="w-full px-6 py-4 text-left text-[9px] uppercase tracking-[0.2em] hover:bg-gray-50 flex justify-between items-center">
                      {s.replace('-', ' ')} {sortBy === s && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Heading - properly contained */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
             <h1 className="text-xl md:text-3xl font-light tracking-[0.5em] uppercase font-serif text-center bg-gradient-to-b from-black to-gray-400 bg-clip-text text-transparent">
               {pageTitle || "NEW IN"}
             </h1>
          </div>

          <div className="hidden lg:flex items-center gap-8 border-l pl-8 border-gray-100">
            {[6, 4, 2].map(n => (
              <button key={n} onClick={() => setCols(n)} className="hover:scale-110 transition-transform">
                <GridIcon cols={n} active={cols === n} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* PRODUCT GRID - Stays behind navbar */}
      <main className="relative z-0 max-w-[1800px] mx-auto px-4 md:px-12 py-12">
        {loading ? (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 animate-pulse">
             {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-50 rounded-sm" />)}
           </div>
        ) : finalProducts.length === 0 ? (
          <div className="text-center py-40">
            <p className="text-gray-400 uppercase tracking-widest text-[11px]">No items found matching your selection.</p>
          </div>
        ) : (
          <div className={`grid transition-all duration-700 ease-in-out ${
            cols === 6 ? 'grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-12' : 
            cols === 4 ? 'grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16' : 'grid-cols-2 gap-x-4 md:gap-x-12 gap-y-24'
          }`}>
            {finalProducts.map((p) => {
              const isFav = favorites.includes(p.id);
              const isProcessing = processingFavs.includes(p.id);

              return (
                <div key={p.id} className="group flex flex-col relative">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
                    <Link href={`/product/${p.id}`} className="block w-full h-full">
                      {p.imageUrls?.[0] ? (
                        <>
                          <img 
                            src={p.imageUrls[0]} 
                            alt={p.name} 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${p.imageUrls[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} 
                          />
                          {p.imageUrls[1] && (
                            <img 
                              src={p.imageUrls[1]} 
                              alt={p.name} 
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100" 
                            />
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-200"><ImageOff size={24} /></div>
                      )}
                    </Link>
                    
                    <button 
                      onClick={(e) => toggleFavorite(e, p.id)}
                      disabled={isProcessing}
                      className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-transform active:scale-90"
                    >
                      {isProcessing ? (
                        <Loader2 size={16} className="animate-spin text-gray-400" />
                      ) : (
                        <Heart 
                          size={18} 
                          className={`transition-colors duration-300 ${isFav ? 'fill-[#f43f5e] text-[#f43f5e]' : 'text-gray-400 hover:text-black'}`} 
                        />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-8 flex flex-col items-center text-center space-y-2">
                    <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-bold">{p.brands?.[0] || 'ELITE'}</span>
                    <h3 className="text-[11px] md:text-[12px] tracking-widest uppercase font-light truncate w-full px-2">{p.name}</h3>
                    <div className="h-[1px] w-6 bg-zinc-200 group-hover:w-12 transition-all duration-500" />
                    <p className="text-[14px] font-medium font-serif italic tracking-tight">{p.price.toLocaleString()} USDT</p>
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

export default ProductTemplate;