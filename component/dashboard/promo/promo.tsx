'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit, X, Loader2, Image as ImageIcon,
  CheckCircle, AlertTriangle, LayoutGrid,
} from 'lucide-react';

interface PromoBanner {
  id: number;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  link: string | null;
  image: string | null;
  bgColor: string | null;
  size: string;
  order: number;
  createdAt: string;
}

const emptyForm = {
  title: '',
  subtitle: '',
  buttonText: 'Shop now',
  link: '/',
  bgColor: '#9a8478',
  size: 'normal',
  order: '0',
  image: null as File | null,
};

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-800 border-t-8 border-t-emerald-500">
      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
      <p className="text-slate-300 mb-6 font-medium">{message}</p>
      <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition">
        Close
      </button>
    </div>
  </div>
);

const ConfirmModal = ({ item, onConfirm, onCancel }: { item: PromoBanner; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-800 border-t-8 border-t-red-500">
      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Delete banner?</h3>
      <p className="text-slate-400 mb-6 text-sm">&ldquo;{item.title}&rdquo; will be permanently removed.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Delete</button>
      </div>
    </div>
  </div>
);

export const PromoBannerCRUD = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PromoBanner | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/promo-banner');
      if (!res.ok) throw new Error('Failed to fetch');
      setBanners(await res.json());
    } catch (e) {
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setExistingImage(null);
    const fileInput = document.getElementById('promo-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const startEdit = (b: PromoBanner) => {
    setEditingId(b.id);
    setExistingImage(b.image);
    setForm({
      title: b.title,
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      link: b.link || '/',
      bgColor: b.bgColor || '#9a8478',
      size: b.size,
      order: String(b.order),
      image: null,
    });
    document.getElementById('promo-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('subtitle', form.subtitle);
      data.append('buttonText', form.buttonText);
      data.append('link', form.link);
      data.append('bgColor', form.bgColor);
      data.append('size', form.size);
      data.append('order', form.order);
      if (form.image) data.append('image', form.image);

      let res: Response;
      if (editingId) {
        data.append('id', String(editingId));
        res = await fetch('/api/dashboard/promo-banner', { method: 'PUT', body: data });
      } else {
        res = await fetch('/api/dashboard/promo-banner', { method: 'POST', body: data });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || 'Save failed');
      }

      setToast(editingId ? 'Banner updated successfully.' : 'Banner created successfully.');
      resetForm();
      await fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/promo-banner', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setToast('Banner deleted.');
      await fetchBanners();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full p-3 bg-[#0b1120] border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition text-sm';
  const labelCls = 'text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block';

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {toDelete && <ConfirmModal item={toDelete} onConfirm={executeDelete} onCancel={() => setToDelete(null)} />}

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl"><LayoutGrid className="w-6 h-6 text-indigo-400" /></div>
        <div>
          <h2 className="text-xl font-black text-white">Promo Banners</h2>
          <p className="text-slate-400 text-sm">Manage the promotional grid shown below the homepage slider.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-medium">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* FORM */}
      <form id="promo-form" onSubmit={handleSubmit} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-white">{editingId ? `Editing #${editingId}` : 'Add New Banner'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Essential Knit Kit" />
          </div>
          <div>
            <label className={labelCls}>Subtitle / Price</label>
            <input className={inputCls} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="From $99.99" />
          </div>
          <div>
            <label className={labelCls}>Button Text</label>
            <input className={inputCls} value={form.buttonText} onChange={e => setForm({ ...form, buttonText: e.target.value })} placeholder="Shop now" />
          </div>
          <div>
            <label className={labelCls}>Link</label>
            <input className={inputCls} value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="/ready-to-wear" />
          </div>
          <div>
            <label className={labelCls}>Size</label>
            <select className={inputCls} value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
              <option value="normal">Normal</option>
              <option value="large">Large (tall, spans 2 rows)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Display Order</label>
            <input type="number" className={inputCls} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Fallback Color (no image)</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} className="w-12 h-11 rounded-lg border border-slate-700 bg-[#0b1120] cursor-pointer" />
              <input className={inputCls} value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Image</label>
            <input id="promo-file" type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files?.[0] || null })} className={`${inputCls} cursor-pointer`} />
            {existingImage && !form.image && (
              <img src={existingImage} alt="current" className="mt-2 h-16 w-24 object-cover rounded-lg border border-slate-700" />
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/20">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {editingId ? 'Update Banner' : 'Add Banner'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl transition">
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
          <ImageIcon className="mx-auto mb-3" size={32} />
          No banners yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map(b => (
            <div key={b.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-36 relative" style={!b.image ? { backgroundColor: b.bgColor || '#9a8478' } : undefined}>
                {b.image && <img src={b.image} alt={b.title} className="w-full h-full object-cover" />}
                <span className="absolute top-2 left-2 text-[9px] font-black uppercase bg-black/70 text-white px-2 py-0.5 rounded-full">{b.size}</span>
                <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-black/70 text-white px-2 py-0.5 rounded-full">#{b.order}</span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-white line-clamp-1">{b.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{b.subtitle || '—'}</p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{b.buttonText} → {b.link}</p>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button onClick={() => startEdit(b)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => setToDelete(b)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 rounded-lg transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoBannerCRUD;
