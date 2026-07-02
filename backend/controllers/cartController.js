import CartModel from "../models/CartModel.js";

// Get cart — GET /api/cart
export const getCart = async (req, res) => {
  try {
    const items = await CartModel.getItems(req.userId);
    return res.json({ success: true, items });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Add item to cart — POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { vegetableId, qty } = req.body;
    if (!vegetableId) {
      return res.json({ success: false, message: "vegetableId is required" });
    }
    await CartModel.addItem(req.userId, vegetableId, qty || 1);
    return res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update item quantity — POST /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { vegetableId, qty } = req.body;
    if (!vegetableId || qty === undefined) {
      return res.json({ success: false, message: "vegetableId and qty are required" });
    }
    await CartModel.updateQty(req.userId, vegetableId, qty);
    return res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Remove item — POST /api/cart/remove
export const removeFromCart = async (req, res) => {
  try {
    const { vegetableId } = req.body;
    await CartModel.removeItem(req.userId, vegetableId);
    return res.json({ success: true, message: "Item removed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Clear cart — POST /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    await CartModel.clearCart(req.userId);
    return res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
