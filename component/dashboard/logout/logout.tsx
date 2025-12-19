"use client";

import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0f172a] border-b border-slate-800 shadow-xl">
      <div className="mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">

          {/* LEFT: Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-amber-500/10 rounded-lg hidden sm:flex">
              <LayoutDashboard className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
            </div>

            <h1 className="text-sm sm:text-lg md:text-2xl font-bold truncate">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                Admin Dashboard
              </span>
            </h1>
          </div>

          {/* RIGHT: Desktop Logout */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 bg-[#1e293b] hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 transition-all duration-300 text-slate-300 hover:text-red-400 px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">
                Logout
              </span>
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="sm:hidden bg-[#0f172a] border-t border-slate-800 px-4 py-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 border border-red-500/40 text-red-400 px-4 py-2 rounded-lg font-semibold"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
