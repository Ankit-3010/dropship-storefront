const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:4000');

export type ProductVariant = {
  id: string;
  name: string;
  stockQuantity: number;
  inStock: boolean;
  priceDeltaInr: number;
};

export type Product = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  status: string;
  inStock: boolean;
  sellingPriceInr: number;
  stockQuantity: number;
  deliveryEstimateText: string;
  image?: string;
  variantCount: number;
  variants: ProductVariant[];
};

export type StoreSettings = { businessName: string };

export type ProfileOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalInr: number;
  createdAt: string;
  itemCount: number;
  items: { title: string; variant: string | null; qty: number; unitPriceInr: number }[];
};

export type Profile = {
  name: string | null;
  phone: string;
  orders: ProfileOrder[];
};

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API}/store/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API}/store/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  const data = await res.json();
  return data.categories as string[];
}

export async function fetchProducts(opts?: {
  category?: string;
  q?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (opts?.category && opts.category !== 'All') params.set('category', opts.category);
  if (opts?.q) params.set('q', opts.q);
  const qs = params.toString();
  const res = await fetch(`${API}/store/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProduct(slug: string): Promise<Product & { images: string[] }> {
  const res = await fetch(`${API}/store/products/${slug}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function fetchProfile(phone: string): Promise<Profile> {
  const res = await fetch(`${API}/store/profile?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function checkout(body: Record<string, unknown>) {
  const res = await fetch(`${API}/store/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data.error) || 'Checkout failed');
  return data;
}

export function getRefFromUrl(): string | undefined {
  return new URLSearchParams(window.location.search).get('ref') || undefined;
}

export function getMobileFromUrl(): string | undefined {
  return new URLSearchParams(window.location.search).get('mobile') || undefined;
}

export function getNameFromUrl(): string | undefined {
  return new URLSearchParams(window.location.search).get('name') || undefined;
}

export function cartKey() {
  return 'shop_cart';
}

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  title: string;
  qty: number;
  unitPrice: number;
  image?: string;
};
