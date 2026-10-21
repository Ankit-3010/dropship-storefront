import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ComponentProps, useEffect, useMemo, useState } from 'react';
import {
  checkout,
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchProfile,
  fetchSettings,
  Product,
} from './api';
import { useCart } from './hooks/useCart';
import { ProductGridSkeleton, ProductPageSkeleton } from './components/Skeletons';
import {
  captureWhatsAppContextFromUrl,
  formatPhoneDisplay,
  getWaMobile,
  getWaName,
  getWaRef,
  withWaQuery,
} from './lib/waContext';

const CAT_ICONS: Record<string, string> = {
  All: '🛍️',
  'T-Shirts': '👕',
  Hoodies: '🧥',
  Accessories: '🎒',
};

function WaLink({ to, className, children, ...rest }: ComponentProps<typeof Link>) {
  return (
    <Link to={withWaQuery(to)} className={className} {...rest}>
      {children}
    </Link>
  );
}

function StoreHeader({
  search,
  onSearch,
  cartCount,
  businessName,
}: {
  search: string;
  onSearch: (v: string) => void;
  cartCount: number;
  businessName: string;
}) {
  return (
    <header className="store-top">
      <div className="store-logo" title={businessName}>{businessName || '…'}</div>
      <div className="store-top-actions">
        <WaLink to="/profile" className="icon-btn" aria-label="Profile">👤</WaLink>
        <WaLink to="/cart" className="icon-btn" aria-label="Cart">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </WaLink>
      </div>
      <div className="search-wrap">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search"
        />
      </div>
    </header>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const variantCount = product.variants?.length ?? product.variantCount ?? 0;
  const sizeLabel = product.variants?.[0]?.name;
  const options = variantCount > 1 ? `${variantCount} sizes` : null;

  return (
    <article className="product-card">
      <WaLink to={`/p/${product.slug}`} className="product-card-link">
        <div className={`product-media ${!product.inStock ? 'out-of-stock' : ''}`}>
          {product.image ? <img src={product.image} alt="" /> : <div className="img-placeholder" />}
          {sizeLabel && <span className="variant-tag">{sizeLabel}</span>}
          {!product.inStock && <div className="oos-badge">Out of stock</div>}
        </div>
        <div className="product-body">
          <span className="cat-label">{product.category}</span>
          <h3>{product.title}</h3>
          <p className="price">₹{product.sellingPriceInr}</p>
          <p className="desc">{product.description}</p>
          <span className={`stock-pill ${product.inStock ? 'in' : 'out'}`}>
            {product.inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </WaLink>
      <div className="add-btn-wrap card-add">
        {product.inStock && variantCount > 1 ? (
          <WaLink to={`/p/${product.slug}`} className="btn-add" style={{ textAlign: 'center' }}>
            CHOOSE
          </WaLink>
        ) : (
          <button
            type="button"
            className="btn-add"
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd(product);
            }}
          >
            ADD
          </button>
        )}
        {options && product.inStock && <div className="options-hint">{options}</div>}
      </div>
    </article>
  );
}

