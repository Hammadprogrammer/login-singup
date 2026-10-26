import type { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import DashboardClient from "@/component/dashboard/dashboard-client";

export const metadata: Metadata = { title: "Admin panel", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // Re-check the role against the database — a stale token must not grant access.
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, email: true } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/");

  return <DashboardClient adminEmail={dbUser.email} />;
}
