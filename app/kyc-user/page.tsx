// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { 
//   ShieldAlert, 
//   Clock, 
//   X, 
//   ChevronRight, 
//   Fingerprint, 
//   FileWarning
// } from "lucide-react";

// export default function KycStatusManager() {
//   const router = useRouter();
//   const [kyc, setKyc] = useState({ status: "", reason: "" });
//   const [loading, setLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const checkAuthAndKyc = async () => {
//       try {
//         // 1. Aapki file structure ke mutabiq path: /api/auth/check-token
//         const authRes = await fetch("/api/auth/check-token");
//         const authData = await authRes.json();

//         // Agar token valid nahi hai ya user logged in nahi hai
//         if (!authData.loggedIn) {
//           setIsLoggedIn(false);
//           setLoading(false);
//           return;
//         }

//         setIsLoggedIn(true);

//         // 2. Agar login hai, tabhi KYC fetch karein
//         const kycRes = await fetch("/api/kyc");
//         const kycData = await kycRes.json();

//         setKyc({ 
//           status: kycData.status, 
//           reason: kycData.rejectionReason || "" 
//         });
        
//         // Agar KYC Approved nahi hai, toh popup auto-open karein
//         if (kycData.status !== "APPROVED") {
//           setIsOpen(true);
//         }
//       } catch (error) {
//         console.error("Auth/KYC Fetch Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthAndKyc();
//   }, []);

//   const configs: Record<string, any> = {
//     REJECTED: { 
//       icon: <FileWarning size={36} className="text-red-600" />, 
//       title: "Action Required",
//       desc: kyc.reason || "Your documents were rejected. Please resubmit valid identification.", 
//       btnText: "Re-submit KYC",
//       link: "/kyc"
//     },
//     PENDING: { 
//       icon: <Clock size={36} className="text-amber-500" />, 
//       title: "Under Review", 
//       desc: "We're currently checking your documents. This usually takes 24-48 hours.",
//       btnText: "Check Progress",
//       link: "/kyc"
//     },
//     NOT_STARTED: { 
//       icon: <ShieldAlert size={36} className="text-indigo-500" />, 
//       title: "Verify Identity", 
//       desc: "Complete your KYC verification to unlock all premium features.", 
//       btnText: "Start Verification",
//       link: "/kyc"
//     } 
//   };

//   // Logic: Loading state, Not Logged In, ya Approved hone par component render nahi hoga
//   if (loading || !isLoggedIn || kyc.status === "APPROVED") return null;

//   const config = configs[kyc.status] || configs.NOT_STARTED;

//   const handleAction = () => {
//     setIsOpen(false);
//     router.push(config.link);
//   };

//   return (
//     <div className="font-sans">
//       {/* FLOATING TOGGLE BUTTON */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9998] flex items-center gap-3 bg-white border border-slate-200 shadow-2xl p-2 pr-5 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-5"
//         >
//           <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
//              <Fingerprint size={20} />
//           </div>
//           <span className="text-sm font-bold text-slate-800 tracking-tight">KYC Status</span>
//         </button>
//       )}

//       {/* OVERLAY & MODAL */}
//       {isOpen && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
//           <div className="relative w-full max-w-[380px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            
//             <div className="p-8 sm:p-10 flex flex-col items-center">
//               {/* ICON */}
//               <div className={`mb-6 w-20 h-20 rounded-[2rem] flex items-center justify-center border animate-in zoom-in-50 duration-500 
//                 ${kyc.status === 'REJECTED' ? 'bg-red-50 border-red-100' : 
//                   kyc.status === 'PENDING' ? 'bg-amber-50 border-amber-100' : 
//                   'bg-indigo-50 border-indigo-100'}`}
//               >
//                 {config.icon}
//               </div>

//               {/* TEXT */}
//               <div className="text-center mb-8">
//                 <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
//                   {config.title}
//                 </h3>
//                 <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed px-2">
//                   {config.desc}
//                 </p>
//               </div>

//               {/* BUTTON */}
//               <button 
//                 onClick={handleAction}
//                 className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-[16px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-slate-200"
//               >
//                 {config.btnText}
//                 <ChevronRight size={18} />
//               </button>
//             </div>

