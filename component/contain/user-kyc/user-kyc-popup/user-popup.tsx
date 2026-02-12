"use client";

import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";

interface KYCStatusModalProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  onResubmit: () => void;
  onClose: () => void;
}

export default function KYCStatusModal({ status, rejectReason, onResubmit, onClose }: KYCStatusModalProps) {
  const configs = {
    PENDING: {
      icon: <Clock size={40} className="text-amber-500" />,
      bg: "bg-amber-100",
      title: "Verification Pending",
      desc: "Hum aapki details check kar rahe hain. Isme 24 ghante tak lag sakte hain.",
      btnText: "Theek Hai",
      btnAction: onClose
    },
    APPROVED: {
      icon: <CheckCircle2 size={40} className="text-green-600" />,
      bg: "bg-green-100",
      title: "Verified Successfully!",
      desc: "Mubarak ho! Aapka account verify ho chuka hai aur aap tamam features use kar sakte hain.",
      btnText: "Shuru Karein",
      btnAction: onClose
    },
    REJECTED: {
      icon: <XCircle size={40} className="text-red-600" />,
      bg: "bg-red-100",
      title: "Verification Failed",
      desc: rejectReason || "Aapke documents wazeh nahi thay ya criteria par poora nahi utar rahe thay.",
      btnText: "Dobara Koshish Karein",
      btnAction: onResubmit
    }
  };

  const current = configs[status];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <div className={`w-20 h-20 ${current.bg} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
          {current.icon}
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-3">{current.title}</h2>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">
          {current.desc}
        </p>

        <button 
          onClick={current.btnAction}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black shadow-lg transition-all ${
            status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-900 hover:bg-black text-white'
          }`}
        >
          {status === 'REJECTED' && <RotateCcw size={18} />}
          {current.btnText}
        </button>
      </div>
    </div>
  );
}