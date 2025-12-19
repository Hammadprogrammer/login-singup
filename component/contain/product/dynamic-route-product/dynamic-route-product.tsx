'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageOff, Loader2, ChevronLeft, ShoppingBag, MessageCircle, Ruler, X, Minus, Plus } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  description?: string;
  category?: string;
  stock: number;
  sizes?: string[]; 
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M'); // Default to M like the screenshot
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`);
        const data: Product[] = await res.json();
        const found = data.find((p) => p.id === id);
        
        if (found) {
          setProduct(found);
          setMainImage(found.imageUrls[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#fcfcfc]">
      <Loader2 className="animate-spin text-gray-300" size={30} />
    </div>
  );

  if (!product) return <div className="text-center py-20 tracking-widest uppercase text-xs">Product not found.</div>;

  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className={`min-h-screen bg-[#F4F4F4] text-[#1a1a1a] pb-20 transition-all duration-500 ${isCartOpen ? 'brightness-90' : ''}`}>
      
      {/* --- CART DRAWER SIDEBAR --- */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[100] shadow-2xl transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.3em] uppercase font-medium">Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300">
            <X size={18} strokeWidth={1} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex gap-4 items-start">
            <div className="w-24 aspect-[3/4] overflow-hidden bg-gray-50">
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-[10px] tracking-widest uppercase font-medium">{product.name}</h3>
              </div>
              <p className="text-[10px] text-gray-500 tracking-wider">
                Rs. {new Intl.NumberFormat('en-PK').format(product.price)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedSize}</p>
              
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center border border-gray-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-gray-400 hover:text-black transition-colors"><Minus size={10} /></button>
                  <span className="px-2 text-[10px] min-w-[20px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-gray-400 hover:text-black transition-colors"><Plus size={10} /></button>
                </div>
                <button className="text-[9px] uppercase tracking-tighter text-gray-400 underline decoration-gray-200 hover:text-black underline-offset-4 transition-all">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 space-y-4">
          <button className="text-[10px] text-gray-400 uppercase tracking-widest block w-full text-left hover:text-black transition-colors">
            Add order note
          </button>
          <p className="text-[9px] text-gray-400 italic">Taxes and shipping calculated at checkout</p>
          <button className="group w-full border border-black py-4 px-8 text-[11px] tracking-[0.3em] uppercase flex justify-between items-center hover:bg-black hover:text-white transition-all duration-300">
            <span>Checkout</span>
            <span className="text-[8px] opacity-40 group-hover:opacity-100">•</span>
            <span>Rs. {new Intl.NumberFormat('en-PK').format(product.price * quantity)}</span>
          </button>
        </div>
      </div>

      {/* Backdrop for Cart */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[90] transition-opacity duration-500"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="max-w-[1300px] mx-auto px-6 pt-10">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-gray-500 hover:text-black transition-all mb-12">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT: Media Section */}
          <div className="w-full lg:w-[65%] flex flex-col-reverse md:flex-row gap-5">
            <div className="flex md:flex-col gap-3 md:w-20 overflow-x-auto no-scrollbar">
              {product.imageUrls.map((url, index) => (
                <button 
                  key={index}
                  onClick={() => setMainImage(url)}
                  className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden transition-all duration-500 ${
                    mainImage === url ? 'ring-1 ring-black ring-offset-1' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white shadow-sm overflow-hidden group">
              <div className="relative aspect-[4/5] md:aspect-[3/4] max-h-[750px] mx-auto overflow-hidden">
                {mainImage ? (
                  <img 
                    src={mainImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 text-gray-300">
                    <ImageOff size={48} strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info Section */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-10 space-y-10">
            <section className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-medium">{product.category || 'New Arrival'}</p>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight leading-tight">{product.name}</h1>
              <p className="text-xl font-medium tracking-wide text-gray-800">Rs. {new Intl.NumberFormat('en-PK').format(product.price)}</p>
            </section>

            {/* Size Section */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Select Size</span>
                <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                  <Ruler size={12} /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-[11px] tracking-widest transition-all duration-300 border ${
                      selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>

            {/* CTA Actions */}
            <section className="space-y-3">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-[#111] text-white py-5 px-8 text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-black active:scale-[0.98] transition-all"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="border border-gray-200 py-4 text-[10px] tracking-[0.15em] uppercase text-gray-400 hover:text-black hover:border-black transition-all">Save to Wishlist</button>
                <a 
                  href={`https://wa.me/YOUR_NUMBER?text=Hi, I'm interested in ${product.name}`}
                  target="_blank"
                  className="border border-gray-200 py-4 text-[10px] tracking-[0.15em] uppercase text-gray-600 flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-all"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </section>

            {/* Details Section */}
            <section className="pt-8 border-t border-gray-200">
              <p className="text-gray-500 font-light leading-relaxed text-[13.5px]">
                {product.description || "A timeless silhouette meticulously crafted for the modern individual."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>  
  );
}