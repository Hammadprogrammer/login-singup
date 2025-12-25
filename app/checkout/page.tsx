"use client"
import React, { useState } from 'react';
import { CreditCard, Wallet, Truck, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Sample Cart Data (Real app mein ye Context ya Redux se aayega)
const cartItems = [
  { id: '1', name: 'Jalabiya Luxury Edit', price: 160, size: 'M', image: 'https://via.placeholder.com/150x200' },
  { id: '2', name: 'Silk Abaya', price: 210, size: 'L', image: 'https://via.placeholder.com/150x200' }
];

const CheckoutPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-gray-400 hover:text-black mb-8">
          <ChevronLeft size={14} /> Back to Shopping
        </Link>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT: Shipping & Payment Form */}
          <div className="flex-1 space-y-12">
            <header className="border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-light tracking-widest uppercase">Checkout</h1>
            </header>

            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Truck size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <input type="text" placeholder="Full Name" className="w-full border-gray-200 border p-4 outline-none focus:border-black transition-all md:col-span-2" />
                <input type="email" placeholder="Email" className="w-full border-gray-200 border p-4 outline-none focus:border-black transition-all md:col-span-2" />
                <input type="text" placeholder="Address" className="w-full border-gray-200 border p-4 outline-none focus:border-black transition-all md:col-span-2" />
                <input type="text" placeholder="City" className="w-full border-gray-200 border p-4 outline-none focus:border-black transition-all" />
                <input type="text" placeholder="Country" className="w-full border-gray-200 border p-4 outline-none focus:border-black transition-all" />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <CreditCard size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <div onClick={() => setPaymentMethod('card')} className={`border p-5 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">Credit/Debit Card</span>
                    <CreditCard size={20} className="text-gray-400" />
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <input type="text" placeholder="Card Number" className="w-full bg-white border border-gray-200 p-3 text-sm outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full bg-white border border-gray-200 p-3 text-sm outline-none" />
                        <input type="text" placeholder="CVV" className="w-full bg-white border border-gray-200 p-3 text-sm outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div onClick={() => setPaymentMethod('crypto')} className={`border p-5 cursor-pointer transition-all ${paymentMethod === 'crypto' ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">USDT (Crypto Wallet)</span>
                    <Wallet size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Dynamic Summary Section */}
          <div className="lg:w-[420px]">
            <div className="bg-[#f9f9f9] p-8 sticky top-10 border border-gray-50">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-8">Bag Summary</h2>
              
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-28 bg-gray-200 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-tight leading-tight">{item.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">Size: {item.size}</p>
                      </div>
                      <p className="text-xs font-medium">USDT {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Subtotal</span>
                  <span>USDT {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-light">Shipping</span>
                  <span className="text-[10px] font-bold uppercase text-green-600">Free Delivery</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-base font-bold uppercase tracking-widest">Total</span>
                  <span className="text-lg font-bold">USDT {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-black text-white py-5 mt-8 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                Pay Now <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;