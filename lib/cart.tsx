"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// عنصر داخل السلة
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image: string;
  type: "physical" | "digital";
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number; // إجمالي عدد القطع
  subtotalCents: number;
  ready: boolean; // اتحمّلت من localStorage؟ (لتفادي اختلاف SSR)
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  // درج السلة (الواجهة)
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const STORAGE_KEY = "cart:v1";
const CartContext = createContext<CartContextValue | null>(null);

function clampQty(qty: number): number {
  const q = Math.floor(qty);
  if (Number.isNaN(q) || q < 1) return 1;
  return q;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  // تحميل من localStorage بعد أول render (client فقط)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // تجاهل — سلة فاضية
    }
    setReady(true);
  }, []);

  // حفظ عند أي تغيير (بعد التحميل الأولي)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // تجاهل — التخزين ممكن يكون ممتلئ/محظور
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, qty: clampQty(i.qty + qty) }
            : i
        );
      }
      return [...prev, { ...item, qty: clampQty(qty) }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, qty: clampQty(qty) } : i
      )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotalCents } = useMemo(() => {
    let count = 0;
    let subtotalCents = 0;
    for (const i of items) {
      count += i.qty;
      subtotalCents += i.qty * i.priceCents;
    }
    return { count, subtotalCents };
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotalCents,
    ready,
    add,
    remove,
    setQty,
    clear,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
