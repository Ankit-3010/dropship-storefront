import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CartItem, cartKey, Product } from '../api';

function loadCartFromStorage(): CartItem[] {
  try {
    const raw =
      localStorage.getItem(cartKey()) ||
      localStorage.getItem('bmai_cart') ||
      '[]';
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(cartKey(), JSON.stringify(items));
  } catch {
    /* private mode / quota */
  }
}

type CartContextValue = {
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  count: number;
  total: number;
  addProductToCart: (p: Product, opts?: { variantId?: string; qty?: number }) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItemsState] = useState<CartItem[]>(loadCartFromStorage);

  const setItems = useCallback((action: React.SetStateAction<CartItem[]>) => {
    setItemsState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveCartToStorage(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addProductToCart = useCallback((p: Product, opts?: { variantId?: string; qty?: number }) => {
    const qty = opts?.qty ?? 1;
    const variants = p.variants ?? [];
    const variant =
      variants.find((v) => v.id === opts?.variantId) ||
      variants.find((v) => v.inStock) ||
      variants[0];
    const variantId = variant?.id;
    const basePrice = Number(p.sellingPriceInr);
    const unitPrice = basePrice + Number(variant?.priceDeltaInr || 0);
    const title =
      variant?.name && variants.length > 1 ? `${p.title} (${variant.name})` : p.title;

    setItemsState((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === p.id && (i.variantId || '') === (variantId || ''),
      );
      let next: CartItem[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty, unitPrice, title };
      } else {
        next = [
          ...prev,
          {
            productId: p.id,
            variantId,
            slug: p.slug,
            title,
            qty,
            unitPrice,
            image: p.image,
          },
        ];
      }
      saveCartToStorage(next);
      return next;
    });
  }, []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, setItems, count, total, addProductToCart }),
    [items, setItems, count, total, addProductToCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
