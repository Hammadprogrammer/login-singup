'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Edit, X, Loader2, Image as ImageIcon,
  CheckCircle, AlertTriangle,
} from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'number' | 'image';

export interface CrudField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
}

export interface CardConfig {
  image?: string;   // field name used as thumbnail
  title: string;    // field name used as card title
  subtitle?: string; // field name used as card subtitle
}

interface EntityCRUDProps {
  title: string;
  description: string;
  apiPath: string;
  fields: CrudField[];
  card: CardConfig;
  icon: React.ElementType;
}

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-800 border-t-8 border-t-emerald-500">
      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
      <p className="text-slate-300 mb-6 font-medium">{message}</p>
      <button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition">Close</button>
    </div>
  </div>
);

export default function EntityCRUD({ title, description, apiPath, fields, card, icon: Icon }: EntityCRUDProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingImages, setExistingImages] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<any | null>(null);

  const blankForm = useCallback(() => {
    const f: Record<string, any> = {};
    fields.forEach((fl) => { f[fl.name] = fl.type === 'image' ? null : fl.type === 'number' ? '0' : ''; });
    return f;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(blankForm);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error('Failed to fetch');
      setRows(await res.json());
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const reset = () => {
    setForm(blankForm());
    setEditingId(null);
    setExistingImages({});
    fields.filter(f => f.type === 'image').forEach(f => {
      const el = document.getElementById(`file-${apiPath}-${f.name}`) as HTMLInputElement;
      if (el) el.value = '';
    });
  };

  const startEdit = (row: any) => {
    setEditingId(row.id);
    const f: Record<string, any> = {};
    const imgs: Record<string, string> = {};
    fields.forEach((fl) => {
      if (fl.type === 'image') { f[fl.name] = null; if (row[fl.name]) imgs[fl.name] = row[fl.name]; }
      else f[fl.name] = row[fl.name] ?? '';
    });
    setForm(f);
    setExistingImages(imgs);
    document.getElementById(`form-${apiPath}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requiredMissing = fields.find(f => f.required && f.type !== 'image' && !String(form[f.name] ?? '').trim());
    if (requiredMissing) { setError(`${requiredMissing.label} is required`); return; }

    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      fields.forEach((f) => {
        if (f.type === 'image') { if (form[f.name]) data.append(f.name, form[f.name]); }
        else data.append(f.name, String(form[f.name] ?? ''));
      });

      let res: Response;
      if (editingId) {
        data.append('id', String(editingId));
        res = await fetch(apiPath, { method: 'PUT', body: data });
      } else {
        res = await fetch(apiPath, { method: 'POST', body: data });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || 'Save failed');
      }
      setToast(editingId ? 'Updated successfully.' : 'Created successfully.');
      reset();
      await fetchRows();
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
      const res = await fetch(apiPath, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setToast('Deleted.');
      await fetchRows();
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
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f172a] p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-800 border-t-8 border-t-red-500">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Delete this item?</h3>
            <p className="text-slate-400 mb-6 text-sm">&ldquo;{toDelete[card.title]}&rdquo; will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl"><Icon className="w-6 h-6 text-indigo-400" /></div>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-medium">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <form id={`form-${apiPath}`} onSubmit={handleSubmit} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="font-bold text-white">{editingId ? `Editing #${editingId}` : `Add New`}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className={labelCls}>{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'textarea' ? (
                <textarea rows={3} className={inputCls} value={form[f.name] ?? ''} placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              ) : f.type === 'image' ? (
                <>
                  <input id={`file-${apiPath}-${f.name}`} type="file" accept="image/*" className={`${inputCls} cursor-pointer`}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.files?.[0] || null })} />
                  {existingImages[f.name] && !form[f.name] && (
                    <img src={existingImages[f.name]} alt="current" className="mt-2 h-16 w-24 object-cover rounded-lg border border-gray-200" />
                  )}
                </>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} className={inputCls} value={form[f.name] ?? ''} placeholder={f.placeholder}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/20">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl transition">
              <X size={18} /> Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
          <ImageIcon className="mx-auto mb-3" size={32} /> No items yet. Add your first one above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((row) => (
            <div key={row.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {card.image && (
                <div className="h-36 bg-[#0b1120] relative">
                  {row[card.image]
                    ? <img src={row[card.image]} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full text-slate-700"><ImageIcon size={28} /></div>}
                  {row.order !== undefined && (
                    <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-black/70 text-white px-2 py-0.5 rounded-full">#{row.order}</span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h4 className="font-bold text-white line-clamp-1">{row[card.title]}</h4>
                {card.subtitle && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{row[card.subtitle] || '—'}</p>}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <button onClick={() => startEdit(row)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => setToDelete(row)} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 rounded-lg transition">
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
}
