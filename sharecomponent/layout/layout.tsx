"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/sharecomponent/navbar/navbar";
import Footer from "@/sharecomponent/footer/footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages jahan Navbar & Footer nahi dikhana
  const hideLayoutPaths = ["/login", "/signup" , "/dashboard"];

  const hideLayout = hideLayoutPaths.includes(pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
