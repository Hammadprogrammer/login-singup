"use client";

import { CheckCircle2, XCircle, Clock, RotateCcw, X } from "lucide-react";

interface KYCStatusModalProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  onResubmit: () => void;
  onClose: () => void;
}

export default function KYCStatusModal({ status, rejectReason, onResubmit, onClose }: KYCStatusModalProps) {
  const configs = {
    PENDING: {
      icon: <Clock size={44} className="text-amber-500" strokeWidth={2.5} />,
      bg: "bg-amber-50",
      title: "Review in Progress",
      desc: "Our verification team is currently reviewing your application. This process typically takes up to 24 business hours.",
      btnText: "Understood",
      btnAction: onClose,
      accentColor: "bg-gray-900"
    },
    APPROVED: {
      icon: <CheckCircle2 size={44} className="text-green-600" strokeWidth={2.5} />,
      bg: "bg-green-50",
      title: "Identity Verified",
      desc: "Success! Your KYC application has been approved. You now have full access to all premium features and services.",
      btnText: "Get Started",
      btnAction: onClose,
      accentColor: "bg-gray-900"
    },
    REJECTED: {
      icon: <XCircle size={44} className="text-red-600" strokeWidth={2.5} />,
      bg: "bg-red-50",
      title: "Verification Declined",
      desc: rejectReason || "Your documents did not meet our compliance standards or were not clearly legible.",
      btnText: "Re-submit Documents",
      btnAction: onResubmit,
      accentColor: "bg-red-600"
    }
  };

  const current = configs[status];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
      
      {/* Modal Container */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-sm w-full text-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative animate-in zoom-in-95 duration-300">
        
        {/* Close Icon (Top Right) */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* Status Icon Area */}
        <div className={`w-24 h-24 ${current.bg} rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-8 ring-white shadow-inner`}>
          {current.icon}
        </div>
        
        {/* Text Content */}
        <h2 className="text-3xl font-black text-black mb-4 tracking-tighter">
          {current.title}
        </h2>
        <p className="text-gray-600 font-bold text-sm leading-relaxed mb-10 px-2 uppercase tracking-tight">
          {current.desc}
        </p>

        {/* Action Button */}
        <button 
          onClick={current.btnAction}
          className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest text-white shadow-xl transform active:scale-95 transition-all ${current.accentColor} hover:opacity-90`}
        >
          {status === 'REJECTED' && <RotateCcw size={18} strokeWidth={3} />}
          {current.btnText}
        </button>

        {/* System ID Tag */}
        <div className="mt-8 flex items-center justify-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Secure Verification ID: {Math.floor(1000 + Math.random() * 9000)}</span>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}