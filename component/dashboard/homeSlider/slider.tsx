"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle2, ArrowLeft, Camera, Loader2, User, CreditCard, 
  Calendar, Image as ImageIcon, ChevronRight
} from "lucide-react";

export default function ProfessionalKYC() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
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

  // ✅ Step 1: Image Selection Fix (Document Upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result.length > 10) { // Check if data is valid
        setFormData(prev => ({ ...prev, [side]: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Step 2: Camera Capture Fix (Face Verification)
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Ensure video is actually playing
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth; 
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.translate(canvas.width, 0); 
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          if (dataUrl.length > 100) { // Valid Base64 check
            setCapturedFace(dataUrl);
          } else {
            alert("Camera image capture fail ho gayi. Dobara koshish karein.");
          }
        }
      }
    }
  };

  // ✅ Step 3: Cloudinary Upload Logic (Using Hardcoded Cloud Name for testing)
  const uploadToCloudinary = async (base64: string) => {
    if (!base64 || base64 === "data:,") return null;

    try {
      const cloudName = "dbzkqua3f"; 
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: JSON.stringify({
          file: base64,
          upload_preset: "ml_default", 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      return data.secure_url || null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.documentFront || !formData.documentBack || !capturedFace) {
      alert("Tamam images lazmi hain!");
      return;
    }

    setIsSubmitting(true);
    try {
      const [frontUrl, backUrl, faceUrl] = await Promise.all([
        uploadToCloudinary(formData.documentFront),
        uploadToCloudinary(formData.documentBack),
        uploadToCloudinary(capturedFace)
      ]);

      if (!frontUrl || !backUrl || !faceUrl) {
        throw new Error("Cloudinary error: Kuch images upload nahi ho saki.");
      }

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

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 3 && !capturedFace) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [step, capturedFace]);

  useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pink-500" /></div>;

  return (
    <div className="min-h-screen bg-[#FFF9FA] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] p-8 shadow-lg">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Details</h2>
            <input className="w-full p-4 bg-gray-50 rounded-xl" placeholder="Full Name" onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input className="w-full p-4 bg-gray-50 rounded-xl" placeholder="ID Number" onChange={e => setFormData({...formData, documentNumber: e.target.value})} />
            <button onClick={() => setStep(2)} className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Upload ID</h2>
            <div className="grid grid-cols-2 gap-4">
              {['documentFront', 'documentBack'].map(side => (
                <label key={side} className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer overflow-hidden">
                  {(formData as any)[side] ? <img src={(formData as any)[side]} className="object-cover h-full w-full" /> : <ImageIcon />}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, side)} />
                </label>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold">Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Live Selfie</h2>
            <div className="w-60 h-60 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-pink-500">
              {!capturedFace ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" /> : <img src={capturedFace} className="w-full h-full object-cover" />}
            </div>
            {!capturedFace ? (
              <button onClick={capturePhoto} className="bg-black text-white px-8 py-3 rounded-xl">Capture</button>
            ) : (
              <button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full bg-pink-600 text-white py-4 rounded-xl">
                {isSubmitting ? "Uploading..." : "Submit KYC"}
              </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {step === 4 && <div className="text-center py-10">🎉 Submitted Successfully!</div>}
      </div>
    </div>
  );
}