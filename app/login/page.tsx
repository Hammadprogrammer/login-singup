"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.redirect) {
      router.push(data.redirect);
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-xl space-y-4"
    >
      <h2 className="text-xl font-semibold text-center mb-4">
        Login to your account
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded focus:outline-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded focus:outline-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
        Login
      </button>
    </form>
  );
}
