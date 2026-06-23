"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, User, ShieldCheck, Shield } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const ROLES = [
  {
    value: "USER",
    label: "User",
    desc: "Regular user — can browse, buy, and list products.",
    icon: User,
    color: "border-slate-600 bg-slate-800/40 text-slate-300",
    activeColor: "border-blue-500 bg-blue-500/10 text-blue-300",
    badge: "bg-slate-700 text-slate-300",
  },
  {
    value: "SUBADMIN",
    label: "Sub Admin",
    desc: "Limited admin — can manage products and view orders.",
    icon: Shield,
    color: "border-slate-600 bg-slate-800/40 text-slate-300",
    activeColor: "border-purple-500 bg-purple-500/10 text-purple-300",
    badge: "bg-purple-500/20 text-purple-300",
  },
  {
    value: "ADMIN",
    label: "Admin",
    desc: "Full access — manage users, orders, and all settings.",
    icon: ShieldCheck,
    color: "border-slate-600 bg-slate-800/40 text-slate-300",
    activeColor: "border-amber-500 bg-amber-500/10 text-amber-300",
    badge: "bg-amber-500/20 text-amber-300",
  },
];

export default function AddUserModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create user.");
        return;
      }
      setSuccess(`${data.name || data.email} created as ${form.role} successfully!`);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0b1120]">
          <h2 className="text-white font-bold flex items-center gap-2 text-base">
            <UserPlus size={18} className="text-blue-400" /> Create New Account
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg px-3 py-2.5">
              ✓ {success}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
            </Field>
            <Field label="Email *">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
              />
            </Field>
          </div>

          <Field label="Password * (min 8 chars)">
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            />
          </Field>

          {/* Role Selector */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-2">
              Select Role *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                      isActive ? r.activeColor : r.color
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-xs font-bold">{r.label}</span>
                    <p className="text-[10px] leading-tight opacity-70">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected role summary */}
          <div className="bg-slate-800/30 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-500">Assigning role:</span>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${ROLES.find(r => r.value === form.role)?.badge}`}>
              {form.role}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
