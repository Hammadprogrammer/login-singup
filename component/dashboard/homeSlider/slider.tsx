'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Trash2, Edit, X, Zap, Loader2, Image, Calendar, 
  Eye, CornerDownRight, TrendingUp, LayoutDashboard, Settings, LogOut, FileText, CheckCircle, AlertTriangle 
} from 'lucide-react'; 

// TypeScript type: ID is Int
interface SliderItem {
  id: number; 
  images: string[];
  createdAt: string;
}

const initialCreateState = {
  images: null as FileList | null, 
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

// ==========================================================
// MODAL COMPONENTS
// ==========================================================

// 1. Success Modal (For C, U, D completion)
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

// 2. Confirmation Modal (For Delete)
const ConfirmationModal = ({ 
    itemToDelete, 
    onConfirm, 
    onCancel 
}: { 
    itemToDelete: SliderItem | null; 
    onConfirm: (id: number) => void; 
    onCancel: () => void 
}) => {
    if (!itemToDelete) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-t-8 border-red-500">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Confirm Deletion</h3>
                    <p className="text-gray-300 mb-4">
                        Are you **absolutely sure** you want to delete item ID <span className="font-bold text-red-400">{itemToDelete.id}</span>? 
                    </p>
                    <p className='text-sm text-red-300 mb-6'>This action is permanent and deletes all associated images.</p>
                    <div className='flex space-x-4'>
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-150 shadow-md"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(itemToDelete.id)}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
                        >
                            <Trash2 className="w-4 h-4 inline mr-1" /> Yes, Delete It
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ==========================================================
// Main Component
// ==========================================================
export const HomeSliderCRUD = () => {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createFormData, setCreateFormData] = useState(initialCreateState);
  const [submitting, setSubmitting] = useState(false);
  
  // State for Editing
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]); // Existing URLs in edit mode
  const [newFiles, setNewFiles] = useState<FileList | null>(null); // New files to upload
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [itemToDelete, setItemToDelete] = useState<SliderItem | null>(null); // For Confirmation Modal

  // Memoized total image count for the dashboard stats
  const totalImages = useMemo(() => sliders.reduce((sum, item) => sum + item.images.length, 0), [sliders]);


  // ----------------------------------------------------------
  // R - READ Function
  // ----------------------------------------------------------
  const fetchSliders = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors on new fetch
    try {
      // Simulate network delay for a better loading experience
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const response = await fetch('/api/dashboard/homeslider', { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data: SliderItem[] = await response.json();
      setSliders(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(`Error fetching sliders: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);


  // ----------------------------------------------------------
  // C - CREATE Function
  // ----------------------------------------------------------
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!createFormData.images || createFormData.images.length === 0) {
        setError('Please select at least one image file.');
        setSubmitting(false);
        return;
    }

    try {
      const data = new FormData();
      for (let i = 0; i < createFormData.images.length; i++) {
        data.append('images', createFormData.images[i]);
      }
      
      const response = await fetch('/api/dashboard/homeslider', {
        method: 'POST',
        body: data, 
      });

      if (!response.ok) throw new Error('Image Upload/Create failed');

      // Show success modal
      setModalMessage('New slider item and images uploaded successfully.');
      setShowSuccessModal(true);
      
      // Reset form state
      setCreateFormData(initialCreateState);
      const fileInput = document.getElementById('create-file-input') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

      await fetchSliders(); 

    } catch (err: any) {
      setError(err.message || `Creation failed.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // U - UPDATE Function (REPLACEMENT LOGIC)
  // ----------------------------------------------------------
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSubmitting(true);
    setError(null);

    // Helper to check if new files are actually present
    const isNewFileUpload = !!newFiles && newFiles.length > 0;

    try {
        if (isNewFileUpload) {
            // Case 1: Uploading New Files (REPLACE existing image set)
            const formData = new FormData();
            formData.append('id', editingItem.id.toString());
            
            for (let i = 0; i < newFiles.length; i++) {
                formData.append('newImages', newFiles[i]);
            }
            formData.append('mode', 'replace_all'); 

            const response = await fetch('/api/dashboard/homeslider', {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) throw new Error('File upload replacement failed.');

        } else {
            // Case 2: Only URL manipulation (no new files uploaded, handle removed URLs)
            
            // Check if the resulting image array is empty and disallow saving an empty item
            if (editImages.length === 0) {
                 throw new Error("Cannot save an item with zero images. Please keep at least one existing image or upload new images.");
            }
            
            const response = await fetch('/api/dashboard/homeslider', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingItem.id,
                    images: editImages, 
                    mode: 'url_only', 
                }),
            });
            if (!response.ok) throw new Error('URL update failed.');
        }

        setModalMessage('Slider item successfully updated.');
        setShowSuccessModal(true);
        
        cancelEdit(); 
        await fetchSliders(); 

    } catch (err: any) {
        setError(err.message || `Update operation failed.`);
    } finally {
        setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // D - DELETE Function
  // ----------------------------------------------------------
  
  // 1. Start deletion process (opens modal)
  const startDelete = (item: SliderItem) => {
      setItemToDelete(item);
  }
  
  // 2. Execute deletion (called by modal)
  const executeDelete = async (id: number) => {
    setItemToDelete(null); // Close the confirmation modal
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/homeslider', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }), 
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Deletion failed.');
      }

      setModalMessage(`Item ID ${id} and its images were successfully deleted.`);
      setShowSuccessModal(true);
      
      await fetchSliders(); 

    } catch (err: any) {
      setError(err.message || 'Deletion failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------
  // Edit Helper Functions
  // ----------------------------------------------------------
  const startEdit = (item: SliderItem) => {
    setEditingItem(item);
    setEditImages([...item.images]); 
    setNewFiles(null); 
    setError(null);
    // Smooth scroll to form
    if (typeof window !== 'undefined') {
        document.getElementById('edit-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditImages([]);
    setNewFiles(null);
    setError(null);
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setEditImages(editImages.filter(url => url !== urlToRemove));
  };
  
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewFiles(e.target.files);
      // Clear existing URLs list only if files are selected to force the user into replacement mode
      if (e.target.files && e.target.files.length > 0) {
          setEditImages([]); 
      }
  };
  
  const handleCancelNewFiles = () => {
    setNewFiles(null);
    // Restore the original image URLs when cancelling new files
    if (editingItem) {
        setEditImages([...editingItem.images]);
    }
    const fileInput = document.getElementById('edit-file-input') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }


  // ----------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------
  const isEditing = !!editingItem;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex">
        
        {/* MODALS */}
        {showSuccessModal && <SuccessModal message={modalMessage} onClose={() => setShowSuccessModal(false)} />}
        {itemToDelete && <ConfirmationModal itemToDelete={itemToDelete} onConfirm={executeDelete} onCancel={() => setItemToDelete(null)} />}

        {/* Fixed Sidebar (Simulated Dashboard Menu) - Hidden on Mobile */}
        {/* <div className="hidden lg:flex flex-col w-64 bg-gray-800 border-r border-gray-700 p-6 shadow-2xl">
            <div className="text-3xl font-extrabold text-indigo-400 mb-10 mt-2 flex items-center">
                <LayoutDashboard className="w-8 h-8 mr-2"/> Admin Panel
            </div>
         
            <div className="mt-auto pt-6 border-t border-gray-700">
                <button className="flex items-center p-3 rounded-xl text-red-400 font-medium w-full transition duration-200 hover:text-red-300 hover:bg-gray-700">
                    <LogOut className="w-5 h-5 mr-3"/> Logout
                </button>
            </div>
        </div> */}

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-8 lg:p-10">
            <header className="mb-10 pb-5 border-b-2 border-indigo-600">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white transition duration-300 ease-in-out">
                    <Zap className="w-8 h-8 inline mr-3 text-indigo-400" /> **Home Slider Management**
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Centralized CRUD interface for managing high-impact banner rotations.</p>
            </header>
            
            {/* Amazing Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Stat Card 1: Total Items */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-indigo-500 transition duration-300 hover:shadow-indigo-500/30 transform hover:-translate-y-1">
                    <p className="text-sm font-semibold text-indigo-400 uppercase">Total Slider Items</p>
                    <p className="text-4xl font-bold mt-1 text-white">{sliders.length}</p>
                    <p className="text-xs text-gray-500 mt-2">Database records</p>
                </div>
                {/* Stat Card 2: Total Images */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-green-500 transition duration-300 hover:shadow-green-500/30 transform hover:-translate-y-1">
                    <p className="text-sm font-semibold text-green-400 uppercase">Total Images Stored</p>
                    <p className="text-4xl font-bold mt-1 text-white">{totalImages}</p>
                    <p className="text-xs text-gray-500 mt-2">Cloudinary assets linked</p>
                </div>
                {/* Stat Card 3: Status Indicator */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border-l-4 border-yellow-500 transition duration-300 hover:shadow-yellow-500/30 transform hover:-translate-y-1">
                    <p className="text-sm font-semibold text-yellow-400 uppercase">System Status</p>
                    <div className="text-4xl font-bold mt-1 text-white flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-3 ${loading ? 'bg-yellow-500 animate-ping' : 'bg-green-500'}`}></span>
                        {loading ? 'Fetching' : 'Online'}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">API connection status</p>
                </div>
            </div>

            {/* 🛑 Error Display */}
            {error && (
                <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 mb-6 rounded-lg shadow-xl transition duration-500 ease-in-out flex justify-between items-center">
                    <div>
                        <p className="font-bold flex items-center"><X className="w-5 h-5 mr-2" /> Error:</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className='text-red-300 hover:text-red-100 p-1 rounded-full'><X className='w-5 h-5'/></button>
                </div>
            )}

            {/* 1. Create/Edit Form Container */}
            <div className={`transition-all duration-500 ease-in-out mb-10 ${isEditing ? 'border-yellow-500' : 'border-indigo-600'}`}>
                {/* Conditional Form Rendering: Create */}
                {!isEditing && (
                    <section id="create-form-section" className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-300 border-t-8 border-indigo-600">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Plus className="w-6 h-6 mr-2 text-indigo-400" /> Upload New Slider Item
                        </h2>
                        
                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="create-file-input" className="block text-base font-semibold text-gray-300 mb-2">Select Images (JPEG/PNG)</label>
                                <input
                                    id="create-file-input"
                                    type="file"
                                    accept="image/*" 
                                    multiple 
                                    onChange={(e) => setCreateFormData({...createFormData, images: e.target.files})}
                                    className="w-full p-4 border-2 border-dashed border-indigo-500/50 rounded-lg bg-gray-700 text-white cursor-pointer 
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                        file:text-sm file:font-semibold file:bg-indigo-700 file:text-white 
                                        hover:file:bg-indigo-600 transition duration-150
                                        
                                        file:text-gray-900
                                    "
                                    required
                                    disabled={submitting}
                                />
                                <p className="text-sm text-gray-500 mt-2 flex items-center"><CornerDownRight className='w-4 h-4 mr-1'/> Recommended aspect ratio: 16:9 (1920x1080).</p>
                            </div>

                            <button
                                type="submit"
                                // Ensure boolean output
                                disabled={submitting || !createFormData.images || createFormData.images.length === 0}
                                className={`w-full sm:w-auto px-10 py-3 rounded-xl font-bold text-white shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center justify-center ${
                                    submitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/50 disabled:bg-gray-600'
                                }`}
                            >
                                {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</> : <><Zap className="w-5 h-5 mr-2" /> Create Slider Item</>}
                            </button>
                        </form>
                    </section>
                )}

                {/* Conditional Form Rendering: Edit */}
                {isEditing && (
                    <section id="edit-form-section" className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl transition-all duration-300 border-t-8 border-yellow-500">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <Edit className="w-6 h-6 mr-2 text-yellow-400" /> Editing Item ID: **{editingItem?.id}**
                        </h2>
                        
                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                            
                            {/* Existing Image URLs Management */}
                            <div className="border border-gray-700 p-4 rounded-lg bg-gray-700 shadow-inner">
                                <p className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                                    <Image className='w-5 h-5 mr-2 text-yellow-400'/> Current Images (URLs) 
                                    {!!newFiles && newFiles.length > 0 ? (
                                        <span className='ml-2 text-red-400 text-sm font-medium'>(Will be **REPLACED** by new upload)</span>
                                    ) : (
                                        <span className='ml-2 text-gray-400 text-sm font-medium'>({editImages.length} saved images)</span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 border border-gray-600 rounded-md bg-gray-900">
                                    {editImages.length === 0 ? (
                                        <p className="text-red-400 text-sm p-2 italic">
                                            {!!newFiles && newFiles.length > 0 
                                                ? "New files are selected and will replace the old set."
                                                : "No images currently saved. Upload new images below."
                                            }
                                        </p>
                                    ) : (
                                        editImages.map((url, index) => (
                                            <div key={index} className="relative group w-24 h-24 overflow-hidden rounded-lg shadow-md ring-2 ring-gray-600 transition duration-300 hover:scale-105">
                                                <img src={url} alt={`Slider ${index}`} className="w-full h-full object-cover" loading="lazy" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(url)}
                                                    className="absolute inset-0 bg-red-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-white text-xs font-bold"
                                                    aria-label="Remove image"
                                                    // FIX: Ensure boolean output here
                                                    disabled={submitting || (!!newFiles && newFiles.length > 0)} 
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* New Image Upload (Replacement) */}
                            <div>
                                <label htmlFor="edit-file-input" className="block text-base font-semibold text-gray-300 mb-2">
                                    Upload New Images to **REPLACE** Current Set
                                </label>
                                <input
                                    id="edit-file-input"
                                    type="file"
                                    accept="image/*" 
                                    multiple 
                                    onChange={handleNewFileChange}
                                    className="w-full p-4 border-2 border-dashed border-green-500/50 rounded-lg bg-gray-700 text-white cursor-pointer 
                                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                                        file:text-sm file:font-semibold file:bg-green-700 file:text-white 
                                        hover:file:bg-green-600 transition duration-150

                                        file:text-gray-900
                                    "
                                    disabled={submitting}
                                />
                                {!!newFiles && newFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-green-400 font-medium flex items-center justify-between p-2 bg-gray-700 rounded-lg">
                                        <span><Plus className='w-4 h-4 mr-1 inline' /> **{newFiles.length}** new files selected for upload (REPLACEMENT mode).</span>
                                        <button type='button' onClick={handleCancelNewFiles} className='text-red-400 hover:text-red-300'><X className='w-4 h-4 inline mr-1'/>Cancel New Files</button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                                <button
                                    type="submit"
                                    // Ensure boolean output here
                                    disabled={submitting || (editImages.length === 0 && (!newFiles || newFiles.length === 0))}
                                    className={`flex-1 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition duration-300 transform hover:scale-[1.02] flex items-center justify-center ${
                                        submitting ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 shadow-yellow-500/50 disabled:bg-gray-600 disabled:opacity-50'
                                    }`}
                                >
                                    {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving Changes...</> : <><Edit className="w-5 h-5 mr-2" /> Save Changes</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition duration-150 shadow-md disabled:opacity-50"
                                >
                                    <X className="w-5 h-5 mr-2 inline" /> Cancel Edit
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </div>

            {/* 2. Sliders List (Read & Actions) */}
            <section className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Eye className="w-6 h-6 mr-2 text-indigo-400" /> Current Live Sliders ({sliders.length})
                </h2>

                {loading && <p className="text-center text-indigo-400 py-12 text-xl font-semibold animate-pulse"><Loader2 className="w-8 h-8 inline mr-2 animate-spin" /> Fetching latest data...</p>}

                {/* Desktop Table View (lg screens and up) */}
                <div className="hidden lg:block overflow-x-auto rounded-lg shadow-inner bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Images (Count / Preview)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Created At (UTC)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {sliders.map((item) => (
                                <tr 
                                    key={item.id} 
                                    className={`transition duration-150 ease-in-out ${editingItem?.id === item.id ? 'bg-yellow-900/30 ring-2 ring-yellow-500' : 'hover:bg-gray-700'}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-400">{item.id}</td>
                                    <td className="px-6 py-4 flex items-center space-x-4">
                                        {item.images[0] ? (
                                            <img 
                                                src={item.images[0]} 
                                                alt={`Slider ${item.id} Preview`} 
                                                className="h-14 w-24 object-cover rounded-md border border-gray-600 shadow-md transition duration-300 hover:scale-[1.1]" 
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="text-gray-500 text-sm italic w-24 h-14 flex items-center justify-center border border-gray-600 rounded-md bg-gray-900"><X className='w-4 h-4 mr-1'/> No Preview</span>
                                        )}
                                        <span className={`text-base font-semibold ${item.images.length === 0 ? 'text-red-400' : 'text-green-400'}`}>{item.images.length} Images</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        <span className='flex items-center'><Calendar className='w-4 h-4 mr-1 text-indigo-400' /> {formatDateTime(item.createdAt)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => startEdit(item)}
                                            className="text-yellow-500 hover:text-yellow-400 font-semibold disabled:text-gray-600 p-2 rounded-md transition duration-150 hover:bg-gray-700"
                                            disabled={submitting || isEditing}
                                        >
                                            <Edit className="w-5 h-5 inline mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => startDelete(item)}
                                            className="text-red-500 hover:text-red-400 font-semibold disabled:text-gray-600 p-2 rounded-md transition duration-150 hover:bg-gray-700"
                                            disabled={submitting || isEditing}
                                        >
                                            <Trash2 className="w-5 h-5 inline mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View (hidden on lg and up) */}
                <div className="lg:hidden space-y-4">
                    {sliders.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 transition duration-300 ease-in-out ${editingItem?.id === item.id ? 'border-yellow-500 bg-yellow-900/20' : 'border-indigo-500 hover:shadow-xl hover:bg-gray-700'}`}
                        >
                            <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
                                <span className="text-xl font-bold text-indigo-400">ID: {item.id}</span>
                                <span className="text-sm font-medium text-gray-500 flex items-center">
                                    <Calendar className='w-4 h-4 mr-1' /> {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-4">
                                {item.images[0] ? (
                                    <img 
                                        src={item.images[0]} 
                                        alt={`Slider ${item.id} Preview`} 
                                        className="h-16 w-24 object-cover rounded-md border border-gray-600 shadow"
                                        loading="lazy"
                                    />
                                ) : (
                                     <span className="text-gray-500 text-sm italic w-24 h-16 flex items-center justify-center border border-gray-600 rounded-md bg-gray-900"><X className='w-4 h-4 mr-1'/> No Preview</span>
                                )}
                                <span className={`text-lg font-semibold ${item.images.length === 0 ? 'text-red-400' : 'text-green-400'}`}>{item.images.length} Images</span>
                            </div>

                            <div className="flex justify-around space-x-2 pt-3 border-t border-gray-700">
                                <button
                                    onClick={() => startEdit(item)}
                                    className="flex-1 flex items-center justify-center text-yellow-500 hover:text-yellow-400 font-semibold disabled:text-gray-600 p-2 rounded-lg transition duration-150 hover:bg-gray-700"
                                    disabled={submitting || isEditing}
                                >
                                    <Edit className="w-5 h-5 mr-1" /> Edit
                                </button>
                                <button
                                    onClick={() => startDelete(item)}
                                    className="flex-1 flex items-center justify-center text-red-500 hover:text-red-400 font-semibold disabled:text-gray-600 p-2 rounded-lg transition duration-150 hover:bg-gray-700"
                                    disabled={submitting || isEditing}
                                >
                                    <Trash2 className="w-5 h-5 mr-1" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


                {sliders.length === 0 && !loading && (
                    <div className="text-center py-12 bg-gray-700 rounded-lg border border-gray-600">
                        <Image className="w-12 h-12 text-indigo-400 mx-auto" />
                        <p className="text-xl text-gray-300 mt-3">No slider items found. Start by creating one!</p>
                    </div>
                )}
            </section>


            
        </div>
    </div>

  );
};