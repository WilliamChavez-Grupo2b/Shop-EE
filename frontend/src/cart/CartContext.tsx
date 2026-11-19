import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { Product } from '../types';

export interface CartItem { product: Product; quantity: number; }

interface CartCtx {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartCtx>(() => ({
    items,
    add: (p, qty = 1) =>
      setItems((prev) => {
        const found = prev.find((i) => i.product.id === p.id);
        if (found) {
          return prev.map((i) =>
            i.product.id === p.id ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [...prev, { product: p, quantity: qty }];
      }),
    remove: (id) => setItems((prev) => prev.filter((i) => i.product.id !== id)),
    clear: () => setItems([]),
    total: items.reduce((sum, i) => sum + Number(i.product.value) * i.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
