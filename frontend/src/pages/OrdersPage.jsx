import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import {
  ORDER_STATUSES,
  CANCELLED,
  STATUS_ICON,
  statusColor,
  statusStep,
} from "../utils/orderStatus";

const currency = `${import.meta.env.VITE_CURRENCY || "Rs"} `;

// Horizontal step tracker: Confirmed → Processing → Handed to Deliverer → Out for Delivery → Delivered
const TrackingStepper = ({ status }) => {
  if (status === CANCELLED) {
    return (
      <div className="flex items-center gap-2 text-red-500 font-body text-sm font-semibold bg-red-50 rounded-xl px-4 py-3">
        <span>✕</span> This order was cancelled
      </div>
    );
  }

  const currentStep = statusStep(status);

  return (
    <div className="flex items-start">
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= currentStep;
        const isLast = i === ORDER_STATUSES.length - 1;
        return (
          <div key={s} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition ${
                  done ? "bg-leaf-600 text-white" : "bg-leaf-50 text-bark/30 border border-leaf-100"
                }`}
              >
                {STATUS_ICON[s]}
              </div>
              <p className={`mt-1.5 text-[10px] font-body font-semibold text-center leading-tight max-w-[70px] ${done ? "text-bark" : "text-bark/30"}`}>
                {s}
              </p>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition ${i < currentStep ? "bg-leaf-600" : "bg-leaf-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-leaf-50/40"
      >
        <div>
          <p className="font-body font-semibold text-bark text-sm">Order #{order.id}</p>
          <p className="font-body text-xs text-bark/40">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-bark">{currency}{Number(order.total_amount).toFixed(2)}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(order.status)}`}>{order.status}</span>
        </div>
      </button>

      <div className="border-t border-leaf-50 px-5 py-5 bg-leaf-50/20">
        <TrackingStepper status={order.status} />
      </div>

      {open && (
        <div className="border-t border-leaf-50 px-5 py-4">
          <p className="text-xs font-semibold text-bark/50 uppercase tracking-wider mb-2">Items</p>
          <ul className="text-sm font-body text-bark/70 space-y-1 mb-3">
            {order.items?.map((it) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.quantity} × {it.vegetable_name}</span>
                <span>{currency}{Number(it.subtotal).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {order.address && (
            <>
              <p className="text-xs font-semibold text-bark/50 uppercase tracking-wider mb-1">Delivering to</p>
              <p className="text-sm font-body text-bark/70">
                {order.address.full_name} · {order.address.phone}
                <br />
                {order.address.street}
              </p>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-center text-xs font-body font-semibold text-leaf-600 hover:text-leaf-700 py-2.5 border-t border-leaf-50"
      >
        {open ? "Hide details" : "View details"}
      </button>
    </div>
  );
};

const OrdersPage = () => {
  const { user, authLoading, setShowLogin } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    axios
      .get("/api/order/my-orders")
      .then(({ data }) => data.success && setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="bg-cream min-h-screen pt-16 max-w-3xl mx-auto px-4 py-16 text-center font-body text-bark/40">
        Loading your orders…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center py-20 max-w-sm px-6">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="font-display font-bold text-bark text-2xl mb-3">Log in to see your orders</h2>
          <p className="font-body text-bark/50 text-sm mb-6">You'll be able to track deliveries once you're logged in.</p>
          <button onClick={() => setShowLogin(true)} className="btn-primary">Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-bold text-bark text-3xl mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">📦</span>
            <h2 className="font-display font-bold text-bark text-xl mb-3">No orders yet</h2>
            <Link to="/shop" className="btn-primary inline-block mt-2">Browse Vegetables</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
