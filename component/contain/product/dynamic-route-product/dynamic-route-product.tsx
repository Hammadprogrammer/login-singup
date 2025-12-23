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
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // High-Resolution Zoom State
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const formatUSDT = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount).replace('$', 'USDT ');
  };

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
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Precise Area Zoom Logic (Covers Face, Body, and Feet)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Percentage calculation for accurate tracking
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - (top + window.scrollY)) / height) * 100;

    setZoomStyle({
      opacity: 1,
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '350%', // High detail zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ opacity: 0 });
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#fcfcfc]">
      <Loader2 className="animate-spin text-gray-300" size={30} />
    </div>
  );

  if (!product) return <div className="text-center py-20 tracking-widest uppercase text-xs">Product not found.</div>;

  return (
    <div className={`min-h-screen bg-[#F4F4F4] text-[#1a1a1a] pb-20 transition-all duration-500 ${isCartOpen ? 'brightness-90' : ''}`}>
      
      {/* --- CART SIDEBAR --- */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[100] shadow-2xl transform transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-[11px] tracking-[0.3em] uppercase font-medium">Cart</h2>
          <button onClick={() => setIsCartOpen(false)}><X size={18} strokeWidth={1} /></button>
        </div>
        <div className="p-6">
          <div className="flex gap-4">
            <img src={mainImage} alt={product.name} className="w-20 aspect-[3/4] object-cover" />
            <div className="space-y-1">
              <h3 className="text-[10px] tracking-widest uppercase">{product.name}</h3>
              <p className="text-[10px] text-gray-500">{formatUSDT(product.price)}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
          <button className="w-full bg-black text-white py-4 text-[11px] tracking-[0.3em] uppercase">
            Checkout • {formatUSDT(product.price * quantity)}
          </button>
        </div>
      </div>

      {isCartOpen && <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[90]" onClick={() => setIsCartOpen(false)} />}

      {/* --- MAIN PAGE CONTENT --- */}
      <div className="max-w-[1300px] mx-auto px-6 pt-10">
        <Link href="/" className="group inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-gray-500 hover:text-black transition-all mb-12">
          <ChevronLeft size={14} /> Back to Gallery
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT: Media Section with Precision Zoom (No Click) */}
          <div className="w-full lg:w-[65%] flex flex-col-reverse md:flex-row gap-5">
            <div className="flex md:flex-col gap-3 md:w-20 overflow-x-auto no-scrollbar">
              {product.imageUrls.map((url, index) => (
                <button 
                  key={index} 
                  onClick={() => setMainImage(url)} 
                  className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden transition-all duration-500 ${mainImage === url ? 'ring-1 ring-black ring-offset-1' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white shadow-sm overflow-hidden relative">
              {/* Interaction Area */}
              <div 
                className="relative aspect-[4/5] md:aspect-[3/4] max-h-[750px] mx-auto overflow-hidden cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Base Image */}
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Zoom Layer (Purely Visual, No Click Handler) */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    ...zoomStyle,
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="w-full lg:w-[35%] lg:sticky lg:top-10 space-y-10">
            <section className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-400 font-medium">{product.category || 'Collection'}</p>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight">{product.name}</h1>
              <p className="text-xl font-medium text-gray-800">{formatUSDT(product.price)}</p>
            </section>

            {/* Size Section */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Select Size</span>
                <button className="text-[10px] uppercase text-gray-400 hover:text-black">Size Guide</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-[11px] transition-all border ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black'}`}
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
                className="w-full bg-[#111] text-white py-5 px-8 text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:bg-black transition-all"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="border border-gray-200 py-4 text-[10px] uppercase text-gray-400 hover:text-black">Wishlist</button>
                <a 
                  href={`https://wa.me/YOUR_NUMBER`}
                  target="_blank"
                  className="border border-gray-200 py-4 text-[10px] uppercase text-gray-600 flex items-center justify-center gap-2 hover:text-green-600 transition-all"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </section>

            <section className="pt-8 border-t border-gray-200">
              <p className="text-gray-500 font-light leading-relaxed text-[13.5px]">
                {product.description || "Meticulously crafted with premium fabrics for a contemporary silhouette."}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>  
  );
}