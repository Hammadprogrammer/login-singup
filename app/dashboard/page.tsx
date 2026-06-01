import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

import DashboardClient from "@/component/dashboard/dashboard-client";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let decoded: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    redirect("/login");
  }

  if (decoded.role !== "ADMIN") {
    redirect("/");
  }

  return <DashboardClient />;
}
