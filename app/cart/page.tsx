'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ArrowRight, Minus, Plus, Trash2, 
  ChevronLeft, ShieldCheck, Clock3, ArrowUpRight, CreditCard
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  brands: string[];
  sizes: string[]; 
  imageUrls: string[];
}

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

export default function LuxuryCartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('luxury_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem('luxury_cart', JSON.stringify(cart));
  }, [cart, loading]);

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount).replace('$', 'USDT ');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => 
      (item.id === productId && item.selectedSize === size) 
      ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
      : item
    ));
  };

  const removeItem = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const handleProcessOrder = () => {
    // This replaces the WhatsApp logic with a professional checkout flow
    console.log("Processing Order:", cart);
    alert("Redirecting to Secure Payment & Order Verification...");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased pb-32 md:pb-12">
      {/* Dynamic Shipping Banner */}
      <div className="bg-zinc-900 text-zinc-100 text-[10px] tracking-[0.25em] uppercase py-4 text-center font-bold px-4 border-b border-zinc-800">
        Complimentary Insured Express Shipping on all Orders
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-16">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-zinc-100 pb-10 gap-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-black text-zinc-900 hover:opacity-70 transition-all">
            <ChevronLeft size={18} /> Continue Shopping
          </Link>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-bold">Current Bag</p>
                <p className="text-sm font-black uppercase tracking-widest">{cart.length} Luxury Items</p>
             </div>
             <div className="h-10 w-[1px] bg-zinc-200 hidden md:block"></div>
             <ShoppingBag size={24} strokeWidth={1.5} className="text-zinc-900" />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} strokeWidth={1} className="text-zinc-300" />
            </div>
            <p className="text-[16px] tracking-[0.2em] uppercase font-black text-zinc-900 mb-8">Your selection is empty</p>
            <Link href="/" className="px-16 py-5 bg-zinc-900 text-white text-[11px] tracking-[0.4em] uppercase font-black hover:bg-black transition-all shadow-xl">
              View Boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* List Section - Left */}
            <div className="lg:col-span-8">
              <div className="border-t border-zinc-900 pt-2">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col md:flex-row gap-6 md:gap-10 py-10 border-b border-zinc-100 items-start">
                    {/* Visual: Image */}
                    <div className="relative w-full md:w-56 aspect-[3/4] bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 group">
                      <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>

                    {/* Content: Details & Alignment */}
                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[12px] tracking-[0.3em] uppercase font-black text-zinc-500">{item.brands[0]}</h4>
                          <button onClick={() => removeItem(item.id, item.selectedSize)} className="text-zinc-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 leading-tight">{item.name}</h3>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <span className="text-[10px] border border-zinc-900 px-4 py-1.5 uppercase tracking-widest font-black text-zinc-900">
                            Size: {item.selectedSize}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-50 px-3 py-1.5">
                            ID: {item.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>

                      {/* Controls & PRICE AREA (Visible Bottom) */}
                      <div className="flex items-end justify-between mt-12 pt-6 border-t border-zinc-50">
                        <div className="space-y-3">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Adjust Quantity</p>
                          <div className="flex items-center border border-zinc-200 rounded-sm overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="p-3 hover:bg-zinc-50 text-zinc-900"><Minus size={14} /></button>
                            <span className="w-12 text-center text-sm font-black border-x border-zinc-100">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="p-3 hover:bg-zinc-50 text-zinc-900"><Plus size={14} /></button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">Item Subtotal</p>
                          <p className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900">
                            {formatUSDT(item.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-medium italic mt-1">
                            {formatUSDT(item.price)} per unit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Section - Right */}
            <div className="lg:col-span-4">
              <div className="bg-zinc-50 p-8 md:p-12 sticky top-12 border border-zinc-100 shadow-sm">
                <h3 className="text-[13px] tracking-[0.4em] uppercase font-black text-zinc-900 mb-10 border-b-2 border-zinc-900 pb-4">Order Summary</h3>
                
                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">Subtotal</span>
                    <span className="text-zinc-900 font-black text-sm">{formatUSDT(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">Shipping</span>
                    <span className="text-emerald-700 font-black tracking-widest uppercase text-[10px] bg-emerald-50 px-2 py-1">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">Tax</span>
                    <span className="text-zinc-400 text-[10px] italic uppercase">Calculated at Checkout</span>
                  </div>
                  
                  <div className="pt-10 mt-6 border-t border-zinc-200">
                    <div className="flex justify-between items-end mb-8">
                       <div>
                          <p className="text-[11px] tracking-[0.3em] uppercase font-black text-zinc-400 mb-1">Total Payable</p>
                          <p className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                            {formatUSDT(cartTotal)}
                          </p>
                       </div>
                    </div>

                    <button 
                      onClick={handleProcessOrder}
                      className="w-full bg-zinc-900 text-white py-6 text-[12px] tracking-[0.5em] uppercase font-black hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]"
                    >
                      Check Order <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Secure Trust Badges */}
                <div className="grid grid-cols-1 gap-6 pt-8 border-t border-zinc-200">
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={20} className="text-zinc-900" />
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-900">Secure SSL Encryption</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <CreditCard size={20} className="text-zinc-900" />
                    <p className="text-[10px] uppercase tracking-widest font-black text-zinc-900">Verified Luxury Source</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* MOBILE PERSISTENT BOTTOM BAR */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-zinc-900 p-6 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-black mb-1">Total</p>
              <p className="text-2xl font-black tracking-tighter text-zinc-900 leading-none">{formatUSDT(cartTotal)}</p>
            </div>
            <button 
              onClick={handleProcessOrder}
              className="flex-1 bg-zinc-900 text-white py-5 px-6 text-[11px] tracking-[0.3em] uppercase font-black flex items-center justify-center gap-3 rounded-sm active:scale-95 transition-transform"
            >
              Check Order <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}