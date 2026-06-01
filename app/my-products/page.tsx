"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  ImageIcon,
  Store,
  Eye
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrls: string[];
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  saleType: string;
  condition: string;
  isPublished: boolean;
  createdAt: string;
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  const fetchMyProducts = async () => {
    try {
      const res = await fetch("/api/products?myProducts=true");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError("Failed to load your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      setDeleteLoading(id);
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      alert("Failed to delete product");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff5f9] flex items-center justify-center mt-[160px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-gray-500">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f9] text-gray-900 mt-[160px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Store className="w-6 h-6 text-pink-500" />
                My Products
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your listed products
              </p>
            </div>
            <Link
              href="/add-product"
              className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/20"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMyProducts}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No products yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven&apos;t listed any products yet. Start selling by adding your first product.
            </p>
            <Link
              href="/add-product"
              className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/20"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-pink-300 hover:shadow-lg transition-all group"
              >
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        product.condition === "NEW"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {product.condition}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        product.saleType === "SELL"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {product.saleType}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <span className="text-pink-500 font-bold">
                      ${product.price}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {product.description || "No description"}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.categories?.[0] && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        {product.categories[0]}
                      </span>
                    )}
                    {product.brands?.[0] && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        {product.brands[0]}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                      {product.sizes?.length || 0} sizes
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-pink-100 text-gray-700 hover:text-pink-600 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteLoading === product.id}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
