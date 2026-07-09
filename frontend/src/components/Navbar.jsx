import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import Login from "./Login";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setIsOpen, user, setUser, logout, showLogin, setShowLogin } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm border-b border-leaf-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-leaf-600 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform duration-300">
              🥕
            </div>
            <div className="leading-tight">
              <span className="font-display font-800 text-lg text-bark tracking-tight block">Vegetable Store</span>
              <span className="text-[9px] font-body font-medium text-leaf-600 uppercase tracking-widest -mt-0.5 block">Fresh Vegetables</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                  location.pathname === l.to
                    ? "bg-leaf-100 text-leaf-700"
                    : "text-bark/70 hover:text-bark hover:bg-leaf-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Login / Account */}
            {user ? (
              <>
                <Link
                  to="/orders"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-body font-medium text-bark/70 hover:text-leaf-700 transition px-3 py-2"
                >
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="hidden sm:flex items-center gap-1.5 text-sm font-body font-medium text-bark/70 hover:text-leaf-700 transition px-3 py-2"
                >
                  Hi, {user.name.split(" ")[0]} · Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="hidden sm:flex items-center gap-1.5 text-sm font-body font-semibold text-leaf-700 hover:text-leaf-800 transition px-3 py-2"
              >
                Login
              </button>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-1.5 bg-leaf-600 text-white px-4 py-2 rounded-full text-sm font-body font-semibold hover:bg-leaf-700 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-soil-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                  {count}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-leaf-50 transition text-bark">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-cream/98 backdrop-blur border-t border-leaf-100 px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2.5 rounded-xl text-sm font-body font-medium transition ${
                  location.pathname === l.to ? "bg-leaf-100 text-leaf-700" : "text-bark hover:bg-leaf-50"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* Login / Account (mobile) */}
            <div className="pt-2 mt-1 border-t border-leaf-100">
              {user ? (
                <>
                  <Link
                    to="/orders"
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-body font-medium text-bark hover:bg-leaf-50 transition"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-body font-medium text-bark hover:bg-leaf-50 transition"
                  >
                    Hi, {user.name.split(" ")[0]} · Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-body font-semibold text-leaf-700 hover:bg-leaf-50 transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer />

      {/* Login Modal */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSuccess={(u) => setUser(u)}
        />
      )}
    </>
  );
};

export default Navbar;
