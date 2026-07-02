import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * SellerLogin — admin/seller login page
 * Connects to backend route:
 *   POST /api/seller/login  { email, password }
 *
 * On success, sets an httpOnly "sellerToken" cookie (handled by backend).
 * Redirects to /seller (your admin dashboard route) on success.
 *
 * Usage: add a route in App.jsx:
 *   <Route path="/seller-login" element={<SellerLogin />} />
 */
const SellerLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await axios.post("/api/seller/login", form, {
        baseURL: import.meta.env.VITE_BACKEND_URL,
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Logged in as Admin");
        navigate("/seller");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-16">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-leaf-100 rounded-full opacity-50" />
        <div className="absolute bottom-0 -left-24 w-72 h-72 bg-soil-100 rounded-full opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-leaf-100 p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-leaf-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🔐
            </div>
            <h1 className="font-display font-bold text-bark text-2xl">Admin Portal</h1>
            <p className="font-body text-bark/50 text-sm mt-1">
              Sign in to manage VerdeFarm's store
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-body px-4 py-2.5 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider block mb-1.5">
                Admin Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@veggiestore.com"
                className="w-full border border-leaf-100 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition"
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
                placeholder="••••••••"
                className="w-full border border-leaf-100 rounded-xl px-4 py-3 text-sm font-body outline-none focus:border-leaf-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-leaf-600 text-white font-body font-semibold py-3.5 rounded-full hover:bg-leaf-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs font-body text-bark/30 mt-6">
            Restricted access — authorized store admins only
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-sm font-body text-bark/40 mt-5">
          <a href="/" className="hover:text-leaf-600 transition">← Back to store</a>
        </p>
      </div>
    </div>
  );
};

export default SellerLogin;
