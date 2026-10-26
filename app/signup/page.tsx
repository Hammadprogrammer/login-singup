"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import AuthShell from "@/component/auth/AuthShell";
import { notifySessionChange } from "@/lib/use-session";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", website: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length > 0 ? 1 : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Could not create your account.");
      notifySessionChange();
      router.push(safeRedirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account." subtitle="Join us" image="/images/mens/hero-1.jpg">
      <form onSubmit={submit} className="space-y-6">
        {error && <p className="text-sm text-oxblood bg-oxblood/5 border border-oxblood/20 px-4 py-3">{error}</p>}
        <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden>
          <label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></label>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div><label className="label">First name</label><input required maxLength={50} value={form.firstName} onChange={set("firstName")} className="field" placeholder="First" autoComplete="given-name" /></div>
          <div><label className="label">Last name</label><input required maxLength={50} value={form.lastName} onChange={set("lastName")} className="field" placeholder="Last" autoComplete="family-name" /></div>
        </div>
        <div><label className="label">Email</label><input type="email" required value={form.email} onChange={set("email")} className="field" placeholder="you@example.com" autoComplete="email" /></div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} required minLength={8} maxLength={128} value={form.password} onChange={set("password")} className="field pr-10" placeholder="At least 8 characters" autoComplete="new-password" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label="Toggle password" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone hover:text-ink">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((n) => <span key={n} className={`h-1 flex-1 ${strength >= n ? (strength === 3 ? "bg-success" : strength === 2 ? "bg-brass" : "bg-oxblood") : "bg-bone-3"}`} />)}
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-ink w-full">{loading && <Loader2 size={14} className="animate-spin" />} Create account</button>
      </form>

      <div className="flex items-center gap-4 my-7">
        <div className="divider" /><span className="text-[10px] uppercase tracking-[0.2em] text-stone">or</span><div className="divider" />
      </div>
      <a href="/api/auth/google" className="btn-outline w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/google.png" alt="" className="h-4 w-4" /> Continue with Google
      </a>

      <p className="text-sm text-stone text-center mt-8">
        Already have an account? <Link href="/login" className="text-ink link-underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-stone" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
