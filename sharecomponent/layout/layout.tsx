"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/sharecomponent/navbar/navbar";
import Footer from "@/sharecomponent/footer/footer";
import KycStatusManager from "@/app/kyc-user/page";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayoutPaths = ["/login", "/signup", "/dashboard", "/cart" , "/admin/kyc", "/kyc"];
  const hideLayout = hideLayoutPaths.includes(pathname);

  const kycPath = ["/kyc", "/login", "/signup"]; 
  const isKycPage = kycPath.includes(pathname);

  return (
    <>
      {!isKycPage && <KycStatusManager />}

      {!hideLayout && <Navbar />}
      
      <main>{children}</main>
      
      {!hideLayout && <Footer />}
    </>
  );
}