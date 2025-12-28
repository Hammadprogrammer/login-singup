"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, Edit, Plus, X, Loader2, Package, CheckCircle2, 
  AlertCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';

const CONFIG = {
  categories: ["Dress", "Accessories"] as const,
  subCategories: {
    "Dress": ["Shalwar Kameez", "Maxi", "Kurti", "Lehenga", "Abaya", "Saree"],
    "Accessories": ["Handbags", "Jewelry", "Watches", "Heels", "Clutches"]
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
    saleType: 'SELL', condition: 'NEW', cat: '', subCat: '', brand: '',
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
    
    data.append('id', form.id);
    data.append('name', form.name);
    data.append('price', form.price);
    data.append('description', form.description);
    data.append('saleType', form.saleType);
    data.append('condition', form.condition);
    data.append('cat', form.cat);
    data.append('subCat', form.subCat);
    data.append('brand', form.brand);
    data.append('sizes', form.sizes.join(','));
    data.append('colors', form.colors.join(','));
    data.append('imageUrls', form.imageUrls.join(','));

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
      const res = await fetch('/api/products', { 
        method: 'DELETE', 
        body: JSON.stringify({ id: isDelModal.id }) 
      });
      if(res.ok) {
        setIsDelModal({open:false, id:''});
        fetchProducts();
      }
    } catch (e) { console.error(e); }
    finally { setDeleteLoading(false); }
  };

  // UI Helper for removing newly selected local files
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20"><Package size={28}/></div>
            ZENITH <span className="text-blue-500 text-xl font-light ml-1">ADMIN</span>
          </h1>
          <button 
            onClick={() => { 
              setForm({id:'', name:'', price:'', description:'', saleType:'SELL', condition:'NEW', cat:'', subCat:'', brand:'', sizes:[], colors:[], imageUrls:[]}); 
              setSelectedFiles([]); setIsModal(true); 
            }}
            className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
          >
            <Plus size={20}/> ADD PRODUCT
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          {loading && (
             <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
             </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-8 py-6">Product</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6">Brand</th>
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
                        <div className="h-14 w-11 rounded-xl bg-slate-800 overflow-hidden border border-white/5 shadow-lg">
                          {p.imageUrls?.[0] ? (
                            <img src={p.imageUrls[0]} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon size={14}/></div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 max-w-[150px]">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs font-bold text-blue-400 uppercase">{p.categories?.[0]}</div>
                      <div className="text-[10px] text-slate-500">{p.subCategories?.[0]}</div>
                    </td>
                    <td className="px-8 py-5 text-xs font-medium text-slate-300">{p.brands?.[0]}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 w-fit">{p.condition}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded border border-purple-500/20 w-fit">{p.saleType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {p.sizes?.map((s: string) => <span key={s} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-slate-400 font-medium">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-white">${p.price}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { 
                          setForm({ ...p, cat: p.categories?.[0] || '', subCat: p.subCategories?.[0] || '', brand: p.brands?.[0] || '' }); 
                          setSelectedFiles([]); setIsModal(true); 
                        }} className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl transition-colors"><Edit size={16}/></button>
                        <button onClick={() => setIsDelModal({ open: true, id: p.id })} className="p-2.5 bg-white/5 hover:bg-red-600 rounded-xl transition-colors"><Trash2 size={16}/></button>
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-[#0f172a] w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-3xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-black tracking-widest uppercase flex items-center gap-3">
                <Sparkles className="text-blue-500 animate-pulse"/> {form.id ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
              </h2>
              <button onClick={() => setIsModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X/></button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-1">Basic Info</label>
                   <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 ring-blue-500 transition-all" placeholder="Product Title" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value, subCat: '', brand: ''})} className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300 appearance-none cursor-pointer">
                    <option value="" className="bg-[#1e293b]">Category</option>
                    {CONFIG.categories.map(c => <option key={c} value={c} className="bg-[#1e293b]">{c}</option>)}
                  </select>
                  <select value={form.subCat} onChange={e => setForm({...form, subCat: e.target.value})} className="bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300 disabled:opacity-30 appearance-none cursor-pointer" disabled={!form.cat}>
                    <option value="" className="bg-[#1e293b]">Sub Category</option>
                    {form.cat && CONFIG.subCategories[form.cat as keyof typeof CONFIG.subCategories]?.map(s => <option key={s} value={s} className="bg-[#1e293b]">{s}</option>)}
                  </select>
                </div>

                <select value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-300 disabled:opacity-30 appearance-none cursor-pointer" disabled={!form.cat}>
                  <option value="" className="bg-[#1e293b]">Select Brand</option>
                  {form.cat && CONFIG.brands[form.cat as keyof typeof CONFIG.brands]?.map(b => <option key={b} value={b} className="bg-[#1e293b]">{b}</option>)}
                </select>

                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl h-40 outline-none focus:border-blue-500 resize-none" placeholder="Detailed product description..." />
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-black text-2xl">$</span>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-blue-500/5 border border-blue-500/20 pl-12 pr-6 py-5 rounded-2xl text-3xl font-black outline-none focus:border-blue-500 transition-all placeholder:text-blue-500/20" placeholder="0.00" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    {CONFIG.saleTypes.map(t => (
                      <button key={t} type="button" onClick={() => setForm({...form, saleType: t})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${form.saleType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                    ))}
                  </div>
                  <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    {CONFIG.conditions.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, condition: c})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${form.condition === c ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-1">Available Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {CONFIG.sizes.map(s => (
                      <button key={s} type="button" onClick={() => toggleArrayItem(s, 'sizes')} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${form.sizes.includes(s) ? 'bg-white text-black border-white shadow-lg scale-105' : 'border-white/10 text-slate-500 hover:border-white/30'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-1">Gallery</label>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Existing Database Images */}
                    {form.imageUrls.map((url, i) => (
                      <div key={`old-${i}`} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => setForm({...form, imageUrls: form.imageUrls.filter(u => u !== url)})} className="bg-red-600 p-2 rounded-full transform hover:scale-110 active:scale-95 shadow-lg"><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                    {/* New Locally Selected Images */}
                    {selectedFiles.map((file, i) => (
                      <div key={`new-${i}`} className="group relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-blue-500/30 shadow-lg">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeSelectedFile(i)} className="bg-red-600 p-2 rounded-full shadow-lg"><X size={14}/></button>
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 bg-blue-600 text-[8px] font-bold text-center py-0.5 rounded uppercase">New</div>
                      </div>
                    ))}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/5 transition-all gap-2 group">
                      <Plus className="group-hover:scale-125 transition-transform"/>
                      <span className="text-[10px] font-black tracking-tighter">UPLOAD</span>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} hidden multiple onChange={e => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])} accept="image/*" />
                </div>

                <button disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                  {submitLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={22}/> SAVE CHANGES</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDelModal.open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in zoom-in duration-200">
          <div className="bg-[#0f172a] p-10 rounded-[2.5rem] border border-white/10 max-w-sm w-full text-center shadow-3xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="text-red-500" size={40}/>
            </div>
            <h3 className="text-xl font-black mb-2 text-white">ARE YOU SURE?</h3>
            <p className="text-slate-400 text-sm mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                disabled={deleteLoading}
                onClick={() => setIsDelModal({open:false, id:''})} 
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black tracking-widest text-xs transition-all disabled:opacity-50"
              >
                CANCEL
              </button>
              <button 
                disabled={deleteLoading}
                onClick={handleDelete} 
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-black tracking-widest text-xs transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}