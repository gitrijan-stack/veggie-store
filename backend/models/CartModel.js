import pool from "../config/db.js";

const CartModel = {
  async getOrCreateCart(userId) {
    const [rows] = await pool.query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (rows[0]) return rows[0].id;

    const [result] = await pool.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
    return result.insertId;
  },

  async getItems(userId) {
    const cartId = await this.getOrCreateCart(userId);
    const [rows] = await pool.query(
      `SELECT ci.vegetable_id AS id, ci.quantity AS qty,
              v.name, v.emoji, v.price, v.unit, v.image_url
       FROM cart_items ci
       JOIN vegetables v ON v.id = ci.vegetable_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
    return rows;
  },

  async addItem(userId, vegetableId, qty = 1) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.query(
      `INSERT INTO cart_items (cart_id, vegetable_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [cartId, vegetableId, qty]
    );
  },

  async updateQty(userId, vegetableId, qty) {
    const cartId = await this.getOrCreateCart(userId);
    if (qty < 1) {
      await pool.query(
        "DELETE FROM cart_items WHERE cart_id = ? AND vegetable_id = ?",
        [cartId, vegetableId]
      );
    } else {
      await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND vegetable_id = ?",
        [qty, cartId, vegetableId]
      );
    }
  },

  async removeItem(userId, vegetableId) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND vegetable_id = ?",
      [cartId, vegetableId]
    );
  },

  async clearCart(userId) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
  },
};

export default CartModel;
