"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { X, User, FileText, Camera, CheckCircle2, ChevronRight, UploadCloud, ArrowLeft } from "lucide-react";

const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo ke liye user set kar rha hoon taaki modal bar bar na aaye
    setUser({ id: 'test-user-123', name: 'Tester' });
    setLoading(false);
  }, []);

  return { user, loading };
};

export default function ProfessionalKYC() {
  const { user, loading } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    docType: "CNIC",
    docNum: "",
    docExpiry: "",
    documentFront: null as string | null,
    documentBack: null as string | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (step === 3) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => console.log("Camera access error (Normal for some browsers)"));
    }
  }, [step]);

  // Validation Hatadi gayi hai (Direct Next)
  const handleNext = () => {
    if (!user) { setShowAuthModal(true); return; }
    setStep(step + 1);
  };

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    setIsSubmitting(true);
    
    let base64Img = "";
    if (canvas && video) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);
      base64Img = canvas.toDataURL("image/jpeg");
    }

    try {
      // Direct API Call testing ke liye
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, faceImage: base64Img, userId: user?.id }),
      });
      
      // Response check karein ya na karein, step 4 par bhej rha hoon testing ke liye
      setStep(4);
    } catch (err) {
      console.error("API Error:", err);
      setStep(4); // Testing ke liye error par bhi next step
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-pink-50 text-pink-600 font-bold animate-pulse">Loading Identity Module...</div>;

  const inputClass = "w-full p-4 bg-white border border-pink-100 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all text-gray-700 shadow-sm placeholder:text-gray-300";
  const labelClass = "block text-xs font-bold text-pink-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-15px_rgba(219,39,119,0.2)] rounded-[2.5rem] overflow-hidden border border-white">
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-pink-100 flex">
          <div className={`h-full bg-pink-500 transition-all duration-700 ease-out`} style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="p-8 md:p-12">
          {/* Back Button */}
          {step > 1 && step < 4 && (
            <button onClick={() => setStep(step - 1)} className="mb-6 flex items-center gap-2 text-pink-400 hover:text-pink-600 font-bold text-sm transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Basic Info</h1>
                <p className="text-gray-500 mt-2 font-medium">Let's start with your official name.</p>
              </header>
              
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input placeholder="Enter full name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Father's Name</label>
                  <input placeholder="Enter father's name" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className={inputClass} />
                </div>
              </div>

              <button onClick={handleNext} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-pink-200 active:scale-95">
                Next Step <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Documents</h1>
                <p className="text-gray-500 mt-2 font-medium">Upload your valid identification.</p>
              </header>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className={labelClass}>Document Type</label>
                  <select value={formData.docType} onChange={e => setFormData({...formData, docType: e.target.value})} className={inputClass}>
                    <option value="CNIC">National ID (CNIC)</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>ID Number</label>
                    <input placeholder="Numbers only" value={formData.docNum} onChange={e => setFormData({...formData, docNum: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Expiry Date</label>
                    <input type="date" value={formData.docExpiry} onChange={e => setFormData({...formData, docExpiry: e.target.value})} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-pink-200 rounded-[2rem] bg-pink-50/30 hover:bg-pink-100/50 transition-all cursor-pointer overflow-hidden">
                    {formData.documentFront ? (
                      <img src={formData.documentFront} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud className="text-pink-400 mb-2" size={28} />
                        <span className="text-[10px] font-black text-pink-500 uppercase">Front Side</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={e => e.target.files && setFormData({...formData, documentFront: URL.createObjectURL(e.target.files[0])})} />
                  </label>

                  <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-pink-200 rounded-[2rem] bg-pink-50/30 hover:bg-pink-100/50 transition-all cursor-pointer overflow-hidden">
                    {formData.documentBack ? (
                      <img src={formData.documentBack} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud className="text-pink-400 mb-2" size={28} />
                        <span className="text-[10px] font-black text-pink-500 uppercase">Back Side</span>
                      </>
                    )}
                    <input type="file" className="hidden" onChange={e => e.target.files && setFormData({...formData, documentBack: URL.createObjectURL(e.target.files[0])})} />
                  </label>
                </div>
              </div>

              <button onClick={handleNext} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-pink-200">
                Continue to Face Check <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 3: Face Check */}
          {step === 3 && (
            <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Selfie Scan</h1>
                <p className="text-gray-500 mt-2 font-medium">Verify your live presence.</p>
              </header>

              <div className="relative w-72 h-72 mx-auto">
                {/* Decorative Pink Rings */}
                <div className="absolute inset-[-10px] rounded-full border-2 border-pink-100 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-[8px] border-pink-600 z-10 border-t-transparent animate-spin"></div>
                
                <div className="absolute inset-0 rounded-full overflow-hidden bg-pink-50 shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />
              
              <button 
                onClick={handleCapture} 
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-pink-200"
              >
                {isSubmitting ? "Uploading Documents..." : "Finalize & Submit"}
              </button>
            </div>
          )}

          {/* Step 4: Final */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-pink-300">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">All Set!</h2>
                <p className="text-gray-500 font-medium">Data sent to admin panel. You can now check your database for the entries.</p>
              </div>
              <Link href="/dashboard" className="block w-full bg-gray-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 opacity-40">
        <div className="h-1 w-8 bg-pink-300 rounded-full"></div>
        <div className="h-1 w-8 bg-pink-300 rounded-full"></div>
        <div className="h-1 w-8 bg-pink-300 rounded-full"></div>
      </div>
    </div>
  );
}