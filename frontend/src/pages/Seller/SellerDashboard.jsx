import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ALL_STATUSES, statusColor } from "../../utils/orderStatus";
import EmojiPicker from "../../components/Seller/EmojiPicker";
import BadgePicker from "../../components/Seller/BadgePicker";

const currency = `${import.meta.env.VITE_CURRENCY || "Rs"} `;
const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "vegetables", label: "Vegetables", icon: "🥦" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "users", label: "Users", icon: "👥" },
];

const emptyVeg = {
  categoryId: "", name: "", emoji: "🥕", description: "",
  price: "", originalPrice: "", unit: "1 piece", stockQty: 100,
  isOrganic: false, pesticidesUsed: "", imageUrl: "", badge: "", badgeColor: "bg-leaf-600", tags: "",
};

/**
 * SellerDashboard — single-file admin dashboard.
 * Guards itself via GET /api/seller/is-auth, then exposes tabs for
 * Overview / Vegetables (add, edit, delete) / Orders (status) / Users (delete).
 */
const SellerDashboard = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("overview");

  // shared data
  const [vegetables, setVegetables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get("/api/seller/is-auth")
      .then(({ data }) => {
        if (data.success) setAuthed(true);
        else navigate("/seller-login", { replace: true });
      })
      .catch(() => navigate("/seller-login", { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate]);

  const refreshAll = () => {
    axios.get("/api/vegetable/list").then(({ data }) => data.success && setVegetables(data.vegetables));
    axios.get("/api/order/all").then(({ data }) => data.success && setOrders(data.orders));
    axios.get("/api/user/list").then(({ data }) => data.success && setUsers(data.users));
    axios.get("/api/category/list").then(({ data }) => data.success && setCategories(data.categories));
  };

  useEffect(() => {
    if (authed) refreshAll();
  }, [authed]);

  const handleLogout = async () => {
    await axios.get("/api/seller/logout");
    navigate("/seller-login", { replace: true });
  };

  if (checking) return <div className="bg-cream min-h-screen max-w-5xl mx-auto px-4 py-16 text-center font-body text-bark/40">Checking admin session…</div>;
  if (!authed) return null;

  return (
    <div className="bg-cream min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display font-bold text-2xl text-bark">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm font-body font-semibold text-red-500 hover:text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-semibold whitespace-nowrap transition ${
              tab === t.key ? "bg-leaf-600 text-white" : "bg-white border border-leaf-100 text-bark/60 hover:bg-leaf-50"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab vegetables={vegetables} orders={orders} users={users} />}
      {tab === "vegetables" && (
        <VegetablesTab vegetables={vegetables} categories={categories} onChange={refreshAll} />
      )}
      {tab === "orders" && <OrdersTab orders={orders} onChange={refreshAll} />}
      {tab === "users" && <UsersTab users={users} onChange={refreshAll} />}
    </div>
  );
};

// ── Overview ─────────────────────────────────────────
const OverviewTab = ({ vegetables, orders, users }) => {
  const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const cards = [
    { label: "Vegetables listed", value: vegetables.length, icon: "🥦" },
    { label: "Total orders", value: orders.length, icon: "📦" },
    { label: "Registered users", value: users.length, icon: "👥" },
    { label: "Total revenue", value: `${currency}${revenue.toFixed(2)}`, icon: "💰" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl border border-leaf-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 bg-leaf-100">{c.icon}</div>
          <p className="font-display font-bold text-2xl text-bark">{c.value}</p>
          <p className="font-body text-xs text-bark/50 mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Vegetables ───────────────────────────────────────
const VegetablesTab = ({ vegetables, categories, onChange }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyVeg);
  const [saving, setSaving] = useState(false);

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.categoryId || !form.name || !form.price || !form.unit) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/vegetable/add", {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stockQty: Number(form.stockQty) || 0,
        badge: form.badge || null,
        pesticidesUsed: form.isOrganic ? null : (form.pesticidesUsed || null),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      if (data.success) {
        toast.success("Vegetable added");
        setForm(emptyVeg);
        setShowAdd(false);
        onChange();
      } else {
        toast.error(data.message || "Failed to add vegetable");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add vegetable");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (veg) => {
    if (!window.confirm(`Remove "${veg.name}"?`)) return;
    try {
      const { data } = await axios.delete(`/api/vegetable/${veg.id}`);
      if (data.success) { toast.success("Vegetable removed"); onChange(); }
      else toast.error(data.message || "Failed to remove");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    }
  };

  const toggleStock = async (veg) => {
    try {
      const { data } = await axios.put(`/api/vegetable/${veg.id}`, { inStock: !veg.in_stock });
      if (data.success) onChange();
    } catch {
      toast.error("Failed to update stock");
    }
  };

  // Only one vegetable can be featured on the homepage hero at a time —
  // the backend clears the flag on every other vegetable when this is set.
  const setFeatured = async (veg) => {
    try {
      const { data } = await axios.put(`/api/vegetable/${veg.id}`, { isFeatured: true });
      if (data.success) { toast.success(`${veg.name} is now featured on the homepage`); onChange(); }
      else toast.error(data.message || "Failed to feature vegetable");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to feature vegetable");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="font-body text-sm text-bark/50">{vegetables.length} listed</p>
        <button onClick={() => setShowAdd((v) => !v)} className="bg-leaf-600 text-white font-body font-semibold text-sm px-4 py-2 rounded-full hover:bg-leaf-700 transition">
          {showAdd ? "Cancel" : "+ Add Vegetable"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-leaf-100 p-5 space-y-4 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={handleAddChange} required placeholder="Name *" className="input" />
            <select name="categoryId" value={form.categoryId} onChange={handleAddChange} required className="input">
              <option value="">Category *</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <EmojiPicker value={form.emoji} onChange={(emoji) => setForm((p) => ({ ...p, emoji }))} />
            <input name="unit" value={form.unit} onChange={handleAddChange} required placeholder="Unit * (e.g. 500g)" className="input" />
          </div>
          <textarea name="description" value={form.description} onChange={handleAddChange} rows={2} placeholder="Description" className="input resize-none" />
          <div className="grid sm:grid-cols-3 gap-3">
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleAddChange} required placeholder="Price *" className="input" />
            <input name="originalPrice" type="number" step="0.01" min="0" value={form.originalPrice} onChange={handleAddChange} placeholder="Original price" className="input" />
            <input name="stockQty" type="number" min="0" value={form.stockQty} onChange={handleAddChange} placeholder="Stock qty" className="input" />
          </div>
          <input name="imageUrl" value={form.imageUrl} onChange={handleAddChange} placeholder="Image URL (https://...)" className="input" />
          <input name="tags" value={form.tags} onChange={handleAddChange} placeholder="Tags, comma separated (e.g. Organic, Immune-Boost)" className="input" />

          <div>
            <p className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider mb-1.5">Badge</p>
            <BadgePicker badge={form.badge} badgeColor={form.badgeColor} onChange={({ badge, badgeColor }) => setForm((p) => ({ ...p, badge, badgeColor }))} />
          </div>

          <div>
            <label className="flex items-center gap-2 font-body text-sm text-bark mb-2">
              <input
                type="checkbox"
                name="isOrganic"
                checked={form.isOrganic}
                onChange={(e) => setForm((p) => ({ ...p, isOrganic: e.target.checked, pesticidesUsed: e.target.checked ? "" : p.pesticidesUsed }))}
                className="w-4 h-4 accent-leaf-600"
              />
              Organic
            </label>
            {!form.isOrganic && (
              <input
                name="pesticidesUsed"
                value={form.pesticidesUsed}
                onChange={handleAddChange}
                placeholder="Pesticides used (e.g. Neem oil, Pyrethrin)"
                className="input"
              />
            )}
          </div>

          <button type="submit" disabled={saving} className="bg-leaf-600 text-white font-body font-semibold px-6 py-2.5 rounded-full hover:bg-leaf-700 transition disabled:opacity-60">
            {saving ? "Saving…" : "Save Vegetable"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-leaf-100 overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-leaf-50 text-left text-bark/50 text-xs uppercase tracking-wider">
              <th className="px-4 py-3">Vegetable</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Homepage</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-leaf-50">
            {vegetables.map((v) => (
              <tr key={v.id} className="hover:bg-leaf-50/50">
                <td className="px-4 py-3"><span className="mr-1.5">{v.emoji}</span>{v.name}</td>
                <td className="px-4 py-3 font-semibold text-bark">{currency}{Number(v.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-bark/60">{v.stock_qty}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {(v.tags || []).length > 0
                      ? v.tags.map((t) => (
                          <span key={t} className="text-[10px] bg-leaf-50 text-leaf-700 px-2 py-0.5 rounded-full border border-leaf-100">{t}</span>
                        ))
                      : <span className="text-xs text-bark/30">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStock(v)} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${v.in_stock ? "bg-leaf-100 text-leaf-700" : "bg-red-50 text-red-500"}`}>
                    {v.in_stock ? "In stock" : "Out of stock"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {v.is_featured ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-soil-100 text-soil-600 whitespace-nowrap">⭐ Featured</span>
                  ) : (
                    <button onClick={() => setFeatured(v)} className="text-xs px-2.5 py-1 rounded-full font-semibold bg-leaf-50 text-bark/50 hover:bg-leaf-100 hover:text-bark whitespace-nowrap transition">
                      Feature on home
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(v)} className="text-leaf-600 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-leaf-50 mr-1">Edit</button>
                  <button onClick={() => handleDelete(v)} className="text-red-500 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <EditVegetableModal vegetable={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />}
      <style>{`.input { width: 100%; border: 1px solid #dcf5dc; border-radius: 0.75rem; padding: 0.6rem 0.9rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #82d882; }`}</style>
    </div>
  );
};

const EditVegetableModal = ({ vegetable, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: vegetable.name, price: vegetable.price, originalPrice: vegetable.original_price || "",
    stockQty: vegetable.stock_qty, unit: vegetable.unit, description: vegetable.description || "",
    tags: (vegetable.tags || []).join(", "), imageUrl: vegetable.image_url || "",
    emoji: vegetable.emoji || "🥕", badge: vegetable.badge || "", badgeColor: vegetable.badge_color || "bg-leaf-600",
    isOrganic: !!vegetable.is_organic, pesticidesUsed: vegetable.pesticides_used || "",
  });
  const [saving, setSaving] = useState(false);
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/vegetable/${vegetable.id}`, {
        name: form.name, price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stockQty: Number(form.stockQty), unit: form.unit, description: form.description,
        imageUrl: form.imageUrl, emoji: form.emoji, badge: form.badge || null, badgeColor: form.badgeColor,
        isOrganic: form.isOrganic, pesticidesUsed: form.isOrganic ? null : (form.pesticidesUsed || null),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      if (data.success) { toast.success("Vegetable updated"); onSaved(); }
      else toast.error(data.message || "Update failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bark/40 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-lg text-bark mb-4">Edit {vegetable.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Name" />
            <EmojiPicker value={form.emoji} onChange={(emoji) => setForm((p) => ({ ...p, emoji }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input" placeholder="Price" />
            <input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} className="input" placeholder="Original price" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="stockQty" type="number" value={form.stockQty} onChange={handleChange} className="input" placeholder="Stock qty" />
            <input name="unit" value={form.unit} onChange={handleChange} className="input" placeholder="Unit" />
          </div>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" />
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="Image URL (e.g. /images/tomatoes.jpg)" className="input" />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-leaf-100" onError={(e) => { e.target.style.display = "none"; }} />
          )}
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags, comma separated (e.g. Organic, Immune-Boost)" className="input" />

          <div>
            <p className="font-body text-xs font-semibold text-bark/50 uppercase tracking-wider mb-1.5">Badge</p>
            <BadgePicker badge={form.badge} badgeColor={form.badgeColor} onChange={({ badge, badgeColor }) => setForm((p) => ({ ...p, badge, badgeColor }))} />
          </div>

          <div>
            <label className="flex items-center gap-2 font-body text-sm text-bark mb-2">
              <input
                type="checkbox"
                checked={form.isOrganic}
                onChange={(e) => setForm((p) => ({ ...p, isOrganic: e.target.checked, pesticidesUsed: e.target.checked ? "" : p.pesticidesUsed }))}
                className="w-4 h-4 accent-leaf-600"
              />
              Organic
            </label>
            {!form.isOrganic && (
              <input
                name="pesticidesUsed"
                value={form.pesticidesUsed}
                onChange={handleChange}
                placeholder="Pesticides used (e.g. Neem oil, Pyrethrin)"
                className="input"
              />
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 bg-leaf-600 text-white font-body font-semibold py-2.5 rounded-full hover:bg-leaf-700 transition disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 font-body font-medium text-bark/50 hover:text-bark">Cancel</button>
          </div>
        </form>
        <style>{`.input { width: 100%; border: 1px solid #dcf5dc; border-radius: 0.75rem; padding: 0.6rem 0.9rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #82d882; }`}</style>
      </div>
    </div>
  );
};

// ── Orders ───────────────────────────────────────────
const OrdersTab = ({ orders, onChange }) => {
  const [expanded, setExpanded] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleStatusChange = async (order, status) => {
    try {
      const { data } = await axios.put(`/api/order/${order.id}/status`, { status });
      if (data.success) { toast.success(`Order #${order.id} marked ${status}`); onChange(); }
      else toast.error(data.message || "Update failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // YYYY-MM-DD in the browser's local timezone, to match what a <input
  // type="date"> picker returns — so filtering lines up with the date
  // shown in each order's timestamp, not a UTC-shifted one.
  const toLocalDateInput = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

  // Selecting a range covers "multiple dates" at once — from/to are both
  // inclusive, and either can be left open to mean "no lower/upper bound".
  const filteredOrders = orders.filter((o) => {
    const d = toLocalDateInput(o.created_at);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  });
  const rangeActive = Boolean(dateFrom || dateTo);
  const rangeTotal = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  if (orders.length === 0) return <p className="font-body text-sm text-bark/40">No orders yet.</p>;

  return (
    <div>
      {/* Date filter */}
      <div className="bg-white rounded-2xl border border-leaf-100 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-body font-semibold text-bark/50 uppercase tracking-wider">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-leaf-100 rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-leaf-400"
          />
          <label className="text-xs font-body font-semibold text-bark/50 uppercase tracking-wider">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-leaf-100 rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-leaf-400"
          />
          {rangeActive && (
            <button onClick={clearDates} className="text-xs font-body font-semibold text-red-500 hover:text-red-600">
              Clear
            </button>
          )}
        </div>

        {rangeActive && (
          <p className="text-sm font-body text-bark/60">
            <span className="font-display font-bold text-bark">{filteredOrders.length}</span> order{filteredOrders.length !== 1 ? "s" : ""} in this range · <span className="font-display font-bold text-bark">{currency}{rangeTotal.toFixed(2)}</span> total
          </p>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="font-body text-sm text-bark/40">No orders in this range.</p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-leaf-100 overflow-hidden">
              <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-leaf-50/40">
                <div>
                  <p className="font-body font-semibold text-bark text-sm">Order #{o.id} · {o.customer_name}</p>
                  <p className="font-body text-xs text-bark/40">{o.email} · {new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-bark">{currency}{Number(o.total_amount).toFixed(2)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(o.status)}`}>{o.status}</span>
                </div>
              </button>
              {expanded === o.id && (
                <div className="border-t border-leaf-50 px-5 py-4 bg-leaf-50/30 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-bark/50 uppercase tracking-wider mb-1.5">Items</p>
                    <ul className="text-sm font-body text-bark/70 space-y-1">
                      {o.items?.map((it) => (
                        <li key={it.id}>{it.quantity} × {it.vegetable_name} — {currency}{Number(it.subtotal).toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-bark/50 uppercase tracking-wider mb-1.5">Update status</p>
                    <select value={o.status} onChange={(e) => handleStatusChange(o, e.target.value)} className="border border-leaf-100 rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-leaf-400">
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Users ────────────────────────────────────────────
const UsersTab = ({ users, onChange }) => {
  const handleDelete = async (user) => {
    if (!window.confirm(`Remove ${user.name} (${user.email})?`)) return;
    try {
      const { data } = await axios.delete(`/api/user/${user.id}`);
      if (data.success) { toast.success("User removed"); onChange(); }
      else toast.error(data.message || "Failed to remove user");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  if (users.length === 0) return <p className="font-body text-sm text-bark/40">No users yet.</p>;

  return (
    <div className="bg-white rounded-2xl border border-leaf-100 overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="bg-leaf-50 text-left text-bark/50 text-xs uppercase tracking-wider">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-leaf-50">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-leaf-50/50">
              <td className="px-4 py-3 font-semibold text-bark">{u.name}</td>
              <td className="px-4 py-3 text-bark/60">{u.email}</td>
              <td className="px-4 py-3 text-bark/40 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => handleDelete(u)} className="text-red-500 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-red-50">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerDashboard;
