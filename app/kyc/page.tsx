"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ArrowLeft, ShieldCheck, 
  Lock, Camera, Loader2, User, CreditCard, 
  Calendar, Image as ImageIcon, ChevronRight
} from "lucide-react";

export default function ProfessionalKYC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "", 
    fatherName: "", 
    docType: "CNIC",
    docNum: "", 
    docExpiry: "", 
    documentFront: null as string | null,
    documentBack: null as string | null,
  });

  // ✅ Cloudinary Upload Helper
  const uploadToCloudinary = async (base64: string) => {
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: JSON.stringify({
          file: base64,
          upload_preset: "your_unsigned_preset", // 👈 Apna Unsigned Preset Name yahan likhein
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary Error: " + data.error?.message);
      return data.secure_url;
    } catch (err) {
      console.error("Upload failed:", err);
      return null;
    }
  };

  // ✅ KYC Status Check
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/kyc");
        if (res.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      } catch { setIsLoggedIn(false); }
      finally { setLoading(false); }
    }
    checkStatus();
  }, []);

  // ✅ Camera Stream Handling
  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    if (step === 3 && !capturedFace && isLoggedIn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamInstance = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => alert("Camera permission denied. Please enable camera."));
    }
    return () => streamInstance?.getTracks().forEach(t => t.stop());
  }, [step, capturedFace, isLoggedIn]);

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth; 
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0); 
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedFace(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  // ✅ Final Submission to Database
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload all images to Cloudinary first
      const frontUrl = await uploadToCloudinary(formData.documentFront!);
      const backUrl = await uploadToCloudinary(formData.documentBack!);
      const faceUrl = await uploadToCloudinary(capturedFace!);

      if (!frontUrl || !backUrl || !faceUrl) {
        throw new Error("Cloudinary upload failed. Check your preset or internet.");
      }

      // 2. Post URLs to our local API
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          documentType: formData.docType,
          documentNumber: formData.docNum,
          documentExpiry: formData.docExpiry,
          documentFront: frontUrl,
          documentBack: backUrl,
          faceImage: faceUrl,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStep(4);
      } else {
        throw new Error(result.error || "Server failed to save data.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FFF9FA]">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-10 px-4 md:px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Bar */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-pink-50 flex items-center justify-between">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 text-pink-300'}`}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`hidden md:block text-xs font-bold uppercase tracking-wider ${step >= s ? 'text-gray-900' : 'text-gray-300'}`}>
                   {s === 1 ? 'Personal' : s === 2 ? 'Documents' : 'Liveness'}
                </span>
                {s !== 3 && <ChevronRight size={14} className="text-gray-200 mx-2" />}
             </div>
           ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,182,193,0.15)] border border-pink-50 p-6 md:p-12 overflow-hidden relative">
          
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-left border-b border-pink-50 pb-6">
                <h2 className="text-3xl font-black text-gray-900">Identity Details</h2>
                <p className="text-gray-400 font-medium mt-1">Information must match your ID card.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Full Name</label>
                  <input type="text" placeholder="Enter full name" className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-gray-950 font-bold focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none transition-all" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2"><User size={14} /> Father's Name</label>
                  <input type="text" placeholder="Enter father name" className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-gray-950 font-bold focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none transition-all" onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Document Number</label>
                  <input type="text" placeholder="CNIC/Passport No" className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-gray-950 font-bold focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none transition-all" onChange={e => setFormData({...formData, docNum: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Expiry Date</label>
                  <input type="date" className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-gray-950 font-bold focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50 outline-none transition-all" onChange={e => setFormData({...formData, docExpiry: e.target.value})} />
                </div>
              </div>

              <button disabled={!formData.fullName || !formData.docNum} onClick={() => setStep(2)} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-40">
                Continue to Uploads
              </button>
            </div>
          )}

          {/* STEP 2: DOCUMENT UPLOAD */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-2">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase"><ArrowLeft size={16} /> Back</button>
              <h2 className="text-3xl font-black text-gray-900">Upload ID</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-60 border-2 border-dashed border-pink-100 rounded-[2rem] bg-pink-50/20 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-all overflow-hidden group">
                    {(formData as any)[side] ? (
                      <img src={(formData as any)[side]} className="w-full h-full object-cover" alt="Document" />
                    ) : (
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-pink-50 group-hover:scale-110 transition-transform">
                          <ImageIcon className="text-pink-500" size={28} />
                        </div>
                        <span className="text-[11px] font-black text-pink-600 uppercase tracking-tighter">Upload {side.includes('Front') ? 'Front' : 'Back'}</span>
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

              <button disabled={!formData.documentFront || !formData.documentBack} onClick={() => setStep(3)} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all">
                Liveness Verification
              </button>
            </div>
          )}

          {/* STEP 3: LIVENESS */}
          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in-95">
              <h2 className="text-3xl font-black text-gray-900">Face Verification</h2>
              
              <div className="relative w-64 h-64 mx-auto rounded-[3rem] p-1.5 bg-gradient-to-tr from-pink-500 to-pink-100 shadow-2xl overflow-hidden">
                <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-white relative">
                  {!capturedFace ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <img src={capturedFace} className="w-full h-full object-cover" alt="Selfie" />
                  )}
                  {!capturedFace && <div className="absolute inset-x-0 h-1 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,1)] animate-[bounce_2s_infinite] top-1/2"></div>}
                </div>
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                {!capturedFace ? (
                  <button onClick={capturePhoto} className="w-full flex items-center justify-center gap-3 bg-gray-950 text-white py-5 rounded-2xl font-black hover:scale-105 transition-all">
                    <Camera size={20} /> Take Selfie
                  </button>
                ) : (
                  <>
                    <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all disabled:opacity-50">
                      {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Documents"}
                    </button>
                    <button onClick={() => setCapturedFace(null)} className="text-pink-500 font-black text-[11px] uppercase tracking-widest hover:underline">Retake</button>
                  </>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-4xl font-black text-gray-900">Submitted!</h2>
              <p className="text-gray-500 mt-4 leading-relaxed max-w-sm mx-auto font-medium">
                Humari team verify kar rahi hai. **2 to 24 hours** mein results dashboard par mil jayenge.
              </p>
              <Link href="/dashboard" className="inline-block mt-10 bg-gray-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-black transition-all">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-center gap-10 opacity-60">
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
              <Lock size={12} className="text-pink-400" /> AES-256 Secure
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
              <ShieldCheck size={12} className="text-pink-400" /> ISO Certified
           </div>
        </div>

      </div>
    </div>
  );
}