"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Search,
  Eye,
  ShieldCheck,
  Zap,
  Maximize2,
  FileText,
  AlertTriangle,
  Info,
  Loader2
} from "lucide-react";

interface KYC {
  id: number;
  fullName: string;
  documentType: string;
  documentNumber: string;
  documentFront: string;
  documentBack: string;
  faceImage: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  user: {
    id: number;
    email: string;
    name?: string | null;
  };
}

export default function AdminKycPage() {
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KYC | null>(null);
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Custom Notification State
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadKycs = async () => {
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      setKycs(data);
    } catch (error) {
      showToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKycs(); }, []);

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!selected) return;
    
    if (status === "REJECTED" && !reason.trim()) {
      showToast("Please provide a rejection reason before proceeding.", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status, rejectionReason: reason }),
      });

      if (res.ok) {
        showToast(`Application #${selected.user.id} ${status.toLowerCase()} successfully`, "success");
        setSelected(null);
        setReason("");
        loadKycs();
      } else {
        throw new Error();
      }
    } catch {
      showToast("System error: Could not update status", "error");
    }
  };

  const filteredKycs = kycs.filter(k => {
    const matchesSearch = k.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          k.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          k.user.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "ALL" || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      
      {/* --- PROFESSIONAL TOAST NOTIFICATION --- */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
            notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
            notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' :
            'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
          }`}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <AlertTriangle size={20} />}
            {notification.type === 'info' && <Info size={20} />}
            <p className="font-bold text-sm tracking-wide">{notification.msg}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <ShieldCheck className="text-indigo-500" size={28} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">KYC.Verify</h1>
            </div>
            <p className="text-slate-500 font-medium">Identity verification management & legal auditing system.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#161f32] p-2 rounded-xl border border-slate-800">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Live</span>
          </div>
        </header>

        {/* Search & Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                    type="text"
                    placeholder="Search by UID, Name, or Email Address..."
                    className="w-full pl-14 pr-6 py-4 bg-[#161f32] border border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-200 shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="bg-[#161f32] border border-slate-800 text-slate-300 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none font-bold appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">Filtered by Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
            </select>
        </div>

        {/* Table Content */}
        {loading ? (
            <div className="bg-[#161f32] rounded-3xl border border-slate-800 p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Accessing Database...</p>
            </div>
        ) : (
            <div className="bg-[#161f32] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/40">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">User ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identification</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredKycs.map((k) => (
                            <tr key={k.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                                <td className="px-8 py-5 font-mono text-indigo-400 font-bold text-sm">#{k.user.id}</td>
                                <td className="px-8 py-5">
                                    <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{k.fullName}</p>
                                    <p className="text-xs text-slate-500 font-medium">{k.user.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-slate-800 rounded-md"><FileText size={12} className="text-slate-400" /></div>
                                        <span className="text-sm font-bold text-slate-300">{k.documentType}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{k.documentNumber}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter
                                        ${k.status === 'PENDING' ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 
                                          k.status === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 
                                          'bg-rose-500/5 border-rose-500/20 text-rose-500'}`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${k.status === 'PENDING' ? 'bg-orange-500' : k.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        {k.status}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => setSelected(k)}
                                        className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-lg shadow-transparent hover:shadow-indigo-500/20"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {selected && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelected(null)} />
          
          <div className="relative w-full max-w-4xl bg-[#0b1120] max-h-[95vh] overflow-y-auto rounded-[32px] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col animate-in fade-in zoom-in duration-300">
            
            <div className="p-8 border-b border-slate-800 flex justify-between items-start">
              <div className="flex gap-5">
                <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl">
                    {selected.fullName.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase">{selected.fullName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-0.5 bg-slate-800 text-indigo-400 text-[10px] font-black rounded font-mono border border-slate-700">USER ID: #{selected.user.id}</span>
                        <span className="text-xs text-slate-500 font-medium italic">{selected.user.email}</span>
                    </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl transition-colors border border-slate-800">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-[0.2em]">Verified Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: "Document Front", src: selected.documentFront },
                            { label: "Document Back", src: selected.documentBack },
                            { label: "Biometric Face Match", src: selected.faceImage, fullWidth: true }
                        ].map((img, i) => (
                            <div 
                                key={i} 
                                onClick={() => setZoomedImage(img.src)}
                                className={`group relative rounded-2xl overflow-hidden border border-slate-800 cursor-zoom-in bg-slate-900 shadow-xl ${img.fullWidth ? 'sm:col-span-2 aspect-[21/9]' : 'aspect-video'}`}
                            >
                                <img src={img.src} alt={img.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                                    <p className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <Maximize2 size={12} className="text-indigo-400" /> {img.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="p-6 bg-[#161f32] rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Identity Summary</h3>
                    <div className="space-y-4">
                        <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Type</p>
                            <p className="text-sm font-bold">{selected.documentType}</p>
                        </div>
                        <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 font-mono">
                            <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">Ref Number</p>
                            <p className="text-sm font-bold">{selected.documentNumber}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Audit Action</h3>
                    <textarea 
                        className="w-full bg-[#0b1120] border border-slate-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white min-h-[120px] transition-all"
                        placeholder="Type rejection reason or approval notes..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => updateStatus("APPROVED")}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3"
                        >
                            <CheckCircle size={18}/> Finalize Approval
                        </button>
                        <button 
                            onClick={() => updateStatus("REJECTED")}
                            className="w-full bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-rose-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <XCircle size={18}/> Reject Application
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN LIGHTBOX --- */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center cursor-zoom-out p-10 animate-in fade-in zoom-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Evidence View" 
            className="max-w-full max-h-full object-contain rounded-lg border border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.3)]"
          />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 pointer-events-none">
            Click anywhere to dismiss
          </div>
        </div>
      )}
    </div>
  );
}