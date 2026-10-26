"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import AuthShell from "@/component/auth/AuthShell";
import { notifySessionChange } from "@/lib/use-session";

const GOOGLE_ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in isn't configured yet.",
  google_state: "Sign-in session expired. Please try again.",
  google_token: "Google could not confirm your sign-in. Please try again.",
  google_email: "We couldn't read a verified email from your Google account.",
  google_failed: "Google sign-in failed. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(GOOGLE_ERRORS[params.get("error") || ""] || null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed.");
      notifySessionChange();
      router.push(safeRedirect || data.redirect || "/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back." subtitle="Sign in">
      <form onSubmit={submit} className="space-y-6">
        {error && <p className="text-sm text-oxblood bg-oxblood/5 border border-oxblood/20 px-4 py-3">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link href="/forgot" className="text-[11px] text-stone hover:text-ink link-underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="field pr-10" placeholder="Your password" autoComplete="current-password" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone hover:text-ink">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-ink w-full">{loading && <Loader2 size={14} className="animate-spin" />} Sign in</button>
      </form>

      <div className="flex items-center gap-4 my-7">
        <div className="divider" /><span className="text-[10px] uppercase tracking-[0.2em] text-stone">or</span><div className="divider" />
      </div>

      <a href="/api/auth/google" className="btn-outline w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/google.png" alt="" className="h-4 w-4" /> Continue with Google
      </a>

      <p className="text-sm text-stone text-center mt-8">
        New here? <Link href={`/signup${safeRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ""}`} className="text-ink link-underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
