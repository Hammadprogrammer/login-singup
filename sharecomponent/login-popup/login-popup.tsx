// File: components/LoginPopup.tsx (or wherever you placed it)

"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Keep useRouter in case you link to signup/forgot password
import Link from "next/link"; // Use Link for Next.js routing

// Props for controlled component
interface LoginPopupProps {
  isVisible: boolean;
  onClose: () => void;
  handleLogin: (e: React.FormEvent) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({
  isVisible,
  onClose,
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
}) => {
  if (!isVisible) return null;

  // Define the primary color (Soft Pink)
  const primaryPink = "bg-[#f7c4d0]"; // Soft Pink background for button
  const hoverPink = "hover:bg-[#f2b3c2]"; // Slightly darker pink on hover
  const textPink = "text-[#f7c4d0]"; // Soft Pink text color

  return (
    <>
      {/* POPUP OVERLAY */}
      <div
        // Tailwind Overlay styles
        className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center pt-20 z-[1000] transition-opacity duration-300"
        onClick={onClose}
      >
        {/* POPUP BOX */}
        <div
          // Tailwind Box styles
          className="relative bg-white p-10 pt-8 rounded-md shadow-2xl w-[400px] max-w-sm animate-scaleIn border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            // Tailwind Close Button styles
            className="absolute top-3 right-3 text-gray-500 text-xl hover:text-gray-700 transition"
            aria-label="Close"
          >
            ×
          </button>

          {/* HEADER */}
          <h2 className={`text-3xl font-serif font-light text-center mb-6 ${textPink}`}>
            Welcome back!
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* EMAIL FIELD */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 uppercase mb-1 tracking-wider">
                  Email
              </label>
              <input
                id="email"
                type="email"
                placeholder=""
                // Tailwind Input styles
                className="w-full border-b border-gray-400 p-2 focus:outline-none focus:border-black transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 uppercase mb-1 tracking-wider">
                  Password
              </label>
              <input
                id="password"
                type="password"
                placeholder=""
                // Tailwind Input styles
                className="w-full border-b border-gray-400 p-2 focus:outline-none focus:border-black transition duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* FORGOT PASSWORD LINK */}
            <div className="text-right text-sm -mt-2">
              <Link href="/forgot-password" onClick={onClose} className="text-gray-500 hover:text-black transition">
                Forgot your password?
              </Link>
            </div>
            

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              // Tailwind Button styles
              className={`w-full ${primaryPink} text-white py-3 uppercase font-medium shadow-sm transition duration-150 ${hoverPink}`}
            >
              Log In
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="text-center text-sm mt-6">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/signup" onClick={onClose} className="text-pink-400 font-medium hover:underline">
                  Join now
              </Link>
          </div>
          
        </div>
      </div>

      {/* SCALE IN ANIMATION (Needs to be kept to work with Tailwind classes) */}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.25s ease;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default LoginPopup;   