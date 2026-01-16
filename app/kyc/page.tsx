"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ArrowLeft, Camera, Loader2, Image as ImageIcon, ChevronRight, AlertCircle
} from "lucide-react";

export default function ProfessionalKYC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "", 
    fatherName: "", 
    documentType: "CNIC",
    documentNumber: "", 
    documentExpiry: "", 
    documentFront: null as string | null,
    documentBack: null as string | null,
  });

  // ✅ Validations
  const isCnicValid = /^\d{13}$/.test(formData.documentNumber);
  const isDateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(formData.documentExpiry);
  const isStep1Valid = formData.fullName.length > 2 && formData.fatherName.length > 2 && isCnicValid && isDateValid;
  const isStep2Valid = formData.documentFront && formData.documentBack;

  useEffect(() => {
    fetch("/api/kyc")
      .then(res => res.json())
      .then(data => {
        if (data.userId) setUserId(data.userId);
        else setShowAuthPopup(true);
        setLoading(false);
      })
      .catch(() => {
        setShowAuthPopup(true);
        setLoading(false);
      });
  }, []);

  // ✅ Only Numbers for CNIC
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 13) setFormData({ ...formData, documentNumber: value });
  };

  // ✅ Custom Date Input (Only Numbers + Auto Slash)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-numeric
    if (value.length > 8) value = value.slice(0, 8); // Max 8 digits (DDMMYYYY)

    // Format as DD/MM/YYYY
    let formatted = value;
    if (value.length > 2 && value.length <= 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else if (value.length > 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    }
    
    setFormData({ ...formData, documentExpiry: formatted });
  };

  const uploadToCloudinary = async (base64: string, subFolder: "documents" | "faces") => {
    if (!base64 || base64 === "data:,") return null;
    try {
      const cloudName = "dbzkqua3f"; 
      const uploadPreset = "ml_default"; 
      const folderPath = `kyc/user_${userId}/${subFolder}`;
      const data = new FormData();
      data.append("file", base64);
      data.append("upload_preset", uploadPreset);
      data.append("folder", folderPath); 

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      return resData.secure_url || null;
    } catch (err) { return null; }
  };

  // Camera logic (Same as before)
  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    if (step === 3 && !capturedFace) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamInstance = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => alert("Camera permission required."));
    }
    return () => streamInstance?.getTracks().forEach(t => t.stop());
  }, [step, capturedFace]);

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
        setCapturedFace(canvas.toDataURL("image/jpeg", 0.7));
      }
    }
  };

  const handleFinalSubmit = async () => {
    if (!userId) return setShowAuthPopup(true);
    setIsSubmitting(true);
    try {
      const [frontUrl, backUrl, faceUrl] = await Promise.all([
        uploadToCloudinary(formData.documentFront!, "documents"),
        uploadToCloudinary(formData.documentBack!, "documents"),
        uploadToCloudinary(capturedFace!, "faces")
      ]);
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, documentFront: frontUrl, documentBack: backUrl, faceImage: faceUrl }),
      });
      if (res.ok) setShowSuccessPopup(true);
      else throw new Error();
    } catch (err) { alert("Submission error."); } 
    finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-pink-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-10 px-4 font-sans relative">
      
      {/* Auth Popup */}
      {showAuthPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Login Required</h3>
            <Link href="/login" className="block w-full bg-pink-600 text-white font-black py-4 rounded-xl mt-4 shadow-lg">Go to Login</Link>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl">
            <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
         <h2 className="text-3xl font-black text-gray-900 mb-2">
            Verification Submitted Successfully!
          </h2>
          <p className="text-gray-500 mb-8">
            Your KYC documents have been submitted and are under review. 
            Your application will be approved within 24 hours.
          </p>
         <Link href="/" className="inline-flex items-center justify-center px-8 py-3 text-white font-semibold bg-gray-900 rounded-xl hover:bg-gray-800 transition duration-300 shadow-lg hover:shadow-xl">
            OK
          </Link>
       </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-pink-50 flex items-center justify-between">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-pink-600 text-white shadow-lg' : 'bg-pink-50 text-pink-300'}`}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`hidden md:block text-[10px] font-black uppercase tracking-wider ${step >= s ? 'text-gray-900' : 'text-gray-300'}`}>
                   {s === 1 ? 'Details' : s === 2 ? 'Documents' : 'Selfie'}
                </span>
                {s !== 3 && <ChevronRight size={14} className="text-gray-200" />}
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-gray-900">Identity Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                
                <input type="text" placeholder="Father Name" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 placeholder-gray-400 ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" 
                  value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                
                <div className="relative">
                    <input type="text" placeholder="CNIC (13 Digits)" className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 placeholder-gray-400 ring-1 outline-none transition-all ${formData.documentNumber && !isCnicValid ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-pink-500'}`} 
                    value={formData.documentNumber} onChange={handleCnicChange} />
                    <span className="absolute right-4 top-4 text-[10px] text-gray-400">{formData.documentNumber.length}/13</span>
                </div>

                <div className="relative">
                    <input type="text" placeholder="Expiry (DD/MM/YYYY)" className={`w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-800 placeholder-gray-400 ring-1 outline-none transition-all ${formData.documentExpiry && !isDateValid ? 'ring-red-400 focus:ring-red-500' : 'ring-gray-100 focus:ring-pink-500'}`} 
                    value={formData.documentExpiry} onChange={handleDateChange} maxLength={10} />
                </div>
              </div>
              <button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase hover:translate-x-[-4px] transition-transform"><ArrowLeft size={16} /> Back to Details</button>
              <h2 className="text-3xl font-black text-gray-900">Upload ID Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-48 border-2 border-dashed border-pink-100 rounded-[2rem] bg-pink-50/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-pink-50 transition-colors">
                    {(formData as any)[side] ? <img src={(formData as any)[side]} className="w-full h-full object-cover" alt="ID" /> : 
                      <div className="text-center">
                        <ImageIcon className="text-pink-500 mx-auto mb-2" size={24} />
                        <span className="text-[10px] font-black text-pink-600 uppercase">Upload {side.includes('Front') ? 'Front' : 'Back'}</span>
                      </div>
                    }
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                      const reader = new FileReader();
                      reader.onload = () => setFormData({...formData, [side]: reader.result as string});
                      if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                ))}
              </div>
              <button disabled={!isStep2Valid} onClick={() => setStep(3)} className="w-full bg-pink-600 disabled:bg-gray-200 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all">Next: Face Verify</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 animate-in slide-in-from-right duration-500">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase float-left"><ArrowLeft size={16} /> Back to Docs</button>
              <div className="clear-both"></div>
              <h2 className="text-3xl font-black text-gray-900">Live Selfie</h2>
              <div className="relative w-64 h-64 mx-auto rounded-[3.5rem] p-1.5 bg-gradient-to-tr from-pink-500 to-pink-200 shadow-2xl overflow-hidden">
                <div className="w-full h-full rounded-[3.3rem] overflow-hidden bg-white">
                  {!capturedFace ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> : <img src={capturedFace} className="w-full h-full object-cover" alt="Selfie" />}
                </div>
              </div>
              {!capturedFace ? (
                <button onClick={capturePhoto} className="w-full bg-gray-950 text-white py-5 rounded-2xl font-black shadow-xl">Take Selfie</button>
              ) : (
                <div className="space-y-4">
                  <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Submit Application"}
                  </button>
                  <button onClick={() => setCapturedFace(null)} className="text-pink-500 font-black text-[10px] uppercase tracking-widest hover:underline">Retake Selfie</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}