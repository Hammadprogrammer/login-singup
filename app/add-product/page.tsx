"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProductForm from "@/component/sell_product/add-product/add-product";
import { Loader2 } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check-token");
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          router.push("/login?redirect=/add-product");
        }
      } catch {
        router.push("/login?redirect=/add-product");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff5f9] flex items-center justify-center mt-[160px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#fff5f9] py-8 px-4 mt-[160px]">
      <div className="max-w-5xl mx-auto">
        <AddProductForm />
      </div>
    </div>
  );
}
