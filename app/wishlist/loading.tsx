export default function WishlistLoading() {
  return (
    <div className="wishlist-page bg-canvas" role="status" aria-busy="true" aria-label="Loading favorites">
      <section className="wishlist-heading">
        <div className="storefront-container wishlist-intro">
          <div className="wishlist-loading-line" style={{ width: 120, marginTop: 0 }} />
          <div className="wishlist-loading-line wishlist-loading-line-wide" style={{ width: 280, height: 38, marginTop: 10 }} />
          <div className="wishlist-loading-line" style={{ width: "min(100%, 560px)", height: 16, marginTop: 10 }} />
        </div>
      </section>
      <section className="wishlist-content">
        <div className="storefront-container">
          <div className="wishlist-loading-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="wishlist-loading-card" key={index}>
                <div className="wishlist-loading-image" />
                <div className="wishlist-loading-line wishlist-loading-line-wide" />
                <div className="wishlist-loading-line" />
                <div className="wishlist-loading-button" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
