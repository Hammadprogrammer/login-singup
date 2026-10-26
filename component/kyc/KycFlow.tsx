"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Camera, Loader2, ImageIcon, ArrowLeft, CheckCircle2, Clock, XCircle, Lock, RefreshCcw } from "lucide-react";
import { toast } from "@/component/ui/Toast";

type DocType = "CNIC" | "PASSPORT" | "DRIVING_LICENSE";
type Status = "PENDING" | "APPROVED" | "REJECTED" | null;

const DOC_LABEL: Record<DocType, { label: string; hint: string; placeholder: string }> = {
  CNIC: { label: "CNIC", hint: "13 digits, no dashes", placeholder: "4210112345671" },
  PASSPORT: { label: "Passport", hint: "6–12 letters/digits", placeholder: "AB1234567" },
  DRIVING_LICENSE: { label: "Driving licence", hint: "5–20 characters", placeholder: "LHR-12345" },
};

const MAX_BYTES = 6 * 1024 * 1024;

function FilePicker({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label className="relative block aspect-[16/10] border border-dashed border-bone-3 hover:border-ink bg-white cursor-pointer overflow-hidden transition-colors group">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <ImageIcon size={26} strokeWidth={1.2} className="text-brass mb-3" />
          <p className="eyebrow text-[10px]">{label}</p>
          <p className="text-[11px] text-stone mt-1">JPG, PNG or WEBP · max 6 MB</p>
        </div>
      )}
      {preview && <span className="absolute bottom-3 left-3 bg-ink/80 text-bone eyebrow text-[9px] px-2 py-1">{label} · click to replace</span>}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          if (f && f.size > MAX_BYTES) return toast.error("Image is larger than 6 MB");
          onChange(f);
        }}
      />
    </label>
  );
}

