export function ProductCardSkeleton() {
  return (
    <article className="product-card skeleton-card">
      <div className="skeleton-block product-media-skel" />
      <div className="product-body">
        <div className="skeleton-line w-30" />
        <div className="skeleton-line w-80" />
        <div className="skeleton-line w-40" />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="page-narrow">
      <div className="skeleton-line w-30" style={{ marginBottom: 12 }} />
      <div className="skeleton-block hero-skel" />
      <div className="skeleton-line w-20" style={{ marginTop: 12 }} />
      <div className="skeleton-line w-70" style={{ marginTop: 8 }} />
      <div className="skeleton-line w-100" />
      <div className="skeleton-line w-40" style={{ marginTop: 12 }} />
    </div>
  );
}
