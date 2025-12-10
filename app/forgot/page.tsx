"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// React Icons for a professional look
import { FiMail, FiLock, FiChevronLeft, FiSend } from "react-icons/fi";
import { IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";

export default function ForgotPage() {
  const router = useRouter();
  
  const primaryPink = "bg-[#f7c4d0]";
  const hoverPink = "hover:bg-[#f2b3c2]";
  const textPink = "text-[#f7c4d0]";
  const disabledPink = "bg-[#f2e6e9]";
  const darkPinkText = "text-[#a05263]"; 
  const darkGray = "text-gray-700"; 

  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "reset">("email");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const inputStyle = `w-full border-b border-gray-700 pl-12 pr-3 py-3 text-lg tracking-wide ${darkGray} placeholder-gray-500
    focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 transition`;

  const getButtonStyle = (loading: boolean) => {
    return `w-full text-white py-4 text-lg font-semibold uppercase tracking-widest shadow-md rounded-md transition duration-150
      ${loading ? `${disabledPink} cursor-not-allowed ${darkGray}` : `${primaryPink} ${hoverPink}`}`;
  };


  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStage("code");
        setSuccessMessage("A verification code has been sent to your email."); 
      } else {
        const data = await res.json();
        setError(data.error || "Invalid Email or could not send code.");
      }
    } catch (err) {
      setError("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (res.ok) {
        setStage("reset");
        setSuccessMessage("Code verified. Please set your new password."); 
      } else {
        const data = await res.json();
        setError(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setError("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (password !== confirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setSuccessMessage("Password successfully updated! Redirecting to login..."); 
        setTimeout(() => {
            router.push('/login');
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Could not update password.");
      }
    } catch (err) {
      setError("Network error. Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (stage) {
      case "email":
        return "Reset Your Password";
      case "code":
        return "Verify Code";
      case "reset":
        return "Set New Password";
      default:
        return "Forgot Password";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-20 px-4 sm:px-6">
      
      {/* Header/Logo part */}
      <div className="mb-6">
        <Link href="/" className="text-3xl font-bold tracking-widest text-gray-800">
          <span className="font-serif">CLOTING</span>
          <span className={`font-light ${textPink}`}>BRAND</span>
        </Link>
      </div>

      <div className="bg-white w-full max-w-lg sm:max-w-xl p-10 rounded-xl shadow-xl border border-gray-200 transition-all duration-300">

        <h2 className={`text-4xl font-serif font-light text-center mb-10 ${textPink}`}>{getTitle()}</h2>

        {/* --- Messages Section --- */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm font-medium flex items-center">
            <IoAlertCircleOutline className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className={`bg-[#f2e6e9] border border-[#f7c4d0] ${darkPinkText} px-4 py-3 rounded mb-6 text-sm font-medium flex items-center`}>
            <IoCheckmarkCircleOutline className="w-5 h-5 mr-3" />
            {successMessage}
          </div>
        )}
        
        {/* --- Form Section: Stage - Email --- */}
        {stage === "email" && (
          <form onSubmit={sendCode} className="space-y-8">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
                Email Address
              </label>
              {/* Email Icon position fixed: top-[42px] should center it relative to the input line */}
              <FiMail className={`absolute top-[42px] left-3 w-5 h-5 ${darkGray}`} /> 
              <input
                type="email"
                className={inputStyle}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={getButtonStyle(isLoading)}
            >
              {isLoading ? (
                  <span className="flex items-center justify-center">
                      <FiSend className="animate-spin mr-3" /> Sending Code...
                  </span>
              ) : (
                  "Send Reset Code"
              )}
            </button>
          </form>
        )}

        {/* --- Form Section: Stage - Code --- */}
        {stage === "code" && (
          <form onSubmit={verify} className="space-y-8">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
                Verification Code
              </label>
              <FiLock className={`absolute top-[42px] left-3 w-5 h-5 ${darkGray}`} />
              <input
                type="text"
                className={inputStyle}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={getButtonStyle(isLoading)}
            >
              {isLoading ? (
                   <span className="flex items-center justify-center">
                      <FiLock className="animate-spin mr-3" /> Verifying...
                  </span>
              ) : (
                  "Verify Code"
              )}
            </button>
            <div className="text-center text-sm pt-2">
                <button 
                    onClick={sendCode as any} 
                    disabled={isLoading}
                    type="button" 
                    className="text-gray-600 hover:text-gray-800 transition font-medium flex items-center justify-center w-full disabled:opacity-50"
                >
                    <FiSend className="mr-2" /> Resend Code
                </button>
            </div>
          </form>
        )}

        {/* --- Form Section: Stage - Reset --- */}
        {stage === "reset" && (
          <form onSubmit={resetPassword} className="space-y-8">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
                New Password
              </label>
              <FiLock className={`absolute top-[42px] left-3 w-5 h-5 ${darkGray}`} />
              <input
                type="password"
                className={inputStyle}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 uppercase mb-1 tracking-widest">
                Confirm New Password
              </label>
              <FiLock className={`absolute top-[42px] left-3 w-5 h-5 ${darkGray}`} />
              <input
                type="password"
                className={inputStyle}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={getButtonStyle(isLoading)}
            >
              {isLoading ? (
                  <span className="flex items-center justify-center">
                      <FiLock className="animate-spin mr-3" /> Updating...
                  </span>
              ) : (
                  "Update Password"
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link (Disabled when loading) */}
        <div className="text-center text-sm mt-10">
          <Link 
            href="/login" 
            className={`font-bold transition underline-offset-4 flex items-center justify-center ${
              isLoading 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:text-gray-800 hover:underline'
            }`}
            // Add a click handler to prevent navigation when loading
            onClick={(e) => isLoading && e.preventDefault()}
            aria-disabled={isLoading}
            tabIndex={isLoading ? -1 : 0}
          >
            <FiChevronLeft className="mr-1" /> Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}