import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { normalizeVeg } from "../utils/normalizeVeg";
import VeggieCard from "../components/VeggieCard";

const StarRow = ({ value, size = "w-4 h-4", onRate }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        onClick={onRate ? () => onRate(s) : undefined}
        className={`${size} ${onRate ? "cursor-pointer" : ""} ${s <= Math.round(value) ? "text-soil-400 fill-current" : "text-bark/10"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const VeggieDetailPage = () => {
  const { slug } = useParams();
  const { addItem, requireLogin, user } = useCart();

  const [veg, setVeg] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("description");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setQty(1);
    axios.get(`/api/vegetable/${slug}`)
      .then(({ data }) => {
        if (cancelled) return;
        if (!data.success) { setNotFound(true); return; }
        setVeg(normalizeVeg(data.vegetable));
        setRelated((data.related || []).map((r) => ({ ...normalizeVeg(r), category: data.vegetable.category })));
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const fetchReviews = (vegetableId) => {
    setReviewsLoading(true);
    axios.get(`/api/review/${vegetableId}`)
      .then(({ data }) => { if (data.success) setReviews(data.reviews); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    if (veg?.id) fetchReviews(veg.id);
  }, [veg?.id]);

  const myExistingReview = user ? reviews.find((r) => r.user_id === user.id) : null;

  useEffect(() => {
    if (myExistingReview) {
      setMyRating(myExistingReview.rating);
      setMyComment(myExistingReview.comment || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myExistingReview?.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    setSubmittingReview(true);
    try {
      const { data } = await axios.post("/api/review/add", {
        vegetableId: veg.id,
        rating: myRating,
        comment: myComment,
      });
      if (!data.success) throw new Error(data.message || "Failed to submit review");
      setReviews(data.reviews);
      setMyComment("");
      toast.success("Thanks for your review!");
      // Refresh the vegetable so the header star rating reflects the new average.
      axios.get(`/api/vegetable/${slug}`).then(({ data }) => {
        if (data.success) setVeg(normalizeVeg(data.vegetable));
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (notFound) return <Navigate to="/shop" replace />;
  if (loading || !veg) {
    return (
      <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
        <p className="font-body text-bark/40 text-sm">Loading vegetable…</p>
      </div>
    );
  }

  const discount = veg.originalPrice ? Math.round(((veg.originalPrice - veg.price) / veg.originalPrice) * 100) : null;
  const outOfStock = !veg.inStock;
  const lowStock = !outOfStock && veg.stockQty != null && veg.stockQty <= 5;

  const handleAdd = () => {
    if (outOfStock) return;
    if (!requireLogin()) return;
    addItem(veg, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-cream min-h-screen pt-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <p className="font-body text-xs text-bark/40">
          <Link to="/" className="hover:text-leaf-600 transition">Home</Link>
          {" "}&rsaquo;{" "}
          <Link to="/shop" className="hover:text-leaf-600 transition">Shop</Link>
          {" "}&rsaquo;{" "}
          <span className="text-bark">{veg.name}</span>
        </p>
      </div>

      {/* Main product */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-3xl border border-leaf-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-gradient-to-br from-leaf-50 to-leaf-100 flex items-center justify-center p-12 min-h-80">
              <div className="relative">
                <img
                  src={veg.image}
                  alt={veg.name}
                  className="w-64 h-64 object-cover rounded-2xl shadow-xl"
                />
                {veg.organic ? (
                  <span className="absolute top-3 left-3 bg-leaf-600 text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                    🌿 Certified Organic
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 bg-soil-500 text-white text-xs font-body font-semibold px-3 py-1 rounded-full">
                    Non-Organic
                  </span>
                )}
                {discount && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-body font-bold px-3 py-1 rounded-full">
                    −{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-8 md:p-10">
              <p className="font-body text-xs font-semibold text-leaf-500 uppercase tracking-widest mb-2">{veg.category}</p>
              <h1 className="font-display font-bold text-bark text-3xl mb-3">{veg.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <StarRow value={veg.rating} />
                <span className="font-display font-bold text-bark text-sm">{veg.rating.toFixed(1)}</span>
                <span className="font-body text-xs text-bark/40">({veg.reviews} {veg.reviews === 1 ? "review" : "reviews"})</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {veg.tags.map((t) => (
                  <span key={t} className="bg-leaf-50 border border-leaf-200 text-leaf-700 text-xs font-body font-semibold px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display font-bold text-leaf-700 text-4xl">Rs {veg.price.toFixed(2)}</span>
                {veg.originalPrice && (
                  <span className="text-bark/30 text-lg font-body line-through">Rs {veg.originalPrice.toFixed(2)}</span>
                )}
                <span className="font-body text-bark/40 text-sm">/ {veg.unit}</span>
              </div>

              {/* Stock status */}
              {outOfStock ? (
                <p className="font-body text-sm font-semibold text-red-500 mb-6">Out of stock</p>
              ) : veg.stockQty != null ? (
                <p className={`font-body text-sm font-semibold mb-6 ${lowStock ? "text-soil-500" : "text-leaf-600"}`}>
                  {lowStock ? `Only ${veg.stockQty} left in stock` : `${veg.stockQty} in stock`}
                </p>
              ) : (
                <div className="mb-6" />
              )}

              <p className="font-body text-bark/60 text-sm leading-relaxed mb-7">{veg.description}</p>

              {/* Qty + Add */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center border border-leaf-200 rounded-full overflow-hidden ${outOfStock ? "opacity-40 pointer-events-none" : ""}`}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 text-leaf-700 hover:bg-leaf-50 transition font-bold text-lg">−</button>
                  <span className="w-10 text-center font-display font-bold text-bark">{qty}</span>
                  <button
                    onClick={() => setQty((q) => (veg.stockQty != null ? Math.min(q + 1, veg.stockQty) : q + 1))}
                    disabled={veg.stockQty != null && qty >= veg.stockQty}
                    className="w-10 h-10 text-leaf-700 hover:bg-leaf-50 transition font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >+</button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className={`flex-1 py-3 rounded-full font-body font-bold text-sm transition-all duration-300 ${
                    outOfStock
                      ? "bg-bark/10 text-bark/30 cursor-not-allowed"
                      : added ? "bg-leaf-100 text-leaf-700" : "bg-leaf-600 text-white hover:bg-leaf-700 shadow-sm hover:shadow-md"
                  }`}
                >
                  {outOfStock ? "Out of Stock" : added ? "✓ Added to Basket" : `Add ${qty > 1 ? `(${qty}) ` : ""}to Basket`}
                </button>
              </div>

              {/* Delivery note */}
              <div className="bg-leaf-50 border border-leaf-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl">🚚</span>
                <p className="font-body text-xs text-bark/60 leading-relaxed">
                  <span className="font-semibold text-bark">Free delivery</span> on orders over Rs 25 · Same-day dispatch before 2 PM
                </p>
              </div>

              {/* Growing info */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xl">{veg.organic ? "🌿" : "🧪"}</span>
                {veg.organic ? (
                  <p className="font-body text-xs text-bark/60 leading-relaxed">
                    <span className="font-semibold text-bark">Certified organic</span> — grown without synthetic pesticides.
                  </p>
                ) : (
                  <span className="bg-soil-50 border border-soil-200 text-soil-600 text-xs font-body font-semibold px-3 py-1 rounded-full">
                    Non-Organic
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm mt-6 overflow-hidden">
          <div className="flex border-b border-leaf-100">
            {["description", "storage", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-4 font-body font-semibold text-sm capitalize transition ${
                  tab === t ? "text-leaf-700 border-b-2 border-leaf-600" : "text-bark/40 hover:text-bark"
                }`}
              >
                {t === "reviews" ? `Reviews (${veg.reviews})` : t}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === "description" && (
              <p className="font-body text-bark/70 text-sm leading-relaxed">{veg.description} Our farming partners follow regenerative agriculture practices, restoring soil health with every season. Each vegetable is hand-picked at optimal ripeness and dispatched within hours of harvest.</p>
            )}
            {tab === "storage" && (
              <ul className="space-y-3 font-body text-sm text-bark/70">
                {["Store in the refrigerator crisper drawer for up to 7 days.", "Keep loosely wrapped — avoid airtight bags which trap moisture.", "Do not wash until ready to use for maximum freshness.", "Can be blanched and frozen for up to 12 months."].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-leaf-500 font-bold mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            )}
            {tab === "reviews" && (
              <div className="space-y-6">
                {/* Write a review */}
                {user ? (
                  <form onSubmit={handleSubmitReview} className="bg-leaf-50 border border-leaf-100 rounded-2xl p-5">
                    <p className="font-display font-bold text-bark text-sm mb-3">
                      {myExistingReview ? "Update your review" : "Write a review"}
                    </p>
                    <div className="mb-3">
                      <StarRow value={myRating} size="w-6 h-6" onRate={setMyRating} />
                    </div>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      rows={3}
                      placeholder="Share what you thought about this vegetable…"
                      className="w-full bg-white border border-leaf-200 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition resize-none mb-3"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-leaf-600 text-white font-body font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-leaf-700 transition disabled:opacity-60"
                    >
                      {submittingReview ? "Saving…" : myExistingReview ? "Update Review" : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="bg-leaf-50 border border-leaf-100 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                    <p className="font-body text-sm text-bark/60">Log in to leave a rating and review for this vegetable.</p>
                    <button
                      onClick={() => requireLogin()}
                      className="bg-leaf-600 text-white font-body font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-leaf-700 transition flex-shrink-0"
                    >
                      Login to Review
                    </button>
                  </div>
                )}

                {/* Review list */}
                {reviewsLoading ? (
                  <p className="font-body text-bark/40 text-sm">Loading reviews…</p>
                ) : reviews.length === 0 ? (
                  <p className="font-body text-bark/40 text-sm">No reviews yet — be the first to share your thoughts.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-leaf-50 pb-4 last:border-0">
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <p className="font-display font-bold text-bark text-sm">{r.user_name}</p>
                          <p className="font-body text-xs text-bark/30">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <StarRow value={r.rating} />
                        {r.comment && (
                          <p className="font-body text-sm text-bark/70 leading-relaxed mt-2">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-bold text-bark text-2xl mb-5">More from {veg.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((v) => <VeggieCard key={v.id} veg={v} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeggieDetailPage;
