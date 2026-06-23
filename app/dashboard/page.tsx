import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/auth";
import DashboardClient from "@/component/dashboard/dashboard-client";

export default async function DashboardPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <DashboardClient />;
}
