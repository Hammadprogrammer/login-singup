"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import AuthShell from "@/component/auth/AuthShell";
import { toast } from "@/component/ui/Toast";

export default function ForgotPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const post = async (url: string, body: object) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return false;
      }
      return true;
    } catch {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await post("/api/auth/forgot", { email })) setStep(2);
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await post("/api/auth/verify-code", { email, code })) setStep(3);
  };
  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords do not match.");
    if (await post("/api/auth/reset-password", { email, code, password })) {
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    }
  };

  const titles = { 1: "Reset your password.", 2: "Check your inbox.", 3: "Choose a new password." } as const;

  return (
    <AuthShell title={titles[step]} subtitle={`Step ${step} of 3`} image="/images/mens/hero-2.jpg">
      {error && <p className="text-sm text-oxblood bg-oxblood/5 border border-oxblood/20 px-4 py-3 mb-6">{error}</p>}

      {step === 1 && (
        <form onSubmit={sendCode} className="space-y-6">
          <p className="text-sm text-ink-3">Enter the email on your account and we&apos;ll send a 6-digit code.</p>
          <div><label className="label">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" autoComplete="email" /></div>
          <button type="submit" disabled={loading} className="btn-ink w-full">{loading && <Loader2 size={14} className="animate-spin" />} Send code</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verify} className="space-y-6">
          <p className="text-sm text-ink-3">If an account exists for <strong>{email}</strong>, a code is on its way. It expires in 10 minutes.</p>
          <div><label className="label">6-digit code</label><input required inputMode="numeric" pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="field font-mono text-2xl tracking-[0.5em]" placeholder="••••••" /></div>
          <button type="submit" disabled={loading || code.length !== 6} className="btn-ink w-full">{loading && <Loader2 size={14} className="animate-spin" />} Verify code</button>
          <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center text-[10px]"><ArrowLeft size={12} /> Use a different email</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={reset} className="space-y-6">
          <div><label className="label">New password</label><input type="password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="At least 8 characters" autoComplete="new-password" /></div>
          <div><label className="label">Confirm password</label><input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" placeholder="Repeat password" autoComplete="new-password" /></div>
          <button type="submit" disabled={loading} className="btn-ink w-full">{loading && <Loader2 size={14} className="animate-spin" />} Update password</button>
        </form>
      )}

      <p className="text-sm text-stone text-center mt-8">
        Remembered it? <Link href="/login" className="text-ink link-underline">Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
