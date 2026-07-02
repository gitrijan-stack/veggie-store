import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VeggieCard from "../components/VeggieCard";
import { useVegetables } from "../context/VegetablesContext";
import { useWishlist } from "../context/WishlistContext";
import { sortWishlistedFirst } from "../utils/sortWishlisted";

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "All";
  const { vegetables, categories, loading, error, refetch } = useVegetables();
  const { isWishlisted } = useWishlist();

  // The vegetable list is fetched once when the app loads. If a seller adds
  // or edits a vegetable in the admin dashboard and then navigates here via
  // client-side routing (no full page reload), that stale list would still
  // be showing — so refresh it every time this page is visited.
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeBadges, setActiveBadges] = useState([]);

  const badgeOptions = [
    { label: "Best Sellers", value: "BESTSELLER" },
    { label: "New", value: "NEW" },
    { label: "Sale", value: "SALE" },
    { label: "Popular", value: "POPULAR" },
  ];

  const toggleBadge = (value) => {
    setActiveBadges((prev) =>
      prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value]
    );
  };

  const filtered = useMemo(() => {
    let list = [...vegetables];
    if (selectedCat !== "All") list = list.filter((v) => v.category === selectedCat);
    if (organicOnly) list = list.filter((v) => v.organic);
    if (searchTerm) list = list.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    list = list.filter((v) => v.price <= maxPrice);
    if (activeBadges.length > 0) list = list.filter((v) => activeBadges.includes(v.badge));
    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.price - b.price); break;
      case "price_desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "name": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    // Hearted vegetables always float to the top, on top of whatever
    // filter/sort combination is active.
    return sortWishlistedFirst(list, isWishlisted);
  }, [vegetables, selectedCat, organicOnly, searchTerm, maxPrice, sortBy, activeBadges, isWishlisted]);

  const Sidebar = () => (
    <aside className="w-full space-y-4">
      {/* Search */}
      <div className="bg-white rounded-2xl p-5 border border-leaf-100 shadow-sm">
        <h3 className="font-display font-bold text-bark text-sm mb-3">Search</h3>
        <div className="flex items-center bg-leaf-50 rounded-xl px-3 py-2 gap-2 border border-leaf-100 focus-within:border-leaf-300 transition">
          <svg className="w-4 h-4 text-bark/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. broccoli..."
            className="flex-1 bg-transparent text-sm font-body text-bark outline-none placeholder-bark/30"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl p-5 border border-leaf-100 shadow-sm">
        <h3 className="font-display font-bold text-bark text-sm mb-3">Category</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCat(cat.name)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-body transition ${
                selectedCat === cat.name
                  ? "bg-leaf-600 text-white font-semibold"
                  : "text-bark/70 hover:bg-leaf-50 hover:text-bark"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </span>
              <span className={`text-xs ${selectedCat === cat.name ? "text-leaf-200" : "text-bark/30"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="bg-white rounded-2xl p-5 border border-leaf-100 shadow-sm">
        <h3 className="font-display font-bold text-bark text-sm mb-3">Max Price</h3>
        <input
          type="range"
          min={1}
          max={1000}
          step={1}
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
          className="w-full accent-leaf-600"
        />
        <div className="flex justify-between text-xs font-body text-bark/50 mt-1">
          <span>Rs 1.00</span>
          <span className="text-leaf-700 font-semibold">Rs {maxPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-leaf-100 shadow-sm">
        <h3 className="font-display font-bold text-bark text-sm mb-3">Filters</h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setOrganicOnly(!organicOnly)}
            className={`w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ${organicOnly ? "bg-leaf-600" : "bg-gray-200"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${organicOnly ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="font-body text-sm text-bark/70 group-hover:text-bark transition">Organic Only</span>
        </label>

        <div className="flex flex-wrap gap-2 mt-4">
          {badgeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleBadge(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold border transition ${
                activeBadges.includes(opt.value)
                  ? "bg-leaf-600 text-white border-leaf-600"
                  : "bg-leaf-50 text-bark/60 border-leaf-100 hover:border-leaf-300 hover:text-bark"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => { setSelectedCat("All"); setSearchTerm(""); setOrganicOnly(false); setMaxPrice(1000); setSortBy("default"); setActiveBadges([]); }}
        className="w-full text-sm font-body text-bark/40 hover:text-red-400 transition py-2"
      >
        Reset all filters
      </button>
    </aside>
  );

  return (
    <div className="bg-cream min-h-screen pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-leaf-700 to-leaf-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-leaf-200 text-xs font-semibold uppercase tracking-widest mb-2">Our Store</p>
          <h1 className="font-display font-bold text-white text-4xl mb-1">Fresh Vegetables</h1>
          <p className="font-body text-leaf-200 text-sm">Harvested daily from partner farms across the region</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-7">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <Sidebar />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-2 text-sm font-body text-bark/60 hover:text-bark border border-leaf-100 px-3 py-1.5 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M10 12h4" />
                </svg>
                Filters
              </button>
              <p className="font-body text-sm text-bark/50">
                <span className="font-semibold text-bark">{filtered.length}</span> vegetables found
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-body border border-leaf-100 rounded-xl px-3 py-2 outline-none focus:border-leaf-300 transition text-bark"
            >
              <option value="default">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>

          {/* Mobile sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden mb-6">
              <Sidebar />
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4 animate-pulse">🥬</span>
              <p className="font-body text-bark/50 text-sm">Loading vegetables…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">⚠️</span>
              <h3 className="font-display font-bold text-bark text-xl mb-2">Couldn't load vegetables</h3>
              <p className="font-body text-bark/50 text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🥬</span>
              <h3 className="font-display font-bold text-bark text-xl mb-2">No vegetables found</h3>
              <p className="font-body text-bark/50 text-sm">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((veg) => (
                <VeggieCard key={veg.id} veg={veg} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
