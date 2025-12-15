import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { HomeSliderCRUD } from "@/component/dashboard/homeSlider/slider";
import ProductDashboard from "@/component/dashboard/product/product";


export default async function DashboardPage() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div>Access denied


    </div>;
  }

  const decoded: any = jwt.decode(token);

  if (decoded?.role !== "ADMIN") {
    return <div>You are not allowed to view this page.</div>;
  }

  return <div>
<HomeSliderCRUD/>
    <ProductDashboard/>
  </div>;
}
