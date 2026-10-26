"use client";

import { Loader2, X } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="display text-3xl lg:text-4xl">{title}</h1>
        {subtitle && <p className="text-sm text-stone mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, accent = "bg-ink" }: { label: string; value: React.ReactNode; hint?: string; accent?: string }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
      <p className="eyebrow text-[10px] text-stone">{label}</p>
      <p className="font-serif text-3xl mt-2 leading-none">{value}</p>
      {hint && <p className="text-xs text-stone mt-2">{hint}</p>}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-stone">
      <Loader2 className="animate-spin" />
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="card p-14 text-center">
      <p className="font-serif text-2xl mb-1">{title}</p>
      {text && <p className="text-sm text-stone">{text}</p>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-5xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto bg-bone shadow-2xl animate-fade-up`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-bone border-b border-bone-3">
          <h2 className="display text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-bone-2"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { key: T; label: string; count?: number }[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-bone-3">
      {items.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative px-4 py-3 text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${value === t.key ? "text-ink" : "text-stone hover:text-ink"}`}
        >
          {t.label}
          {t.count !== undefined && <span className={`ml-2 px-1.5 py-0.5 text-[10px] ${value === t.key ? "bg-ink text-bone" : "bg-bone-2 text-ink-3"}`}>{t.count}</span>}
          {value === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-ink" />}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-6 text-sm">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-outline py-2 px-4 text-[10px]">Previous</button>
      <span className="text-stone">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-outline py-2 px-4 text-[10px]">Next</button>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-stone mt-1">{hint}</p>}
    </div>
  );
}
