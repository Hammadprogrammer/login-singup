'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Loader2, ChevronLeft, ShoppingBag, 
  X, ShieldCheck, Truck, Heart, ArrowRight, Info, Plus, Minus, Trash2,
  Package, CheckCircle2, Calendar, Tag
} from 'lucide-react';
import { useParams } from 'next/navigation';

// --- INTERFACES ---
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brands: string[];
  sizes: string[]; 
  colors: string[];
  imageUrls: string[];
  saleType: 'sale' | 'rent'; // Added specific types
  condition: 'New' | 'Pre-owned' | 'Vintage'; // Added specific types
}

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export default function LuxuryProductPage() {
  const params = useParams();
  const id = params?.id;

  const MASTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount).replace('$', 'USDT ');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const savedCart = localStorage.getItem('luxury_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart load error", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('luxury_cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`);
        const data: Product[] = await res.json();
        const found = data.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          setMainImage(found.imageUrls[0]);
          const firstAvailable = found.sizes[0];
          if (firstAvailable) setSelectedSize(firstAvailable);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    if (id) fetchProduct();
  }, [id]);

  const addToBag = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );
      
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prevCart, { ...product, selectedSize, quantity: 1 }];
    });
    
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId && item.selectedSize === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (productId: string, size: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - (top + window.scrollY)) / height) * 100;
    setZoomStyle({
      opacity: 1,
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%',
    });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-200" size={40} />
    </div>
  );
  
  if (!product) return <div className="text-center py-40">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      
      {/* --- BAG DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-700 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-white z-[110] shadow-2xl transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-8 border-b border-zinc-50">
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} strokeWidth={1.5} />
              <h2 className="text-[10px] tracking-[0.5em] uppercase font-bold">Shopping Bag ({cart.length})</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300 p-2">
              <X size={20} strokeWidth={1.2} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                 <ShoppingBag size={40} strokeWidth={0.5} />
                 <p className="uppercase tracking-[0.3em] text-[10px]">Your bag is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6 items-start border-b border-zinc-50 pb-8 last:border-0">
                  <div className="w-24 bg-zinc-50 aspect-[3/4] overflow-hidden flex-shrink-0">
                    <img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[8px] tracking-widest uppercase text-zinc-400 font-bold">{item.brands[0]}</p>
                    <h3 className="text-xs font-light tracking-wide">{item.name}</h3>
                    <div className="flex gap-2">
                        <span className="text-[7px] border px-1 uppercase font-bold text-zinc-500">{item.saleType}</span>
                        <span className="text-[7px] border px-1 uppercase font-bold text-zinc-500">{item.condition}</span>
                    </div>
                    <p className="text-[10px] text-zinc-900 font-bold mt-2">SIZE: {item.selectedSize}</p>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center border border-zinc-100 rounded-sm">
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="p-2 hover:bg-zinc-50"><Minus size={10} /></button>
                        <span className="px-3 text-[10px] font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="p-2 hover:bg-zinc-50"><Plus size={10} /></button>
                       <button onClick={() => removeItem(item.id, item.selectedSize)} className="text-zinc-900 hover:text-red-500 transition-colors ml-[10px]">
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                      </div>
                    
                    </div>
                  </div>
                  <p className="text-xs font-bold">{formatUSDT(item.price * item.quantity)}</p>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 bg-zinc-50 border-t border-zinc-100 space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-[10px] tracking-widest uppercase text-zinc-400 font-bold">Total Amount</p>
                <p className="text-xl font-medium tracking-tighter">{formatUSDT(cartTotal)}</p>
              </div>
              <button className="w-full bg-zinc-900 text-white py-6 text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-black flex items-center justify-center gap-4 transition-all">
                Proceed to Checkout <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="max-w-[1700px] mx-auto px-8 lg:px-16 py-12">
        <nav className="mb-16 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase font-bold text-zinc-400 hover:text-black transition-colors">
            <ChevronLeft size={16} /> Collection
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="relative group">
            <ShoppingBag size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Gallery Section */}
          <div className="flex flex-col-reverse xl:flex-row gap-8">
            <div className="flex xl:flex-col gap-4 overflow-x-auto xl:w-24 no-scrollbar">
              {product.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setMainImage(url)} className={`relative aspect-[3/4.5] w-20 xl:w-full overflow-hidden transition-all duration-500 ${mainImage === url ? 'ring-1 ring-zinc-900 ring-offset-4' : 'opacity-40 hover:opacity-100'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative bg-white group overflow-hidden">
              {/* SALE/RENT BADGE */}
              <div className="absolute top-6 left-6 z-10">
                <span className="bg-zinc-900 text-white text-[9px] tracking-[0.2em] uppercase font-bold px-4 py-2 shadow-xl">
                  {product.saleType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>

              <div className="relative aspect-[3/4.5] cursor-crosshair" onMouseMove={handleMouseMove} onMouseLeave={() => setZoomStyle({ opacity: 0 })}>
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 hidden md:block" style={{ ...zoomStyle, backgroundRepeat: 'no-repeat' }} />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-4">
            <div className="sticky top-16 space-y-12">
              <div className="space-y-4">
                <p className="text-[16px] tracking-[0.5em] uppercase font-black text-zinc-900">{product.brands[0]}</p>
                {/* SMALLER TITLE AS REQUESTED */}
                <h1 className="text-[16px] font-light tracking-tight text-zinc-900 uppercase">{product.name}</h1>
                
                <div className="flex items-center gap-4">
                    <p className="text-[15px]  font-bold tracking-tighter">{formatUSDT(product.price)}</p>
                    {product.saleType === 'rent' && <span className="text-[10px] text-zinc-400 uppercase tracking-widest">/ Per Day</span>}
                </div>

                <div className="inline-flex items-center gap-2 bg-zinc-10 px-3 py-1 rounded-full border border-zinc-100">
                    <div className={`w-1.5 h-1.5 rounded-full ${product.condition === 'New' ? 'bg-green-500' : 'bg-orange-400'}`} />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-900">Condition: {product.condition}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-900">
                  <Info size={14} /> Description
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 font-light max-w-xl">
                  {product.description || "No description available for this luxury piece."}
                </p>
              </div>

              {/* Sizes */}
              <div className="space-y-6">
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Select Size</p>
                <div className="flex flex-wrap gap-4">
                  {MASTER_SIZES.map((size) => {
                    const isAvailable = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`relative w-16 h-16 flex items-center justify-center text-[12px] font-bold border transition-all overflow-hidden
                          ${selectedSize === size ? 'border-zinc-900 bg-zinc-900 text-white shadow-xl' : 'border-zinc-800 text-zinc-900 hover:border-zinc-900'}
                          ${!isAvailable ? 'opacity-30 cursor-not-allowed bg-zinc-50' : ''}
                        `}
                      >
                        <span className={!isAvailable ? 'text-zinc-800' : ''}>{size}</span>
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[140%] h-[1px] bg-zinc-800 rotate-[45deg] absolute" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={addToBag}
                  className="bg-zinc-900 text-white py-6 text-[10px] tracking-[0.4em] uppercase font-bold hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl"
                >
                  {product.saleType === 'rent' ? <Calendar size={18} /> : <ShoppingBag size={18} />} 
                  {product.saleType === 'rent' ? 'Reserve for Rent' : 'Add to Bag'}
                </button>
                <button onClick={() => setIsCartOpen(true)} className="border border-zinc-800 py-6 text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-900 hover:border-zinc-900 transition-all">
                  View Bag ({cart.length})
                </button>
              </div>
              
              {/* Trust Badges */}
              <div className="pt-10 border-t border-zinc-100 flex flex-wrap gap-10">
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-zinc-400" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">
                    {product.saleType === 'rent' ? 'Express Delivery & Pickup' : 'Free Express Shipping'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-zinc-400" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Quality Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-zinc-400" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">{product.saleType} listing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}