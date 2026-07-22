import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Khalti redirects here after the shopper finishes (or cancels/abandons)
// the hosted payment page. The query params on this URL come from Khalti,
// so we never trust them directly for the final verdict — we only use the
// pidx to ask our own backend to re-check the payment via Khalti's lookup
// API, which is the only source of truth (per Khalti's docs).
const KhaltiCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, axios } = useCart();
  const [state, setState] = useState("checking"); // checking | success | failed
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const verifiedRef = useRef(false);

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (!pidx) {
      setState("failed");
      setMessage("Missing payment reference.");
      return;
    }

    // Guard against double-firing in React StrictMode / re-renders.
    if (verifiedRef.current) return;
    verifiedRef.current = true;

    (async () => {
      try {
        const { data } = await axios.post("/api/order/khalti/verify", { pidx });
        setOrderId(data.orderId || null);

        if (data.success) {
          setState("success");
          clearCart();
          setTimeout(() => navigate("/orders"), 2500);
        } else {
          setState("failed");
          setMessage(data.message || "Payment was not completed.");
        }
      } catch (err) {
        setState("failed");
        setMessage(err.response?.data?.message || err.message || "Could not verify payment.");
      }
    })();
  }, [searchParams, axios, clearCart, navigate]);

  return (
    <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
      <div className="text-center py-20 max-w-md px-6">
        {state === "checking" && (
          <>
            <svg className="animate-spin h-10 w-10 text-leaf-600 mx-auto mb-6" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <h2 className="font-display font-bold text-bark text-2xl mb-3">Confirming your payment…</h2>
            <p className="font-body text-bark/60 text-sm">Please don't close this page.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-24 h-24 bg-leaf-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-float">🎉</div>
            <h2 className="font-display font-bold text-bark text-3xl mb-3">Payment Successful!</h2>
            <p className="font-body text-bark/60 text-sm leading-relaxed mb-2">
              Your order is confirmed and your fresh vegetables are being packed.
            </p>
            {orderId && <p className="font-body text-bark/40 text-xs mb-2">Order #{orderId}</p>}
            <Link to="/orders" className="btn-primary inline-block mt-6 text-sm">Track Your Order</Link>
            <div className="mt-4 text-bark/30 text-xs font-body">Redirecting to your orders...</div>
          </>
        )}

        {state === "failed" && (
          <>
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">⚠️</div>
            <h2 className="font-display font-bold text-bark text-3xl mb-3">Payment Not Completed</h2>
            <p className="font-body text-bark/60 text-sm leading-relaxed mb-2">{message}</p>
            {orderId && <p className="font-body text-bark/40 text-xs mb-2">Order #{orderId}</p>}
            <Link to="/checkout" className="btn-primary inline-block mt-6 text-sm">Back to Checkout</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default KhaltiCallbackPage;
