'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  UploadCloud,
  Package,
  Database,
  Link,
  Zap,
  X,
  Check,
  Eye,
  Box,
  Wallet,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// --- Type Definitions (Updated to match Prisma model) ---
interface Product {
  id: string; // Changed to String
  name: string;
  description: string | null; // Optional in Prisma
  price: number; // Float in Prisma, use number in TS
  stock: number; // Int in Prisma, use number in TS
  category: string | null; // Optional in Prisma
  imageUrls: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string; // Added updatedAt
}

// --- Initial Form State ---
interface FormState {
    name: string;
    price: string; // Managed as string for input, converted to number on save
    stock: string; // Managed as string for input, converted to number on save
    category: string;
    description: string;
    isPublished: boolean;
    imageUrls: string[];
}

const initialFormState: FormState = {
  name: '',
  price: '0.00',
  stock: '0',
  category: 'Electronics', // Default category
  description: '',
  isPublished: true,
  imageUrls: [],
};

// --- Constants ---
const API_ROUTE = '/api/products';

// --- Helper Functions ---

/**
 * Formats ISO date string to a readable format
 */
const formatDateTime = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'shortOffset',
    });
  } catch (e) {
    return 'N/A';
  }
};

// --- Components ---

// 1. Info Card Component
const InfoCard: React.FC<{
  title: string;
  value: string | number;
  description: string;
  status?: 'online' | 'offline';
  icon: React.ReactNode;
}> = ({ title, value, description, status, icon }) => (
  <div className="p-4 rounded-xl bg-gray-800 shadow-lg border border-gray-700">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-xs font-semibold uppercase text-gray-400">{title}</h3>
      {icon}
    </div>
    <p
      className={`text-3xl font-bold ${
        status === 'online' ? 'text-green-400' : status === 'offline' ? 'text-red-400' : 'text-white'
      }`}
    >
      {value}
    </p>
    <div className="text-sm text-gray-500 mt-1">
      {status === 'online' ? (
        <span className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
          Online
        </span>
      ) : status === 'offline' ? (
        <span className="flex items-center">
          <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
          Offline
        </span>
      ) : (
        description
      )}
    </div>
  </div>
);

// 2. Image Preview Component
const ImagePreview: React.FC<{
  url: string;
  isNew: boolean;
  onRemove: () => void;
}> = ({ url, isNew, onRemove }) => (
  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-600 shadow-sm">
    <img src={url} alt="Product Preview" className="w-full h-full object-cover" loading="lazy" />
    <button
      type="button"
      onClick={onRemove}
      title="Remove Image"
      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-500 transition"
    >
      <X className="w-4 h-4" />
    </button>
    {isNew && (
      <span className="absolute bottom-0 left-0 text-xs px-1 bg-blue-500 text-white rounded-tr-md">
        New
      </span>
    )}
  </div>
);


