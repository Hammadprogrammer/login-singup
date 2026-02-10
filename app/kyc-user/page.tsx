"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, X } from "lucide-react";

export default function KycStatusPopup() {
  const [kyc, setKyc] = useState({ status: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true); // Popup control

  useEffect(() => {
    fetch("/api/kyc")
      .then((res) => res.json())
      .then((data) => {
        setKyc({ status: data.status, reason: data.rejectionReason });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Agar user ne close kar diya ya loading hai, toh kuch mat dikhao
  if (!isOpen || loading) return null;

  const configs: Record<string, any> = {
    APPROVED: { icon: <CheckCircle size={40} className="text-green-500" />, color: "green", title: "Verification Successful", desc: "Your identity has been verified. You now have full access." },
    REJECTED: { icon: <XCircle size={40} className="text-red-500" />, color: "red", title: "KYC Rejected", desc: kyc.reason || "The documents provided do not meet our requirements.", action: "Try Again" },
    PENDING: { icon: <Clock size={40} className="text-amber-500" />, color: "amber", title: "Under Review", desc: "We're checking your documents. This usually takes 24-48 hours." },
    NOT_STARTED: { icon: <AlertCircle size={40} className="text-blue-500" />, color: "blue", title: "Complete KYC", desc: "Please verify your identity to enable all features.", action: "Start Verification" }
  };

  const config = configs[kyc.status] || configs.NOT_STARTED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className={`mb-4 p-3 rounded-full bg-${config.color}-50`}>
            {config.icon}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {config.title}
          </h3>
          
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {config.desc}
          </p>

          {/* Action Button */}
          {config.action ? (
            <button className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              {config.action}
            </button>
          ) : (
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}