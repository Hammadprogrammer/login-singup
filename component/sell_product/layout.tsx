"use client";
import { useEffect, useState } from "react";
import MemberAccessPopup from "./check-user-login/check-user-login"; 

export default function SellProductLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check-token");
        const data = await res.json();
        
        // Console check taake aapko pata chale API kya bhej rahi hai
        console.log("Auth Data:", data);

        if (data.loggedIn === true) {
          setIsAuthorized(true);
          setShowPopup(false); // Login hai toh popup hide karo
        } else {
          setIsAuthorized(false);
          setShowPopup(true); // Login nahi hai toh popup dikhao
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setIsAuthorized(false);
        setShowPopup(true); 
      }
    }
    checkAuth();
  }, []);

  // Jab tak API respond nahi karti, loading dikhao
  if (isAuthorized === null) return <div className="h-screen flex items-center justify-center">Checking Access...</div>;

  return (
    <>
      <MemberAccessPopup 
        isVisible={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
      
      {/* Agar authorized hai toh content dikhao, warna khali div */}
      {isAuthorized ? children : <div className="h-screen" />}
    </>
  );
}