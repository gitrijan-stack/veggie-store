import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, removeItem, updateQty, total, count, isOpen, setIsOpen, clearCart, requireLogin } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bark/30 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-cream z-50 shadow-2xl flex flex-col animate-fade-in border-l border-leaf-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-leaf-100">
          <div>
            <h2 className="font-display font-bold text-lg text-bark">Your Basket</h2>
            <p className="text-xs text-bark/50 font-body">{count} item{count !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-leaf-50 flex items-center justify-center text-bark hover:bg-leaf-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <span className="text-6xl animate-float">🛒</span>
              <p className="font-display font-semibold text-bark/60">Your basket is empty</p>
              <p className="text-sm font-body text-bark/40">Add some fresh vegetables to get started!</p>
              <button onClick={() => setIsOpen(false)}>
                <Link to="/shop" className="btn-primary text-sm">Browse Vegetables</Link>
              </button>
            </div>
          ) : (
            items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-leaf-100 hover:border-leaf-200 transition">
                <img src={item.image} alt={item.name} onError={(e)=>{e.currentTarget.src='/images/placeholder.svg'}} className="w-14 h-14 bg-leaf-50 rounded-lg flex-shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-bark truncate">{item.name}</p>
                  <p className="text-xs text-bark/50 font-body">{item.unit}</p>
                  <p className="text-leaf-700 font-bold text-sm font-body">Rs {(item.price * item.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-full bg-leaf-50 text-leaf-700 flex items-center justify-center hover:bg-leaf-100 transition font-bold text-sm"
                  >−</button>
                  <span className="w-6 text-center text-sm font-semibold font-body">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    disabled={item.stockQty != null && item.qty >= item.stockQty}
                    className="w-7 h-7 rounded-full bg-leaf-50 text-leaf-700 flex items-center justify-center hover:bg-leaf-100 transition font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-leaf-50"
                  >+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full text-red-400 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center ml-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-leaf-100 px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-bark/60 text-sm">Subtotal</span>
              <span className="font-display font-bold text-xl text-bark">Rs {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-leaf-600 font-body bg-leaf-50 rounded-lg px-3 py-2">
              🚚 Free delivery on orders over Rs 25
            </p>
            <Link
              to="/checkout"
              onClick={(e) => {
                if (!requireLogin()) { e.preventDefault(); return; }
                setIsOpen(false);
              }}
              className="block w-full text-center btn-primary"
            >
              Checkout · Rs {total.toFixed(2)}
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-center text-sm text-bark/40 font-body hover:text-red-400 transition py-1"
            >
              Clear basket
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
