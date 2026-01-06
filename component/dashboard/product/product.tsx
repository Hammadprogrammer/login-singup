"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
 Trash2, Edit, Plus, X, Loader2, Package, CheckCircle2,
 AlertCircle, Sparkles, Image as ImageIcon, Palette, Ruler
} from 'lucide-react';


const CONFIG = {
 categories: ["Dress", "Accessories"] as const,
 subCategories: {
   "Dress": ["Shalwar Kameez", "Maxi", "Kurti", "Lehenga", "Abaya", "Saree"],
   "Accessories": ["Handbags", "Jewelry", "Watches", "Heels", "Clutches"]
 } as Record<string, string[]>,
  // Specific Types (Category level deep detailing)
 subCategoryTypes: {
   "Shalwar Kameez": ["Stitched", "Unstitched", "Semi-Stitched"],
   "Maxi": ["Party Wear", "Bridal", "Casual"],
   "Kurti": ["Cotton", "Lawn", "Silk", "Embroidered"],
   "Lehenga": ["Bridal Wear", "Party Wear"],
   "Abaya": ["Front Open", "Butterfly Style", "Kaftan"],
   "Saree": ["Banarasi", "Silk", "Ready to Wear"],
   "Handbags": ["Tote Bag", "Crossbody", "Shoulder Bag"],
   "Jewelry": ["Necklace Set", "Earrings", "Bangles"],
   "Watches": ["Analog", "Digital", "Automatic", "Smart Watch"],
   "Heels": ["Stilettos", "Block Heels", "Pumps"],
   "Clutches": ["Bridal Clutch", "Box Clutch"]
 } as Record<string, string[]>,


 brands: {
   "Dress": ["Khaadi", "Sana Safinaz", "Maria.B", "Sapphire", "Gul Ahmed", "Elan"],
   "Accessories": ["Gucci", "Rolex", "Charles & Keith", "Hublot", "Pandora", "Aldo"]
 } as Record<string, string[]>,
 conditions: ["NEW", "OLD"] as const,
 saleTypes: ["SELL", "RENT"] as const,
 sizes: ["XS", "S", "M", "L", "XL", "XXL"],
 colors: ["Red", "Maroon", "Gold", "Ivory", "Black", "Emerald", "Navy"]
};


