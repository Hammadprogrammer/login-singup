// "use client";

// import { useRef, useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { 
//   CheckCircle2, ArrowLeft, Camera, Loader2, Image as ImageIcon, ChevronRight 
// } from "lucide-react";
// import KYCStatusModal from "./user-kyc-popup/user-popup";

// export default function ProfessionalKYC() {
//   const router = useRouter();
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // States
//   const [loading, setLoading] = useState(true);
//   const [step, setStep] = useState(1);
//   const [userId, setUserId] = useState<number | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [capturedFace, setCapturedFace] = useState<string | null>(null);
//   const [kycStatus, setKycStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
//   const [rejectReason, setRejectReason] = useState("");

//   const [formData, setFormData] = useState({
//     fullName: "", 
//     fatherName: "", 
//     documentType: "CNIC",
//     documentNumber: "", 
//     documentExpiry: "", 
//     documentFront: null as string | null,
//     documentBack: null as string | null,
//   });

//   // 1. Initial Auth & Status Check
//   useEffect(() => {
//     const checkStatus = async () => {
//       try {
//         const res = await fetch("/api/kyc");
//         const data = await res.json();
//         if (data.userId) {
//           setUserId(data.userId);
//           if (data.status) {
//             setKycStatus(data.status);
//             setRejectReason(data.reason || "");
//             setStep(4);
//           }
//         } else {
//           router.push("/login");
//         }
//       } catch (err) {
//         console.error("Failed to fetch KYC status");
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkStatus();
//   }, [router]);

//   // 2. Image Upload to Cloudinary
//   const uploadToCloudinary = async (base64: string, subFolder: string) => {
//     if (!base64 || !userId) return null;
//     try {
//       const data = new FormData();
//       data.append("file", base64);
//       data.append("upload_preset", "ml_default"); 
//       data.append("folder", `kyc/user_${userId}/${subFolder}`); 
      
//       const res = await fetch(`https://api.cloudinary.com/v1_1/dbzkqua3f/image/upload`, {
//         method: "POST",
//         body: data,
//       });
//       const resData = await res.json();
//       return resData.secure_url || null;
//     } catch (err) {
//       return null;
//     }
//   };

//   // 3. Final Submit Logic
//   const handleFinalSubmit = async () => {
//     setIsSubmitting(true);
//     try {
//       // Parallel uploads for speed
//       const [frontUrl, backUrl, faceUrl] = await Promise.all([
//         uploadToCloudinary(formData.documentFront!, "documents"),
//         uploadToCloudinary(formData.documentBack!, "documents"),
//         uploadToCloudinary(capturedFace!, "faces")
//       ]);

//       if (!frontUrl || !backUrl || !faceUrl) {
//         throw new Error("Kuch images upload nahi ho saki. Internet check karein.");
//       }

//       const res = await fetch("/api/kyc", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           ...formData, 
//           documentFront: frontUrl, 
//           documentBack: backUrl, 
//           faceImage: faceUrl 
//         }),
//       });

//       if (res.ok) {
//         setKycStatus("PENDING");
//         setStep(4);
//       } else {
//         const errData = await res.json();
//         throw new Error(errData.error || "Submission fail ho gayi.");
//       }
//     } catch (err: any) { 
//       alert(err.message); 
//     } finally { 
//       setIsSubmitting(false); 
//     }
//   };

//   // 4. Input Handlers
//   const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value.replace(/\D/g, "").slice(0, 13);
//     setFormData({ ...formData, documentNumber: val });
//   };

//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let val = e.target.value.replace(/\D/g, "").slice(0, 8);
//     let formatted = val;
//     if (val.length > 2 && val.length <= 4) formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
//     else if (val.length > 4) formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
//     setFormData({ ...formData, documentExpiry: formatted });
//   };

//   const capturePhoto = () => {
//     if (canvasRef.current && videoRef.current) {
//       const canvas = canvasRef.current;
//       canvas.width = videoRef.current.videoWidth; 
//       canvas.height = videoRef.current.videoHeight;
//       const ctx = canvas.getContext("2d");
//       if (ctx) {
//         ctx.translate(canvas.width, 0); ctx.scale(-1, 1); // Mirror effect fix
//         ctx.drawImage(videoRef.current, 0, 0);
//         setCapturedFace(canvas.toDataURL("image/jpeg", 0.7));
//       }
//     }
//   };

//   // Camera initialization
//   useEffect(() => {
//     let stream: MediaStream | null = null;
//     if (step === 3 && !capturedFace) {
//       navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
//         .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
//         .catch(() => alert("Camera permission chahiye."));
//     }
//     return () => stream?.getTracks().forEach(t => t.stop());
//   }, [step, capturedFace]);