export default function KycFlow() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [form, setForm] = useState({ fullName: "", fatherName: "", documentType: "CNIC" as DocType, documentNumber: "", documentExpiry: "" });
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [face, setFace] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kyc", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/login?redirect=/kyc");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setStatus(d.status);
        setReason(d.reason || "");
        if (d.status === "REJECTED") setStep(0);
        if (d.fullName) setForm((f) => ({ ...f, fullName: d.fullName }));
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Camera for the live selfie step
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 3 && !face) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "user" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
          setCameraError(null);
        })
        .catch(() => setCameraError("Camera access is required. You can also upload a clear selfie below."));
    }
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [step, face]);

  useEffect(() => {
    if (!face) return setFacePreview(null);
    const url = URL.createObjectURL(face);
    setFacePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [face]);

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => blob && setFace(new File([blob], "selfie.jpg", { type: "image/jpeg" })), "image/jpeg", 0.85);
  };

  const docOk = (() => {
    const n = form.documentNumber.replace(/\s|-/g, "");
    if (form.documentType === "CNIC") return /^\d{13}$/.test(n);
    if (form.documentType === "PASSPORT") return /^[A-Z0-9]{6,12}$/i.test(n);
    return /^[A-Z0-9-]{5,20}$/i.test(n);
  })();
  const expiryOk = !form.documentExpiry || /^\d{2}-\d{2}-\d{4}$/.test(form.documentExpiry);
  const step1Ok = form.fullName.trim().length >= 3 && docOk && expiryOk;

  const onDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 8);
    const f = v.length > 4 ? `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}` : v.length > 2 ? `${v.slice(0, 2)}-${v.slice(2)}` : v;
    setForm({ ...form, documentExpiry: f });
  };

  const submit = async () => {
    if (!front || !back || !face) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("documentFront", front);
      fd.append("documentBack", back);
      fd.append("faceImage", face);
      const res = await fetch("/api/kyc", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Submission failed");
      setStatus("PENDING");
      toast.success("Verification submitted");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>;

  // ---------- Status screens ----------
  if (status && (status !== "REJECTED" || step === 0)) {
    const cfg = {
      PENDING: { icon: Clock, tone: "text-brass", title: "Under review", text: "Our team is checking your documents. This usually takes less than 24 hours — we'll email you when it's done." },
      APPROVED: { icon: CheckCircle2, tone: "text-success", title: "You're verified", text: "Your identity has been confirmed. Thank you for helping us keep the store safe." },
      REJECTED: { icon: XCircle, tone: "text-oxblood", title: "Action required", text: reason || "Your documents could not be verified. Please re-submit clear, valid images." },
    }[status];
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center animate-fade-up">
        <cfg.icon size={48} strokeWidth={1} className={`mx-auto mb-6 ${cfg.tone}`} />
        <p className="eyebrow text-brass mb-3">Identity verification</p>
        <h1 className="display text-4xl mb-4">{cfg.title}</h1>
        <p className="text-ink-3 leading-relaxed mb-10">{cfg.text}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {status === "REJECTED" && <button onClick={() => setStep(1)} className="btn-ink"><RefreshCcw size={14} /> Re-submit</button>}
          <Link href="/" className="btn-outline">Back to store</Link>
        </div>
      </div>
    );
  }

  const steps = ["Details", "Documents", "Selfie"];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
      <div className="text-center mb-10">
        <p className="eyebrow text-brass mb-3">Identity verification</p>
        <h1 className="display text-4xl lg:text-5xl mb-3">Verify your identity</h1>
        <p className="text-sm text-ink-3 max-w-md mx-auto leading-relaxed">A quick three-step check. Documents are uploaded over an encrypted connection and are only visible to our verification team.</p>
      </div>

      <ol className="grid grid-cols-3 gap-2 mb-8">
        {steps.map((s, i) => (
          <li key={s}>
            <div className={`h-1 mb-2 transition-colors ${step > i ? "bg-ink" : "bg-bone-3"}`} />
            <p className={`text-[10px] uppercase tracking-[0.2em] ${step > i ? "text-ink" : "text-stone"}`}>{i + 1}. {s}</p>
          </li>
        ))}
      </ol>

      <div className="card p-7 lg:p-10">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="label">Full name (as on document)</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field" placeholder="Full legal name" maxLength={100} />
            </div>
            <div>
              <label className="label">Father&apos;s name <span className="text-stone normal-case tracking-normal">(optional)</span></label>
              <input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} className="field" placeholder="Father's name" maxLength={100} />
            </div>
            <div>
              <label className="label">Document type</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(DOC_LABEL) as DocType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, documentType: t, documentNumber: "" })} className={`py-3 text-[11px] uppercase tracking-[0.15em] border transition-colors ${form.documentType === t ? "bg-ink text-bone border-ink" : "border-bone-3 hover:border-ink"}`}>{DOC_LABEL[t].label}</button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label">{DOC_LABEL[form.documentType].label} number</label>
                <input value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: form.documentType === "CNIC" ? e.target.value.replace(/\D/g, "").slice(0, 13) : e.target.value.toUpperCase().slice(0, 20) })} className="field font-mono" placeholder={DOC_LABEL[form.documentType].placeholder} />
                <p className="text-[11px] text-stone mt-1.5">{DOC_LABEL[form.documentType].hint}</p>
              </div>
              <div>
                <label className="label">Expiry date <span className="text-stone normal-case tracking-normal">(optional)</span></label>
                <input value={form.documentExpiry} onChange={onDate} className="field font-mono" placeholder="DD-MM-YYYY" inputMode="numeric" />
              </div>
            </div>
            <button disabled={!step1Ok} onClick={() => setStep(2)} className="btn-ink w-full">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setStep(1)} className="text-[11px] uppercase tracking-[0.2em] text-stone hover:text-ink flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
            <h2 className="display text-3xl">Upload your {DOC_LABEL[form.documentType].label.toLowerCase()}</h2>
            <p className="text-sm text-ink-3">Both sides, well lit, all four corners visible. No glare.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <FilePicker label="Front side" file={front} onChange={setFront} />
              <FilePicker label="Back side" file={back} onChange={setBack} />
            </div>
            <button disabled={!front || !back} onClick={() => setStep(3)} className="btn-ink w-full">Continue to selfie</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-center">
            <button onClick={() => setStep(2)} className="text-[11px] uppercase tracking-[0.2em] text-stone hover:text-ink flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
            <h2 className="display text-3xl">Take a live selfie</h2>
            <p className="text-sm text-ink-3">Face the camera in good light. Remove sunglasses and hats.</p>
            <div className="relative mx-auto w-60 h-60 rounded-full overflow-hidden border-4 border-brass bg-ink">
              {facePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={facePreview} alt="Selfie" className="h-full w-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {cameraError && <p className="text-xs text-oxblood">{cameraError}</p>}
            {!face ? (
              <div className="space-y-3">
                {!cameraError && <button onClick={capture} className="btn-ink w-full"><Camera size={16} /> Capture photo</button>}
                <label className="btn-outline w-full cursor-pointer">
                  Upload a selfie instead
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && setFace(e.target.files[0])} />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={submit} disabled={submitting} className="btn-ink w-full">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {submitting ? "Uploading securely…" : "Submit for verification"}
                </button>
                <button onClick={() => setFace(null)} className="btn-ghost w-full justify-center text-[10px]">Retake</button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-stone"><Lock size={12} /> Encrypted upload · Access-controlled storage · Never shared</p>
    </div>
  );
}