export default function LuxuryAdminPro() {
 const [products, setProducts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [submitLoading, setSubmitLoading] = useState(false);
 const [deleteLoading, setDeleteLoading] = useState(false);
 const [isModal, setIsModal] = useState(false);
 const [isDelModal, setIsDelModal] = useState({ open: false, id: '' });
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
     setProducts(data);
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


 const onSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setSubmitLoading(true);
   const data = new FormData();
  
   Object.entries(form).forEach(([key, value]) => {
     if (Array.isArray(value)) data.append(key, value.join(','));
     else data.append(key, value);
   });


   selectedFiles.forEach(file => {
     data.append(form.id ? 'newImages' : 'images', file);
   });


   try {
     const res = await fetch('/api/products', {
       method: form.id ? 'PUT' : 'POST',
       body: data
     });
     if (res.ok) {
       setIsModal(false);
       setSelectedFiles([]);
       fetchProducts();
     }
   } catch (e) { console.error(e); }
   finally { setSubmitLoading(false); }
 };


 const handleDelete = async () => {
   setDeleteLoading(true);
   try {
     const res = await fetch('/api/products', { method: 'DELETE', body: JSON.stringify({ id: isDelModal.id }) });
     if(res.ok) { setIsDelModal({open:false, id:''}); fetchProducts(); }
   } catch (e) { console.error(e); }
   finally { setDeleteLoading(false); }
 };
 


 return (
   <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-10">
     <div className=" mx-auto">
      
       {/* Header Section */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
         <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
           <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Package size={28}/></div>
           All Product Managment <span className="text-blue-500 font-light ml-1">ADMIN</span>
         </h1>
         <button
           onClick={() => {
             setForm({id:'', name:'', price:'', description:'', saleType:'SELL', condition:'NEW', cat:'', subCat:'', productType: '', brand:'', sizes:[], colors:[], imageUrls:[]});
             setSelectedFiles([]); setIsModal(true);
           }}
           className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
         >
           <Plus size={20}/> ADD PRODUCT
         </button>
       </div>


       {/* Updated Table Section */}
       <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
         {loading && (
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
         )}
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead className="bg-white/5 text-[13px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
               <tr>
                 <th className="px-8 py-6">Product Info</th>
                 <th className="px-8 py-6">Categeries</th>
                 <th className="px-8 py-6">Brand Name</th>
                 <th className="px-8 py-6">Status</th>
                 <th className="px-8 py-6">Config</th>
                 <th className="px-8 py-6">Price</th>
                 <th className="px-8 py-6 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {products.map((p) => (
                 <tr key={p.id} className="group hover:bg-white/[0.02] transition-all">
                   <td className="px-8 py-5">
                     <div className="flex items-center gap-4">
                       <div className="h-16 w-12 rounded-xl bg-slate-800 overflow-hidden border border-white/5 shadow-lg">
                         {p.imageUrls?.[0] ? (
                           <img src={p.imageUrls[0]} className="h-full w-full object-cover" />
                         ) : (
                           <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon size={18}/></div>
                         )}
                       </div>
                       <div>
                         <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase">{p.name}</div>
                         <div className="text-[9px] text-slate-500 line-clamp-1 max-w-[140px] mt-1 uppercase tracking-tighter italic">{p.description} Collection</div>


                       </div>
                     </div>
                   </td>


                   {/* Classification Column (Updated) */}
                   <td className="px-8 py-5">
                     <div className="flex flex-col gap-1">
                       <span className="text-[11px] font-black text-blue-500 uppercase tracking-tight">{p.cat}</span>
                       <span className="text-[14px] text-slate-300 font-medium">{p.subCategories?.[0] || "not Found"}</span>
                       {p.productType && (
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 w-fit font-bold">{p.productType}</span>
                       )}
                     </div>
                   </td>


                   {/* Brand Name Column (Updated) */}
                   <td className="px-8 py-5">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                       {p.brands?.[0] || 'No Brand'}
                     </div>
                   </td>


                   <td className="px-8 py-5">
                     <div className="flex flex-col gap-1.5">
                       <span className={`text-[9px] font-bold px-2 py-0.5 rounded w-fit border ${p.condition === 'NEW' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>{p.condition}</span>
                       <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded border border-purple-500/20 w-fit">{p.saleType}</span>
                     </div>
                   </td>


                   <td className="px-8 py-5">
                     <div className="flex flex-col gap-2">
                       <div className="flex flex-wrap gap-1 max-w-[120px]">
                         {p.sizes?.map((s: string) => <span key={s} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">{s}</span>)}
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {p.colors?.map((c: string) => <div key={c} className="w-2.5 h-2.5 rounded-full border border-white/20" title={c} style={{backgroundColor: c.toLowerCase()}} />)}
                       </div>
                     </div>
                   </td>


                   <td className="px-8 py-5 font-black text-white text-lg">${p.price}</td>


                   <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                       <button onClick={() => {
                         setForm({ ...p, cat: p.cat || '', subCat: p.subCat || '', productType: p.productType || '', brand: p.brand || '' });
                         setIsModal(true);
                       }} className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl transition-all"><Edit size={16}/></button>
                       <button onClick={() => setIsDelModal({ open: true, id: p.id })} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl transition-all"><Trash2 size={16}/></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     </div>


     {/* Main Modal */}
     {isModal && (
       <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
         <div className="bg-[#0f172a] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-3xl">
           <div className="p-8 border-b border-white/5 flex justify-between items-center">
             <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
               <Sparkles className="text-blue-500 animate-pulse"/> {form.id ? 'EDIT LUXURY PRODUCT' : 'ADD NEW LUXURY'}
             </h2>
             <button onClick={() => setIsModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X/></button>
           </div>


           <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Product Title</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all" placeholder="Enter name..." required />
               </div>
              
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Category</label>
                   <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value, subCat: '', productType: '', brand: ''})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300">
                     <option value="">Select</option>
                     {CONFIG.categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Sub-Category</label>
                   <select value={form.subCat} onChange={e => setForm({...form, subCat: e.target.value, productType: ''})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300" disabled={!form.cat}>
                     <option value="">Select</option>
                     {form.cat && CONFIG.subCategories[form.cat as keyof typeof CONFIG.subCategories]?.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
               </div>


               {form.subCat && CONFIG.subCategoryTypes[form.subCat] && (
                 <div className="space-y-2 animate-in slide-in-from-top-2">
                   <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Specific Type</label>
                   <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value})} className="w-full bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl outline-none focus:border-blue-500 text-white font-bold" required>
                     <option value="">Select Specific Type</option>
                     {CONFIG.subCategoryTypes[form.subCat].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
               )}


               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Brand Name</label>
                 <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300" disabled={!form.cat}>
                   <option value="">Select Brand</option>
                   {form.cat && CONFIG.brands[form.cat as keyof typeof CONFIG.brands]?.map(b => <option key={b} value={b}>{b}</option>)}
                 </select>
               </div>


               <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl h-32 outline-none focus:border-blue-500 resize-none" placeholder="Description..." />
             </div>


             <div className="space-y-8">
               <div className="relative group">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-black text-2xl">$</span>
                   <input
                     type="text"
                     value={form.price}
                     onChange={e => {
                       const value = e.target.value;
                       if (/^\d*\.?\d*$/.test(value)) {
                         setForm({ ...form, price: value });
                       }
                     }}
                     className="w-full bg-blue-500/5 border border-blue-500/20 pl-12 pr-6 py-5 rounded-2xl text-3xl font-black outline-none focus:border-blue-500"
                     placeholder="0.00"
                     required
                   />
               </div>


               <div className="grid grid-cols-2 gap-4">
                 <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                   {CONFIG.saleTypes.map(t => (
                     <button key={t} type="button" onClick={() => setForm({...form, saleType: t})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.saleType === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500'}`}>{t}</button>
                   ))}
                 </div>
                 <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                   {CONFIG.conditions.map(c => (
                     <button key={c} type="button" onClick={() => setForm({...form, condition: c})} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${form.condition === c ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>{c}</button>
                   ))}
                 </div>
               </div>


               <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><Ruler size={12}/> Select Sizes</label>
                 <div className="flex flex-wrap gap-2">
                   {CONFIG.sizes.map(s => (
                     <button key={s} type="button" onClick={() => toggleArrayItem(s, 'sizes')} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${form.sizes.includes(s) ? 'bg-white text-black border-white' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                   ))}
                 </div>
               </div>


               <div className="space-y-4">
                 <div className="grid grid-cols-4 gap-3">
                   {form.imageUrls.map((url, i) => (
                     <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10">
                       <img src={url} className="w-full h-full object-cover" />
                       <button type="button" onClick={() => setForm({...form, imageUrls: form.imageUrls.filter(u => u !== url)})} className="absolute inset-0 bg-red-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><X size={16}/></button>
                     </div>
                   ))}
                   {selectedFiles.map((file, i) => (
                     <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-blue-600/30">
                       <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                       <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full"><X size={10}/></button>
                     </div>
                   ))}
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-500 hover:border-blue-500 transition-all">
                     <Plus size={24}/>
                   </button>
                 </div>
                 <input type="file" ref={fileInputRef} hidden multiple onChange={e => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} accept="image/*" />
               </div>


               <button disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-600/20 uppercase tracking-widest">
                 {submitLoading ? <Loader2 className="animate-spin mx-auto" /> : "Save Luxury Product"}
               </button>
             </div>
           </form>
         </div>
       </div>
     )}


     {/* Delete Confirmation */}
     {isDelModal.open && (
       <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
         <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-white/10 max-w-sm w-full text-center">
           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={40}/>
           </div>
           <h3 className="text-xl font-black mb-2 text-white uppercase tracking-tighter">Remove Product?</h3>
           <p className="text-slate-400 text-sm mb-8">This will be permanently deleted from the store.</p>
           <div className="flex gap-4">
             <button onClick={() => setIsDelModal({open:false, id:''})} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
             <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20">
               {deleteLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Delete"}
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}