//   if (loading) return <div className="h-screen flex items-center justify-center bg-[#FFF9FA]"><Loader2 className="animate-spin text-pink-600" size={40} /></div>;

//   return (
//     <div className="min-h-screen bg-[#FFF9FA] py-6 px-4">
//       <div className="max-w-xl mx-auto">
        
//         {/* Progress Bar */}
//         {step < 4 && (
//           <div className="bg-white rounded-xl p-3 mb-6 flex items-center justify-around shadow-sm border border-pink-100">
//             {[1, 2, 3].map((s) => (
//               <div key={s} className="flex items-center gap-2">
//                 <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-300'}`}>
//                   {step > s ? <CheckCircle2 size={14} /> : s}
//                 </div>
//                 <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-black' : 'text-gray-300'}`}>
//                   {s === 1 ? 'Info' : s === 2 ? 'ID' : 'Face'}
//                 </span>
//                 {s !== 3 && <ChevronRight size={12} className="text-pink-100" />}
//               </div>
//             ))}
//           </div>
//         )}

//         <div className="bg-white rounded-3xl border border-pink-50 p-6 md:p-10 shadow-xl">
          
//           {/* Step 1: Personal Info */}
//           {step === 1 && (
//             <div className="space-y-6">
//               <header>
//                 <h2 className="text-2xl font-bold">Personal Information</h2>
//                 <p className="text-gray-500 text-sm">Exactly as on your CNIC.</p>
//               </header>
//               <div className="space-y-4">
//                 <input type="text" placeholder="FULL NAME" className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" onChange={(e)=>setFormData({...formData, fullName: e.target.value.toUpperCase()})} />
//                 <input type="text" placeholder="FATHER NAME" className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" onChange={(e)=>setFormData({...formData, fatherName: e.target.value.toUpperCase()})} />
//                 <div className="grid grid-cols-2 gap-4">
//                   <input type="text" value={formData.documentNumber} placeholder="CNIC NUMBER" className="p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" onChange={handleCNICChange} />
//                   <input type="text" value={formData.documentExpiry} placeholder="DD-MM-YYYY" className="p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 outline-none" onChange={handleDateChange} />
//                 </div>
//               </div>
//               <button 
//                 disabled={formData.documentNumber.length !== 13 || formData.documentExpiry.length !== 10 || !formData.fullName} 
//                 onClick={() => setStep(2)} 
//                 className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 disabled:opacity-30"
//               >
//                 Continue
//               </button>
//             </div>
//           )}

//           {/* Step 2: ID Upload */}
//           {step === 2 && (
//             <div className="space-y-6">
//               <button onClick={() => setStep(1)} className="flex items-center gap-1 text-black font-bold text-xs opacity-60"><ArrowLeft size={14} /> Back</button>
//               <h2 className="text-2xl font-bold">Upload ID Card</h2>
//               <div className="grid grid-cols-1 gap-4">
//                 {['documentFront', 'documentBack'].map((side) => (
//                   <label key={side} className="relative h-44 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-pink-500 transition-all">
//                     {(formData as any)[side] ? (
//                       <img src={(formData as any)[side]} className="w-full h-full object-cover" alt="ID" />
//                     ) : (
//                       <div className="text-center">
//                         <ImageIcon className="mx-auto mb-2 text-pink-600" size={24} />
//                         <span className="text-[10px] font-bold uppercase">Upload {side.includes('Front') ? 'Front' : 'Back'}</span>
//                       </div>
//                     )}
//                     <input type="file" className="hidden" accept="image/*" onChange={e => {
//                       const reader = new FileReader();
//                       reader.onload = () => setFormData({...formData, [side]: reader.result as string});
//                       if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
//                     }} />
//                   </label>
//                 ))}
//               </div>
//               <button 
//                 disabled={!formData.documentFront || !formData.documentBack} 
//                 onClick={() => setStep(3)} 
//                 className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg"
//               >
//                 Face Verification
//               </button>
//             </div>
//           )}

//           {/* Step 3: Face Capture */}
//           {step === 3 && (
//             <div className="text-center space-y-6">
//               <h2 className="text-2xl font-bold">Take a Selfie</h2>
//               <div className="relative w-56 h-56 mx-auto rounded-full border-4 border-pink-500 overflow-hidden bg-gray-50 shadow-2xl">
//                 {!capturedFace ? (
//                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
//                 ) : (
//                   <img src={capturedFace} className="w-full h-full object-cover" alt="Selfie" />
//                 )}
//               </div>
//               {!capturedFace ? (
//                 <button onClick={capturePhoto} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2">
//                   <Camera size={18} /> Capture Photo
//                 </button>
//               ) : (
//                 <div className="space-y-3">
//                   <button 
//                     onClick={handleFinalSubmit} 
//                     disabled={isSubmitting} 
//                     className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
//                   >
//                     {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Application"}
//                   </button>
//                   <button onClick={() => setCapturedFace(null)} className="text-black font-bold text-[10px] opacity-60">Retake Photo</button>
//                 </div>
//               )}
//               <canvas ref={canvasRef} className="hidden" />
//             </div>
//           )}

