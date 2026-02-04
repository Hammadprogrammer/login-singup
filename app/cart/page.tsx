'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ArrowRight, Minus, Plus, Trash2, 
  ChevronLeft, ShieldCheck, Tag
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brands: string[];
  imageUrls: string[];
}

interface CartItem {
  id: number; 
  productId: number;
  quantity: number;
  size?: string;
  product: Product; 
}

export default function LuxuryCartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    ));

    try {
      await fetch('/api/cart', {
        method: 'PATCH',
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });
    } catch (error) {
      console.error("Update failed:", error);
      fetchCart();
    }
  };

  const removeItem = async (cartItemId: number) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    try {
      await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Delete failed:", error);
      fetchCart();
    }
  };

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount).replace('$', 'USDT ');
  };
  // const formatPKR = (amount: number) => {
  //   return new Intl.NumberFormat('en-PK', {
  //     style: 'currency',
  //     currency: 'PKR',
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(amount).replace('PKR', 'Rs.');
  // };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      {/* Top Utility Bar */}
      <div className="bg-zinc-900 text-zinc-100 text-[9px] md:text-[10px] tracking-[0.2em] uppercase py-3 text-center font-bold px-4">
        Complimentary Insured Express Shipping
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-12">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-zinc-100 gap-4">
          <Link href="/" className="group inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-black text-zinc-900">
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Boutique
          </Link>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
             <div className="text-left sm:text-right">
                <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-bold">Your Bag</p>
                <p className="text-xs font-black uppercase tracking-widest">{cart.length} Items</p>
             </div>
             <ShoppingBag size={20} strokeWidth={1.5} className="text-zinc-900" />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <ShoppingBag size={48} strokeWidth={0.5} className="text-zinc-300 mb-6" />
            <h2 className="text-lg tracking-[0.2em] uppercase font-black mb-6">Your bag is empty</h2>
            <Link href="/" className="w-full max-w-xs py-4 bg-zinc-900 text-white text-[10px] tracking-[0.3em] uppercase font-black hover:bg-black transition-all">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Cart Items List */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="space-y-0">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 md:gap-8 py-6 md:py-10 border-b border-zinc-100 last:border-0 items-start">
                    {/* Image - Smaller on Mobile */}
                    <div className="relative w-24 sm:w-40 md:w-48 aspect-[3/4] bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100">
                      <img 
                        src={item.product.imageUrls[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-h-full justify-between">
                      <div className="space-y-1 md:space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-[9px] md:text-[10px] tracking-[0.2em] uppercase font-black text-zinc-400">
                            {item.product.brands?.[0] || 'Luxury Brand'}
                          </h4>
                          <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h3 className="text-base md:text-2xl font-medium tracking-tight text-zinc-900 leading-tight">
                          {item.product.name}
                        </h3>
                        <div className="flex gap-2 items-center pt-1">
                          <span className="text-[9px] bg-zinc-100 px-2 py-1 uppercase tracking-widest font-bold">
                            Size: {item.size || 'M'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex flex-wrap items-end justify-between mt-4 md:mt-8 gap-4">
                        <div className="flex items-center border border-zinc-200 rounded-sm scale-90 origin-left md:scale-100">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-zinc-50"><Minus size={12} /></button>
                          <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-zinc-50"><Plus size={12} /></button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg md:text-xl font-black tracking-tighter">
                            {formatUSDT(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky Summary Card */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-zinc-50 p-6 md:p-10 lg:sticky lg:top-8 border border-zinc-100">
                <h3 className="text-[11px] tracking-[0.3em] uppercase font-black text-zinc-900 mb-8 pb-3 border-b border-zinc-200">
                  Summary
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-bold">{formatUSDT(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="text-emerald-600 font-bold">Free</span>
                  </div>
                  <div className="pt-6 mt-4 border-t border-zinc-200">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-black text-zinc-400">Total</span>
                      <span className="text-3xl font-black tracking-tighter">{formatUSDT(cartTotal)}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-zinc-900 text-white py-5 text-[10px] tracking-[0.4em] uppercase font-black hover:bg-black transition-all flex items-center justify-center gap-2 group mb-6">
                  Checkout Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-3 py-2 border-t border-zinc-200 pt-6">
                  <ShieldCheck size={14} className="text-zinc-400" />
                  <p className="text-[8px] md:text-[9px] uppercase tracking-[0.15em] font-bold text-zinc-400">
                    Secure Payment Gateway & Insured Shipping
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}