//             {/* CLOSE */}
//             <button 
//               onClick={() => setIsOpen(false)}
//               className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
//             >
//               <X size={22} />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Hourglass, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Fingerprint, 
  ShieldAlert,
  Info,
  Lock
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
        const authRes = await fetch("/api/auth/check-token");
        const authData = await authRes.json();

        if (!authData.loggedIn) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);
        const kycRes = await fetch("/api/kyc");
        const kycData = await kycRes.json();

        setKyc({ 
          status: kycData.status, 
          reason: kycData.rejectionReason || "" 
        });
        
        if (kycData.status !== "APPROVED") {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("KYC System Error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndKyc();
  }, []);

  const configs: Record<string, any> = {
    REJECTED: { 
      icon: <AlertCircle size={32} className="text-rose-600" />, 
      gradient: "from-rose-500/10 to-rose-600/5",
      accent: "bg-rose-600",
      border: "border-rose-100",
      title: "Verification Rejected",
      desc: kyc.reason || "Your documents didn't meet our criteria. Please update and resubmit.", 
      btnText: "Update Identity",
      showClose: true 
    },
    PENDING: { 
      icon: <Hourglass size={32} className="text-amber-600" />, 
      gradient: "from-amber-500/10 to-amber-600/5",
      accent: "bg-amber-600",
      border: "border-amber-100",
      title: "Reviewing Documents", 
      desc: "Hang tight! Our compliance team is checking your details. This takes ~24h.",
      btnText: "Check Dashboard",
      showClose: true 
    },
    NOT_STARTED: { 
      icon: <Lock size={32} className="text-indigo-600" />, 
      gradient: "from-indigo-500/10 to-blue-600/5",
      accent: "bg-indigo-600",
      border: "border-indigo-100",
      title: "Unlock Full Access", 
      desc: "Complete your KYC to enable withdrawals and increase your daily limits.", 
      btnText: "Start Setup",
      showClose: true 
    } 
  };

  if (loading || !isLoggedIn || kyc.status === "APPROVED") return null;

  const config = configs[kyc.status] || configs.NOT_STARTED;

  return (
    <div className="font-sans antialiased text-slate-900">
      {/* FLOATING MINI BUTTON (Appears when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] group flex items-center gap-3 bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 pr-5 rounded-2xl hover:border-slate-300 transition-all duration-300 active:scale-95 animate-in slide-in-from-bottom-5"
        >
          <div className={`${config.accent} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>
             <Fingerprint size={20} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-black text-slate-400 leading-none mb-1">Verify</p>
            <p className="text-sm font-bold text-slate-800 tracking-tight">Status Update</p>
          </div>
        </button>
      )}

      {/* MODAL SYSTEM */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500">
          
          <div className={`relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.25)] border ${config.border} overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500`}>
            
            {/* Header / Graphic */}
            <div className={`h-28 w-full bg-gradient-to-br ${config.gradient} flex items-end justify-center pb-0`}>
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center translate-y-6 border border-slate-50 transition-transform hover:scale-105 duration-500">
                    {config.icon}
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pt-12 pb-10 text-center">
              <div className="space-y-3 mb-10">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">
                  {config.title}
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  {config.desc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button 
                    onClick={() => { setIsOpen(false); router.push("/kyc"); }}
                    className={`w-full py-4 ${config.accent} hover:shadow-lg hover:brightness-110 text-white rounded-2xl font-bold text-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-md shadow-slate-200`}
                >
                    {config.btnText}
                    <ArrowRight size={18} />
                </button>
                
                <div className="flex items-center justify-center gap-2 py-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secure Verification</span>
                </div>
              </div>

              {/* Unique Close Button for 'PENDING' and 'REJECTED' */}
              {config.showClose && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Dynamic Status Bar (Bottom) */}
            {kyc.status === 'REJECTED' && (
                <div className="bg-rose-50 border-t border-rose-100 px-8 py-3 flex items-center gap-2">
                    <Info size={14} className="text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">Your account features are currently locked.</span>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles for extra polish */}
      <style jsx global>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-subtle {
          animation: subtle-pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}