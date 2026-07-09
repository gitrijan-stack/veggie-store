import OrderModel from "../models/OrderModel.js";

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
