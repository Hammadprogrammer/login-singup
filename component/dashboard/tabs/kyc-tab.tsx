"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Maximize2, Loader2, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "@/component/ui/Toast";
import { PageHeader, StatCard, Spinner, Empty, Modal, Tabs } from "../ui";

interface KYC {
  id: number; fullName: string; fatherName: string | null; documentType: string; documentNumber: string; documentExpiry: string | null;
  documentFront: string; documentBack: string; faceImage: string; status: "PENDING" | "APPROVED" | "REJECTED"; rejectionReason?: string | null;
  createdAt: string; updatedAt: string; user: { id: number; email: string; name?: string | null };
}
type Filter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export default function KYCTab() {
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KYC | null>(null);
  const [reason, setReason] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [zoom, setZoom] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/kyc", { cache: "no-store" });
      setKycs(r.ok ? await r.json() : []);
    } catch {
      toast.error("Failed to fetch KYC records");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const decide = async (status: "APPROVED" | "REJECTED") => {
    if (!selected) return;
    if (status === "REJECTED" && reason.trim().length < 3) return toast.error("Please give a rejection reason");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/kyc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selected.id, status, rejectionReason: reason }) });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Update failed");
      toast.success(`${selected.fullName} ${status.toLowerCase()}`);
      setSelected(null);
      setReason("");
      load();
    } finally {
      setBusy(false);
    }
  };

  const term = q.trim().toLowerCase();
  const visible = kycs.filter((k) => (filter === "ALL" || k.status === filter) && (!term || k.fullName.toLowerCase().includes(term) || k.user.email.toLowerCase().includes(term) || k.documentNumber.includes(term) || String(k.user.id) === term));
  const count = (s: Filter) => (s === "ALL" ? kycs.length : kycs.filter((k) => k.status === s).length);

  const tone = (s: KYC["status"]) => (s === "APPROVED" ? "border-success/40 text-success" : s === "PENDING" ? "border-brass text-[#7a5f2a]" : "border-oxblood/40 text-oxblood");

  return (
    <div className="space-y-6">
      <PageHeader title="Identity verification" subtitle="Review documents and approve or reject. Images are served via short-lived signed links." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={kycs.length} />
        <StatCard label="Pending" value={count("PENDING")} accent="bg-brass" />
        <StatCard label="Approved" value={count("APPROVED")} accent="bg-success" />
        <StatCard label="Rejected" value={count("REJECTED")} accent="bg-oxblood" />
      </div>

      <Tabs<Filter> value={filter} onChange={setFilter} items={[{ key: "PENDING", label: "Pending", count: count("PENDING") }, { key: "APPROVED", label: "Approved", count: count("APPROVED") }, { key: "REJECTED", label: "Rejected", count: count("REJECTED") }, { key: "ALL", label: "All", count: kycs.length }]} />

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, document no. or user ID…" className="field-box pl-10" />
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <Empty title="No records" text={filter === "PENDING" ? "No verifications waiting for review." : undefined} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-stone bg-bone-2/50">
                <tr><th className="text-left px-5 py-3 font-medium">Applicant</th><th className="text-left px-4 py-3 font-medium">Document</th><th className="text-left px-4 py-3 font-medium">Submitted</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-bone-3">
                {visible.map((k) => (
                  <tr key={k.id} className="hover:bg-bone-2/40">
                    <td className="px-5 py-3"><p className="font-medium">{k.fullName}</p><p className="text-[11px] text-stone">{k.user.email} · #{k.user.id}</p></td>
                    <td className="px-4 py-3"><p className="text-xs">{k.documentType.replace("_", " ")}</p><p className="font-mono text-[11px] text-stone">{k.documentNumber}</p></td>
                    <td className="px-4 py-3 text-xs text-stone">{formatDate(k.createdAt, true)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider ${tone(k.status)}`}>{k.status}</span></td>
                    <td className="px-5 py-3 text-right"><button onClick={() => { setSelected(k); setReason(""); }} className="btn-outline py-1.5 px-3 text-[10px]"><Eye size={13} /> Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal title={selected.fullName} onClose={() => setSelected(null)} wide>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <p className="eyebrow text-[10px] text-stone mb-3">Submitted documents</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[{ label: "Document front", src: selected.documentFront }, { label: "Document back", src: selected.documentBack }, { label: "Live selfie", src: selected.faceImage, full: true }].map((img) => (
                  <button key={img.label} onClick={() => setZoom(img.src)} className={`group relative overflow-hidden bg-bone-2 border border-bone-3 text-left ${img.full ? "sm:col-span-2 aspect-[21/9]" : "aspect-video"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.label} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute bottom-2 left-2 bg-ink/80 text-bone text-[10px] uppercase tracking-wider px-2 py-1 flex items-center gap-1"><Maximize2 size={10} /> {img.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone mt-3">Links expire after 15 minutes. Reload the list to refresh them.</p>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="card p-5 text-sm space-y-2">
                <p className="eyebrow text-[10px] text-stone mb-1">Identity summary</p>
                <p><span className="text-stone">Name:</span> {selected.fullName}</p>
                {selected.fatherName && <p><span className="text-stone">Father:</span> {selected.fatherName}</p>}
                <p><span className="text-stone">Type:</span> {selected.documentType.replace("_", " ")}</p>
                <p><span className="text-stone">Number:</span> <span className="font-mono">{selected.documentNumber}</span></p>
                {selected.documentExpiry && <p><span className="text-stone">Expires:</span> {formatDate(selected.documentExpiry)}</p>}
                <p><span className="text-stone">Account:</span> {selected.user.email} (#{selected.user.id})</p>
                <p><span className="text-stone">Submitted:</span> {formatDate(selected.createdAt, true)}</p>
              </div>

              {selected.status === "PENDING" ? (
                <div className="card p-5 space-y-3">
                  <p className="eyebrow text-[10px] text-stone">Decision</p>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} className="field-box resize-none" placeholder="Rejection reason (required to reject)…" />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => decide("APPROVED")} disabled={busy} className="btn py-3 text-[10px] bg-success text-bone">{busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />} Approve</button>
                    <button onClick={() => decide("REJECTED")} disabled={busy} className="btn py-3 text-[10px] border border-oxblood text-oxblood hover:bg-oxblood hover:text-bone"><XCircle size={14} /> Reject</button>
                  </div>
                </div>
              ) : (
                <div className="card p-5 text-sm">
                  <p className="eyebrow text-[10px] text-stone mb-2">Decision</p>
                  <span className={`px-2 py-1 border text-[10px] uppercase tracking-wider ${tone(selected.status)}`}>{selected.status}</span>
                  {selected.rejectionReason && <p className="mt-3 text-ink-3">Reason: {selected.rejectionReason}</p>}
                  <p className="text-[11px] text-stone mt-2">Updated {formatDate(selected.updatedAt, true)}</p>
                </div>
              )}

              <p className="text-[11px] text-stone flex items-center gap-2"><ShieldCheck size={12} /> Documents are stored as private Cloudinary assets.</p>
            </div>
          </div>
        </Modal>
      )}

      {zoom && (
        <div className="fixed inset-0 z-[300] bg-ink/95 flex items-center justify-center p-6 cursor-zoom-out animate-fade-in" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="Document" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
