    'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Package, RotateCcw, Box, Wallet } from 'lucide-react';

// --- Type Definitions (Matching API response structure) ---
interface Product {
  id: string; 
  name: string;
  description: string | null; 
  price: number; 
  stock: number; 
  category: string | null; 
  imageUrls: string[]; // List of image URLs
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Constants ---
const API_ROUTE = 'api/products'; // Your specified API endpoint

// --- Components ---

// 1. Product Card Component (Simplified for display)
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  // Use the first image URL, or a placeholder if none exists
  const imageUrl = product.imageUrls.length > 0
    ? product.imageUrls[0]
    : '/placeholder-image.png'; // Fallback placeholder image path

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
      
      {/* Product Image (First Image Only) */}
      <div className="h-48 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
        {product.imageUrls.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-700/70 text-gray-400 font-medium">
                No Image
             </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        {/* Name/Title */}
        <h3 className="text-xl font-bold text-white truncate" title={product.name}>
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center text-lg font-semibold text-green-400">
          <Wallet className="w-5 h-5 mr-2 text-green-500" />
          {product.price.toFixed(2)} 
          <span className="text-sm ml-1 text-green-500 font-normal">USDT</span>
        </div>
        
        {/* Additional Info (Optional) */}
        <div className="flex items-center text-sm text-gray-400 pt-1 border-t border-gray-700">
            <Box className="w-4 h-4 mr-2" />
            <span className='font-medium'>{product.stock}</span> in stock
        </div>
      </div>
    </div>
  );
};


/**
 * 📦 Simple Product Display Component
 */
const ProductsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data (GET) ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ROUTE);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      const data: Product[] = await response.json();
      setProducts(data);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      // Optionally show a user-friendly error message
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- UI Render ---

  return (
    <div className="min-h-screen bg-white text-white p-4 sm:p-8">
      
      {/* --- Header --- */}
      <div className='flex justify-between items-center mb-8'>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black flex items-center">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-400" />
          **Available Products**
        </h1>
        {/* <button
            onClick={fetchProducts}
            disabled={loading}
            className={`flex items-center px-3 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition disabled:bg-gray-800 disabled:text-gray-400 text-sm`}
        >
            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
            {loading ? 'Fetching...' : 'Refresh'}
        </button> */}
      </div>
      
      <p className="text-gray-400 mb-8 text-sm sm:text-base">
        Total Product {products.length} 
      
      </p>

      {/* --- Product List --- */}
      <section>
        {loading ? (
            <div className="text-center py-20 text-gray-400">
                <RotateCcw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p className='text-lg'>Loading products from API...</p>
            </div>
        ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-4" />
              <p className='text-lg'>No products found.</p>
            </div>
        ) : (
            // Responsive Grid Layout
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default ProductsDashboard;