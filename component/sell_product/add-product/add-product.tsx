"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  Loader2,
  Package,
  ImageIcon,
  CheckCircle2,
  ChevronDown,
  Ruler,
  Pipette,
  DollarSign,
  FileText,
  Tag,
  AlertCircle
} from "lucide-react";

const CONFIG = {
  categories: ["NEW IN", "READY TO WEAR", "COUTURE", "WINTER EDIT", "UNSTITCHED", "ACCESSORIES"] as const,

  subCategories: {
    "NEW IN": ["LATEST ARRIVALS"],
    "READY TO WEAR": ["EVERYDAY", "OCCASION WEAR", "ALL"],
    "COUTURE": ["BRIDAL", "SEMI-FORMAL"],
    "WINTER EDIT": ["SEASONAL PICKS"],
    "UNSTITCHED": ["Lawn", "Silk", "Cotton", "Embroidered"],
    "ACCESSORIES": ["Handbags", "Jewelry", "Watches", "Heels", "Clutches"]
  } as Record<string, string[]>,

  subCategoryTypes: {
    "EVERYDAY": ["Tunics & Kurtas", "Jackets", "Kaftans", "Tops", "Matching Sets", "Pants", "All"],
    "OCCASION WEAR": ["Kurta sets", "Kaftans", "Jackets", "Anarkalis", "Saree Set", "All"],
    "ALL": ["Kaftans", "Tunics & Kurtas", "Tops", "Jackets", "Matching Sets", "Pants", "Kurta sets", "Anarkalis", "Saree Set"],
    "BRIDAL": ["Luxury Bridal", "Destination Wedding", "Consultation"],
    "SEMI-FORMAL": ["Evening Wear", "Party Wear", "View All"],
    "SEASONAL PICKS": ["Shawls & Wraps", "Woolen Kurta", "Velvet Collection"],
    "Lawn": ["2 Piece", "3 Piece"],
    "Silk": ["Printed", "Embroidered"],
    "Handbags": ["Tote Bag", "Crossbody", "Shoulder Bag", "Backpack"],
    "Jewelry": ["Necklace Set", "Earrings", "Bangles", "Rings"],
    "Watches": ["Analog", "Digital", "Automatic", "Smart Watch"],
    "Heels": ["Stilettos", "Block Heels", "Pumps", "Wedges"],
    "Clutches": ["Bridal Clutch", "Box Clutch", "Envelope Clutch"]
  } as Record<string, string[]>,

  brands: {
    "NEW IN": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire"],
    "READY TO WEAR": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire", "Gul Ahmed", "Limelight", "J.", "Generation"],
    "COUTURE": ["Elan", "Asim Jofa", "Faraz Manan", "HSY", "Zara Shahjahan", "Faiza Saqlain", "Tena Durrani"],
    "WINTER EDIT": ["Bareeze", "Nishat Linen", "Bonanza Satrangi", "Alkaram Studio"],
    "UNSTITCHED": ["Kayseria", "Firdous", "Bin Saeed", "Zellbury"],
    "ACCESSORIES": ["Gucci", "Rolex", "Charles & Keith", "Hublot", "Pandora", "Aldo"]
  } as Record<string, string[]>,

  conditions: ["NEW", "OLD"] as const,
  saleTypes: ["SELL", "RENT"] as const,
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  
  colors: [
    { name: "Red", hex: "#FF0000" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Green", hex: "#008000" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Purple", hex: "#800080" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
    { name: "Navy", hex: "#000080" }
  ]
};

const LuxurySelect = ({ label, value, onChange, options, disabled, placeholder = "Select Option" }: any) => (
  <div className="space-y-2 w-full">
    {label && <label className="text-[10px] font-black text-gray-500 uppercase ml-1 flex items-center gap-2">{label}</label>}
    <div className="relative group">
      <select 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        className="w-full appearance-none bg-gray-50 border border-gray-200 p-4 pr-10 rounded-2xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <option value="" className="bg-white">{placeholder}</option>
        {options?.map((opt: string) => (
          <option key={opt} value={opt} className="bg-white text-gray-700 py-2">{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);

export default function AddProductForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: '', 
    price: '', 
    description: '',
    saleType: 'SELL', 
    condition: 'NEW', 
    cat: '', 
    subCat: '',
    productType: '', 
    brand: ''
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleArrayItem = (item: string, field: 'sizes' | 'colors') => {
    if (field === 'sizes') {
      setSizes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setColors(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Product Name is required";
    if (!form.cat) return "Please select a Category";
    if (!form.subCat) return "Please select a Sub-Category";
    if (!form.brand) return "Please select a Brand";
    if (!form.price || parseFloat(form.price) <= 0) return "Valid Price is required";
    if (sizes.length === 0) return "Select at least one Size";
    if (colors.length === 0) return "Select at least one Color";
    if (selectedFiles.length === 0) return "Please upload at least one product image";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    
    setError(null);
    setSubmitLoading(true);
    
    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('saleType', form.saleType);
    data.append('condition', form.condition);
    data.append('cat', form.cat);
    data.append('subCat', form.subCat);
    data.append('types', form.productType); 
    data.append('brand', form.brand);
    data.append('sizes', sizes.join(','));
    data.append('colors', colors.join(','));
    selectedFiles.forEach(file => data.append('images', file));

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        body: data
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push('/my-products');
        }, 1500);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to add product. Please try again.");
      }
    } catch (e) { 
      setError("Server error. Please try again.");
    } finally { 
      setSubmitLoading(false); 
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-12 text-center shadow-lg">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Product Added Successfully!</h2>
        <p className="text-gray-500">Redirecting to your products...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-xl">
            <Package className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Add New Product</h2>
            <p className="text-gray-500 text-sm">Fill in the details to list your item</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Tag size={12} /> Product Name
              </label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="e.g. Premium Silk Maxi"
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Category & Sub-Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LuxurySelect 
                label="Category" 
                value={form.cat} 
                onChange={(e: any) => setForm({...form, cat: e.target.value, subCat: '', productType: '', brand: ''})}
                options={CONFIG.categories}
              />
              <LuxurySelect 
                label="Sub-Category" 
                value={form.subCat} 
                disabled={!form.cat}
                onChange={(e: any) => setForm({...form, subCat: e.target.value, productType: ''})}
                options={form.cat ? CONFIG.subCategories[form.cat] : []}
              />
            </div>

            {/* Product Type */}
            {form.subCat && CONFIG.subCategoryTypes[form.subCat] && (
              <LuxurySelect 
                label="Specific Type"
                value={form.productType}
                onChange={(e: any) => setForm({...form, productType: e.target.value})}
                options={CONFIG.subCategoryTypes[form.subCat]}
                placeholder="Select Variation"
              />
            )}

            {/* Brand */}
            <LuxurySelect 
              label="Brand Name"
              value={form.brand}
              disabled={!form.cat}
              onChange={(e: any) => setForm({...form, brand: e.target.value})}
              options={form.cat ? CONFIG.brands[form.cat] : []}
            />

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <FileText size={12} /> Description
              </label>
              <textarea 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl h-32 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all text-gray-900 placeholder:text-gray-400 resize-none" 
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <DollarSign size={12} /> Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500 font-black text-xl">$</span>
                <input
                  type="text"
                  value={form.price}
                  onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setForm({ ...form, price: e.target.value }); }}
                  className="w-full bg-pink-50 border border-pink-200 pl-10 pr-4 py-4 rounded-2xl text-2xl font-black outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-gray-900 placeholder:text-gray-400"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Sale Type & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Sale Type</label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  {CONFIG.saleTypes.map(t => (
                    <button 
                      key={t} 
                      type="button" 
                      onClick={() => setForm({...form, saleType: t})} 
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.saleType === t ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Condition</label>
                <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  {CONFIG.conditions.map(c => (
                    <button 
                      key={c} 
                      type="button" 
                      onClick={() => setForm({...form, condition: c})} 
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.condition === c ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-500'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Ruler size={12}/> Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {CONFIG.sizes.map(s => (
                  <button 
                    key={s} 
                    type="button" 
                    onClick={() => toggleArrayItem(s, 'sizes')} 
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${sizes.includes(s) ? 'bg-pink-500 text-white border-pink-500 shadow-md' : 'border-gray-300 text-gray-500 hover:border-pink-300'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <Pipette size={12}/> Colors
              </label>
              <div className="flex flex-wrap gap-3">
                {CONFIG.colors.map(c => (
                  <button 
                    key={c.name} 
                    type="button" 
                    onClick={() => toggleArrayItem(c.name, 'colors')} 
                    className={`group relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${colors.includes(c.name) ? 'border-pink-500 scale-110 shadow-lg' : 'border-gray-300'}`}
                  >
                    <div className="w-7 h-7 rounded-full" style={{ backgroundColor: c.hex }} />
                    {colors.includes(c.name) && (
                      <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-0.5">
                        <CheckCircle2 size={12} className="text-white"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                <ImageIcon size={12}/> Product Images
              </label>
              <div className="grid grid-cols-4 gap-3">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                    <button 
                      type="button" 
                      onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} 
                      className="absolute top-1 right-1 bg-red-500 p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} className="text-white"/>
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-400 transition-all bg-gray-50"
                >
                  <Plus size={24}/>
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                multiple 
                accept="image/*" 
                onChange={e => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} 
              />
              <p className="text-xs text-gray-400">Click + to upload product images</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button 
            disabled={submitLoading} 
            className="w-full bg-pink-500 hover:bg-pink-600 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-pink-500/20 uppercase tracking-widest disabled:opacity-50 text-white"
          >
            {submitLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Adding Product...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus size={18} /> Add Product
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
