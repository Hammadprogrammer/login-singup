"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter hook for redirection

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State for errors and loading
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter(); // Initialize router for navigation

  // --- Design Constants (Pink Theme) ---
  const primaryPink = '#e58e9f'; 
  const buttonPink = '#eeb8c3'; 

  // --- Validation Logic ---
  const validate = () => {
    // Existing validation logic...
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form Submission Handler ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      console.log(data);
      
      if (res.ok) {
        // Successful signup, redirect to login page
        router.push('/login'); 

      } else {
        // --- Specific Error Handling for User Exists ---
        
        const errorMessage = data.message || "Signup failed. Please try again.";

        // Check if the error indicates a duplicate email (assuming API returns relevant message or status)
        if (errorMessage.toLowerCase().includes("email already exist") || errorMessage.toLowerCase().includes("duplicate") || res.status === 409) {
          // Set error specifically for the email field
          setErrors({ email: "Email is already registered. Please log in." });
        } else {
          // General errors (e.g., server error)
          setErrors({ general: errorMessage });
        }
      }

    } catch (error) {
      console.error("Signup fetch error:", error);
      setErrors({ general: "A network error occurred. Check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Styling Classes ---
  const inputBaseStyle = "peer w-full border border-gray-400 focus:border-black outline-none bg-white py-3 px-3 text-gray-800 transition duration-300 rounded-none";
  const labelBaseStyle = "block text-sm font-medium text-gray-700 mb-1";
  const errorTextStyle = "text-xs text-red-500 mt-1";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <motion.form
            onSubmit={handleSignup}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md mx-auto p-8 rounded-lg shadow-xl bg-white space-y-6"
        >
            {/* HEADER */}
            <h1 
                className="text-3xl font-serif text-center mb-6"
                style={{ color: primaryPink }}
            >
                Create Account
            </h1>

            {/* General Error Message Display (for non-field specific errors) */}
            {errors.general && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-center text-sm font-medium">
                    {errors.general}
                </div>
            )}

            {/* INPUT FIELDS */}
            <div className="space-y-4">
                {/* First Name & Last Name */}
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label htmlFor="firstName" className={labelBaseStyle}>First Name</label>
                        <input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => { setFirstName(e.target.value); setErrors(prev => ({ ...prev, firstName: '', general: '' })); }}
                            type="text"
                            className={`${inputBaseStyle} ${errors.firstName ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                        />
                        {errors.firstName && <p className={errorTextStyle}>{errors.firstName}</p>}
                    </div>

                    <div className="flex-1">
                        <label htmlFor="lastName" className={labelBaseStyle}>Last Name</label>
                        <input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => { setLastName(e.target.value); setErrors(prev => ({ ...prev, lastName: '', general: '' })); }}
                            type="text"
                            className={`${inputBaseStyle} ${errors.lastName ? 'border-red-500' : ''}`}
                            disabled={isLoading}
                        />
                        {errors.lastName && <p className={errorTextStyle}>{errors.lastName}</p>}
                    </div>
                </div>

                {/* Email (Updated to handle unique email check error) */}
                <div>
                    <label htmlFor="email" className={labelBaseStyle}>Email Address</label>
                    <input
                        id="email"
                        value={email}
                        onChange={(e) => { 
                            setEmail(e.target.value); 
                            // Clear email-specific and general errors on change
                            setErrors(prev => ({ ...prev, email: '', general: '' })); 
                        }}
                        type="email"
                        className={`${inputBaseStyle} ${errors.email ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                    />
                    {/* Error shown directly below the input field */}
                    {errors.email && <p className={errorTextStyle}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className={labelBaseStyle}>Password</label>
                    <input
                        id="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '', general: '' })); }}
                        type="password"
                        className={`${inputBaseStyle} ${errors.password ? 'border-red-500' : ''}`}
                        disabled={isLoading}
                    />
                    {errors.password && <p className={errorTextStyle}>{errors.password}</p>}
                </div>
            </div>

            {/* BUTTON */}
            <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-lg text-white font-medium shadow-md transition-all uppercase tracking-wider mt-6 disabled:opacity-50"
                style={{ backgroundColor: buttonPink }}
                disabled={isLoading}
            >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
            </motion.button>
    <motion.button
  type="button"
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  onClick={() => {
    window.location.href = "/api/auth/google";
  }}
  disabled={isLoading}
  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg 
             border shadow-md transition-all font-medium 
             disabled:opacity-50 disabled:cursor-not-allowed "
  style={{
    color: "black",
    backgroundColor: "#fff",
  }}
>
  <img src="/google.png" className="w-5 h-5" alt="Google" />
  Continue with Google
</motion.button>

            {/* Login Link */}
            <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/login" className="font-bold hover:underline" style={{ color: primaryPink }}>
                    Log In
                </Link>
            </div>
        </motion.form>
    </div>
  );
}