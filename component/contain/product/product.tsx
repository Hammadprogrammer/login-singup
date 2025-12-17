'use client';

import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrls: string[];
}

const API_ROUTE = 'api/products';

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_ROUTE);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20 tracking-widest uppercase text-[10px] text-gray-400">Loading Collection...</div>;

  return (
    // Background set to pure white
    <div className="w-full bg-white py-16 px-4 font-serif">
      <div className="max-w-7xl mx-auto">
        
        {/* Minimalist Heading */}
        <h2 className="text-center text-[20px] tracking-[0.4em] uppercase mb-16 text-gray-800 font-light">
          Curated For You
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col cursor-pointer">
              
              {/* Image Section */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#fafafa]">
                {product.imageUrls && product.imageUrls[0] ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-200">
                    <ImageOff size={24} strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Product Details - Now in USDT */}
              <div className="mt-6 text-center">
                <h3 className="text-[12px] tracking-[0.18em] uppercase text-gray-900 mb-2 font-medium leading-5">
                  {product.name}
                </h3>
                <p className="text-[11px] tracking-[0.15em] text-gray-500 font-sans">
                  {/* Formatted for USDT */}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(product.price)} USDT
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;