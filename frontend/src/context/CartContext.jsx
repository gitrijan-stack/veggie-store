import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // ── Auth state ──────────────────────────────
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await axios.get("/api/user/logout");
    } finally {
      setUser(null);
      setItems([]);
    }
  }, []);

  // Call before any purchase action (add to cart, checkout). Returns true if
  // the user is logged in; otherwise pops the login modal and returns false.
  const requireLogin = useCallback(() => {
    if (!user) {
      setShowLogin(true);
      return false;
    }
    return true;
  }, [user]);

  // ── Cart logic ──────────────────────────────
  // A vegetable's stockQty (if known) is the hard ceiling on how many a
  // shopper can have in their basket — never let the cart quantity exceed
  // what's actually available.
  const stockCap = (veg) => (veg.stockQty != null ? veg.stockQty : Infinity);

  const addItem = useCallback((veg, qty = 1) => {
    const cap = stockCap(veg);
    if (cap <= 0) {
      toast.error(`${veg.name} is out of stock`);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === veg.id);
      const desired = (existing ? existing.qty : 0) + qty;
      const nextQty = Math.min(desired, cap);
      if (desired > cap) toast.error(`Only ${cap} ${veg.name} in stock`);
      if (existing) return prev.map((i) => (i.id === veg.id ? { ...i, qty: nextQty } : i));
      return [...prev, { ...veg, qty: nextQty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const cap = stockCap(i);
        if (qty > cap) {
          toast.error(`Only ${cap} ${i.name} in stock`);
          return { ...i, qty: cap };
        }
        return { ...i, qty };
      })
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        // cart
        items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen,
        // auth
        user, setUser, logout, showLogin, setShowLogin, authLoading, fetchUser, requireLogin,
        axios,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
