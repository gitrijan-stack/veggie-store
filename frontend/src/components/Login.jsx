import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Login — user register/login modal
 * Connects to backend routes:
 *   POST /api/user/register  { name, email, password }
 *   POST /api/user/login     { email, password }
 *
 * Usage: render <Login /> conditionally from Navbar or App,
 * controlled by a `showLogin` boolean in context or local state.
 */
const Login = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/user/login" : "/api/user/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const { data } = await axios.post(endpoint, payload, {
        baseURL: import.meta.env.VITE_BACKEND_URL,
        withCredentials: true,
      });

      if (data.success) {
        toast.success(mode === "login" ? "Welcome back!" : "Account created!");
        onSuccess?.(data.user);
        onClose?.();
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bark/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-cream rounded-3xl shadow-2xl w-full max-w-sm p-8 relative border border-leaf-100"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-leaf-50 flex items-center justify-center text-bark hover:bg-leaf-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🥬</span>
            <h2 className="font-display font-bold text-bark text-2xl">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="font-body text-bark/50 text-sm mt-1">
              {mode === "login"
                ? "Log in to track orders and save your basket"
                : "Join VerdeFarm for fresher deliveries"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-body px-4 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                  className="w-full border border-leaf-100 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition bg-white"
                />
              </div>
            )}

            <div>
              <label className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="jane@email.com"
                className="w-full border border-leaf-100 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition bg-white"
              />
            </div>

            <div>
              <label className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full border border-leaf-100 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leaf-600 text-white font-body font-semibold py-3.5 rounded-full hover:bg-leaf-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm font-body text-bark/50 mt-5">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-leaf-600 font-semibold hover:text-leaf-800 transition"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>

          {/* Admin login */}
          <p className="text-center text-xs font-body text-bark/30 mt-3">
            Store owner?{" "}
            <Link to="/seller-login" onClick={onClose} className="text-bark/50 font-semibold hover:text-leaf-600 transition">
              Admin login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