function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const { count, addProductToCart } = useCart();

  useEffect(() => {
    fetchSettings().then((s) => setBusinessName(s.businessName)).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchProducts({ category, q: search })
        .then(setProducts)
        .catch((e) => setErr(String(e)))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [category, search]);

  const recommended = useMemo(() => products.filter((p) => p.inStock).slice(0, 6), [products]);

  const addProduct = (p: Product) => {
    if (!p.inStock) return;
    const vc = p.variants?.length ?? p.variantCount ?? 0;
    if (vc > 1) return;
    if (vc > 0 && !p.variants.some((v) => v.inStock)) return;
    addProductToCart(p);
    setToast(`Added ${p.title}`);
    window.setTimeout(() => setToast(''), 2000);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const c = p.category || 'All';
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(p);
    }
    return map;
  }, [products]);

  const sections =
    category === 'All' ? [...grouped.entries()] : [[category, products] as [string, Product[]]];

  return (
    <div className="store-shell">
      <StoreHeader
        businessName={businessName}
        search={search}
        onSearch={setSearch}
        cartCount={count}
      />
      {toast && <div className="cart-toast" role="status">{toast}</div>}
      <div className="store-body">
        <nav className="category-rail" aria-label="Categories">
          {['All', ...categories.filter((c) => c !== 'All')].map((c) => (
            <button
              key={c}
              type="button"
              className={`cat-item ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              <span className="cat-icon">{CAT_ICONS[c] || '📦'}</span>
              <span className="cat-label-text">{c}</span>
            </button>
          ))}
        </nav>
        <main className="catalog-main">
          {err && <p className="err">{err}</p>}
          {recommended.length > 0 && category === 'All' && !search && (
            <>
              <h2 className="section-head">Recommended</h2>
              <div className="recommended">
                {recommended.map((p) => (
                  <WaLink key={p.id} to={`/p/${p.slug}`} className="rec-card">
                    {p.image && <img src={p.image} alt="" />}
                    <p>{p.title}</p>
                  </WaLink>
                ))}
              </div>
            </>
          )}
          {loading && products.length === 0 && !err && <ProductGridSkeleton />}
          {!loading &&
            sections.map(([cat, list]) => (
              <section key={cat}>
                <h2 className="section-head">{cat}</h2>
                {list.length === 0 ? (
                  <p className="empty">No items in this category.</p>
                ) : (
                  <div className="product-grid">
                    {list.map((p) => (
                      <ProductCard key={p.id} product={p} onAdd={addProduct} />
                    ))}
                  </div>
                )}
              </section>
            ))}
        </main>
      </div>
    </div>
  );
}

function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [p, setP] = useState<(Product & { images: string[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [variantId, setVariantId] = useState('');
  const [qty, setQty] = useState(1);
  const { addProductToCart } = useCart();
  const nav = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProduct(slug)
      .then((prod) => {
        setP(prod);
        setImageIdx(0);
        const firstInStock = prod.variants.find((v) => v.inStock);
        setVariantId(firstInStock?.id || prod.variants[0]?.id || '');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !p) return <ProductPageSkeleton />;

  const variant = p.variants.find((v) => v.id === variantId);
  const unit = Number(p.sellingPriceInr) + Number(variant?.priceDeltaInr || 0);
  const maxQty = variant ? Math.min(20, variant.stockQuantity) : 20;
  const canAdd =
    p.inStock && (p.variants.length === 0 || (variant?.inStock && variant.stockQuantity >= qty));

  const add = () => {
    if (!canAdd) return;
    addProductToCart(p, { variantId: variantId || undefined, qty });
    nav(withWaQuery('/cart'));
  };

  const hero = p.images[imageIdx] || p.images[0];

  return (
    <div className="page-narrow">
      <WaLink to="/" className="page-back">← Shop</WaLink>
      {hero && <img className="hero-img" src={hero} alt="" loading="lazy" />}
      {p.images.length > 1 && (
        <div className="gallery-thumbs">
          {p.images.map((url, i) => (
            <button
              key={url}
              type="button"
              className={i === imageIdx ? 'active' : ''}
              onClick={() => setImageIdx(i)}
            >
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <span className="cat-label">{p.category}</span>
      <h2>{p.title}</h2>
      <p className="desc">{p.description}</p>
      <p className="price">₹{unit}</p>
      <span className={`stock-pill ${p.inStock ? 'in' : 'out'}`}>
        {p.inStock ? 'In stock' : 'Out of stock'}
      </span>
      <p className="desc">{p.deliveryEstimateText}</p>
      {p.variants.length > 0 && (
        <div>
          <div className="desc" style={{ fontWeight: 600, marginBottom: 4 }}>Size</div>
          <div className="variant-pills">
            {p.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`variant-pill ${variantId === v.id ? 'active' : ''}`}
                disabled={!v.inStock}
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="qty-stepper" aria-label="Quantity">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
        <span>{qty}</span>
        <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase">+</button>
      </div>
      <div className="product-detail-actions">
        <button className="btn-primary" type="button" onClick={add} disabled={!canAdd}>
          Add to cart — ₹{unit * qty}
        </button>
      </div>
    </div>
  );
}

function CartPage() {
  const { items, setItems, total } = useCart();
  return (
    <div className="page-narrow">
      <WaLink to="/" className="page-back">← Shop</WaLink>
      <h2>Your cart</h2>
      {items.length === 0 ? (
        <p className="empty">Cart is empty.</p>
      ) : (
        <>
          {items.map((i, idx) => (
            <div key={`${i.productId}-${i.variantId || 'x'}-${idx}`} className="cart-line">
              <div>
                <strong>{i.title}</strong>
                <div className="desc">× {i.qty} — ₹{i.unitPrice * i.qty}</div>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((_, j) => j !== idx))}
              >
                Remove
              </button>
            </div>
          ))}
          <p className="price">Total: ₹{total}</p>
          <WaLink to="/checkout" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
            Checkout (COD)
          </WaLink>
        </>
      )}
    </div>
  );
}

function CheckoutPage() {
  const { items, setItems, total } = useCart();
  const waPhone = getWaMobile() || '';
  const waName = getWaName() || '';
  const [form, setForm] = useState({
    phone: waPhone,
    fullName: waName,
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await checkout({
        ...form,
        conversationId: getWaRef(),
        idempotencyKey: `checkout-${Date.now()}`,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          qty: i.qty,
        })),
      });
      setDone(result.orderNumber);
      setItems([]);
    } catch (err) {
      setError(String(err));
    }
  };

  if (done) {
    return (
      <div className="page-narrow success-page">
        <h2>Order placed!</h2>
        <p>Order <strong>{done}</strong></p>
        <p className="desc">Pay on delivery. Check WhatsApp for confirmation.</p>
        <WaLink to="/profile" className="btn-primary" style={{ display: 'block' }}>View orders</WaLink>
      </div>
    );
  }

  const labels: Record<string, string> = {
    fullName: 'Full name',
    phone: 'Phone',
    line1: 'Address line 1',
    line2: 'Address line 2',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
  };

  return (
    <div className="page-narrow">
      <WaLink to="/cart" className="page-back">← Cart</WaLink>
      <h2>Checkout — COD</h2>
      <p className="desc">Order total: ₹{total}</p>
      {!waPhone && (
        <p className="err">Open the shop from WhatsApp so we can link your number.</p>
      )}
      <form className="form" onSubmit={submit}>
        {(['fullName', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'] as const).map((k) => (
          <label key={k}>
            {labels[k]}
            <input
              required={k !== 'line2'}
              readOnly={waPhone && (k === 'phone' || (k === 'fullName' && !!waName))}
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              placeholder={k === 'phone' ? '919876543210' : ''}
            />
          </label>
        ))}
        {error && <p className="err">{error}</p>}
        <button className="btn-primary" type="submit" disabled={items.length === 0 || !waPhone}>
          Place order
        </button>
      </form>
    </div>
  );
}

function ProfilePage() {
  const phone = getWaMobile();
  const nameFromWa = getWaName();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof fetchProfile>> | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!phone) return;
    setErr('');
    fetchProfile(phone.replace(/\D/g, ''))
      .then(setProfile)
      .catch((e) => setErr(String(e)));
  }, [phone]);

  if (!phone) {
    return (
      <div className="page-narrow">
        <WaLink to="/" className="page-back">← Shop</WaLink>
        <h2>My profile</h2>
        <p className="empty">Open the store from WhatsApp to see your profile and orders.</p>
      </div>
    );
  }

  const displayName = profile?.name || nameFromWa || 'Customer';

  return (
    <div className="page-narrow">
      <WaLink to="/" className="page-back">← Shop</WaLink>
      <h2>My profile</h2>
      {err && <p className="err">{err}</p>}
      <div className="profile-banner">
        <div className="profile-avatar">👤</div>
        <div className="profile-name">{displayName}</div>
        <div className="profile-phone">{formatPhoneDisplay(phone)}</div>
      </div>
      <h3>Previous orders</h3>
      {!profile ? (
        <p className="desc">Loading orders…</p>
      ) : profile.orders.length === 0 ? (
        <p className="empty">No orders yet.</p>
      ) : (
        profile.orders.map((o) => (
          <div key={o.id} className="order-card">
            <div className="order-card-head">
              <div>
                <div className="order-id">Order #{o.orderNumber.replace('ORD-', '')}</div>
                <div className="desc">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <div className="order-meta">
                <div className="price">₹{o.totalInr.toFixed(2)}</div>
                <span className="status-pill">{o.status.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="desc order-items">
              {o.items.map((i) => `${i.title}${i.variant ? ` (${i.variant})` : ''} ×${i.qty}`).join(' · ')}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    captureWhatsAppContextFromUrl();
  }, []);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s.businessName) document.title = s.businessName;
      })
      .catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/p/:slug" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
