"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, ArrowLeft, Camera, Loader2, Image as ImageIcon, ChevronRight 
} from "lucide-react";
import KYCStatusModal from "./user-kyc-popup/user-popup";

export default function ProfessionalKYC() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  
  const [kycStatus, setKycStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [formData, setFormData] = useState({
    fullName: "", 
    fatherName: "", 
    documentType: "CNIC",
    documentNumber: "", 
    documentExpiry: "", 
    documentFront: null as string | null,
    documentBack: null as string | null,
  });

  useEffect(() => {
    fetch("/api/kyc")
      .then(res => res.json())
      .then(data => {
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 13);
    setFormData({ ...formData, documentNumber: val });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = val;
    if (val.length > 2 && val.length <= 4) {
      formatted = `${val.slice(0, 2)}-${val.slice(2)}`;
    } else if (val.length > 4) {
      formatted = `${val.slice(0, 2)}-${val.slice(2, 4)}-${val.slice(4)}`;
    }
    setFormData({ ...formData, documentExpiry: formatted });
  };

  const uploadToCloudinary = async (base64: string, subFolder: "documents" | "faces") => {
    if (!base64 || base64 === "data:,") return null;
    try {
      const cloudName = "dbzkqua3f"; 
      const uploadPreset = "ml_default"; 
      const data = new FormData();
      data.append("file", base64);
      data.append("upload_preset", uploadPreset);
      data.append("folder", `kyc/user_${userId}/${subFolder}`); 
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      return resData.secure_url || null;
    } catch (err) { return null; }
  };

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
    if (!userId) return alert("User ID not found.");
    setIsSubmitting(true);
    try {
      const [frontUrl, backUrl, faceUrl] = await Promise.all([
        uploadToCloudinary(formData.documentFront!, "documents"),
        uploadToCloudinary(formData.documentBack!, "documents"),
        uploadToCloudinary(capturedFace!, "faces")
      ]);
      if (!frontUrl || !backUrl || !faceUrl) throw new Error("Upload failed.");
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, documentFront: frontUrl, documentBack: backUrl, faceImage: faceUrl }),
      });
      if (res.ok) {
        setKycStatus("PENDING");
        setStep(4);
      } else throw new Error("Database error.");
    } catch (err: any) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#FFF9FA]"><Loader2 className="animate-spin text-pink-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-6 px-4 md:py-10 font-sans text-black">
      <div className="max-w-xl mx-auto">
        
        {/* Progress Stepper - Mobile Optimized */}
        {step < 4 && (
          <div className="bg-white rounded-xl p-3 mb-6 border border-pink-100 flex items-center justify-around shadow-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-pink-600 text-white shadow-md' : 'bg-pink-50 text-pink-300'}`}>
                  {step > s ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-black' : 'text-gray-300'}`}>
                  {s === 1 ? 'Info' : s === 2 ? 'ID' : 'Face'}
                </span>
                {s !== 3 && <ChevronRight size={12} className="text-pink-100" />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-pink-50 p-6 md:p-10 shadow-xl shadow-pink-200/10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <header>
                <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Personal Information</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">Enter details exactly as on your CNIC.</p>
              </header>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase ml-1">Full Name</label>
                    <input 
                      type="text" placeholder="ALI KHAN" 
                      className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 transition-all outline-none text-black text-sm" 
                      onChange={(e)=>setFormData({...formData, fullName: e.target.value.toUpperCase()})} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase ml-1">Father Name</label>
                    <input 
                      type="text" placeholder="ASLAM KHAN" 
                      className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 transition-all outline-none text-black text-sm" 
                      onChange={(e)=>setFormData({...formData, fatherName: e.target.value.toUpperCase()})} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase ml-1">CNIC Number</label>
                    <input 
                      type="text" value={formData.documentNumber} placeholder="42XXXXXXXXXXX" 
                      className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 transition-all outline-none text-black tracking-widest text-sm" 
                      onChange={handleCNICChange} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-black uppercase ml-1">Expiry Date</label>
                    <input 
                      type="text" value={formData.documentExpiry} placeholder="DD-MM-YYYY" 
                      className="w-full p-4 bg-gray-50 rounded-xl font-bold border-2 border-transparent focus:border-pink-500 transition-all outline-none text-black text-sm" 
                      onChange={handleDateChange} 
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={formData.documentNumber.length !== 13 || formData.documentExpiry.length !== 10 || !formData.fullName} 
                onClick={() => setStep(2)} 
                className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition-all disabled:opacity-30 uppercase tracking-widest text-xs"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-black font-bold text-xs uppercase opacity-60 hover:opacity-100 transition-all">
                <ArrowLeft size={14} /> Back
              </button>
              <header>
                <h2 className="text-2xl md:text-3xl font-bold text-black">Upload ID</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">Upload clear photos of both sides.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {['documentFront', 'documentBack'].map((side) => (
                  <label key={side} className="relative h-44 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-pink-500 transition-all">
                    {(formData as any)[side] ? (
                      <img src={(formData as any)[side]} className="w-full h-full object-cover" alt="ID" />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm mb-2 text-pink-600">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-black uppercase tracking-widest">Upload {side.includes('Front') ? 'Front' : 'Back'}</span>
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
              <button disabled={!formData.documentFront || !formData.documentBack} onClick={() => setStep(3)} className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all hover:bg-pink-700">
                Next: Face Verify
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
              <header>
                <h2 className="text-2xl md:text-3xl font-bold text-black">Selfie Verification</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">Keep your face in the center of the frame.</p>
              </header>
              
              <div className="relative w-56 h-56 mx-auto rounded-full p-1 border-4 border-pink-500 shadow-2xl overflow-hidden bg-gray-50">
                {!capturedFace ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full rounded-full object-cover scale-x-[-1]" />
                ) : (
                  <img src={capturedFace} className="w-full h-full rounded-full object-cover" alt="Selfie" />
                )}
              </div>

              {!capturedFace ? (
                <button onClick={capturePhoto} className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold shadow-xl hover:bg-gray-900 transition-all uppercase tracking-widest text-xs">
                  <Camera size={18} /> Capture Photo
                </button>
              ) : (
                <div className="space-y-3">
                  <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs transition-all hover:bg-pink-700">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Submit Application"}
                  </button>
                  <button onClick={() => setCapturedFace(null)} className="text-black font-bold text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100">Retake Photo</button>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {step === 4 && kycStatus && (
            <KYCStatusModal 
              status={kycStatus} 
              rejectReason={rejectReason}
              onResubmit={() => { setStep(1); setKycStatus(null); }}
              onClose={() => router.push("/")}
            />
          )}
        </div>
      </div>
    </div>
  );
}