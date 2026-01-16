"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, UploadCloud, ArrowLeft, ShieldCheck, 
  Lock, Camera, Loader2, Clock, LogIn, Sparkles, 
  User, CreditCard, Calendar, Image as ImageIcon
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

  // Cloudinary Upload Helper
  const uploadToCloudinary = async (base64: string) => {
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: JSON.stringify({
          file: base64,
          upload_preset: "your_preset_name", // Apna preset yahan likhein
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err);
      return null;
    }
  };

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

  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    if (step === 3 && !capturedFace && isLoggedIn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamInstance = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => alert("Camera access denied"));
    }
    return () => streamInstance?.getTracks().forEach(t => t.stop());
  }, [step, capturedFace, isLoggedIn]);

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedFace(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Upload All Images to Cloudinary
      const frontUrl = await uploadToCloudinary(formData.documentFront!);
      const backUrl = await uploadToCloudinary(formData.documentBack!);
      const faceUrl = await uploadToCloudinary(capturedFace!);

      if (!frontUrl || !backUrl || !faceUrl) throw new Error("Image upload failed");

      // 2. Submit Data to API
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          documentType: formData.docType,
          documentNumber: formData.docNum,
          documentExpiry: formData.docExpiry ? new Date(formData.docExpiry) : null,
          documentFront: frontUrl,
          documentBack: backUrl,
          faceImage: faceUrl,
        }),
      });

      if (res.ok) setStep(4);
      else alert("Submission failed.");
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-pink-500" size={40} />
    </div>
  );

  if (!isLoggedIn) return (
    <div className="h-screen flex items-center justify-center bg-[#FFF5F7] p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="text-pink-600" size={30} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Please Sign In</h2>
        <p className="text-gray-500 mt-2 mb-8">Account verify karne ke liye login zaroori hai.</p>
        <Link href="/login" className="block w-full bg-pink-600 text-white font-bold py-4 rounded-xl hover:bg-pink-700 transition-all">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8F9] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
            <ShieldCheck className="text-pink-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Identity<span className="text-pink-600">Verification</span>
          </h1>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= s ? 'bg-pink-600 text-white' : 'bg-white text-gray-400'}`}>
                {step > s ? <CheckCircle2 size={18} /> : s}
              </div>
              {s !== 3 && <div className={`w-12 h-1 rounded-full mx-2 ${step > s ? 'bg-pink-600' : 'bg-pink-100'}`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-pink-100/50 border border-white p-8 md:p-12 transition-all">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                <p className="text-gray-400 text-sm mt-1">Apne official documents ke mutabiq details bharein.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                    <User size={14} className="text-pink-500" /> Full Name
                  </label>
                  <input 
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-50 focus:border-pink-400 outline-none transition-all"
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                    <User size={14} className="text-pink-500" /> Father's Name
                  </label>
                  <input 
                    type="text"
                    placeholder="Father Name"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-50 focus:border-pink-400 outline-none transition-all"
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                    <CreditCard size={14} className="text-pink-500" /> Document Number
                  </label>
                  <input 
                    type="text"
                    placeholder="42101-XXXXXXX-X"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-50 focus:border-pink-400 outline-none transition-all"
                    onChange={e => setFormData({...formData, docNum: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-pink-500" /> Expiry Date
                  </label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-pink-50 focus:border-pink-400 outline-none transition-all"
                    onChange={e => setFormData({...formData, docExpiry: e.target.value})}
                  />
                </div>
              </div>

              <button 
                disabled={!formData.fullName || !formData.docNum}
                onClick={() => setStep(2)}
                className="w-full bg-pink-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all disabled:opacity-50"
              >
                Next Step: Upload Documents
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-pink-600 font-bold text-xs uppercase transition-colors">
                <ArrowLeft size={16} /> Previous
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Document Photos</h2>
                <p className="text-gray-400 text-sm mt-1">CNIC/Passport ki saaf tasaveer upload karein.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-56 border-2 border-dashed border-pink-100 rounded-3xl bg-pink-50/30 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50 transition-all overflow-hidden">
                    {(formData as any)[side] ? (
                      <img src={(formData as any)[side]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                          <ImageIcon className="text-pink-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-pink-600 uppercase">{side.replace('document', '')} Side</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const reader = new FileReader();
                      reader.onload = () => setFormData({...formData, [side]: reader.result as string});
                      reader.readAsDataURL(e.target.files![0]);
                    }} />
                  </label>
                ))}
              </div>

              <button 
                disabled={!formData.documentFront || !formData.documentBack}
                onClick={() => setStep(3)}
                className="w-full bg-pink-600 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-pink-700 transition-all"
              >
                Continue to Face Scan
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in-95">
              <h2 className="text-2xl font-bold text-gray-800">Liveness Check</h2>
              
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-pink-100 border-t-pink-500 animate-spin"></div>
                <div className="w-full h-full rounded-full overflow-hidden border-8 border-white shadow-xl bg-gray-100">
                  {!capturedFace ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <img src={capturedFace} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>

              {!capturedFace ? (
                <button onClick={capturePhoto} className="flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold mx-auto hover:bg-black transition-all">
                  <Camera size={20} /> Take a Selfie
                </button>
              ) : (
                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  <button 
                    onClick={handleFinalSubmit} 
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit All Details"}
                  </button>
                  <button onClick={() => setCapturedFace(null)} className="text-pink-600 font-bold text-sm uppercase">Retake</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} className="animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Under Review</h2>
              <p className="text-gray-500 mt-4 leading-relaxed max-w-sm mx-auto">
                Shukriya! Aapka KYC process ho raha hai. Hum <b>2-24 ghanton</b> mein review mukammal kar lenge.
              </p>
              <Link href="/dashboard" className="inline-block mt-10 bg-gray-900 text-white px-10 py-4 rounded-xl font-bold">Go to Dashboard</Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-center gap-8 opacity-40">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <Lock size={14} /> Encrypted
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <ShieldCheck size={14} /> Verified Secure
          </div>
        </div>

      </div>
    </div>
  );
}