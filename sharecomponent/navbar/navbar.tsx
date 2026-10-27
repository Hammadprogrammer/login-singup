"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, ChevronRight, LogOut, Package, ShieldCheck, LayoutDashboard } from "lucide-react";
import { SITE, CATEGORIES } from "@/lib/site";
import { useSession } from "@/lib/use-session";

const NAV = [
  ...CATEGORIES.map((c) => ({ label: c.name, href: `/${c.slug}` })),
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

function initials(name?: string | null, email?: string | null) {
  const src = (name || "").trim();
  if (src) {
    const parts = src.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.[0] || "?").toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartCount, loading, logout } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const tone = transparent ? "text-bone" : "text-ink";
  const avatar = user ? initials(user.name, user.email) : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        transparent ? "bg-transparent" : "bg-bone/95 backdrop-blur-md border-b border-bone-3 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.3)]"
      }`}
    >
      {/* Announcement */}
      <div className={`hidden lg:block h-8 leading-4 text-center eyebrow py-2 transition-colors ${transparent ? "bg-ink/40 text-bone/80" : "bg-ink text-bone/80"}`}>
        Complimentary shipping on orders over {SITE.currency === "USD" ? "$" : ""}{SITE.freeShippingOver} · Easy 14-day returns
      </div>

      <div className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 ${tone}`}>
        {/* Brand row */}
        <div className="relative flex items-center justify-between h-16 lg:h-[72px]">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <div className="hidden lg:block w-24" aria-hidden />

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none">
            <span className="font-serif text-2xl lg:text-[30px] tracking-[0.35em] font-medium">{SITE.name}</span>
            <span className={`eyebrow text-[8px] mt-1 ${transparent ? "text-brass-2" : "text-brass"}`}>Menswear</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 lg:w-24 lg:justify-end">
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                aria-label="Account"
                onClick={() => (user ? setAccountOpen((v) => !v) : router.push("/login"))}
                className="p-1.5 hover:text-brass transition-colors flex items-center"
              >
                {!loading && user ? (
                  <span
                    title={user.name || user.email}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold tracking-wider ring-1 transition-colors ${
                      transparent ? "bg-bone/15 ring-bone/40 text-bone" : "bg-ink ring-ink text-bone"
                    }`}
                  >
                    {avatar}
                  </span>
                ) : (
                  <User size={20} strokeWidth={1.5} />
                )}
              </button>
              {accountOpen && user && (
                <div className="absolute right-0 mt-3 w-64 card shadow-2xl text-ink p-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-bone-3 flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-ink text-bone flex items-center justify-center text-xs font-semibold shrink-0">{avatar}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name || "Customer"}</p>
                      <p className="text-xs text-stone truncate">{user.email}</p>
                    </div>
                  </div>
                  <ul className="py-1 text-sm">
                    {user.role === "ADMIN" && (
                      <li><Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-bone"><LayoutDashboard size={16} /> Admin panel</Link></li>
                    )}
                    <li><Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-bone"><Package size={16} /> Order history</Link></li>
                    <li><Link href="/kyc" className="flex items-center gap-3 px-4 py-2.5 hover:bg-bone"><ShieldCheck size={16} /> Identity verification</Link></li>
                    <li><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bone text-left"><LogOut size={16} /> Sign out</button></li>
                  </ul>
                </div>
              )}
            </div>

            <Link href="/cart" aria-label="Bag" className="relative p-2 hover:text-brass transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brass text-ink text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Nav row */}
        <nav className={`hidden lg:block h-10 border-t ${transparent ? "border-bone/15" : "border-bone-3"}`}>
          <ul className="flex items-center justify-center gap-10 h-full">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`link-underline text-[11px] uppercase tracking-[0.25em] font-medium ${
                    pathname.startsWith(n.href) ? "opacity-100" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside
          className={`absolute left-0 top-0 h-full w-[86%] max-w-sm bg-bone text-ink flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-bone-3">
            <span className="font-serif text-xl tracking-[0.35em]">{SITE.name}</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 -mr-2"><X size={22} strokeWidth={1.5} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <p className="eyebrow text-brass mb-4">Shop</p>
            <ul className="space-y-1">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="flex items-center justify-between py-3 font-serif text-2xl border-b border-bone-3">
                    {c.name} <ChevronRight size={18} className="text-stone" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow text-brass mt-8 mb-4">Company</p>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="block py-1">About us</Link></li>
              <li><Link href="/reviews" className="block py-1">Customer reviews</Link></li>
              <li><Link href="/contact" className="block py-1">Contact</Link></li>
            </ul>
          </nav>
          <div className="px-6 py-5 border-t border-bone-3 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-ink text-bone flex items-center justify-center text-xs font-semibold shrink-0">{avatar}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name || "Customer"}</p>
                    <p className="text-xs text-stone truncate">{user.email}</p>
                  </div>
                </div>
                {user.role === "ADMIN" && <Link href="/dashboard" className="btn-outline w-full">Admin panel</Link>}
                <Link href="/orders" className="btn-ink w-full">Order history</Link>
                <Link href="/kyc" className="btn-outline w-full">Identity verification</Link>
                <button onClick={handleLogout} className="btn-ghost w-full justify-center">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ink w-full">Sign in</Link>
                <Link href="/signup" className="btn-outline w-full">Create account</Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
