'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Wallet, Truck, ChevronRight, ChevronLeft, 
  ShieldCheck, Lock, Info 
} from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  selectedSize: string;
  quantity: number;
  imageUrls: string[];
  listingType?: string;
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    city: '',
    country: '',
  });

  // 1. Load Data from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('luxury_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
    setLoading(false);
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      alert("Stripe Checkout Initializing... (Aapko yahan stripe.confirmCardPayment call karna hoga)");
    } else {
      alert("Redirecting to Crypto Gateway...");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Boutique Experience...</div>;

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      {/* Top Security Banner */}
      <div className="bg-zinc-50 border-b border-zinc-100 py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
          <span className="flex items-center gap-2"><Lock size={12} /> SSL Encrypted</span>
          <span className="flex items-center gap-2"><ShieldCheck size={12} /> Secure Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-zinc-400 hover:text-black mb-12 transition-colors">
          <ChevronLeft size={14} /> Review Bag
        </Link>

        <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* LEFT: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-16">
            <section>
              <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-8 border-b border-zinc-100 pb-4">01. Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input required name="fullName" onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full border-zinc-200 border-b p-4 outline-none focus:border-black transition-all md:col-span-2 text-sm" />
                <input required name="email" onChange={handleInputChange} type="email" placeholder="Email Address" className="w-full border-zinc-200 border-b p-4 outline-none focus:border-black transition-all md:col-span-2 text-sm" />
                <input required name="address" onChange={handleInputChange} type="text" placeholder="Shipping Address" className="w-full border-zinc-200 border-b p-4 outline-none focus:border-black transition-all md:col-span-2 text-sm" />
                <input required name="city" onChange={handleInputChange} type="text" placeholder="City" className="w-full border-zinc-200 border-b p-4 outline-none focus:border-black transition-all text-sm" />
                <input required name="country" onChange={handleInputChange} type="text" placeholder="Country" className="w-full border-zinc-200 border-b p-4 outline-none focus:border-black transition-all text-sm" />
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-8 border-b border-zinc-100 pb-4">02. Payment</h2>
              <div className="space-y-4">
                {/* Stripe Card Option */}
                <div 
                  onClick={() => setPaymentMethod('card')} 
                  className={`group relative border p-6 cursor-pointer transition-all duration-500 ${paymentMethod === 'card' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'}`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-zinc-900' : 'border-zinc-300'}`}>
                        {paymentMethod === 'card' && <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Credit / Debit Card (Stripe)</span>
                    </div>
                    <div className="flex gap-2">
                      <CreditCard size={18} className="text-zinc-400" />
                    </div>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      {/* Note: Real Stripe Elements will be injected here */}
                      <div className="p-4 border border-zinc-200 bg-white rounded-sm">
                         <p className="text-[10px] text-zinc-400 uppercase mb-2 font-bold tracking-tighter flex items-center gap-2">
                           <Lock size={10} /> Secure Card Entry
                         </p>
                         <div className="h-10 flex items-center text-zinc-400 text-sm italic">
                           Stripe Card Element Mounts Here...
                         </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                        Your payment is processed securely via Stripe. We do not store your card details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Crypto Option */}
                <div 
                  onClick={() => setPaymentMethod('crypto')} 
                  className={`border p-6 cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'crypto' ? 'border-zinc-900' : 'border-zinc-300'}`}>
                        {paymentMethod === 'crypto' && <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">USDT / Crypto Wallet</span>
                    </div>
                    <Wallet size={18} className="text-zinc-400" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50 p-8 md:p-12 sticky top-10 border border-zinc-100">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 pb-4 border-b border-zinc-200">Order Summary</h2>
              
              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-6">
                    <div className="w-20 h-28 bg-white border border-zinc-100 flex-shrink-0 p-1">
                      <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1 flex-1">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-tight leading-tight mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] text-zinc-500 uppercase font-bold bg-white px-2 py-0.5 border border-zinc-100">Size: {item.selectedSize}</span>
                           <span className="text-[9px] text-zinc-500 uppercase font-bold">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 ${item.listingType === 'Rent' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200'}`}>
                          {item.listingType || 'Sale'}
                        </span>
                        <p className="text-sm font-black tracking-tighter">USDT {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-zinc-200 space-y-4">
                <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>USDT {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold">
                  <span className="text-zinc-400">Express Shipping</span>
                  <span className="text-emerald-600">Complimentary</span>
                </div>
                
                <div className="flex justify-between pt-6 border-t border-zinc-900 mt-6">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Total Amount</span>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter leading-none">USDT {subtotal.toFixed(2)}</p>
                    <p className="text-[9px] text-zinc-400 mt-1 uppercase">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={cart.length === 0}
                className="w-full bg-zinc-900 text-white py-6 mt-10 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {paymentMethod === 'card' ? 'Authorize Payment' : 'Proceed to Crypto'} <ChevronRight size={16} />
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 opacity-40">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-tighter">
                  <Info size={12} /> Duty Free Import
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;