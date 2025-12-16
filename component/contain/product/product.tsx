'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Using more descriptive icons for a professional look
import { Package, RotateCcw, Box, DollarSign, Tag, Clock } from 'lucide-react';

// --- Types ---
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  imageUrls: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_ROUTE = 'api/products';

// --- Product Card ---
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl =
    product.imageUrls.length > 0
      ? product.imageUrls[0]
      : 'https://via.placeholder.com/400x300/F3F4F6/9CA3AF?text=No+Image';

  // Stock status class
  const stockColor =
    product.stock > 10
      ? 'bg-green-100 text-green-700' // High stock
      : product.stock > 0
      ? 'bg-yellow-100 text-yellow-700' // Low stock
      : 'bg-red-100 text-red-700'; // Out of stock

  return (
    // Card with a cleaner shadow and focus effect
    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition duration-300 cursor-pointer w-full max-w-md overflow-hidden">
      {/* Image Container */}
      <div className="h-56 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition duration-700"
        />
        {product.imageUrls.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm text-gray-500 font-medium">
            No Image Available
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* Modern Price Display & Stock Status (Top Section) */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-baseline">
            <DollarSign className="w-5 h-5 text-gray-400 mr-1 mt-1" />
            {/* Unique, modern price display */}
            <span className="text-4xl font-extrabold text-blue-700 tracking-tight">
              {product.price.toFixed(2)}
            </span>
          </div>

          <div 
            className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full ${stockColor} whitespace-nowrap`}
          >
            <Box className="w-3 h-3 mr-1" />
            {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
          </div>
        </div>
        
        {/* Divider */}
        <hr className="mb-4 border-gray-100" />


        {/* Product Details (Bottom Section) */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-3">
            {product.description || 'No description provided.'}
          </p>
        )}
        
        {/* Category and Dates */}
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          {product.category && (
            <span className="flex items-center font-medium">
              <Tag className="w-3 h-3 mr-1 text-blue-500" />
              {product.category}
            </span>
          )}
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Updated: {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard ---
const ProductsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 500));

    try {
      // Attempt to fetch from API
      const res = await fetch(API_ROUTE);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setProducts(data);
    } catch {
      // Fallback data for demonstration
      setProducts([
        {
          id: '1',
          name: 'Mechanical Gaming Keyboard RGB Pro Edition',
          description: 'A full-sized, clicky mechanical keyboard with customizable RGB lighting and premium magnetic wrist rest. Designed for speed and durability.',
          price: 129.99,
          stock: 4,
          category: 'Accessories',
          imageUrls: ['https://picsum.photos/400/300?2'],
          isPublished: true,
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-11-20T10:00:00Z',
        },
        {
          id: '2',
          name: 'Ergonomic Vertical Mouse Wireless',
          description: 'A mouse designed to reduce wrist strain during long sessions by maintaining a natural handshake grip. Features six programmable buttons.',
          price: 59.99,
          stock: 15,
          category: 'Accessories',
          imageUrls: ['https://picsum.photos/400/300?1'],
          isPublished: true,
          createdAt: '2025-05-01T10:00:00Z',
          updatedAt: '2025-10-10T10:00:00Z',
        },
        {
          id: '3',
          name: '4K Ultra HD Curved Monitor 32-inch ProArt',
          description: 'High-resolution, curved display with 144Hz refresh rate, HDR support, and minimal bezel for immersive gaming and professional content creation.',
          price: 999.00,
          stock: 2,
          category: 'Displays',
          imageUrls: ['https://picsum.photos/400/300?3'],
          isPublished: true,
          createdAt: '2025-03-20T10:00:00Z',
          updatedAt: '2025-12-15T10:00:00Z',
        },
        {
          id: '4',
          name: 'Noise Cancelling Studio Headphones Elite',
          description: 'Over-ear headphones with superior sound quality, advanced active noise cancellation, and a battery life of up to 30 hours.',
          price: 249.50,
          stock: 12,
          category: 'Audio',
          imageUrls: ['https://picsum.photos/400/300?4'],
          isPublished: true,
          createdAt: '2025-02-10T10:00:00Z',
          updatedAt: '2025-09-01T10:00:00Z',
        },
        {
            id: '5',
            name: 'Webcam Pro 1080p Ultra Wide Field of View',
            description: 'Full HD webcam with built-in stereo microphone, auto-focus, and a wide field of view perfect for group meetings and professional streaming.',
            price: 49.99,
            stock: 0, // Out of stock example
            category: 'Accessories',
            imageUrls: ['https://picsum.photos/400/300?5'],
            isPublished: true,
            createdAt: '2025-06-05T10:00:00Z',
            updatedAt: '2025-07-25T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 flex justify-center items-center">
            <Package className="mr-3 text-blue-600 w-8 h-8" />
            Modern Product Inventory
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            Showcasing **{products.length} unique** products currently in stock.
          </p>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            {loading ? 'Loading...' : 'Refresh Inventory'}
          </button>
        </div>

        {/* Grid (CENTERED) */}
        {loading ? (
          <div className="text-center py-24">
            <RotateCcw className="w-12 h-12 mx-auto animate-spin text-blue-600" />
            <p className="mt-3 text-gray-600">Fetching products...</p>
          </div>
        ) : (
          <div
            className="
              grid gap-8 mx-auto
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-3
              justify-items-center
            "
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsDashboard;