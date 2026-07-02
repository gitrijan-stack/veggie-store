import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

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
  const addItem = useCallback((veg, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === veg.id);
      if (existing) return prev.map((i) => i.id === veg.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...veg, qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
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