//           {/* Step 4: Status Modal */}
//           {step === 4 && kycStatus && (
//             <KYCStatusModal 
//               status={kycStatus} 
//               rejectReason={rejectReason}
//               onResubmit={() => { setStep(1); setKycStatus(null); }}
//               onClose={() => router.push("/")}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ArrowLeft, Camera, Loader2, Image as ImageIcon, ChevronRight, AlertCircle, ShieldCheck
} from "lucide-react";
import KYCStatusModal from "./user-kyc-popup/user-popup";

interface ValidationErrors {
  fullName?: string;
  fatherName?: string;
  documentNumber?: string;
  documentExpiry?: string;
}

export default function ProfessionalKYC() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState({
    fullName: "", 
    fatherName: "", 
    documentType: "CNIC",
    documentNumber: "", 
    documentExpiry: "", 
    documentFront: null as string | null,
    documentBack: null as string | null,
  });

  // --- Initial Auth Check ---
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/kyc");
        const data = await res.json();
        if (data.userId) {
          setUserId(data.userId);
          if (data.status) {
            setKycStatus(data.status);
            setRejectReason(data.reason || "");
            setStep(4);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed");
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [router]);

  // --- Validation Logic ---
  const validateStep1 = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father Name is required";
    if (formData.documentNumber.length !== 13) newErrors.documentNumber = "Enter 13-digit CNIC number";
    if (formData.documentExpiry.length !== 10) newErrors.documentExpiry = "Enter valid expiry date (DD-MM-YYYY)";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  // --- Handlers ---
  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setFormData({ ...formData, documentNumber: val });
    if (errors.documentNumber) setErrors({ ...errors, documentNumber: undefined });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = val;
    if (val.length > 2 && val.length <= 4) formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
    else if (val.length > 4) formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
    setFormData({ ...formData, documentExpiry: formatted });
    if (errors.documentExpiry) setErrors({ ...errors, documentExpiry: undefined });
  };

  const uploadToCloudinary = async (base64: string, subFolder: string) => {
    if (!base64 || !userId) return null;
    try {
      const data = new FormData();
      data.append("file", base64);
      data.append("upload_preset", "ml_default"); 
      data.append("folder", `kyc/user_${userId}/${subFolder}`); 
      const res = await fetch(`https://api.cloudinary.com/v1_1/dbzkqua3f/image/upload`, {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      return resData.secure_url || null;
    } catch (err) {
      return null;
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const [frontUrl, backUrl, faceUrl] = await Promise.all([
        uploadToCloudinary(formData.documentFront!, "documents"),
        uploadToCloudinary(formData.documentBack!, "documents"),
        uploadToCloudinary(capturedFace!, "faces")
      ]);

      if (!frontUrl || !backUrl || !faceUrl) throw new Error("Upload failed. Check connection.");

      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, documentFront: frontUrl, documentBack: backUrl, faceImage: faceUrl }),
      });

      if (res.ok) {
        setKycStatus("PENDING");
        setStep(4);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed.");
      }
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth; 
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        setCapturedFace(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 3 && !capturedFace) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(() => alert("Camera permission required."));
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [step, capturedFace]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFF9FA]">
      <Loader2 className="animate-spin text-pink-600 mb-4" size={50} />
      <h1 className="text-black font-black text-2xl tracking-tighter uppercase">User KYC</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-8 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* Progress Bar */}
        {step < 4 && (
          <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-around shadow-sm border border-pink-100">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${step >= s ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-black' : 'text-gray-400'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Identity' : 'Biometric'}
                </span>
                {s !== 3 && <ChevronRight size={14} className="text-gray-200" />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-2xl relative">
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <header className="mb-6 text-center">
                <h2 className="text-3xl font-black text-black">Verification Details</h2>
                <p className="text-gray-500 text-xs font-bold mt-1">Please enter your data exactly as on your ID card.</p>
              </header>

              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-black uppercase ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name" 
                    className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-black border-2 transition-all outline-none placeholder:text-gray-400 ${errors.fullName ? 'border-red-500' : 'border-transparent focus:border-pink-500 focus:bg-white'}`}
                    onChange={(e)=>{
                      setFormData({...formData, fullName: e.target.value.toUpperCase()});
                      if(errors.fullName) setErrors({...errors, fullName: undefined});
                    }} 
                    value={formData.fullName}
                  />
                  {errors.fullName && <p className="text-red-600 text-[10px] font-black uppercase ml-2 mt-1">{errors.fullName}</p>}
                </div>

                {/* Father Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-black uppercase ml-1">Father Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter father name" 
                    className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-black border-2 transition-all outline-none placeholder:text-gray-400 ${errors.fatherName ? 'border-red-500' : 'border-transparent focus:border-pink-500 focus:bg-white'}`}
                    onChange={(e)=>{
                      setFormData({...formData, fatherName: e.target.value.toUpperCase()});
                      if(errors.fatherName) setErrors({...errors, fatherName: undefined});
                    }} 
                    value={formData.fatherName}
                  />
                  {errors.fatherName && <p className="text-red-600 text-[10px] font-black uppercase ml-2 mt-1">{errors.fatherName}</p>}
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-black uppercase ml-1">CNIC Number</label>
                    <input 
                      type="text" 
                      value={formData.documentNumber} 
                      placeholder="42XXXXXXXXXXX" 
                      className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-black border-2 transition-all outline-none placeholder:text-gray-400 ${errors.documentNumber ? 'border-red-500' : 'border-transparent focus:border-pink-500 focus:bg-white'}`}
                      onChange={handleCNICChange} 
                    />
                    {errors.documentNumber && <p className="text-red-600 text-[10px] font-black uppercase ml-2 mt-1">{errors.documentNumber}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-black uppercase ml-1">ID Expiry Date</label>
                    <input 
                      type="text" 
                      value={formData.documentExpiry} 
                      placeholder="DD-MM-YYYY" 
                      className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-black border-2 transition-all outline-none placeholder:text-gray-400 ${errors.documentExpiry ? 'border-red-500' : 'border-transparent focus:border-pink-500 focus:bg-white'}`}
                      onChange={handleDateChange} 
                    />
                    {errors.documentExpiry && <p className="text-red-600 text-[10px] font-black uppercase ml-2 mt-1">{errors.documentExpiry}</p>}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleNextStep}
                className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all uppercase tracking-widest text-sm mt-4"
              >
                Continue Verification
              </button>
            </div>
          )}

          {/* Step 2: ID Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-black font-black text-xs uppercase hover:opacity-60"><ArrowLeft size={16} /> Back</button>
              <h2 className="text-2xl font-black text-black">Upload ID Documents</h2>
              <div className="grid grid-cols-1 gap-5">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-52 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-pink-500 transition-all">
                    {(formData as any)[side] ? (
                      <img src={(formData as any)[side]} className="w-full h-full object-cover" alt="ID" />
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-pink-50">
                          <ImageIcon className="text-pink-600" size={24} />
                        </div>
                        <span className="text-xs font-black text-black uppercase">{side.includes('Front') ? 'Front of CNIC' : 'Back of CNIC'}</span>
                        <p className="text-[10px] text-gray-400 mt-1 font-bold">CLICK TO UPLOAD PHOTO</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const reader = new FileReader();
                      reader.onload = () => setFormData({...formData, [side]: reader.result as string});
                      if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                ))}
              </div>
              <button 
                disabled={!formData.documentFront || !formData.documentBack}
                onClick={() => setStep(3)} 
                className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl disabled:opacity-20 uppercase tracking-widest text-sm"
              >
                Proceed to Biometric
              </button>
            </div>
          )}

          {/* Step 3: Face Capture */}
          {step === 3 && (
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter">Live Face Match</h2>
              <div className="relative w-64 h-64 mx-auto rounded-[3.5rem] border-8 border-pink-500 overflow-hidden bg-gray-900 shadow-2xl ring-8 ring-pink-50">
                {!capturedFace ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <img src={capturedFace} className="w-full h-full object-cover" alt="Selfie" />
                )}
              </div>
              {!capturedFace ? (
                <button onClick={capturePhoto} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                  <Camera size={20} /> Take Live Photo
                </button>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={handleFinalSubmit} 
                    disabled={isSubmitting} 
                    className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Final Submit"}
                  </button>
                  <button onClick={() => setCapturedFace(null)} className="text-black font-black text-xs uppercase border-b-2 border-black">Retake Image</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Step 4: Status Modal */}
          {step === 4 && kycStatus && (
            <KYCStatusModal 
              status={kycStatus} 
              rejectReason={rejectReason}
              onResubmit={() => { setStep(1); setKycStatus(null); setErrors({}); }}
              onClose={() => router.push("/")}
            />
          )}
        </div>

        {/* Security Info */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-black" />
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Secure Data Encryption</span>
          </div>
          <p className="max-w-[300px] text-center text-[9px] font-bold leading-relaxed uppercase opacity-50">
            Your identity information is protected by industry-standard encryption protocols.
          </p>
        </div>
      </div>
    </div>
  );
}