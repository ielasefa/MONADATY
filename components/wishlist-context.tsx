"use client";

import { createContext, useContext, useEffect, useState } from "react";

type WishlistContextType = {
  items: string[];
  hydrated: boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  contains: (id: string) => boolean;
  count: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("monadaty:wishlist");
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems([...new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0))]);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("monadaty:wishlist", JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  function add(id: string) {
    setItems((cur) => (cur.includes(id) ? cur : [...cur, id]));
  }

  function remove(id: string) {
    setItems((cur) => cur.filter((x) => x !== id));
  }

  function toggle(id: string) {
    setItems((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function contains(id: string) {
    return items.includes(id);
  }

  const value: WishlistContextType = {
    items,
    hydrated,
    add,
    remove,
    toggle,
    contains,
    count: items.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
