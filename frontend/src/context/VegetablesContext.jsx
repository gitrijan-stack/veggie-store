import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { normalizeVeg } from "../utils/normalizeVeg";

// Category names/emoji are stable metadata (they rarely change and aren't
// editable from the admin dashboard), so they stay here — but the COUNT
// per category is always derived from the live vegetables list below.
const CATEGORY_META = [
  { name: "Leafy Greens", emoji: "🥬" },
  { name: "Root Vegetables", emoji: "🥕" },
  { name: "Brassicas", emoji: "🥦" },
  { name: "Fruit Vegetables", emoji: "🍅" },
  { name: "Alliums", emoji: "🧅" },
];

const VegetablesContext = createContext(null);

export const VegetablesProvider = ({ children }) => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Lives here (rather than inside ShopPage) so the Navbar search box and
  // the Shop page filters always stay in sync, no matter which one the
  // shopper typed into.
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVegetables = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get("/api/vegetable/list");
      if (!data.success) throw new Error(data.message || "Failed to load vegetables");
      setVegetables(data.vegetables.map(normalizeVeg));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load vegetables");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVegetables();
  }, [fetchVegetables]);

  // An admin working in the dashboard is often in a separate tab/window
  // from the storefront (see: featuring a vegetable while the homepage is
  // already open elsewhere). Quietly re-fetch whenever this tab regains
  // focus so those changes show up without the shopper needing to
  // manually refresh.
  useEffect(() => {
    const onFocus = () => fetchVegetables({ silent: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchVegetables({ silent: true });
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchVegetables]);

  const categories = [
    { name: "All", emoji: "🌾", count: vegetables.length },
    ...CATEGORY_META.map((c) => ({
      ...c,
      count: vegetables.filter((v) => v.category === c.name).length,
    })),
  ];

  // The vegetable an admin has marked "Feature on homepage" (falls back to
  // the first vegetable so the hero never renders empty before an admin
  // has picked one).
  const featured = vegetables.find((v) => v.isFeatured) || vegetables[0] || null;

  return (
    <VegetablesContext.Provider value={{ vegetables, categories, featured, loading, error, refetch: fetchVegetables, searchTerm, setSearchTerm }}>
      {children}
    </VegetablesContext.Provider>
  );
};

export const useVegetables = () => useContext(VegetablesContext);
