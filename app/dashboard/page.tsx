import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default function DashboardPage() {
  const token = cookies().get("token")?.value;

  if (!token) return <div>Access denied</div>;

  const decoded: any = jwt.decode(token);

  if (decoded.role !== "ADMIN") {
    return <div>You are not allowed to view this page.</div>;
  }

  return <div>Welcome Admin! This is Dashboard.</div>;
}
