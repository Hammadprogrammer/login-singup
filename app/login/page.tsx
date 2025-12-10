"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ... (primaryPink, hoverPink, textPink, disabledPink colors same rahenge)
  const primaryPink = "bg-[#f7c4d0]";
  const hoverPink = "hover:bg-[#f2b3c2]";
  const textPink = "text-[#f7c4d0]";
  const disabledPink = "bg-[#f2e6e9]";


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.redirect) {
        router.push(data.redirect);
      } else {
        setError(data.error || "Login failed. Please check your email and password.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network error. Could not connect to the server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-20 px-4 sm:px-6">

      {/* ... (Header/Logo part same rahega) */}
      <div className="mb-6">
        <Link href="/" className="text-3xl font-bold tracking-widest text-gray-800">
          <span className="font-serif">CLOTING</span>
          <span className={`font-light ${textPink}`}>BRAND</span>
        </Link>
      </div>

      <div className="bg-white w-full max-w-lg sm:max-w-xl p-10 rounded-xl shadow-xl border border-gray-200 transition-all duration-300">

        <h2 className={`text-4xl font-serif font-light text-center mb-10 ${textPink}`}>Welcome back!</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          {/* EMAIL (same as before) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border-b border-gray-700 p-3 text-lg tracking-wide text-gray-700 placeholder-gray-700
              focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD (same as before) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
              Password
            </label>
            <input
              type="password"
              className="w-full border-b border-gray-700 p-3 text-lg tracking-wide text-gray-700 placeholder-gray-700
              focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 transition"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* 👇 NAYA "FORGET PASSWORD" LINK YAHAN HAI 👇 */}
          <div className="flex justify-end pt-2">
            <Link href="/forgot" className="text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline transition">
              Forgot password?
            </Link>
          </div>
          {/* 👆 NAYA "FORGET PASSWORD" LINK YAHAN HAI 👆 */}


          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white py-4 text-lg font-semibold uppercase tracking-widest shadow-md rounded-md transition duration-150
              ${isLoading ? `${disabledPink} cursor-not-allowed text-gray-500` : `${primaryPink} ${hoverPink}`}`}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* ... (Don't have an account? part same rahega) */}
        <div className="text-center text-sm mt-10">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/signup" className="text-pink-300 font-bold hover:text-pink-400 transition underline-offset-4 hover:underline" style={{ color: primaryPink }}>
            Join now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;