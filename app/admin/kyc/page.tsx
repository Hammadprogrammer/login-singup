"use client";

import { useEffect, useState } from "react";
import { Check, X, Eye, ShieldCheck, UserCheck, Calendar, Hash } from "lucide-react";

export default function AdminVerification() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kyc")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const processKyc = async (id: string | number, status: string) => {
    const reason = status === "REJECTED" ? "Document mismatch or unclear photos" : "";
    try {
      const res = await fetch("/api/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reason }),
      });
      if (res.ok) {
        setData((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-pink-50">
      <div className="animate-bounce text-pink-600 font-black text-2xl tracking-tighter">ADMIN PANEL...</div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-[#fffafa] min-h-screen font-sans">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <span className="bg-pink-600 text-white p-2 rounded-2xl shadow-lg shadow-pink-200">
              <ShieldCheck size={32} />
            </span>
            KYC Approvals
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Verify pending identity requests from users.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pending Requests</span>
          <div className="text-3xl font-black text-pink-600">{data.length}</div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-pink-100 max-w-7xl mx-auto">
          <div className="bg-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="text-pink-300" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No Pending Verifications</h3>
          <p className="text-gray-400">All caught up! New requests will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {data.map((user) => (
            <div key={user.id} className="bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-pink-50 overflow-hidden flex flex-col lg:flex-row hover:shadow-xl transition-all duration-500">
              
              {/* Left Side: Images */}
              <div className="lg:w-1/2 p-6 bg-pink-50/30 space-y-4">
                 <div className="relative group overflow-hidden rounded-2xl border-2 border-white shadow-sm">
                    <p className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md text-[10px] text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">Face Liveness</p>
                    <img 
                      src={user.faceImage} // Cloudinary URL
                      alt="Face" 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-white shadow-sm">
                       <p className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-[8px] text-pink-600 px-2 py-0.5 rounded-md font-black uppercase">Front Side</p>
                       <img src={user.documentFront} className="w-full h-32 object-cover group-hover:brightness-75 transition-all" />
                    </div>
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-white shadow-sm">
                       <p className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm text-[8px] text-pink-600 px-2 py-0.5 rounded-md font-black uppercase">Back Side</p>
                       <img src={user.documentBack} className="w-full h-32 object-cover group-hover:brightness-75 transition-all" />
                    </div>
                 </div>
              </div>

              {/* Right Side: Details */}
              <div className="lg:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">{user.fullName}</h3>
                    <span className="bg-pink-100 text-pink-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                      {user.documentType}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <Hash size={16} className="text-pink-300" />
                      <span className="text-sm font-medium tracking-tight">{user.documentNumber || user.docNum}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <UserCheck size={16} className="text-pink-300" />
                      <span className="text-sm font-medium tracking-tight">S/O {user.fatherName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <Calendar size={16} className="text-pink-300" />
                      <span className="text-sm font-medium tracking-tight">Expires: {user.documentExpiry?.split("T")[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => processKyc(user.id, "APPROVED")} 
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-100 transition-all active:scale-95"
                  >
                    <Check size={20} /> Approve
                  </button>
                  <button 
                    onClick={() => processKyc(user.id, "REJECTED")} 
                    className="px-6 bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-600 py-4 rounded-2xl font-bold transition-all active:scale-95"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Footer Branding */}
      <div className="text-center mt-20 pb-10">
        <p className="text-gray-300 text-xs font-bold uppercase tracking-[0.3em]">Secure Identity Management System</p>
      </div>
    </div>
  );
}