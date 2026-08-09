"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/types";
import { formatMoney, parseMoney } from "@/lib/money";
import { useTranslation } from "@/hooks/useTranslation";
import { resolveDatabaseProductImage } from "@/lib/product-images";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: string;
  category: Product["category"];
  brand?: string;
  collection?: string;
  // Use explicit visual union instead of depending on Product type here to keep the cart model stable
  visual?: "can" | "bottle" | "glass";
  accent?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  isDrawerOpen: boolean;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  toastMessage: string | null;
};

const STORAGE_KEY = "monadaty-cart";

const CartDrawer = dynamic(() => import("@/components/CartDrawer").then((mod) => mod.CartDrawer), {
  ssr: false,
});

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { t } = useTranslation("products");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);

    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart) as CartItem[];
        // Backfill slug for legacy carts stored before the slug field existed
        setItems(parsed.map((item) => ({ ...item, slug: item.slug ?? "" })));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hasMounted, items]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => formatMoney(items.reduce((total, item) => total + parseMoney(item.price) * item.quantity, 0)),
    [items],
  );

  function addItem(product: Product, quantity: number) {
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.min(Math.floor(quantity), 99) : 1;

    // Stock validation: never allow adding more than available stock.
    const availableStock = typeof product.stock === "number" ? product.stock : Number.POSITIVE_INFINITY;
    const isAvailable = typeof product.available === "boolean" ? product.available : true;

    if (!isAvailable || availableStock <= 0) {
      setToastMessage(t("out_of_stock", "Out of stock"));
      return;
    }

    const currentInCart =
      items.find((item) => item.id === product.id)?.quantity ?? 0;

    if (currentInCart + safeQuantity > availableStock) {
      setToastMessage(t("product_unavailable", "This product is unavailable"));
      return;
    }

    const resolvedImage = resolveDatabaseProductImage(product);

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                image: resolvedImage,
                brand: product.brand,
                collection: product.collection,
                visual: product.visual,
                accent: product.accent,
                category: product.category,
                quantity: Math.min(item.quantity + safeQuantity, 99),
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          slug: product.slug ?? product.id,
          image: resolvedImage,
          brand: product.brand,
          collection: product.collection,
          // Coerce visual into the explicit cart union; leave undefined if not present
          visual: (product.visual as "can" | "bottle" | "glass") ?? undefined,
          accent: product.accent ?? undefined,
          price: product.price,
          category: product.category,
          quantity: safeQuantity,
        },
      ];
    });

    setDrawerOpen(true);
    setToastMessage(t("added_to_box", "{name} added to box").replace("{name}", product.name));
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== id) return item;
          if (!Number.isFinite(quantity) || quantity <= 0) return { ...item, quantity: 0 };
          return { ...item, quantity: Math.min(Math.floor(quantity), 99) };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    setToastMessage(t("item_removed", "Item removed from box"));
  }

  function clearCart() {
    setItems([]);
    setDrawerOpen(false);
  }

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    isDrawerOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    toggleDrawer: () => setDrawerOpen((currentOpen) => !currentOpen),
    toastMessage,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-6 left-1/2 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 rounded-md border border-ivory/[0.06] bg-black-surface px-5 py-3 text-sm text-ivory shadow-2xl backdrop-blur-xl animate-fade-in"
        >
          {toastMessage}
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
