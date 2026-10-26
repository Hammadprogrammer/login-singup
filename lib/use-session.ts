"use client";

import { useCallback, useEffect, useState } from "react";

export interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}

interface SessionState {
  loading: boolean;
  user: SessionUser | null;
  cartCount: number;
}

const listeners = new Set<() => void>();
/** Call after login/logout/cart changes so every subscriber refreshes. */
export function notifySessionChange() {
  listeners.forEach((l) => l());
}

export function useSession() {
  const [state, setState] = useState<SessionState>({ loading: true, user: null, cartCount: 0 });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check-token", { cache: "no-store" });
      if (!res.ok) {
        setState({ loading: false, user: null, cartCount: 0 });
        return;
      }
      const data = await res.json();
      let cartCount = 0;
      try {
        const cart = await fetch("/api/cart", { cache: "no-store" });
        if (cart.ok) {
          const items: { quantity: number }[] = await cart.json();
          cartCount = items.reduce((a, i) => a + i.quantity, 0);
        }
      } catch {}
      setState({ loading: false, user: data.user, cartCount });
    } catch {
      setState({ loading: false, user: null, cartCount: 0 });
    }
  }, []);

  useEffect(() => {
    refresh();
    listeners.add(refresh);
    return () => {
      listeners.delete(refresh);
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    notifySessionChange();
  }, []);

  return { ...state, refresh, logout };
}
