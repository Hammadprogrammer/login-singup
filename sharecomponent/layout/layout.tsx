"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/sharecomponent/navbar/navbar";
import Footer from "@/sharecomponent/footer/footer";
import Toaster from "@/component/ui/Toast";

/** Hides the storefront chrome on auth screens and inside the admin panel. */
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = ["/login", "/signup", "/forgot"].includes(pathname) || pathname.startsWith("/dashboard");

  if (bare) {
    return (
      <>
        <main>{children}</main>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] pt-16 lg:pt-[144px]">{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}
