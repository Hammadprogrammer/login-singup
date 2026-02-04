'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ArrowRight, Minus, Plus, Trash2, 
  ChevronLeft, ShieldCheck, CreditCard, Tag
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

  // 1. Fetch Cart from API
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

  // 2. Update Quantity via API (PATCH)
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Optimistic UI update (pehle frontend update kar do for speed)
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
      fetchCart(); // Error aane pe wapas DB wala data le aao
    }
  };

  // 3. Remove Item via API (DELETE)
  const removeItem = async (cartItemId: number) => {
    // Optimistic UI update
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased pb-32 md:pb-12">
      <div className="bg-zinc-900 text-zinc-100 text-[10px] tracking-[0.25em] uppercase py-4 text-center font-bold px-4 border-b border-zinc-800">
        Complimentary Insured Express Shipping on all Orders
      </div>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-16">
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
            <div className="lg:col-span-8">
              <div className="border-t border-zinc-900 pt-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 md:gap-10 py-10 border-b border-zinc-100 items-start">
                    <div className="relative w-full md:w-56 aspect-[3/4] bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100 group">
                      <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between self-stretch">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[12px] tracking-[0.3em] uppercase font-black text-zinc-800">{item.product.brands?.[0] || 'Luxury Brand'}</h4>
                          <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 leading-tight">{item.product.name}</h3>
                        
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <span className="text-[10px] border border-zinc-900 px-4 py-1.5 uppercase tracking-widest font-black text-zinc-900">
                            Size: {item.size || 'M'}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest bg-zinc-100 px-3 py-1.5">
                            <Tag size={12} /> Authentic
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-12 pt-6 border-t border-zinc-50">
                        <div className="space-y-3">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Adjust Quantity</p>
                          <div className="flex items-center border border-zinc-200 rounded-sm overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-3 hover:bg-zinc-50 text-zinc-900"><Minus size={14} /></button>
                            <span className="w-12 text-center text-sm font-black border-x border-zinc-100">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3 hover:bg-zinc-50 text-zinc-900"><Plus size={14} /></button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">Item Subtotal</p>
                          <p className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900">
                            {formatUSDT(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Section */}
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
                  <div className="pt-10 mt-6 border-t border-zinc-200">
                    <p className="text-[11px] tracking-[0.3em] uppercase font-black text-zinc-400 mb-1">Total Payable</p>
                    <p className="text-4xl font-black tracking-tighter text-zinc-900 leading-none mb-8">
                      {formatUSDT(cartTotal)}
                    </p>
                    <button className="w-full bg-zinc-900 text-white py-6 text-[10px] tracking-[0.5em] uppercase font-black hover:bg-black transition-all flex items-center justify-center shadow-2xl active:scale-[0.98]">
                      Proceed to Checkout <ArrowRight size={13} className="ml-2" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={18} className="text-zinc-900" />
                    <p className="text-[9px] uppercase tracking-widest font-black text-zinc-900">Secure SSL Encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}