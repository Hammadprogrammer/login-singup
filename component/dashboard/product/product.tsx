"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Trash2, Edit, Plus, X, Loader2, Package, 
  AlertCircle, Sparkles, Image as ImageIcon, Ruler, Pipette, CheckCircle2, ChevronDown,
  Users, ChevronRight, User
} from 'lucide-react';

// User Product Group Component
const UserProductGroup = ({ group, onEdit, onDelete }: { group: any, onEdit: (p: any) => void, onDelete: (id: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user, products } = group;

  return (
    <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* User Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-purple-600/20 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-lg">{user.name === 'Unknown User' ? 'Admin' : user.name}</h3>
            <p className="text-slate-400 text-sm">{user.email || 'System Admin'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 bg-white/5 rounded-xl text-sm font-bold text-slate-300">
            {products.length} Products
          </span>
          <ChevronRight 
            className={`w-6 h-6 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </div>
      </button>

      {/* Products Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Size/Color</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 rounded-lg bg-slate-800 overflow-hidden border border-white/5">
                        {p.imageUrls?.[0] ? (
                          <img src={p.imageUrls[0]} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon size={16}/></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.description?.substring(0, 30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-blue-500">{p.categories?.[0]}</span>
                      <span className="text-xs text-slate-300">{p.subCategories?.[0]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-1 rounded">
                      {p.brands?.[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[80px]">
                      {p.sizes?.map((s: string) => <span key={s} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-300">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded ${p.condition === 'NEW' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">${p.price}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onEdit(p)} className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg transition-all"><Edit size={14}/></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 bg-white/5 hover:bg-red-600 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// const CONFIG = {
//   categories: ["Dress", "Accessories"] as const,

  
//   subCategories: {
// "Dress": [
//   "Shalwar Kameez",
//   "Maxi",
//   "Kurti",
//   "Kurta",
//   "Kurta Pajama",
//   "Lehenga",
//   "Gown",
//   "Abaya",
//   "Jumpsuit",
//   "Frock",
//   "Anarkali",
//   "Saree",
//   "Sharara",
//   "Gharara",
//   "Palazzo Suit",
//   "Pant Suit",
//   "Kaftan",
//   "Cape Dress",
//   "Co-Ord Set",
//   "Skirt",
//   "Blouse",
//   "Peplum Top",
//   "Tunics",
//   "Bridal Dress",
//   "Party Wear Dress",
//   "Casual Dress",
//   "Formal Dress"
// ],
//     "Accessories": ["Handbags", "Jewelry", "Watches", "Heels", "Clutches"]
//   } as Record<string, string[]>,
// subCategoryTypes: {
//   // Dress
//   "Shalwar Kameez": ["Stitched", "Unstitched", "Semi-Stitched"],
//   "Maxi": ["Party Wear", "Bridal", "Casual", "Formal"],
//   "Kurti": ["Cotton", "Lawn", "Silk", "Embroidered"],
//   "Kurta": ["Cotton", "Linen", "Printed", "Embroidered"],
//   "Kurta Pajama": ["Casual", "Festive", "Wedding Wear"],
//   "Lehenga": ["Bridal Wear", "Party Wear", "Formal"],
//   "Gown": ["Evening Gown", "Bridal Gown", "Party Gown"],
//   "Abaya": ["Front Open", "Butterfly Style", "Kaftan", "Closed"],
//   "Jumpsuit": ["Casual", "Party Wear", "Formal"],
//   "Frock": ["Casual", "Party Wear", "Kids Wear"],
//   "Anarkali": ["Bridal", "Party Wear", "Formal"],
//   "Saree": ["Banarasi", "Silk", "Chiffon", "Net", "Ready to Wear"],
//   "Sharara": ["Bridal", "Party Wear", "Festive"],
//   "Gharara": ["Traditional", "Bridal", "Party Wear"],
//   "Palazzo Suit": ["Casual", "Formal", "Party Wear"],
//   "Pant Suit": ["Office Wear", "Formal", "Casual"],
//   "Kaftan": ["Casual", "Resort Wear", "Party Wear"],
//   "Cape Dress": ["Party Wear", "Formal"],
//   "Co-Ord Set": ["Casual", "Lounge Wear", "Party Wear"],
//   "Skirt": ["Mini", "Midi", "Maxi"],
//   "Blouse": ["Sleeveless", "Full Sleeve", "Back Open"],
//   "Peplum Top": ["Casual", "Party Wear"],
//   "Tunics": ["Cotton", "Printed", "Embroidered"],
//   "Bridal Dress": ["Lehenga Style", "Gown Style", "Traditional"],
//   "Party Wear Dress": ["Western", "Eastern", "Fusion"],
//   "Casual Dress": ["Daily Wear", "Summer Wear"],
//   "Formal Dress": ["Office Wear", "Evening Wear"],

//   // Accessories
//   "Handbags": ["Tote Bag", "Crossbody", "Shoulder Bag", "Backpack"],
//   "Jewelry": ["Necklace Set", "Earrings", "Bangles", "Rings"],
//   "Watches": ["Analog", "Digital", "Automatic", "Smart Watch"],
//   "Heels": ["Stilettos", "Block Heels", "Pumps", "Wedges"],
//   "Clutches": ["Bridal Clutch", "Box Clutch", "Envelope Clutch"]
// } as Record<string, string[]>,





//   brands: {
  //   "Dress": ["Khaadi",
  // "Sana Safinaz",
  // "Maria.B",
  // "Sapphire",
  // "Gul Ahmed",
  // "Elan",
  // "Asim Jofa",
  // "Nishat Linen",
  // "Bonanza Satrangi",
  // "Alkaram Studio",
  // "Bareeze",
  // "Ethnic by Outfitters",
  // "Limelight",
  // "J.",
  // "Generation",
  // "Zellbury",
  // "Beechtree",
  // "Cross Stitch",
  // "Charizma",
  // "Saya",
  // "Motifz",
  // "Rang Rasiya",
  // "Iznik",
  // "Bin Saeed",
  // "Anaya by Kiran Chaudhry",
  // "Qalamkar",
  // "Noor by Saadia Asad",
  // "Faraz Manan",
  // "HSY",
  // "Republic by Omar Farooq",
  // "Zara Shahjahan",
  // "Sanam Chaudhri",
  // "Firdous",
  // "Kayseria",
  // "Sobia Nazir",
  // "Tena Durrani",
//   "Faiza Saqlain"],
//     "Accessories": ["Gucci", "Rolex", "Charles & Keith", "Hublot", "Pandora", "Aldo"]
//   } as Record<string, string[]>,
//   conditions: ["NEW", "OLD"] as const,
//   saleTypes: ["SELL", "RENT"] as const,
//   sizes: ["XS", "S", "M", "L", "XL", "XXL"],
// colors: [
//   { name: "Red", hex: "#FF0000" },
//   { name: "Orange", hex: "#FFA500" },
//   { name: "Yellow", hex: "#FFFF00" },
//   { name: "Green", hex: "#008000" },
//   { name: "Blue", hex: "#0000FF" },
//   { name: "Purple", hex: "#800080" },
//   { name: "Pink", hex: "#FFC0CB" },
//   { name: "Brown", hex: "#A52A2A" },
//   { name: "Black", hex: "#000000" },
//   { name: "White", hex: "#FFFFFF" },
//   { name: "Gray", hex: "#808080" },
//   { name: "Navy", hex: "#000080" }
// ]
  
// };


const CONFIG = {
  // Added "NEW IN" as the first category
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
    // NEW IN types
    // "LATEST ARRIVALS": ["Pre-order", "In Stock", "Limited Edition"],
    // "TRENDING NOW": ["Social Media Hits", "Best Sellers"],
    // "SEASONAL SPECIAL": ["Summer Collection", "Winter Drops"],

    // READY TO WEAR types
    "EVERYDAY": ["Tunics & Kurtas", "Jackets", "Kaftans", "Tops", "Matching Sets", "Pants", "All"],
    "OCCASION WEAR": ["Kurta sets", "Kaftans", "Jackets", "Anarkalis", "Saree Set", "All"],
    "ALL": ["Kaftans", "Tunics & Kurtas", "Tops", "Jackets", "Matching Sets", "Pants", "Kurta sets", "Anarkalis", "Saree Set"],

    // COUTURE types
    "BRIDAL": ["Luxury Bridal", "Destination Wedding", "Consultation"],
    "SEMI-FORMAL": ["Evening Wear", "Party Wear", "View All"],

    // WINTER EDIT types
    "SEASONAL PICKS": ["Shawls & Wraps", "Woolen Kurta", "Velvet Collection"],

    // UNSTITCHED types
    "Lawn": ["2 Piece", "3 Piece"],
    "Silk": ["Printed", "Embroidered"],

    // ACCESSORIES types
    "Handbags": ["Tote Bag", "Crossbody", "Shoulder Bag", "Backpack"],
    "Jewelry": ["Necklace Set", "Earrings", "Bangles", "Rings"],
    "Watches": ["Analog", "Digital", "Automatic", "Smart Watch"],
    "Heels": ["Stilettos", "Block Heels", "Pumps", "Wedges"],
    "Clutches": ["Bridal Clutch", "Box Clutch", "Envelope Clutch"]
  } as Record<string, string[]>,

  brands: {
    "NEW IN": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire"], // Quick access to top brands
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

// Custom Styled Select Component
const LuxurySelect = ({ label, value, onChange, options, disabled, icon: Icon, placeholder = "Select Option" }: any) => (
  <div className="space-y-2 w-full">
    {label && <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
      {Icon && <Icon size={12} />} {label}
    </label>}
    <div className="relative group">
      <select 
        value={value} 
        onChange={onChange} 
        disabled={disabled}
        className="w-full appearance-none bg-black/40 border border-white/10 p-4 pr-10 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <option value="" className="bg-[#0f172a]">{placeholder}</option>
        {options?.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#0f172a] text-white py-2">
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
        <ChevronDown size={18} />
      </div>
    </div>
  </div>
);

export default function LuxuryAdminPro() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isDelModal, setIsDelModal] = useState({ open: false, id: '' });
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '', name: '', price: '', description: '',
    saleType: 'SELL', condition: 'NEW', cat: '', subCat: '',
    productType: '', brand: '',
    sizes: [] as string[], colors: [] as string[], imageUrls: [] as string[]
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/products');
      const data = await r.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleArrayItem = (item: string, field: 'sizes' | 'colors') => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Product Name is required";
    if (!form.cat) return "Please select a Category";
    if (!form.subCat) return "Please select a Sub-Category";
    if (!form.brand) return "Please select a Brand";
    if (!form.price || parseFloat(form.price) <= 0) return "Valid Price is required";
    if (form.sizes.length === 0) return "Select at least one Size";
    if (form.colors.length === 0) return "Select at least one Color";
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
    data.append('sizes', form.sizes.join(','));
    data.append('colors', form.colors.join(','));

    if (form.id) {
        data.append('id', form.id);
        data.append('imageUrls', form.imageUrls.join(',')); 
        selectedFiles.forEach(file => data.append('newImages', file));
    } else {
        selectedFiles.forEach(file => data.append('images', file));
    }

    try {
      const res = await fetch('/api/products', {
        method: form.id ? 'PUT' : 'POST',
        body: data
      });
      if (res.ok) {
        setIsModal(false);
        setSelectedFiles([]);
        fetchProducts();
      } else {
        const err = await res.json();
        setError(err.error || "Something went wrong");
      }
    } catch (e) { console.error(e); setError("Server error"); }
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/products', { 
         method: 'DELETE', 
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: isDelModal.id }) 
      });
      if(res.ok) { setIsDelModal({open:false, id:''}); fetchProducts(); }
    } catch (e) { console.error(e); }
    finally { setDeleteLoading(false); }
  };

  // Group products by user
  const groupProductsByUser = (products: any[]) => {
    const grouped: { [key: string]: { user: any, products: any[] } } = {};
    
    products.forEach((p) => {
      const isAdmin = !p.user;
      const userId = p.user?.id || 'admin';
      const userName = isAdmin ? 'Admin' : (p.user?.name || p.user?.email || 'Unknown User');
      const userEmail = isAdmin ? 'System Administrator' : (p.user?.email || '');
      
      if (!grouped[userId]) {
        grouped[userId] = {
          user: { id: userId, name: userName, email: userEmail },
          products: []
        };
      }
      grouped[userId].products.push(p);
    });
    
    return Object.values(grouped);
  };

  const groupedProducts = groupProductsByUser(products);
  const [viewMode, setViewMode] = useState<'all' | 'byUser'>('all');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-3 md:p-10">
      <div className="mx-auto max-w-7xl">
       
        {/* Header - Stack on mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-6 bg-[#0f172a] p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h1 className="text-xl md:text-3xl font-black flex items-center gap-3 tracking-tighter uppercase text-center md:text-left">
            <div className="p-2 md:p-3 bg-blue-600 rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20">
              <Package size={24}/>
            </div>
            <span>Product Management <span className="text-blue-500 font-light block md:inline text-sm md:text-3xl">ADMIN</span></span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              <span className="font-bold text-white">{products.length}</span> products from <span className="font-bold text-white">{groupedProducts.length}</span> users
            </div>
            <button
              onClick={() => {
                setForm({id:'', name:'', price:'', description:'', saleType:'SELL', condition:'NEW', cat:'', subCat:'', productType: '', brand:'', sizes:[], colors:[], imageUrls:[]});
                setSelectedFiles([]); setError(null); setIsModal(true);
              }}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
            >
              <Plus size={20}/> ADD PRODUCT
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('all')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              viewMode === 'all' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Package size={16} className="inline mr-2" />
            All Products
          </button>
          <button
            onClick={() => setViewMode('byUser')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              viewMode === 'byUser' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Products by User
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : viewMode === 'byUser' ? (
          /* Products Grouped by User */
          <div className="space-y-6">
            {groupedProducts.map((group) => (
              <UserProductGroup 
                key={group.user.id} 
                group={group}
                onEdit={(p: any) => {
                  setForm({
                    ...p,
                    cat: p.categories?.[0] || '',
                    subCat: p.subCategories?.[0] || '',
                    brand: p.brands?.[0] || '',
                    productType: p.productTypes?.[0] || ''
                  });
                  setError(null);
                  setIsModal(true);
                }}
                onDelete={(id: string) => setIsDelModal({ open: true, id })}
              />
            ))}
          </div>
        ) : (
          /* All Products - Simple Table View */
          <div className="bg-[#0f172a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-white/5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5">Product</th>
                    <th className="px-6 py-5">Seller</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Brand</th>
                    <th className="px-6 py-5">Size/Color</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Price</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-all">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-10 rounded-lg bg-slate-800 overflow-hidden border border-white/5">
                            {p.imageUrls?.[0] ? (
                              <img src={p.imageUrls[0]} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon size={16}/></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-[10px] text-slate-500">{p.description?.substring(0, 30)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <User size={12} className="text-blue-400" />
                          </div>
                          <span className="text-sm text-slate-300">{p.user?.name || p.user?.email || 'Admin'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-blue-500">{p.categories?.[0]}</span>
                          <span className="text-xs text-slate-300">{p.subCategories?.[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-1 rounded">
                          {p.brands?.[0]}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1 max-w-[80px]">
                          {p.sizes?.map((s: string) => <span key={s} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-300">{s}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded w-fit ${p.condition === 'NEW' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {p.condition}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded w-fit">{p.saleType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-white">${p.price}</td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => {
                            setForm({
                              ...p,
                              cat: p.categories?.[0] || '',
                              subCat: p.subCategories?.[0] || '',
                              brand: p.brands?.[0] || '',
                              productType: p.productTypes?.[0] || ''
                            });
                            setError(null);
                            setIsModal(true);
                          }} className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg transition-all"><Edit size={14}/></button>
                          <button onClick={() => setIsDelModal({ open: true, id: p.id })} className="p-2 bg-white/5 hover:bg-red-600 rounded-lg transition-all"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Main Modal - Mobile Friendly */}
      {isModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-[#0f172a] w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] md:rounded-[2.5rem] border-white/10 overflow-hidden flex flex-col shadow-3xl">
            <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-[#0f172a]">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-widest flex items-center gap-3">
                <Sparkles className="text-blue-500 animate-pulse" size={20}/> {form.id ? 'EDIT LUXURY' : 'ADD NEW LUXURY'}
              </h2>
              <button onClick={() => setIsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X/></button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Product Title</label>
                     <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Premium Silk Maxi" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LuxurySelect 
                      label="Category" 
                      value={form.cat} 
                      onChange={(e:any) => setForm({...form, cat: e.target.value, subCat: '', productType: '', brand: ''})}
                      options={CONFIG.categories}
                    />
                    <LuxurySelect 
                      label="Sub-Category" 
                      value={form.subCat} 
                      disabled={!form.cat}
                      onChange={(e:any) => setForm({...form, subCat: e.target.value, productType: ''})}
                      options={form.cat ? CONFIG.subCategories[form.cat] : []}
                    />
                  </div>

                  {form.subCat && CONFIG.subCategoryTypes[form.subCat] && (
                    <LuxurySelect 
                      label="Specific Type"
                      value={form.productType}
                      onChange={(e:any) => setForm({...form, productType: e.target.value})}
                      options={CONFIG.subCategoryTypes[form.subCat]}
                      placeholder="Select Variation"
                    />
                  )}

                  <LuxurySelect 
                    label="Brand Name"
                    value={form.brand}
                    disabled={!form.cat}
                    onChange={(e:any) => setForm({...form, brand: e.target.value})}
                    options={form.cat ? CONFIG.brands[form.cat] : []}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl h-32 outline-none focus:border-blue-500 resize-none" placeholder="Enter luxurious details..." />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-black text-2xl">$</span>
                      <input
                        type="text"
                        value={form.price}
                        onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setForm({ ...form, price: e.target.value }); }}
                        className="w-full bg-blue-500/5 border border-blue-500/20 pl-12 pr-6 py-5 rounded-2xl text-3xl font-black outline-none focus:border-blue-500"
                        placeholder="0.00"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {CONFIG.saleTypes.map(t => (
                        <button key={t} type="button" onClick={() => setForm({...form, saleType: t})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.saleType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
                      ))}
                    </div>
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {CONFIG.conditions.map(c => (
                        <button key={c} type="button" onClick={() => setForm({...form, condition: c})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.condition === c ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Ruler size={12}/> Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {CONFIG.sizes.map(s => (
                        <button key={s} type="button" onClick={() => toggleArrayItem(s, 'sizes')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${form.sizes.includes(s) ? 'bg-white text-black border-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Pipette size={12}/> Colors</label>
                    <div className="flex flex-wrap gap-3">
                      {CONFIG.colors.map(c => (
                        <button key={c.name} type="button" onClick={() => toggleArrayItem(c.name, 'colors')} className={`group relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${form.colors.includes(c.name) ? 'border-blue-500 scale-110 shadow-lg' : 'border-white/10'}`}>
                           <div className="w-7 h-7 rounded-full" style={{ backgroundColor: c.hex }} />
                           {form.colors.includes(c.name) && <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5"><CheckCircle2 size={12} className="text-white"/></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><ImageIcon size={12}/> Gallery</label>
                    <div className="grid grid-cols-4 gap-3">
                      {form.imageUrls.map((url, i) => (
                        <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                          <img src={url} className="w-full h-full object-cover" alt="preview" />
                          <button type="button" onClick={() => setForm({...form, imageUrls: form.imageUrls.filter(u => u !== url)})} className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X size={16}/></button>
                        </div>
                      ))}
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-blue-600/30">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new upload" />
                          <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full"><X size={10}/></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all">
                        <Plus size={24}/>
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} hidden multiple onChange={e => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} accept="image/*" />
                  </div>

                  {error && <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs font-bold animate-shake">{error}</div>}

                  <button disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest disabled:opacity-50">
                    {submitLoading ? <Loader2 className="animate-spin mx-auto" /> : "Save Luxury Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDelModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#0f172a] p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/10 max-w-sm w-full text-center shadow-3xl">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="text-red-500" size={32}/>
            </div>
            <h3 className="text-lg md:text-xl font-black mb-2 text-white uppercase tracking-tighter">Remove Product?</h3>
            <p className="text-slate-400 text-sm mb-8">This action cannot be undone and will permanently remove this item.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDelModal({open:false, id:''})} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-xs transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-black text-xs shadow-lg shadow-red-600/20 transition-all">
                {deleteLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}