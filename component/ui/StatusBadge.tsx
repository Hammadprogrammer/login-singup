import { normalizeOrderStatus, type OrderStatusValue } from "@/lib/site";

export const STATUS_STYLE: Record<OrderStatusValue, string> = {
  PENDING: "bg-brass/15 text-[#7a5f2a] border-brass/40",
  PROCESSING: "bg-[#1F2A44]/10 text-[#1F2A44] border-[#1F2A44]/30",
  COMPLETED: "bg-success/10 text-success border-success/30",
  CANCELLED: "bg-oxblood/10 text-oxblood border-oxblood/30",
};

export default function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const s = normalizeOrderStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] uppercase tracking-[0.2em] font-semibold ${STATUS_STYLE[s]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s}
    </span>
  );
}
