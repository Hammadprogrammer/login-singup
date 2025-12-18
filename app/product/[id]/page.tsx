'use client'; // Client component zaroori hai click handle karne ke liye

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageOff, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
  description?: string;
  category?: string;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`); // Apni API se data lein
        const data: Product[] = await res.json();
        const found = data.find((p) => p.id === id);
        
        if (found) {
          setProduct(found);
          setMainImage(found.imageUrls[0]); // Pehli image ko default set karein
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
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-gray-300" size={40} />
    </div>
  );

  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-serif bg-white min-h-screen">
      {/* Back Button */}
      <Link href="/" className="text-[10px] tracking-widest uppercase text-gray-400 mb-8 block hover:text-black transition">
        ← Back to Collection
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT SIDE: Thumbnails and Main Image */}
        <div className="flex flex-col-reverse md:flex-row gap-4 lg:w-2/3">
          
          {/* Thumbnails list (Side wali images) */}
          <div className="flex md:flex-col gap-3 overflow-y-auto max-h-[600px] scrollbar-hide">
            {product.imageUrls.map((url, index) => (
              <div 
                key={index}
                onClick={() => setMainImage(url)}
                className={`cursor-pointer border-2 transition-all w-20 h-28 md:w-24 md:h-32 flex-shrink-0 ${
                  mainImage === url ? 'border-gray-800' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Main Large Image Display */}
          <div className="flex-1 bg-[#fafafa] overflow-hidden relative aspect-[3/4]">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <ImageOff size={48} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Product Info */}
        <div className="lg:w-1/3 flex flex-col">
          <div className="sticky top-10">
            <h1 className="text-[22px] tracking-[0.15em] uppercase text-gray-900 mb-2 font-light">
              {product.name}
            </h1>
            
            <p className="text-lg tracking-widest text-gray-500 mb-8 font-sans">
              RS. {new Intl.NumberFormat('en-PK').format(product.price)}
            </p>

            {/* Size & Stock Info (As per your Image) */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-3">Size:</p>
              <div className="flex gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <div key={size} className="border border-gray-200 px-4 py-2 text-[10px] text-gray-600 hover:border-black cursor-pointer transition">
                    {size}
                  </div>
                ))}
              </div>
              {product.stock === 1 && (
                <p className="text-orange-500 italic text-[11px] mt-4 tracking-wide">Only 1 left</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-10">
              <button className="w-full border border-black bg-white text-black py-4 tracking-[0.2em] uppercase text-[11px] hover:bg-black hover:text-white transition duration-300">
                Add to Bag
              </button>
              
              <button className="w-full border border-gray-200 py-4 tracking-[0.1em] uppercase text-[10px] text-gray-500 hover:bg-gray-50 transition">
                Notify Me When Available
              </button>

              <button className="w-full border border-gray-200 py-4 flex items-center justify-center gap-2 tracking-[0.1em] uppercase text-[10px] text-gray-800">
                <span className="text-green-500 text-lg">WhatsApp icon</span> Speak to a Stylist
              </button>
            </div>

            {/* Description */}
            <div className="mt-10 pt-10 border-t border-gray-100">
               <p className="text-gray-500 font-sans leading-relaxed text-[13px]">
                {product.description || "Elegant design with intricate detailing, perfect for your luxury collection."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}