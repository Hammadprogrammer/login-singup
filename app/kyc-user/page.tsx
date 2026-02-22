"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Clock, 
  X, 
  ChevronRight, 
  Fingerprint, 
  FileWarning
} from "lucide-react";

export default function KycStatusManager() {
  const router = useRouter();
  const [kyc, setKyc] = useState({ status: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndKyc = async () => {
      try {
        // 1. Aapki file structure ke mutabiq path: /api/auth/check-token
        const authRes = await fetch("/api/auth/check-token");
        const authData = await authRes.json();

        // Agar token valid nahi hai ya user logged in nahi hai
        if (!authData.loggedIn) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        // 2. Agar login hai, tabhi KYC fetch karein
        const kycRes = await fetch("/api/kyc");
        const kycData = await kycRes.json();

        setKyc({ 
          status: kycData.status, 
          reason: kycData.rejectionReason || "" 
        });
        
        // Agar KYC Approved nahi hai, toh popup auto-open karein
        if (kycData.status !== "APPROVED") {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Auth/KYC Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndKyc();
  }, []);

  const configs: Record<string, any> = {
    REJECTED: { 
      icon: <FileWarning size={36} className="text-red-600" />, 
      title: "Action Required",
      desc: kyc.reason || "Your documents were rejected. Please resubmit valid identification.", 
      btnText: "Re-submit KYC",
      link: "/kyc"
    },
    PENDING: { 
      icon: <Clock size={36} className="text-amber-500" />, 
      title: "Under Review", 
      desc: "We're currently checking your documents. This usually takes 24-48 hours.",
      btnText: "Check Progress",
      link: "/kyc"
    },
    NOT_STARTED: { 
      icon: <ShieldAlert size={36} className="text-indigo-500" />, 
      title: "Verify Identity", 
      desc: "Complete your KYC verification to unlock all premium features.", 
      btnText: "Start Verification",
      link: "/kyc"
    } 
  };

  // Logic: Loading state, Not Logged In, ya Approved hone par component render nahi hoga
  if (loading || !isLoggedIn || kyc.status === "APPROVED") return null;

  const config = configs[kyc.status] || configs.NOT_STARTED;

  const handleAction = () => {
    setIsOpen(false);
    router.push(config.link);
  };

  return (
    <div className="font-sans">
      {/* FLOATING TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9998] flex items-center gap-3 bg-white border border-slate-200 shadow-2xl p-2 pr-5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
             <Fingerprint size={20} />
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">KYC Status</span>
        </button>
      )}

      {/* OVERLAY & MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="p-8 sm:p-10 flex flex-col items-center">
              {/* ICON */}
              <div className={`mb-6 w-20 h-20 rounded-[2rem] flex items-center justify-center border animate-in zoom-in-50 duration-500 
                ${kyc.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 
                  kyc.status === 'PENDING' ? 'bg-amber-50 border-amber-100' : 
                  'bg-indigo-50 border-indigo-100'}`}
              >
                {config.icon}
              </div>

              {/* TEXT */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {config.title}
                </h3>
                <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed px-2">
                  {config.desc}
                </p>
              </div>

              {/* BUTTON */}
              <button 
                onClick={handleAction}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-slate-200"
              >
                {config.btnText}
                <ChevronRight size={18} />
              </button>
            </div>

            {/* CLOSE */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}