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
  UserCheck,
  Camera,
  Loader2,
  Clock
} from "lucide-react";

// Demo Auth Hook
const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Start Camera safely
  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    if (step === 3 && !capturedFace) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          streamInstance = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera Error:", err);
          alert("Please allow camera access for face verification.");
        });
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
    };
  }, [step, capturedFace]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'documentFront' | 'documentBack') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // Mirror effect for natural selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedFace(dataUrl);
        
        // Stop Camera Stream safely
        const stream = video.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !capturedFace) return;
    setIsSubmitting(true);

    const payload = {
      userId: user.id,
      ...formData,
      faceImage: capturedFace,
    };

    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStep(4);
      } else {
        const result = await res.json();
        alert(result.error || "Submission failed. Please check all fields.");
      }
    } catch (error) {
      alert("Server connection error. Check your internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-pink-500 font-bold animate-pulse">Authenticating...</div>;

  const inputClass = "w-full px-4 py-4 bg-pink-50/30 border border-pink-100 rounded-2xl outline-none focus:bg-white focus:border-pink-500 transition-all text-slate-800 shadow-sm placeholder:text-slate-300";
  const labelClass = "block text-[10px] font-black text-pink-900/40 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-[380px] bg-pink-950 p-8 md:p-12 flex flex-col justify-between text-white shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg"><ShieldCheck size={22} /></div>
            <span className="text-xl font-black tracking-tighter uppercase">Pink<span className="text-pink-400">Auth</span></span>
          </div>

          <div className="space-y-8">
            {[
              { n: 1, t: "Basic Info" },
              { n: 2, t: "ID Documents" },
              { n: 3, t: "Face Scan" },
              { n: 4, t: "Verification" }
            ].map((s) => (
              <div key={s.n} className={`flex items-center gap-4 transition-all ${step >= s.n ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step > s.n ? 'bg-green-500' : step === s.n ? 'bg-pink-500' : 'bg-pink-900'}`}>
                  {step > s.n ? <CheckCircle2 size={16} /> : s.n}
                </div>
                <span className={`font-bold text-sm ${step === s.n ? 'text-pink-400' : 'text-white'}`}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 p-5 bg-pink-900/30 rounded-2xl border border-pink-800/50">
           <Lock size={16} className="text-pink-500 mb-2" />
           <p className="text-[11px] text-pink-200/70 leading-relaxed">All data is processed through secure 256-bit encryption and stored in our protected database.</p>
        </div>
      </div>

      {/* MAIN FORM */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-xl bg-white shadow-2xl shadow-pink-200/50 rounded-[2.5rem] p-6 md:p-12 transition-all">
          
          {step < 4 && step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-slate-400 hover:text-pink-600 font-bold text-xs mb-6 uppercase tracking-wider">
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Details</h1>
                <p className="text-slate-400 text-sm mt-1">Please enter your legal name as per ID.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input placeholder="Enter full name" className={inputClass} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Father's Name</label>
                  <input placeholder="Enter father's name" className={inputClass} value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                </div>
                <button 
                  disabled={!formData.fullName || !formData.fatherName}
                  onClick={() => setStep(2)} 
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-pink-200"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">ID Upload</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className={labelClass}>ID Type</label>
                   <select className={inputClass} value={formData.docType} onChange={e => setFormData({...formData, docType: e.target.value})}>
                      <option value="CNIC">CNIC (Pakistan)</option>
                      <option value="PASSPORT">Passport</option>
                   </select>
                </div>
                <div>
                   <label className={labelClass}>ID Number</label>
                   <input placeholder="00000-0000000-0" className={inputClass} onChange={e => setFormData({...formData, docNum: e.target.value})} />
                </div>
                <div>
                   <label className={labelClass}>Expiry Date</label>
                   <input type="date" className={inputClass} onChange={e => setFormData({...formData, docExpiry: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="h-40 border-2 border-dashed border-pink-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-pink-50/20 hover:bg-pink-50 overflow-hidden relative">
                  {formData.documentFront ? <img src={formData.documentFront} className="w-full h-full object-cover" /> : <div className="text-center"><UploadCloud className="mx-auto text-pink-300" /><span className="text-[10px] font-bold text-pink-400">FRONT</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'documentFront')} />
                </label>
                <label className="h-40 border-2 border-dashed border-pink-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-pink-50/20 hover:bg-pink-50 overflow-hidden relative">
                  {formData.documentBack ? <img src={formData.documentBack} className="w-full h-full object-cover" /> : <div className="text-center"><UploadCloud className="mx-auto text-pink-300" /><span className="text-[10px] font-bold text-pink-400">BACK</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'documentBack')} />
                </label>
              </div>
              <button 
                disabled={!formData.documentFront || !formData.documentBack}
                onClick={() => setStep(3)} 
                className="w-full bg-pink-600 text-white font-black py-4 rounded-2xl disabled:opacity-50"
              >
                Continue to Face Scan
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-in fade-in">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Liveness Check</h1>
              <div className="relative w-64 h-64 mx-auto rounded-full border-[10px] border-pink-50 overflow-hidden bg-slate-100 shadow-inner">
                {!capturedFace ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <img src={capturedFace} className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              {!capturedFace ? (
                <button onClick={capturePhoto} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">
                  <Camera size={20} /> Capture Selfie
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Verification"}
                  </button>
                  <button onClick={() => setCapturedFace(null)} className="text-xs font-bold text-pink-500 uppercase tracking-widest">Retake Photo</button>
                </div>
              )}
              <p className="text-[11px] text-slate-400">Hold your phone steady and ensure your face is clearly visible.</p>
            </div>
          )}

          {/* STEP 4: FINAL STATUS */}
          {step === 4 && (
            <div className="text-center space-y-8 py-4 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner rotate-3">
                <Clock size={48} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">KYC Submitted!</h1>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  We have received your documents. Your account status is now <span className="font-bold text-amber-600 italic">Pending</span>. Review takes up to 24 hours.
                </p>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mx-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  <span>Current Status</span>
                  <span className="text-amber-600">Under Review</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[75%] animate-pulse"></div>
                </div>
              </div>

              <Link href="/dashboard" className="block w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all">
                Return to Dashboard
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}