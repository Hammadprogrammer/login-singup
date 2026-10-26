"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Reply } from "lucide-react";
import { formatDate } from "@/lib/format";
import { toast } from "@/component/ui/Toast";
import { PageHeader, Spinner, Empty } from "../ui";

interface Msg { id: number; name: string; email: string; subject: string | null; message: string; isRead: boolean; createdAt: string }

export default function MessagesTab() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/contact", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])).then(setMsgs).finally(() => setLoading(false));
  }, []);

  const markRead = async (m: Msg) => {
    setOpen(open === m.id ? null : m.id);
    if (m.isRead) return;
    await fetch("/api/contact", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, isRead: true }) });
    setMsgs((p) => p.map((x) => (x.id === m.id ? { ...x, isRead: true } : x)));
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    const r = await fetch("/api/contact", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) {
      setMsgs((p) => p.filter((x) => x.id !== id));
      toast.success("Message deleted");
    }
  };

  const unread = msgs.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle={`Contact form inbox · ${unread} unread`} />
      {loading ? (
        <Spinner />
      ) : msgs.length === 0 ? (
        <Empty title="Inbox empty" text="Messages from the contact page will appear here." />
      ) : (
        <ul className="card divide-y divide-bone-3">
          {msgs.map((m) => (
            <li key={m.id}>
              <button onClick={() => markRead(m)} className="w-full text-left p-4 flex items-start gap-4 hover:bg-bone-2/40">
                {m.isRead ? <MailOpen size={18} className="text-stone mt-0.5 shrink-0" /> : <Mail size={18} className="text-brass mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className={`text-sm ${m.isRead ? "" : "font-semibold"}`}>{m.name} <span className="text-stone font-normal">· {m.email}</span></p>
                    <span className="text-[11px] text-stone">{formatDate(m.createdAt, true)}</span>
                  </div>
                  <p className="text-sm truncate">{m.subject || <span className="text-stone">(no subject)</span>}</p>
                  {open !== m.id && <p className="text-xs text-stone truncate">{m.message}</p>}
                </div>
              </button>
              {open === m.id && (
                <div className="px-4 pb-5 pl-14 animate-fade-in">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  <div className="flex gap-2 mt-4">
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "your message")}`} className="btn-ink py-2 px-4 text-[10px]"><Reply size={12} /> Reply</a>
                    <button onClick={() => remove(m.id)} className="btn-outline py-2 px-4 text-[10px] text-oxblood border-oxblood/40"><Trash2 size={12} /> Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
