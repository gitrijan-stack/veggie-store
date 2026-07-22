import OrderModel from "../models/OrderModel.js";
import UserModel from "../models/UserModel.js";
import { khaltiInitiate, khaltiLookup } from "../config/khalti.js";

// Place order — POST /api/order/place
export const placeOrder = async (req, res) => {
  try {
    const { addressId, items, paymentType } = req.body;

    if (!addressId || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid order data" });
    }

    const result = await OrderModel.create({
      userId: req.userId,
      addressId,
      items,
      paymentType: paymentType || "CARD",
    });

    return res.json({ success: true, message: "Order placed successfully", ...result });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Start a Khalti payment — POST /api/order/khalti/initiate
// Creates a Pending/unpaid order (stock + cart untouched), asks Khalti for
// a payment_url, stashes the pidx it gives back onto the order, then hands
// the payment_url to the frontend to redirect the shopper to.
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { addressId, items } = req.body;

    if (!addressId || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid order data" });
    }

    const { orderId, totalAmount } = await OrderModel.createPendingForKhalti({
      userId: req.userId,
      addressId,
      items,
    });

    const user = await UserModel.findById(req.userId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    let khaltiResponse;
    try {
      khaltiResponse = await khaltiInitiate({
        return_url: `${frontendUrl}/checkout/khalti/callback`,
        website_url: frontendUrl,
        // Khalti wants paisa (1 rupee = 100 paisa), rounded to the nearest
        // whole paisa to avoid float-precision rejections.
        amount: Math.round(totalAmount * 100),
        purchase_order_id: `veggie-order-${orderId}`,
        purchase_order_name: `Veggie Store Order #${orderId}`,
        customer_info: user
          ? { name: user.name, email: user.email, phone: user.phone || undefined }
          : undefined,
      });
    } catch (khaltiError) {
      // Khalti rejected the request (bad config, validation error, etc) —
      // don't leave a dangling Pending order behind.
      await OrderModel.markKhaltiPaymentFailed(orderId);
      throw khaltiError;
    }

    await OrderModel.setKhaltiPidx(orderId, khaltiResponse.pidx);

    return res.json({
      success: true,
      orderId,
      pidx: khaltiResponse.pidx,
      payment_url: khaltiResponse.payment_url,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Confirm a Khalti payment — POST /api/order/khalti/verify
// The frontend calls this from the /checkout/khalti/callback page after
// Khalti redirects the shopper back. We never trust the redirect's query
// params for the final decision — only the server-side lookup call does,
// per Khalti's docs.
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.json({ success: false, message: "Missing pidx" });
    }

    const order = await OrderModel.findByPidx(pidx);
    if (!order) {
      return res.json({ success: false, message: "Order not found for this payment" });
    }
    if (order.user_id !== req.userId) {
      return res.json({ success: false, message: "Not authorized" });
    }

    // Already finalized (e.g. verify fired twice) — just report success.
    if (order.is_paid) {
      return res.json({ success: true, orderId: order.id, status: "Completed" });
    }

    const lookup = await khaltiLookup(pidx);

    if (lookup.status === "Completed") {
      await OrderModel.finalizeKhaltiPayment(order.id);
      return res.json({ success: true, orderId: order.id, status: lookup.status });
    }

    await OrderModel.markKhaltiPaymentFailed(order.id);
    return res.json({
      success: false,
      orderId: order.id,
      status: lookup.status,
      message: `Payment ${lookup.status.toLowerCase()}`,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get orders for logged-in user — GET /api/order/my-orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findByUser(req.userId);
    return res.json({ success: true, orders });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get all orders (seller/admin) — GET /api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findAll();
    return res.json({ success: true, orders });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update order status (seller/admin) — PUT /api/order/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await OrderModel.updateStatus(req.params.id, status);
    return res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Cancel one of the logged-in user's own orders — PUT /api/order/:id/cancel
const CANCELLABLE_STATUSES = ["Confirmed", "Processing", "Handed to Deliverer"];

export const cancelMyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    if (order.user_id !== req.userId) {
      return res.json({ success: false, message: "Not authorized" });
    }
    if (order.status === "Cancelled") {
      return res.json({ success: false, message: "This order is already cancelled" });
    }
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return res.json({ success: false, message: `Order can no longer be cancelled once it's ${order.status}` });
    }

    await OrderModel.cancelAndRestock(id);
    return res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
