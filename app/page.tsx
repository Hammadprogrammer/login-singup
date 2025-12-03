"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <motion.form
      onSubmit={handleSignup}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-md mx-auto p-8 rounded-2xl shadow-xl bg-white space-y-6 border border-gray-200"
    >
      <h1 className="text-2xl font-semibold text-center text-gray-900">Create Account</h1>

      {/* INPUT COMPONENT */}
      <div className="space-y-6">
        {/* First Name */}
        <div className="relative">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder=" "
            className="peer w-full border-b-2 border-gray-400 focus:border-black outline-none bg-transparent py-3 text-black placeholder-transparent"
          />
          <label
            className="absolute left-0 top-3 text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black"
          >
            First Name
          </label>
        </div>

        {/* Last Name */}
        <div className="relative">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder=" "
            className="peer w-full border-b-2 border-gray-400 focus:border-black outline-none bg-transparent py-3 text-black placeholder-transparent"
          />
          <label
            className="absolute left-0 top-3 text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black"
          >
            Last Name
          </label>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            type="email"
            className="peer w-full border-b-2 border-gray-400 focus:border-black outline-none bg-transparent py-3 text-black placeholder-transparent"
          />
          <label
            className="absolute left-0 top-3 text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black"
          >
            Email Address
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            type="password"
            className="peer w-full border-b-2 border-gray-400 focus:border-black outline-none bg-transparent py-3 text-black placeholder-transparent"
          />
          <label
            className="absolute left-0 top-3 text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black"
          >
            Password
          </label>
        </div>
      </div>

      {/* BUTTON */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl bg-black text-white font-medium shadow-lg hover:shadow-2xl transition-all"
      >
        Sign Up
      </motion.button>
    </motion.form>
  );
}
