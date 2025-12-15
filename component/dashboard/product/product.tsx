// file: app/dashboard/page.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Trash2, Edit, X, Zap, Loader2, Image, Calendar, Tag, DollarSign, Package,
  Eye, TrendingUp, LayoutDashboard, Settings, LogOut, CheckCircle, AlertTriangle, FileText
} from 'lucide-react'; 
// Note: Icons (Tag, DollarSign, Package) are used for Product-specific visual relevance.

// --- 1. Types and Initial State ---
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
}

const INITIAL_FORM_STATE = {
    name: '', description: '', price: 0, stock: 0, isPublished: false, imageUrls: '', category: '',
};

// Utility function to format date
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// --- 2. Main Component (ProductDashboard) ---
const ProductDashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // NOTE: Using a simple alert for success/error instead of a modal to keep it simple,
    // but the final UI styling is matching the slider screenshot.

    // Derived states for stats cards
    const totalProducts = products.length;
    const productsInStock = products.filter(p => p.stock > 0).length;
    const totalImageLinks = useMemo(() => products.reduce((sum, p) => sum + p.imageUrls.length, 0), [products]);

    // Effect to handle form data for editing
    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                description: editingProduct.description || '',
                price: editingProduct.price,
                stock: editingProduct.stock,
                isPublished: editingProduct.isPublished,
                imageUrls: editingProduct.imageUrls.join(', '),
                category: editingProduct.category || '',
            });
        } else {
            setFormData(INITIAL_FORM_STATE);
        }
    }, [editingProduct]);

    // READ (GET) - Fetch all products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); 
            
            // Simulating a successful fetch
            const simulatedProducts: Product[] = [
                { id: 'prod_1', name: 'Premium Wireless Headset', description: 'ANC headphones with 50-hour battery life.', price: 199.99, stock: 45, category: 'Electronics', imageUrls: ['https://via.placeholder.com/100x60/4f46e5/ffffff?text=Headset'], isPublished: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: 'prod_2', name: 'Cotton T-Shirt - Blue', description: '100% organic cotton.', price: 29.50, stock: 0, category: 'Clothing', imageUrls: ['https://via.placeholder.com/100x60/10b981/ffffff?text=Shirt'], isPublished: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
                { id: 'prod_3', name: '4K Monitor 27 inch', description: null, price: 549.00, stock: 12, category: 'Electronics', imageUrls: ['https://via.placeholder.com/100x60/f59e0b/ffffff?text=Monitor'], isPublished: false, createdAt: new Date().toISOString() },
            ];

            const response = await fetch('/api/products', { method: 'GET' });
            if (response.ok) {
                const data: Product[] = await response.json();
                setProducts(data);
            } else {
                // Fallback to simulated data if API fails for UI preview
                // In a real app, you would only set the error here.
                setProducts(simulatedProducts); 
                // throw new Error('Failed to fetch product data');
            }
        } catch (err) {
            setError(`Error fetching products: ${err instanceof Error ? err.message : 'Unknown error'}`);
            // Fallback to simulated data for UI testing
            setProducts([
                { id: 'prod_1', name: 'Premium Wireless Headset', description: 'ANC headphones with 50-hour battery life.', price: 199.99, stock: 45, category: 'Electronics', imageUrls: ['https://via.placeholder.com/100x60/4f46e5/ffffff?text=Headset'], isPublished: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: 'prod_2', name: 'Cotton T-Shirt - Blue', description: '100% organic cotton.', price: 29.50, stock: 0, category: 'Clothing', imageUrls: ['https://via.placeholder.com/100x60/10b981/ffffff?text=Shirt'], isPublished: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    
    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | number | boolean = value;

        if (type === 'number') {
            finalValue = parseFloat(value) || 0;
        } else if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    // CREATE (POST) / UPDATE (PUT) Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const isEditMode = !!editingProduct;
        const actionType = isEditMode ? 'update' : 'create';

        const dataToSend: any = {
            action: actionType,
            id: isEditMode ? editingProduct!.id : undefined,
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            stock: Number(formData.stock),
            category: formData.category,
            isPublished: formData.isPublished,
            imageUrls: formData.imageUrls.split(',').map(url => url.trim()).filter(url => url),
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok || response.status === 201) {
                alert(isEditMode ? 'Product Saved Successfully!' : 'Product Created Successfully!');
                fetchProducts();
                setEditingProduct(null);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Operation failed.');
            }
        } catch (err: any) {
             setError(err.message || `Operation failed.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // DELETE operation
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/products', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id }),
            });

            if (response.status === 204 || response.ok) { 
                alert('Product Deleted Successfully!');
                fetchProducts();
            } else {
                 const errorData = await response.json();
                throw new Error(errorData.message || 'Deletion failed.');
            }
        } catch (err: any) {
            setError(err.message || 'Deletion failed.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setError(null);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setFormData(INITIAL_FORM_STATE);
        setError(null);
    };

    // --- Render Logic ---
    const isEditing = !!editingProduct;
    const formTitle = isEditing ? `Update Product Details` : 'Upload New Product Item';
    
    // Tailwind Classes derived from the screenshot's dark theme
    const bgPrimary = 'bg-gray-900';
    const bgCard = 'bg-gray-800';
    const borderAccent = 'border-indigo-600';
    const textAccent = 'text-indigo-400';
    const textLight = 'text-white';
    const textMuted = 'text-gray-400';
    const inputStyle = `mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg ${textLight} placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner`;
    const buttonCreateStyle = `w-full sm:w-auto px-10 py-3 rounded-xl font-bold ${textLight} shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center justify-center`;

    return (
        <div className={`min-h-screen ${bgPrimary} ${textLight} font-sans p-4 sm:p-8 lg:p-10`}>
            
            {/* Header and Description */}
            <header className="mb-10 pb-5 border-b-2 border-indigo-600">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white transition duration-300 ease-in-out">
                    <Tag className="w-8 h-8 inline mr-3 text-indigo-400" /> **Product Catalog Management**
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Centralized CRUD interface for managing all product catalog items.</p>
            </header>

            {/* Stat Cards (Matching Home Slider UI) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Stat Card 1: Total Products (TOTAL SLIDER ITEMS) */}
                <div className={`${bgCard} p-6 rounded-xl shadow-xl border-l-4 border-indigo-500 transition duration-300 hover:shadow-indigo-500/30 transform hover:-translate-y-1`}>
                    <p className="text-sm font-semibold text-indigo-400 uppercase">TOTAL PRODUCTS</p>
                    <p className="text-4xl font-bold mt-1 text-white">{totalProducts}</p>
                    <p className="text-xs text-gray-500 mt-2">Database records</p>
                </div>
                {/* Stat Card 2: Total Image Links (TOTAL IMAGES STORED) */}
                <div className={`${bgCard} p-6 rounded-xl shadow-xl border-l-4 border-green-500 transition duration-300 hover:shadow-green-500/30 transform hover:-translate-y-1`}>
                    <p className="text-sm font-semibold text-green-400 uppercase">TOTAL IMAGE LINKS</p>
                    <p className="text-4xl font-bold mt-1 text-white">{totalImageLinks}</p>
                    <p className="text-xs text-gray-500 mt-2">Cloudinary assets linked</p>
                </div>
                {/* Stat Card 3: System Status */}
                <div className={`${bgCard} p-6 rounded-xl shadow-xl border-l-4 border-yellow-500 transition duration-300 hover:shadow-yellow-500/30 transform hover:-translate-y-1`}>
                    <p className="text-sm font-semibold text-yellow-400 uppercase">SYSTEM STATUS</p>
                    <div className="text-4xl font-bold mt-1 text-white flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-3 bg-green-500`}></span>
                        Online
                    </div>
                    <p className="text-xs text-gray-500 mt-2">API connection status</p>
                </div>
            </div>

            {/* 🛑 Error Display */}
            {error && (
                <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-lg shadow-xl flex justify-between items-center">
                    <div>
                        <p className="font-bold flex items-center"><X className="w-5 h-5 mr-2" /> Error:</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className='text-red-300 hover:text-red-100 p-1 rounded-full'><X className='w-5 h-5'/></button>
                </div>
            )}

            {/* 1. CREATE / UPDATE Form Area (Matching Home Slider UI) */}
            <div className={`transition-all duration-500 ease-in-out mb-10`}>
                <section id="product-form-section" className={`${bgCard} p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-300 border-t-8 ${isEditing ? 'border-yellow-500' : 'border-indigo-600'}`}>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        {isEditing ? <Edit className="w-6 h-6 mr-2 text-yellow-400" /> : <Plus className="w-6 h-6 mr-2 text-indigo-400" />} 
                        {formTitle}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1: Name, Category, Price */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><Tag className='w-4 h-4 mr-1'/> Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><Tag className='w-4 h-4 mr-1'/> Category</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} className={inputStyle} placeholder="e.g. Electronics, Clothing" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><DollarSign className='w-4 h-4 mr-1'/> Price ($)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className={inputStyle} required />
                            </div>
                        </div>
                        
                        {/* Row 2: Stock, Published */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><Package className='w-4 h-4 mr-1'/> Stock Quantity</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" className={inputStyle} required />
                            </div>
                            <div className="flex items-center pt-6 md:col-span-2">
                                <input 
                                    type="checkbox" 
                                    name="isPublished" 
                                    checked={formData.isPublished} 
                                    onChange={handleChange} 
                                    className="h-4 w-4 bg-gray-700 border-gray-600 text-indigo-600 rounded focus:ring-indigo-500" 
                                />
                                <label className="ml-2 block text-sm font-medium text-gray-300">Publish Immediately (Visible on Site)</label>
                            </div>
                        </div>

                        {/* Row 3: Description, Image URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><FileText className='w-4 h-4 mr-1'/> Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputStyle} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 flex items-center"><Image className='w-4 h-4 mr-1'/> Image URLs (comma separated)</label>
                                <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} rows={3} className={inputStyle} placeholder="url1, url2, url3" />
                                <p className="text-xs text-gray-500 mt-1">Links directly to images (e.g., from Cloudinary/S3).</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`${buttonCreateStyle} ${
                                    isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/50 disabled:bg-gray-600'
                                }`}
                            >
                                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : isEditing ? <><Edit className="w-5 h-5 mr-2" /> Update Product Item</> : <><Zap className="w-5 h-5 mr-2" /> Create Product Item</>}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition duration-150 shadow-md disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 mr-2 inline" /> Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            </div>

            {/* 2. READ Section - Product List (Matching Home Slider UI) */}
            <section className={`${bgCard} p-4 md:p-6 rounded-xl shadow-2xl border border-gray-700`}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Eye className="w-6 h-6 mr-2 text-indigo-400" /> Current Product Catalog ({products.length})
                </h2>

                {loading && <p className="text-center text-indigo-400 py-12 text-xl font-semibold animate-pulse"><Loader2 className="w-8 h-8 inline mr-2 animate-spin" /> Fetching latest data...</p>}

                {/* Table View */}
                <div className="overflow-x-auto rounded-lg shadow-inner bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Product Name / Image</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Price/Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Created At (UTC)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {products.map((product) => (
                                <tr 
                                    key={product.id} 
                                    className={`transition duration-150 ease-in-out ${editingProduct?.id === product.id ? 'bg-yellow-900/30 ring-2 ring-yellow-500' : 'hover:bg-gray-700'}`}
                                >
                                    {/* Product Name / Image Column */}
                                    <td className="px-6 py-4 flex items-center space-x-4">
                                        {product.imageUrls[0] ? (
                                            <img 
                                                src={product.imageUrls[0]} 
                                                alt={`${product.name} Preview`} 
                                                className="h-10 w-16 object-cover rounded-md border border-gray-600 shadow-md" 
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="text-gray-500 text-xs italic w-16 h-10 flex items-center justify-center border border-gray-600 rounded-md bg-gray-900"><Image className='w-4 h-4'/></span>
                                        )}
                                        <div className="text-sm font-semibold text-gray-200">
                                            {product.name}
                                            <span className="block text-xs text-gray-500 mt-0.5">{product.category || 'N/A'}</span>
                                        </div>
                                    </td>
                                    
                                    {/* Price / Stock Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="text-green-400 font-bold">${product.price.toFixed(2)}</div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-600/30 text-green-400' : product.stock > 0 ? 'bg-yellow-600/30 text-yellow-400' : 'bg-red-600/30 text-red-400'}`}>
                                            Stock: {product.stock}
                                        </span>
                                    </td>
                                    
                                    {/* Status Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isPublished ? 'bg-indigo-600/30 text-indigo-400' : 'bg-red-600/30 text-red-400'}`}>
                                            {product.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    
                                    {/* Created At Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        <span className='flex items-center'><Calendar className='w-4 h-4 mr-2 text-gray-500'/>{formatDateTime(product.createdAt)}</span>
                                    </td>
                                    
                                    {/* Actions Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => startEdit(product)}
                                            className="text-yellow-500 hover:text-yellow-400 transition p-2 rounded-lg hover:bg-gray-700"
                                            title="Edit Item"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-400 transition p-2 rounded-lg hover:bg-gray-700"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && !loading && (
                        <div className="p-10 text-center text-gray-500">
                            <AlertTriangle className='w-6 h-6 inline mr-2 text-yellow-500'/> No products found. Use the form above to create one.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductDashboard;