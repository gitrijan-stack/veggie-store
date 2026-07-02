import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useCart } from "./CartContext";

const OLD_GLOBAL_KEY = "veggie-store-wishlist"; // pre-per-user key, cleaned up below
const storageKey = (userId) => `veggie-store-wishlist:${userId}`;

const readStored = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
};

const WishlistContext = createContext(null);

// Tracks which vegetables a shopper has "hearted". This is tied to the
// logged-in user's id (like the cart's requireLogin gate) and stored under
// a per-user localStorage key, so:
//   - hearting requires being logged in (pops the login modal otherwise,
//     matching how "Add to cart" behaves)
//   - each account only ever sees its own hearts — logging in as a
//     different user on the same browser never carries over someone
//     else's wishlist
export const WishlistProvider = ({ children }) => {
  const { user, requireLogin } = useCart();
  const [wishlist, setWishlist] = useState([]);

  // One-time cleanup: remove the old browser-wide (non-per-user) key from
  // before this was scoped to accounts, so it can't leak into anyone's list.
  useEffect(() => {
    try {
      localStorage.removeItem(OLD_GLOBAL_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Load the current user's own wishlist whenever who's logged in changes
  // (login, logout, or switching accounts on the same browser).
  useEffect(() => {
    setWishlist(readStored(user?.id));
  }, [user?.id]);

  useEffect(() => {
    if (!user) return; // nothing to persist while logged out
    try {
      localStorage.setItem(storageKey(user.id), JSON.stringify(wishlist));
    } catch {
      // localStorage unavailable (private mode, etc.) — fail silently,
      // hearts just won't persist across a refresh.
    }
  }, [wishlist, user]);

  const isWishlisted = useCallback((id) => wishlist.includes(id), [wishlist]);

  const toggleWishlist = useCallback((id) => {
    if (!requireLogin()) return;
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [requireLogin]);

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
