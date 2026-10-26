"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserPlus, Trash2, Loader2, Eye } from "lucide-react";
import { formatPrice, formatDate, shortId } from "@/lib/format";
import { paymentLabel } from "@/lib/site";
import StatusBadge from "@/component/ui/StatusBadge";
import { toast } from "@/component/ui/Toast";
import { PageHeader, StatCard, Spinner, Empty, Modal, Pagination, Field } from "../ui";

interface Customer {
  id: number; email: string; name: string | null; role: string; provider: string; createdAt: string;
  kyc: { status: string } | null; _count: { orders: number; reviews: number }; totalSpent: number;
}
interface Data { totalUsers: number; todayUsers: number; verifiedUsers: number; recentUsers: Customer[]; pagination: { page: number; pages: number; total: number } }

export default function CustomersTab() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [kyc, setKyc] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [debounced, kyc, role]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), pageSize: "25" });
    if (debounced) p.set("q", debounced);
    if (kyc) p.set("kyc", kyc);
    if (role) p.set("role", role);
    try {
      const r = await fetch(`/api/dashboard/user-stats?${p}`, { cache: "no-store" });
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, [page, debounced, kyc, role]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const r = await fetch("/api/dashboard/delete-user", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleting.id }) });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Delete failed");
      toast.success("Customer deleted");
      setDeleting(null);
      load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Registered accounts, spend and verification status." action={<button onClick={() => setAdding(true)} className="btn-ink py-2.5 px-5 text-[10px]"><UserPlus size={14} /> Add user</button>} />

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Registered" value={data.totalUsers} hint={`${data.todayUsers} joined today`} />
          <StatCard label="KYC verified" value={data.verifiedUsers} accent="bg-success" />
          <StatCard label="Showing" value={data.pagination.total} hint="match current filters" accent="bg-brass" />
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or ID…" className="field-box pl-10" />
        </div>
        <select value={kyc} onChange={(e) => setKyc(e.target.value)} className="field-box">
          <option value="">Any KYC status</option>
          <option value="APPROVED">Verified</option>
          <option value="PENDING">Pending review</option>
          <option value="REJECTED">Rejected</option>
          <option value="NONE">Not submitted</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="field-box">
          <option value="">All roles</option>
          <option value="USER">Customers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {loading && !data ? (
        <Spinner />
      ) : !data || data.recentUsers.length === 0 ? (
        <Empty title="No customers found" />
      ) : (
        <div className={`card overflow-hidden ${loading ? "opacity-60" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-stone bg-bone-2/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 font-medium">Orders</th>
                  <th className="text-right px-4 py-3 font-medium">Spent</th>
                  <th className="text-left px-4 py-3 font-medium">KYC</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-3">
                {data.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-bone-2/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-ink text-bone flex items-center justify-center text-xs font-semibold uppercase">{(u.name || u.email)[0]}</div>
                        <div className="min-w-0"><p className="font-medium truncate">{u.name || "—"}</p><p className="text-[11px] text-stone truncate">{u.email} · #{u.id}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone">{formatDate(u.createdAt)}<br /><span className="text-[10px]">{u.provider}</span></td>
                    <td className="px-4 py-3 text-right">{u._count.orders}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(u.totalSpent)}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider ${u.kyc?.status === "APPROVED" ? "border-success/40 text-success" : u.kyc?.status === "PENDING" ? "border-brass text-[#7a5f2a]" : u.kyc?.status === "REJECTED" ? "border-oxblood/40 text-oxblood" : "border-bone-3 text-stone"}`}>{u.kyc?.status ?? "None"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{u.role}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetailId(u.id)} className="p-2 hover:bg-bone-2" title="Details"><Eye size={15} /></button>
                        <button onClick={() => setDeleting(u)} disabled={u.role === "ADMIN"} className="p-2 hover:bg-oxblood/10 text-oxblood disabled:opacity-30" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5"><Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} /></div>
        </div>
      )}

      {detailId !== null && <CustomerDetail id={detailId} onClose={() => setDetailId(null)} />}
      {adding && <AddUser onClose={() => setAdding(false)} onCreated={() => { setAdding(false); load(); }} />}
      {deleting && (
        <Modal title="Delete customer" onClose={() => setDeleting(null)}>
          <p className="text-sm mb-6">Delete <strong>{deleting.name || deleting.email}</strong>? Their cart, reviews, KYC and orders will be permanently removed.</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleting(null)} className="btn-outline py-2.5 px-5 text-[10px]">Cancel</button>
            <button onClick={remove} disabled={busy} className="btn py-2.5 px-5 text-[10px] bg-oxblood text-bone">{busy && <Loader2 size={12} className="animate-spin" />} Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CustomerDetail({ id, onClose }: { id: number; onClose: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/dashboard/user-detail?id=${id}`, { cache: "no-store" }).then((r) => r.json()).then(setD);
  }, [id]);

  return (
    <Modal title={d?.user ? d.user.name || d.user.email : "Customer"} onClose={onClose} wide>
      {!d ? (
        <Spinner />
      ) : d.error ? (
        <p className="text-sm text-oxblood">{d.error}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Orders" value={d.stats.orderCount} />
            <StatCard label="Total spent" value={formatPrice(d.stats.totalSpent)} accent="bg-brass" />
            <StatCard label="Product views" value={d.stats.viewCount} accent="bg-[#1F2A44]" />
            <StatCard label="KYC" value={d.user.kyc?.status ?? "None"} accent="bg-success" />
          </div>
          <div className="card p-5 text-sm grid sm:grid-cols-2 gap-2">
            <p><span className="text-stone">Email:</span> {d.user.email}</p>
            <p><span className="text-stone">Joined:</span> {formatDate(d.user.createdAt, true)}</p>
            <p><span className="text-stone">Role:</span> {d.user.role}</p>
            <p><span className="text-stone">Sign-in:</span> {d.user.provider}</p>
          </div>
          <div>
            <p className="eyebrow text-[10px] text-stone mb-3">Orders</p>
            {d.orders.length === 0 ? (
              <p className="text-sm text-stone">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-bone-3 card">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {d.orders.map((o: any) => (
                  <li key={o.id} className="p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[160px]"><p className="font-mono text-xs">#{shortId(o.id)}</p><p className="text-[11px] text-stone">{formatDate(o.createdAt, true)} · {paymentLabel(o.paymentMethod)}</p></div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p className="text-xs text-ink-3 flex-1">{o.items.map((i: any) => `${i.name}${i.size ? ` (${i.size})` : ""} ×${i.quantity}`).join(", ")}</p>
                    <p className="font-medium">{formatPrice(o.totalAmount)}</p>
                    <StatusBadge status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function AddUser({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/dashboard/create-user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) return setError(d.error || "Failed");
      toast.success("User created");
      onCreated();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Add user" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field-box" /></Field>
        <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field-box" /></Field>
        <Field label="Temporary password" hint="At least 8 characters. Ask them to change it after first sign-in."><input required minLength={8} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="field-box font-mono" /></Field>
        <Field label="Role">
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="field-box">
            <option value="USER">Customer</option>
            <option value="ADMIN">Admin (full access)</option>
          </select>
        </Field>
        {error && <p className="text-sm text-oxblood">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-outline py-2.5 px-5 text-[10px]">Cancel</button>
          <button type="submit" disabled={busy} className="btn-ink py-2.5 px-5 text-[10px]">{busy && <Loader2 size={12} className="animate-spin" />} Create</button>
        </div>
      </form>
    </Modal>
  );
}
