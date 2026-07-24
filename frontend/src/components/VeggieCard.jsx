import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const VeggieCard = ({ veg }) => {
  const { addItem, requireLogin } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const wished = isWishlisted(veg.id);
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    if (outOfStock) return;
    if (!requireLogin()) return;
    addItem(veg);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discount = veg.originalPrice
    ? Math.round(((veg.originalPrice - veg.price) / veg.originalPrice) * 100)
    : null;

  const outOfStock = !veg.inStock;
  const lowStock = !outOfStock && veg.stockQty != null && veg.stockQty <= 5;

  return (
    <div className="card group relative overflow-hidden">
      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(veg.id); }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          wished ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <svg className={`w-4 h-4 transition-colors ${wished ? "text-red-500 fill-current" : "text-bark/40"}`} fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Badge */}
      {veg.badge && (
        <span className={`absolute top-3 left-3 z-10 tag text-white ${veg.badgeColor}`}>
          {veg.badge}
        </span>
      )}

      {/* Image area */}
      <Link to={`/vegetable/${veg.slug}`}>
        <div className="h-48 bg-gradient-to-br from-leaf-50 to-leaf-100 flex items-center justify-center overflow-hidden relative">
          {!imageError && veg.image ? (
            <img
              src={veg.image}
              alt={veg.name}
              onError={() => setImageError(true)}
              className={`h-40 w-40 object-cover rounded-xl group-hover:scale-108 transition-transform duration-500 ${outOfStock ? "grayscale opacity-60" : ""}`}
              style={{ objectFit: "cover", borderRadius: "12px" }}
            />
          ) : (
            <img src="/images/placeholder.svg" alt="placeholder" className={`h-40 w-40 object-cover rounded-xl ${outOfStock ? "grayscale opacity-60" : ""}`} />
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-bark/40 flex items-center justify-center">
              <span className="bg-white/95 text-red-500 text-xs font-body font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-body font-semibold text-leaf-500 uppercase tracking-widest mb-0.5">{veg.category}</p>
        <Link to={`/vegetable/${veg.slug}`}>
          <h3 className="font-display font-bold text-bark text-base leading-tight mb-1 hover:text-leaf-700 transition">{veg.name}</h3>
        </Link>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(veg.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] font-body bg-leaf-50 text-leaf-700 px-2 py-0.5 rounded-full border border-leaf-100">
              {t}
            </span>
          ))}
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(veg.rating) ? "text-soil-400 fill-current" : "text-bark/10"}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] font-body text-bark/40">({veg.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-bold text-leaf-700 text-lg">Rs {veg.price.toFixed(2)}</span>
              {veg.originalPrice && (
                <span className="text-bark/30 text-xs font-body line-through">Rs {veg.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <p className="text-[10px] font-body text-bark/40">per {veg.unit}</p>
            {outOfStock ? (
              <p className="text-[10px] font-body text-red-500 font-semibold mt-0.5">Out of stock</p>
            ) : veg.stockQty != null && (
              <p className={`text-[10px] font-body mt-0.5 ${lowStock ? "text-soil-500 font-semibold" : "text-bark/40"}`}>
                {lowStock ? `Only ${veg.stockQty} left` : `${veg.stockQty} in stock`}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all duration-300 ${
              outOfStock
                ? "bg-bark/10 text-bark/30 cursor-not-allowed"
                : added
                ? "bg-leaf-100 text-leaf-700 scale-95"
                : "bg-leaf-600 text-white hover:bg-leaf-700 hover:scale-105 shadow-sm"
            }`}
          >
            {outOfStock ? "Out of Stock" : added ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VeggieCard;