// 3. Success Modal
const SuccessModal = ({ message, onClose }: { message: string; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 border-t-8 border-green-500">
                <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 animate-bounce-slow" />
                    <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                    <p className="text-gray-300 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// 4. Product Form Modal
const ProductFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (
    data: Omit<Product, 'createdAt' | 'updatedAt'>,
    newFiles: File[]
  ) => void;
  isLoading: boolean;
  setShowSuccessModal: (message: string) => void;
}> = ({ isOpen, onClose, product, onSave, isLoading, setShowSuccessModal }) => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      // Initialize form data from product, converting number to string for input
      setFormData({
        name: product.name,
        price: product.price.toFixed(2), // Set price as string
        stock: product.stock.toString(), // Set stock as string
        category: product.category || initialFormState.category,
        description: product.description || initialFormState.description,
        isPublished: product.isPublished,
        imageUrls: product.imageUrls,
      });
      setExistingImageUrls(product.imageUrls);
    } else {
      setFormData(initialFormState);
      setExistingImageUrls([]);
    }
    // Cleanup Object URLs and reset files when modal closes/opens
    newFilePreviews.forEach(url => URL.revokeObjectURL(url));
    setNewFiles([]);
    setNewFilePreviews([]);
    setInputError(null);
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setInputError(null);
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'price') {
        // Allow only valid float characters, preventing 'e'
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    } else if (name === 'stock') {
        // Allow only valid integer characters, preventing 'e'
        if (/^\d*$/.test(value) || value === '') {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setNewFiles((prev) => [...prev, ...selectedFiles]);
      setNewFilePreviews((prev) => [...prev, ...newPreviews]);
      e.target.value = '';
    }
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewFile = (previewUrl: string, index: number) => {
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrl); 
  };

  const totalImages = existingImageUrls.length + newFiles.length;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseFloat(formData.price);
    const stockValue = parseInt(formData.stock);
    
    // --- Validation ---
    if (!formData.name.trim()) {
        setInputError('Product Name is required.');
        return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
        setInputError('Price (USDT) must be a positive number.');
        return;
    }
    if (isNaN(stockValue) || stockValue < 0) {
        setInputError('Stock must be zero or a positive integer.');
        return;
    }
    if (totalImages === 0) {
        setInputError('At least one image is required.');
        return;
    }
    setInputError(null);
    
    // Combine data for submission
    const dataToSave = { 
        ...(product ? { id: product.id } : {}), 
        name: formData.name,
        price: priceValue, // Send as number
        stock: stockValue, // Send as number
        category: formData.category.trim() || null, // Handle optional category
        description: formData.description.trim() || null, // Handle optional description
        isPublished: formData.isPublished,
        imageUrls: existingImageUrls,
    } as Omit<Product, 'createdAt' | 'updatedAt'>;
    
    onSave(dataToSave, newFiles);
    
    newFilePreviews.forEach(url => URL.revokeObjectURL(url));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      {/* Increased max-w-lg for better mobile fit on smaller devices */}
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          
          {inputError && (
              <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-3 rounded-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2"/>
                  <p className="text-sm font-medium">{inputError}</p>
              </div>
          )}

          {/* --- Image Upload Section --- */}
          <div className="space-y-3 border border-gray-700 p-4 rounded-lg bg-gray-700 shadow-inner">
            <label className="block text-base font-semibold text-gray-300 flex items-center mb-2">
                <Wallet className='w-5 h-5 mr-2'/> Product Images ({totalImages} total)
            </label>
            
            {/* Image Previews - Added flex-shrink-0 to prevent preview sizing issues */}
            <div className="flex flex-wrap gap-3 sm:gap-4 p-3 sm:p-4 border border-dashed border-gray-600 rounded-md bg-gray-900 min-h-[100px]">
              {existingImageUrls.map((url, index) => (
                <ImagePreview
                  key={`existing-${index}`}
                  url={url}
                  isNew={false}
                  onRemove={() => removeExistingImage(url)}
                />
              ))}
              {newFilePreviews.map((url, index) => (
                <ImagePreview
                  key={`new-${index}`}
                  url={url}
                  isNew={true}
                  onRemove={() => removeNewFile(url, index)}
                />
              ))}
                {totalImages === 0 && (
                    <div className="flex items-center justify-center w-full text-gray-500 text-sm">
                        <Wallet className="w-6 h-6 mr-2" /> No images selected.
                    </div>
                )}
            </div>

            {/* Dedicated Upload Button */}
            <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only" // Hidden input
                disabled={isLoading}
                autoComplete="off" // 🛑 Autofill Off
            />
            <label
                htmlFor="file-upload"
                className={`w-full flex items-center justify-center px-4 py-3 border-2 rounded-lg font-bold text-white transition duration-300 shadow-md cursor-pointer ${
                    isLoading ? 'bg-gray-600 border-gray-600 cursor-not-allowed' : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700'
                }`}
                title="Click to select image files"
            >
                <UploadCloud className="w-5 h-5 mr-2" /> Upload Images
            </label>
          </div>

          {/* --- Form Fields (Responsive Grid) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name *</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="E.g., Crypto Wallet Ledger X"
                autoComplete="off" // 🛑 Autofill Off
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Price (USDT) input field */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (USDT) *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <input
                    type="text" // Used to prevent 'e-0'
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    placeholder="59.99"
                    autoComplete="off" // 🛑 Autofill Off
                    className="block w-full border border-gray-600 rounded-md p-2 bg-gray-700 text-white pl-10 focus:border-green-500 focus:ring-green-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 sm:text-sm">USDT</span>
                  </div>
              </div>
            </div>
            
            {/* Stock input field */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-300">Stock</label>
              <input
                type="text" // Used to prevent 'e-0'
                name="stock"
                id="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="150"
                autoComplete="off" // 🛑 Autofill Off
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
            <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                autoComplete="off" // 🛑 Autofill Off
                className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
            >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home Goods">Home Goods</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed features and specs..."
              autoComplete="off" // 🛑 Autofill Off
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center pt-2">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={formData.isPublished}
              onChange={handleChange}
              autoComplete="off" // 🛑 Autofill Off
              className="h-4 w-4 text-blue-500 border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
            />
            <label
              htmlFor="isPublished"
              className="ml-2 block text-sm font-medium text-gray-300"
            >
              Published (Visible on site)
            </label>
          </div>

          {/* --- Submit Button --- */}
          {/* Changed justify-end to flex-col/flex-row for better mobile spacing */}
          <div className="pt-4 flex justify-end"> 
            <button
              type="submit"
              disabled={isLoading || totalImages === 0}
              className={`px-6 py-3 w-full sm:w-auto rounded-lg text-white font-semibold transition shadow-md ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500'
              } disabled:bg-gray-600 disabled:opacity-50`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </span>
              ) : isEdit ? (
                'Update Product'
              ) : (
                <span className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" /> Create Product
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Delete Confirmation Modal
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (id: string) => void;
  isLoading: boolean;
}> = ({ isOpen, onClose, product, onConfirm, isLoading }) => {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-red-400">Confirm Deletion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 text-gray-300">
          Are you sure you want to delete the product{' '}
          <strong className="font-semibold text-white">{product.name}</strong>?
          This action is permanent and will delete the images from Cloudinary.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product.id)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-semibold transition ${
              isLoading
                ? 'bg-red-700 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Deleting...
              </span>
            ) : (
              <span className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * 📦 Main Products Dashboard Component (Dark Theme)
 */
const ProductsDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(
    undefined
  );
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');


  // --- Fetch Data (READ) ---
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ROUTE);
      if (!response.ok) {
        setApiStatus('offline');
        throw new Error('Failed to fetch');
      }
      setApiStatus('online');
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- CRUD Operations ---

  const handleCreate = () => {
    setCurrentProduct(undefined); // Clear for creation mode
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = async (
    data: Omit<Product, 'createdAt' | 'updatedAt'>,
    newFiles: File[]
  ) => {
    setIsSaving(true);
    const isEditMode = !!(data as any).id;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const formData = new FormData();
      
      // Append non-file data
      formData.append('name', data.name);
      formData.append('price', data.price.toString()); // Price is USDT (Number)
      formData.append('stock', data.stock.toString()); // Stock (Number)
      formData.append('category', data.category || ''); // Nullable to string
      formData.append('description', data.description || ''); // Nullable to string
      formData.append('isPublished', data.isPublished.toString());

      if (isEditMode) {
        formData.append('id', (data as any).id);
        // Send existing URLs as a comma-separated string for the PUT route
        formData.append('existingImageUrls', data.imageUrls.join(',')); 
        // Append new files under the 'newImages' key
        newFiles.forEach((file) => formData.append('newImages', file));
      } else {
        // Append new files under the 'images' key for POST
        newFiles.forEach((file) => formData.append('images', file));
      }

      const response = await fetch(API_ROUTE, {
        method: method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      setModalMessage(`Product ${data.name} ${isEditMode ? 'updated' : 'created'} successfully!`);
      setShowSuccessModal(true);
      setIsModalOpen(false);
      fetchProducts(); 

    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, error);
      alert(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataOnlyUpdate = async (id: string, updateData: Partial<Product>) => {
    if(isSaving) return;
    setIsSaving(true);
    try {
        const response = await fetch(API_ROUTE, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updateData }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product data');
        }
        
        // Optimistic update
        setProducts(prev => prev.map(p => p.id === id ? {...p, ...updateData} : p));
        
    } catch (error: any) {
        console.error('Error updating product data:', error);
        alert(error.message || 'Failed to update product data.');
    } finally {
        setIsSaving(false);
    }
  };


  const handleDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    const deletedProductName = productToDelete?.name || 'Product';
    try {
      const response = await fetch(API_ROUTE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      setModalMessage(`${deletedProductName} deleted successfully!`);
      setShowSuccessModal(true);
      setIsDeleteModalOpen(false);
      fetchProducts(); 

    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.message || 'An unexpected error occurred during deletion.');
    } finally {
      setIsSaving(false);
      setProductToDelete(null);
    }
  };
  
  // --- UI Render ---
  const totalItems = products.length;
  const totalImages = products.reduce((sum, item) => sum + item.imageUrls.length, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      
      {/* Modals */}
      {showSuccessModal && <SuccessModal message={modalMessage} onClose={() => setShowSuccessModal(false)} />}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={currentProduct}
        onSave={handleSave as any}
        isLoading={isSaving}
        setShowSuccessModal={(msg) => { setModalMessage(msg); setShowSuccessModal(true); }}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={productToDelete}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
      
      {/* --- Header --- */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-white flex items-center">
        <Package className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-400" />
        **Product Catalog Management**
      </h1>
      <p className="text-gray-400 mb-8 text-sm sm:text-base">
        Centralized CRUD interface for managing all product inventory and details.
      </p>

      {/* --- Info Cards (Responsive Grid) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <InfoCard
          title="TOTAL PRODUCTS"
          value={totalItems}
          description="Database records"
          icon={<Database className="w-6 h-6 text-blue-400" />}
        />
        <InfoCard
          title="TOTAL IMAGES STORED"
          value={totalImages}
          description="Cloudinary assets linked"
          icon={<Link className="w-6 h-6 text-yellow-400" />}
        />
        <InfoCard
          title="TOTAL STOCK"
          value={products.reduce((sum, p) => sum + p.stock, 0)}
          description="Sum of all available stock"
          icon={<Box className="w-6 h-6 text-purple-400" />}
        />
        <InfoCard
          title="SYSTEM STATUS"
          value={apiStatus === 'online' ? 'Online' : 'Offline'}
          description="API connection status"
          status={apiStatus}
          icon={<Zap className="w-6 h-6 text-green-400" />}
        />
      </div>

      {/* --- Product Creation Button --- */}
      <div className="flex justify-end mb-6">
        <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 transition disabled:bg-gray-600 text-sm sm:text-base"
            disabled={loading || isSaving}
        >
            <Plus className="w-5 h-5 mr-2" /> Add New Product
        </button>
      </div>

      {/* --- Current Live Products (READ) --- */}
      <section className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white">
          ◎ Current Products ({totalItems})
        </h2>

        {loading ? (
            <div className="text-center py-10 text-gray-400">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                <p>Loading products...</p>
            </div>
        ) : totalItems === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-600 rounded-lg text-gray-400">
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <p>No products found in the catalog.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
              {/* Added min-w-full to ensure table takes up full space for scroll on mobile */}
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name / Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price (USDT)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md shadow border border-gray-600"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{product.name}</div>
                        <div className="text-xs text-gray-400">{product.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 flex items-center">
                        <Wallet className='w-4 h-4 mr-1'/> {product.price.toFixed(2)} <span className='text-xs ml-1 text-green-500'>USDT</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                            onClick={() => handleDataOnlyUpdate(product.id, { isPublished: !product.isPublished })}
                            disabled={isSaving}
                            className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold transition ${
                                product.isPublished
                                ? 'bg-green-700/50 text-green-300 hover:bg-green-700'
                                : 'bg-yellow-700/50 text-yellow-300 hover:bg-yellow-700'
                            } disabled:opacity-50`}
                            title={product.isPublished ? "Click to unpublish" : "Click to publish"}
                        >
                            {product.isPublished ? (
                                <><Check className='w-4 h-4 mr-1'/> Published</>
                            ) : (
                                <><Eye className='w-4 h-4 mr-1'/> Draft</>
                            )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-400 hover:text-blue-300 ml-3 transition disabled:opacity-50"
                          title="Edit"
                          disabled={isSaving}
                        >
                          <Edit2 className="w-5 h-5 inline mr-1" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(product)}
                          className="text-red-400 hover:text-red-300 ml-3 transition disabled:opacity-50"
                          title="Delete"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-5 h-5 inline mr-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </section>
    </div>
  );
};

export default ProductsDashboard;