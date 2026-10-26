import type { Metadata } from "next";
import KycFlow from "@/component/kyc/KycFlow";

export const metadata: Metadata = { title: "Identity verification" };

export default function KycPage() {
  return <KycFlow />;
}
