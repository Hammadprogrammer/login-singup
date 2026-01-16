"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ArrowLeft, Camera, Loader2, Image as ImageIcon, ChevronRight 
} from "lucide-react";

export default function ProfessionalKYC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "", 
    fatherName: "", 
    documentType: "CNIC",
    documentNumber: "", 
    documentExpiry: "", 
    documentFront: null as string | null,
    documentBack: null as string | null,
  });

  // Check Auth & Get UserID for folder structure
  useEffect(() => {
    fetch("/api/kyc")
      .then(res => res.json())
      .then(data => {
        if (data.userId) setUserId(data.userId);
        setLoading(false);
      });
  }, []);

  // ✅ Updated Cloudinary Upload with Specific Folders
  const uploadToCloudinary = async (base64: string, subFolder: "documents" | "faces") => {
    if (!base64 || base64 === "data:,") return null;
    try {
      const cloudName = "dbzkqua3f"; 
      const uploadPreset = "ml_default"; 
      // Aapke screenshot ke mutabiq path: kyc/user_id/subFolder
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
    } catch (err) {
      console.error("Upload Error:", err);
      return null;
    }
  };

  // Camera Logic
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
    if (!userId) return alert("User ID not found. Please refresh.");
    setIsSubmitting(true);
    try {
      // 1. Upload in Parallel to correct folders
      const [frontUrl, backUrl, faceUrl] = await Promise.all([
        uploadToCloudinary(formData.documentFront!, "documents"),
        uploadToCloudinary(formData.documentBack!, "documents"),
        uploadToCloudinary(capturedFace!, "faces")
      ]);

      if (!frontUrl || !backUrl || !faceUrl) {
        throw new Error("Upload failed. Check Cloudinary settings.");
      }

      // 2. Save to DB
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          documentFront: frontUrl,
          documentBack: backUrl,
          faceImage: faceUrl,
        }),
      });

      if (res.ok) setStep(4);
      else throw new Error("Database saving failed.");

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pink-500" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Bar */}
        <div className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-pink-50 flex items-center justify-between">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-pink-50 text-pink-300'}`}>
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span className={`hidden md:block text-[10px] font-black uppercase tracking-wider ${step >= s ? 'text-gray-900' : 'text-gray-300'}`}>
                   {s === 1 ? 'Details' : s === 2 ? 'Documents' : 'Selfie'}
                </span>
                {s !== 3 && <ChevronRight size={14} className="text-gray-200" />}
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-pink-50 p-8 md:p-12 transition-all">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-gray-900">Identity Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" className="p-4 bg-gray-50 rounded-2xl font-bold border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                <input type="text" placeholder="Father Name" className="p-4 bg-gray-50 rounded-2xl font-bold border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                <input type="text" placeholder="ID Number" className="p-4 bg-gray-50 rounded-2xl font-bold border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" onChange={e => setFormData({...formData, documentNumber: e.target.value})} />
                <input type="date" className="p-4 bg-gray-50 rounded-2xl font-bold border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-500 outline-none" onChange={e => setFormData({...formData, documentExpiry: e.target.value})} />
              </div>
              <button disabled={!formData.fullName} onClick={() => setStep(2)} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-pink-500 font-bold text-xs uppercase"><ArrowLeft size={16} /> Back</button>
              <h2 className="text-3xl font-black text-gray-900">Upload ID Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-48 border-2 border-dashed border-pink-100 rounded-[2rem] bg-pink-50/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-pink-50 transition-colors">
                    {(formData as any)[side] ? (
                      <img src={(formData as any)[side]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="text-pink-500 mx-auto mb-2" size={24} />
                        <span className="text-[10px] font-black text-pink-600 uppercase">Upload {side.includes('Front') ? 'Front' : 'Back'}</span>
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
              <button disabled={!formData.documentFront || !formData.documentBack} onClick={() => setStep(3)} className="w-full bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all">Next: Face Verify</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-8 animate-in slide-in-from-right duration-500">
              <h2 className="text-3xl font-black text-gray-900">Live Selfie</h2>
              <div className="relative w-64 h-64 mx-auto rounded-[3.5rem] p-1.5 bg-gradient-to-tr from-pink-500 to-pink-200 shadow-2xl overflow-hidden">
                <div className="w-full h-full rounded-[3.3rem] overflow-hidden bg-white">
                  {!capturedFace ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <img src={capturedFace} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              {!capturedFace ? (
                <button onClick={capturePhoto} className="w-full flex items-center justify-center gap-3 bg-gray-950 text-white py-5 rounded-2xl font-black">
                  <Camera size={20} /> Take Selfie
                </button>
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

          {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in duration-500">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-gray-900">KYC Submitted!</h2>
              <p className="text-gray-500 mt-4 font-medium">Aapka account review ke baad activate ho jayega.</p>
              <Link href="/dashboard" className="inline-block mt-10 bg-gray-900 text-white px-12 py-5 rounded-2xl font-black shadow-lg">Back to Dashboard</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}