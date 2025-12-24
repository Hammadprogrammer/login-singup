import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

import { HomeSliderCRUD } from "@/component/dashboard/homeSlider/slider";
import ProductDashboard from "@/component/dashboard/product/product";
import LogoutDashboard from "@/component/dashboard/logout/logout";
import UserStatus from "@/component/dashboard/user-status/user-status";

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

  return (
    <div>
      <LogoutDashboard />
      <HomeSliderCRUD />
      <ProductDashboard />
      <UserStatus/>

    </div>
  );
}
