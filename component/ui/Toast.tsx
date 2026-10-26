"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type Kind = "success" | "error" | "info";
interface ToastMsg { id: number; kind: Kind; text: string }

const listeners = new Set<(t: ToastMsg) => void>();
let seq = 0;

/** Global imperative toast — call from anywhere on the client. */
export const toast = {
  success: (text: string) => emit("success", text),
  error: (text: string) => emit("error", text),
  info: (text: string) => emit("info", text),
};
function emit(kind: Kind, text: string) {
  const t = { id: ++seq, kind, text };
  listeners.forEach((l) => l(t));
}

export default function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const add = (t: ToastMsg) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 4200);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[min(92vw,420px)]">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`animate-fade-up flex items-start gap-3 px-4 py-3 shadow-2xl border text-sm ${
            t.kind === "success"
              ? "bg-ink text-bone border-ink"
              : t.kind === "error"
              ? "bg-oxblood text-bone border-oxblood"
              : "bg-bone text-ink border-bone-3"
          }`}
        >
          {t.kind === "success" ? <CheckCircle2 size={18} className="text-brass-2 shrink-0 mt-0.5" /> : t.kind === "error" ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <Info size={18} className="shrink-0 mt-0.5" />}
          <p className="flex-1 leading-snug">{t.text}</p>
          <button onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))} className="opacity-60 hover:opacity-100"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
