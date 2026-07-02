import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const Field = ({ name, label, type = "text", placeholder, value, onChange, error }) => (
  <div>
    <label className="font-body text-xs font-semibold text-bark/40 uppercase tracking-wider block mb-1.5">
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full border rounded-xl px-4 py-3 text-sm font-body outline-none transition ${
        error ? "border-red-300 bg-red-50 focus:border-red-400" : "border-leaf-100 focus:border-leaf-400"
      }`}
    />
    {error && <p className="text-red-500 text-[11px] font-body mt-1">⚠ {error}</p>}
  </div>
);

const CheckoutPage = () => {
  const { items, total, clearCart, user, setShowLogin } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [khaltiLoading, setKhaltiLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  const grandTotal = total + (total >= 25 ? 0 : 3.99);

  const validate = () => {
    const e = {};

    if (!form.firstName.trim()) e.firstName = "First name is required.";
    else if (!/^[A-Za-z\s]+$/.test(form.firstName)) e.firstName = "First name must contain only letters.";

    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    else if (!/^[A-Za-z\s]+$/.test(form.lastName)) e.lastName = "Last name must contain only letters.";

    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^(98|97)\d{8}$/.test(form.phone)) e.phone = "Enter a valid Nepali number (98XXXXXXXX or 97XXXXXXXX).";

    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@gmail\.com$/.test(form.email)) e.email = "Please enter a valid Gmail address (e.g. name@gmail.com).";

    if (!form.address.trim()) e.address = "Address is required.";

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Phone: only allow digits, max 10
    if (name === "phone") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }
    setForm({ ...form, [name]: value });
    // Clear error for this field on change
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleKhaltiPayment = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    if (!user) {
      toast.error("Please log in to place your order");
      setShowLogin(true);
      return;
    }

    setKhaltiLoading(true);
    try {
      // 1. Save the delivery address
      const { data: addrData } = await axios.post("/api/address/add", {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        street: form.address,
        city: "",
        country: "Nepal",
        isDefault: true,
      });
      if (!addrData.success) throw new Error(addrData.message || "Could not save address");

      // Simulate the Khalti payment step, then place the real order
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const { data: orderData } = await axios.post("/api/order/place", {
        addressId: addrData.id,
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
        paymentType: "CARD",
      });
      if (!orderData.success) throw new Error(orderData.message || "Could not place order");

      setOrderId(orderData.orderId);
      setPlaced(true);
      clearCart();
      setTimeout(() => navigate("/orders"), 4000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to place order");
    } finally {
      setKhaltiLoading(false);
    }
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="font-display font-bold text-bark text-2xl mb-3">Your basket is empty</h2>
          <Link to="/shop" className="btn-primary inline-block mt-2">Browse Vegetables</Link>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center py-20 max-w-md px-6">
          <div className="w-24 h-24 bg-leaf-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-float">🎉</div>
          <h2 className="font-display font-bold text-bark text-3xl mb-3">Order Placed!</h2>
          <p className="font-body text-bark/60 text-sm leading-relaxed mb-2">
            Your fresh vegetables are being packed right now. You'll receive a confirmation shortly.
          </p>
          {orderId && (
            <p className="font-body text-bark/40 text-xs mb-2">Order #{orderId}</p>
          )}
          <p className="font-body text-leaf-600 text-xs font-semibold">Estimated delivery: Today by 7 PM</p>
          <Link to="/orders" className="btn-primary inline-block mt-6 text-sm">Track Your Order</Link>
          <div className="mt-4 text-bark/30 text-xs font-body">Redirecting to your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-bark text-3xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form + Khalti */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-6 space-y-4">
              <h2 className="font-display font-bold text-bark text-lg">Your Details</h2>

              {/* First & Last name side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Field name="firstName" label="First Name" placeholder="Shabda"  value={form.firstName} onChange={handleChange} error={errors.firstName} />
                <Field name="lastName"  label="Last Name"  placeholder="Sharma"  value={form.lastName}  onChange={handleChange} error={errors.lastName} />
              </div>

              <Field name="phone"   label="Phone Number" type="tel"   placeholder="98XXXXXXXX"            value={form.phone}   onChange={handleChange} error={errors.phone} />
              <Field name="email"   label="Gmail"        type="email" placeholder="shabda@gmail.com"      value={form.email}   onChange={handleChange} error={errors.email} />
              <Field name="address" label="Address"      type="text"  placeholder="Panga Dobato, Kirtipur" value={form.address} onChange={handleChange} error={errors.address} />
            </div>

            {/* Khalti pay */}
            <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-6">
              <button
                type="button"
                onClick={handleKhaltiPayment}
                disabled={khaltiLoading}
                className="w-full py-4 rounded-xl font-display font-bold text-base text-white bg-[#5C2D91] hover:bg-[#4a2275] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {khaltiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Connecting to Khalti…
                  </>
                ) : (
                  <>Pay with Khalti · Rs {grandTotal.toFixed(2)}</>
                )}
              </button>
              <p className="text-[11px] font-body text-bark/30 flex items-center justify-center gap-1.5 mt-3">
                <span>🔒</span> Secured by Khalti — your payment details are never shared with us.
              </p>
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-5 h-fit">
            <h3 className="font-display font-bold text-bark text-base mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.src = "/images/placeholder.svg"; }}
                    className="w-9 h-9 bg-leaf-50 rounded-lg flex-shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-xs text-bark truncate">{item.name}</p>
                    <p className="text-[10px] text-bark/40 font-body">× {item.qty}</p>
                  </div>
                  <span className="font-body font-semibold text-sm text-bark">Rs {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-leaf-100 pt-3 space-y-1.5 text-sm font-body">
              <div className="flex justify-between text-bark/50">
                <span>Subtotal</span><span>Rs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-bark/50">
                <span>Delivery</span>
                <span className={total >= 25 ? "text-leaf-600 font-semibold" : ""}>
                  {total >= 25 ? "Free" : "Rs 3.99"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-bark pt-1.5 border-t border-leaf-50 text-base">
                <span>Total</span><span>Rs {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            {total < 25 && (
              <p className="text-xs font-body text-soil-600 bg-soil-50 rounded-lg px-3 py-2 mt-3 border border-soil-100">
                Add Rs {(25 - total).toFixed(2)} more for free delivery!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
