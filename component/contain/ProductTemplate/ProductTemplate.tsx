'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  SlidersHorizontal, Heart, ChevronDown, Check, X, 
  ImageOff, Loader2, LayoutGrid, Square, ChevronLeft, ChevronRight 
} from 'lucide-react';
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

const COLORS = [
  { name: "Red", hex: "#FF0000" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Green", hex: "#008000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Navy", hex: "#000080" }
];

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "FREE SIZE"];

const GridIcon = ({ cols, active }: { cols: number; active: boolean }) => {
  if (cols === 2) return <Square size={18} className={active ? 'text-black' : 'text-gray-300'} />;
  if (cols === 4) return <LayoutGrid size={18} className={active ? 'text-black' : 'text-gray-300'} />;
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
  colors?: string[];
  isPublished: boolean;
}

interface ProductTemplateProps {
  targetCategory?: string;
  targetSubCategory?: string;
  targetProductType?: string;
  pageTitle: string;
}

const ProductTemplate = ({ targetCategory, targetSubCategory, targetProductType, pageTitle }: ProductTemplateProps) => {
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);

  // --- DYNAMIC ITEMS PER PAGE LOGIC ---
  const itemsPerPage = useMemo(() => {
    if (cols === 2) return 16;
    if (cols === 4) return 20;
    if (cols === 6) return 30;
    return 12;
  }, [cols]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSidebar || showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showSidebar, showAuthModal]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCols(2); 
      else setCols(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, favRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/favorites')
        ]);
        const prodData = await prodRes.json();
        
        let filtered = prodData.filter((p: Product) => p.isPublished);
        
        if (targetCategory) filtered = filtered.filter((p: Product) => p.categories?.includes(targetCategory));
        if (targetSubCategory) filtered = filtered.filter((p: Product) => p.subCategories?.includes(targetSubCategory));
        if (targetProductType) {
          filtered = filtered.filter((p: Product) => 
            p.productTypes?.some(type => type.toLowerCase() === targetProductType.toLowerCase())
          );
        }
        
        setProducts(filtered);
        const favData = await favRes.json();
        if (!favData.error) setFavorites(favData.map((f: any) => f.productId || f.product?.id));
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [targetCategory, targetSubCategory, targetProductType]);

  // Reset to page 1 if filters or layout changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, selectedSizes, selectedColors, sortBy, cols]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const noFilters = selectedBrands.length === 0 && selectedSizes.length === 0 && selectedColors.length === 0;
      if (noFilters) return true;

      const brandMatch = selectedBrands.length > 0 && p.brands?.some(b => selectedBrands.includes(b));
      const sizeMatch = selectedSizes.length > 0 && p.sizes?.some(s => selectedSizes.includes(s));
      const colorMatch = selectedColors.length > 0 && p.colors?.some(c => selectedColors.includes(c));

      return brandMatch || sizeMatch || colorMatch;
    });

    if (sortBy === 'low-to-high') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'high-to-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, sortBy, selectedBrands, selectedSizes, selectedColors]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / itemsPerPage));
  const currentItems = filteredAndSortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFilter = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

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
      if (res.ok) {
        setFavorites(prev => isFav ? prev.filter(id => id !== productId) : [...prev, productId]);
      } else if (res.status === 401) {
        setShowAuthModal(true);
      }
    } catch (err) { console.error(err); } finally {
      setProcessingFavs(prev => prev.filter(id => id !== productId));
    }
  };

  return (
    <div className="relative w-full bg-white text-black font-sans">
      
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[12000] flex items-end md:items-center justify-center"> 
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-sm p-8 text-center shadow-2xl rounded-t-3xl md:rounded-2xl animate-in slide-in-from-bottom duration-300">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-5 right-5 text-gray-400"><X size={22} /></button>
            <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-rose-50 rounded-full">
              <Heart size={30} className="text-pink-500 fill-pink-500/10" />
            </div>
            <h2 className="text-[14px] uppercase tracking-[0.2em] font-semibold mb-2">Save to Wishlist</h2>
            <Link href="/login" className="block w-full bg-black text-white text-[11px] uppercase tracking-widest py-4 rounded-full font-bold">Sign In Now</Link>
          </div>
        </div>
      )}

      {/* FILTER SIDEBAR */}
      <div className={`fixed inset-0 z-[11000] transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        <aside className={`absolute top-0 right-0 h-full w-[85%] max-w-[400px] bg-white shadow-2xl transition-transform duration-500 ease-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full uppercase tracking-[0.15em] text-[10px] font-medium">
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <span className="text-[12px] font-bold">Filters</span>
              <button onClick={() => setShowSidebar(false)}><X size={24} strokeWidth={1} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10">
              <div>
                <h3 className="mb-4 border-l-2 border-black pl-3 font-bold">Designers</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(BRAND_DATA[targetCategory || "READY TO WEAR"] || BRAND_DATA["READY TO WEAR"]).map(brand => (
                    <button key={brand} onClick={() => toggleFilter(brand, selectedBrands, setSelectedBrands)} 
                      className={`text-left p-3 border text-[9px] truncate transition-all duration-300 ${selectedBrands.includes(brand) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400 hover:border-black'}`}>
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 border-l-2 border-black pl-3 font-bold">Color</h3>
                <div className="grid grid-cols-4 gap-3">
                  {COLORS.map(color => (
                    <button key={color.name} onClick={() => toggleFilter(color.name, selectedColors, setSelectedColors)} className="flex flex-col items-center gap-2 group">
                      <div className={`w-8 h-8 rounded-full border transition-all duration-300 flex items-center justify-center ${selectedColors.includes(color.name) ? 'ring-2 ring-black ring-offset-2' : 'border-gray-100'}`} style={{ backgroundColor: color.hex }}>
                        {selectedColors.includes(color.name) && <Check size={14} className={color.name === 'White' || color.name === 'Yellow' ? 'text-black' : 'text-white'} />}
                      </div>
                      <span className={`text-[8px] tracking-widest ${selectedColors.includes(color.name) ? 'font-bold text-black' : 'text-gray-400'}`}>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 border-l-2 border-black pl-3 font-bold">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map(size => (
                    <button key={size} onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                      className={`py-3 border text-[9px] text-center transition-all duration-300 ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400 hover:border-black'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t grid grid-cols-2 gap-4 bg-white shrink-0">
              <button onClick={() => {setSelectedBrands([]); setSelectedSizes([]); setSelectedColors([]);}} className="py-4 border border-black uppercase font-bold text-[10px]">Reset</button>
              <button onClick={() => setShowSidebar(false)} className="py-4 bg-black text-white uppercase font-bold text-[10px]">Apply</button>
            </div>
          </div>
        </aside>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-[50] bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => setShowSidebar(true)} className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-black">
              <SlidersHorizontal size={18} /> 
              <span className="hidden md:inline">Filter</span>
            </button>

            <div className="relative" ref={sortRef}>
              <button onClick={() => setShowSort(!showSort)} className="text-[11px] uppercase tracking-widest font-black flex items-center gap-1.5">
                <ChevronDown size={18} className={`transition-transform duration-300 ${showSort ? 'rotate-180' : ''}`} />
                <span className="hidden md:inline">Sort</span>
              </button>
              {showSort && (
                <div className="absolute top-full left-0 mt-4 w-48 bg-white border border-gray-100 shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                  {['default', 'low-to-high', 'high-to-low'].map((s) => (
                    <button key={s} onClick={() => {setSortBy(s as any); setShowSort(false);}} className="w-full px-5 py-3.5 text-left text-[9px] uppercase tracking-[0.15em] hover:bg-gray-50 flex justify-between items-center transition-colors">
                      {s.replace('-', ' ')} {sortBy === s && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
             <h1 className="text-[15px] md:text-2xl font-light tracking-[0.2em] md:tracking-[0.5em] uppercase font-serif">{pageTitle}</h1>
          </div>

          <div className="hidden md:flex items-center gap-6 border-l pl-8 border-gray-100">
             {[6, 4, 2].map(n => (
              <button key={n} onClick={() => setCols(n)} className={`transition-all duration-300 ${cols === n ? 'scale-110 opacity-100' : 'opacity-100 hover:opacity-70'}`}>
                <GridIcon cols={n} active={cols === n} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-[1800px] mx-auto px-2 md:px-12 py-4">
        {loading ? (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
             {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-50 rounded-sm" />)}
           </div>
        ) : (
          <>
            {currentItems.length > 0 ? (
              <div className={`grid gap-x-2 gap-y-10 md:gap-x-10 md:gap-y-16 transition-all duration-500 ${
                cols === 6 ? 'grid-cols-2 md:grid-cols-6' : 
                cols === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'
              }`}>
                {currentItems.map((p) => {
                  const isFav = favorites.includes(p.id);
                  const isProcessing = processingFavs.includes(p.id);
                  const hasSecondImage = p.imageUrls && p.imageUrls.length > 1;

                  return (
                    <div key={p.id} className="group flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9]">
                        <Link href={`/product/${p.id}`} className="block w-full h-full relative">
                          {p.imageUrls?.[0] ? (
                            <>
                              <img src={p.imageUrls[0]} alt={p.name} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${hasSecondImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-110'}`} />
                              {hasSecondImage && <img src={p.imageUrls[1]} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-0 scale-100 transition-all duration-1000 ease-in-out group-hover:opacity-100 group-hover:scale-110" />}
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-200"><ImageOff size={24} /></div>
                          )}
                        </Link>
                        <button onClick={(e) => toggleFavorite(e, p.id)} disabled={isProcessing} className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/90 shadow-md">
                          {isProcessing ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <Heart size={18} className={`${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />}
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col items-center text-center space-y-1">
                        <span className="text-[8px] md:text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-bold">{p.brands?.[0] || 'ELITE'}</span>
                        <h3 className="text-[10px] md:text-[13px] tracking-widest uppercase font-light truncate w-full px-2">{p.name}</h3>
                        <p className="text-[12px] md:text-[15px] font-medium font-serif italic tracking-tight pt-1">{p.price.toLocaleString()} USDT</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400">No products found</span>
                {/* <button onClick={() => {setSelectedBrands([]); setSelectedSizes([]); setSelectedColors([]);}} className="text-[11px] underline tracking-widest uppercase font-bold">Clear Filters</button> */}
              </div>
            )}

            {/* PAGINATION */}
            <div className="mt-[30px] flex flex-col items-center justify-center space-y-8 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-6">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-20">
                  <ChevronLeft size={16} /> <span className="hidden sm:inline">Prev</span>
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => handlePageChange(i+1)} className={`w-10 h-10 text-[10px] font-bold rounded-full transition-colors ${currentPage === i+1 ? 'bg-black text-white' : 'text-gray-300 hover:text-black'}`}>
                      {(i+1).toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold disabled:opacity-20">
                  <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
                </button>
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gray-900 font-medium">Showing {currentItems.length} of {filteredAndSortedProducts.length} Results ({itemsPerPage} per page)</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductTemplate;