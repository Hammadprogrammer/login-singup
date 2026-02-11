"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface KYCStatusProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "NONE";
  reason?: string;
  onRetry: () => void;
}

export default function KYCStatusModals({ status, reason, onRetry }: KYCStatusProps) {
  const router = useRouter();

  if (status === "NONE") return null;

  const config = {
    PENDING: {
      icon: <Clock size={40} className="text-amber-600" />,
      bg: "bg-amber-100",
      title: "Verification Pending",
      desc: "Hum aapki details review kar rahe hain. Isme aam tor par 24 ghante lagte hain.",
      btnText: "Back to Home",
      btnClass: "bg-gray-900",
      action: () => router.push("/"),
    },
    APPROVED: {
      icon: <CheckCircle2 size={40} className="text-green-600" />,
      bg: "bg-green-100",
      title: "Account Verified!",
      desc: "Mubarak ho! Aapki KYC verification mukammal ho chuki hai.",
      btnText: "Go to Dashboard",
      btnClass: "bg-green-600",
      action: () => router.push("/dashboard"),
    },
    REJECTED: {
      icon: <XCircle size={40} className="text-red-600" />,
      bg: "bg-red-100",
      title: "KYC Rejected",
      desc: reason || "Aapke documents standard ke mutabiq nahi thay.",
      btnText: "Re-Submit Application",
      btnClass: "bg-pink-600",
      action: onRetry,
    },
  }[status];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
        <div className={`w-20 h-20 ${config.bg} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
          {config.icon}
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">{config.title}</h2>
        
        <div className={status === "REJECTED" ? "bg-red-50 p-4 rounded-2xl mb-6" : "mb-8"}>
          {status === "REJECTED" && <p className="text-red-600 text-[10px] font-black uppercase mb-1">Reason for Rejection</p>}
          <p className={`${status === "REJECTED" ? "text-gray-800" : "text-gray-500"} font-medium leading-relaxed`}>
            {config.desc}
          </p>
        </div>

        <button 
          onClick={config.action}
          className={`w-full ${config.btnClass} text-white py-4 rounded-2xl font-black shadow-lg hover:opacity-90 transition-all`}
        >
          {config.btnText}
        </button>
      </div>
    </div>
  );
}