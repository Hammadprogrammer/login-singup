"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ChevronRight, 
  UploadCloud, 
  ArrowLeft, 
  ShieldCheck, 
  Info,
  Lock,
  UserCheck
} from "lucide-react";

const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo user: Real app mein ye aapke auth provider se aayega
    setUser({ id: 'user_2t8O8pSshm68vWd6zPqYxG' });
    setLoading(false);
  }, []);

  return { user, loading };
};

export default function ProfessionalKYC() {
  const { user, loading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form Data (Exactly matches your API logic)
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    docType: "CNIC",
    docNum: "",
    docExpiry: "",
    documentFront: null as string | null, // Base64 strings
    documentBack: null as string | null,
  });

  useEffect(() => {
    if (step === 3) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => alert("Camera access required for face verification"));
    }
  }, [step]);

  // Image to Base64 Converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'documentFront' | 'documentBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    // 1. Capture Face Image from Canvas
    let faceImageBase64 = "";
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      faceImageBase64 = canvas.toDataURL("image/jpeg");
    }

    // 2. Prepare Payload (Matches your API structure)
    const payload = {
      userId: user.id,
      fullName: formData.fullName,
      fatherName: formData.fatherName,
      docType: formData.docType,
      docNum: formData.docNum,
      docExpiry: formData.docExpiry,
      documentFront: formData.documentFront,
      documentBack: formData.documentBack,
      faceImage: faceImageBase64,
    };

    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setStep(4); // Success Step
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 font-bold animate-pulse">Authenticating Session...</div>;

  const inputClass = "w-full px-4 py-4 bg-pink-50/30 border border-pink-100 rounded-2xl outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all text-slate-800 shadow-sm";
  const labelClass = "block text-xs font-black text-pink-900/40 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col md:flex-row">
      
      {/* SIDEBAR (Desktop) */}
      <div className="w-full md:w-[400px] bg-pink-950 p-10 flex flex-col justify-between text-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-900/50">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter">PINK<span className="text-pink-400">KYC</span></span>
          </div>

          <div className="space-y-10">
            {[
              { id: 1, label: "Basic Info" },
              { id: 2, label: "ID Documents" },
              { id: 3, label: "Face Scan" },
              { id: 4, label: "Complete" }
            ].map((s) => (
              <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step === s.id ? 'translate-x-3' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= s.id ? 'bg-pink-500' : 'bg-pink-900'}`}>
                  {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                </div>
                <span className="font-bold tracking-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-pink-900/40 rounded-[2rem] border border-pink-800 text-[11px] text-pink-300 leading-relaxed">
          <Lock size={16} className="mb-2 text-pink-500" />
          Your data is encrypted and sent directly to our secure Cloudinary and Prisma vault.
        </div>
      </div>

      {/* FORM CONTENT */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl bg-white shadow-[0_32px_64px_-15px_rgba(219,39,119,0.1)] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
          
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(step - 1)} className="mb-8 flex items-center gap-2 text-pink-400 hover:text-pink-600 font-bold text-sm transition-all">
              <ArrowLeft size={18} /> Back
            </button>
          )}

          {/* STEP 1: PERSONAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
              <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Personal Details</h1>
                <p className="text-slate-400 mt-2 font-medium">Start your verification with your legal name.</p>
              </header>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Full Legal Name</label>
                  <input placeholder="John Doe" className={inputClass} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Father's Name</label>
                  <input placeholder="Robert Doe" className={inputClass} value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                </div>
                <button onClick={handleNext} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl shadow-pink-200 transition-all hover:-translate-y-1 active:scale-95">
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
              <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">ID Documents</h1>
                <p className="text-slate-400 mt-2">Upload high-quality images of your ID.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Document Type</label>
                  <select className={inputClass} value={formData.docType} onChange={e => setFormData({...formData, docType: e.target.value})}>
                    <option value="CNIC">CNIC (National ID)</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>ID Number</label>
                  <input placeholder="12345-6789012-3" className={inputClass} value={formData.docNum} onChange={e => setFormData({...formData, docNum: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input type="date" className={inputClass} value={formData.docExpiry} onChange={e => setFormData({...formData, docExpiry: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Front Upload */}
                <label className="group relative h-44 border-2 border-dashed border-pink-100 rounded-[2.5rem] bg-pink-50/20 hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center">
                  {formData.documentFront ? (
                    <img src={formData.documentFront} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="mx-auto text-pink-200 mb-1" size={28} />
                      <span className="text-[10px] font-black text-pink-400 uppercase">Front Side</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'documentFront')} />
                </label>
                {/* Back Upload */}
                <label className="group relative h-44 border-2 border-dashed border-pink-100 rounded-[2.5rem] bg-pink-50/20 hover:bg-pink-50 hover:border-pink-300 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center">
                  {formData.documentBack ? (
                    <img src={formData.documentBack} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <UploadCloud className="mx-auto text-pink-200 mb-1" size={28} />
                      <span className="text-[10px] font-black text-pink-400 uppercase">Back Side</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'documentBack')} />
                </label>
              </div>

              <button onClick={handleNext} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-3xl transition-all shadow-xl shadow-pink-100">
                Next: Face Check
              </button>
            </div>
          )}

          {/* STEP 3: LIVENESS */}
          {step === 3 && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
              <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Face Scan</h1>
                <p className="text-slate-400 mt-2 font-medium">Verify your live presence.</p>
              </header>
              <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto rounded-[3.5rem] border-[12px] border-pink-50 p-2 shadow-2xl shadow-pink-100 overflow-hidden bg-pink-50">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="bg-pink-50 p-5 rounded-3xl text-left border border-pink-100 flex gap-3">
                <Info className="text-pink-500 shrink-0" size={20} />
                <p className="text-xs text-pink-900/60 font-medium leading-relaxed">Ensure you are in a bright room. Do not wear sunglasses, hats or masks during the scan.</p>
              </div>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white font-bold py-5 rounded-3xl shadow-xl shadow-pink-200 transition-all"
              >
                {isSubmitting ? "Uploading to Secure Vault..." : "Submit Verification"}
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-12 space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="w-32 h-32 bg-pink-500 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-pink-200 rotate-3">
                <UserCheck size={60} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Data Saved!</h1>
                <p className="text-slate-400 mt-4 max-w-sm mx-auto font-medium">Your identity documents have been successfully sent to the admin panel via Cloudinary.</p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-12 py-5 rounded-3xl hover:bg-black transition-all">
                Finish <ChevronRight size={20} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}