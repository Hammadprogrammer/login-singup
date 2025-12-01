"use client";
import { useState } from "react";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      console.log("Response status:", res.status);

      const data = await res.json().catch(() => {
        console.log("Response not JSON");
        return null;
      });

      if (!res.ok) {
        console.error("Signup failed:", data);
        return;
      }

      console.log("Signup success:", data);
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button type="submit">Signup</button>
    </form>
  );
}
  