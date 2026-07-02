import pool from "../config/db.js";

const OrderModel = {
  async create({ userId, addressId, items, paymentType = "CARD" }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Calculate total from live vegetable prices
      let totalAmount = 0;
      const lineItems = [];

      for (const item of items) {
        const [rows] = await connection.query(
          "SELECT id, name, price FROM vegetables WHERE id = ?",
          [item.id]
        );
        const veg = rows[0];
        if (!veg) throw new Error(`Vegetable ${item.id} not found`);

        const subtotal = veg.price * item.qty;
        totalAmount += subtotal;
        lineItems.push({ ...veg, qty: item.qty, subtotal });
      }

      const deliveryFee = totalAmount >= 25 ? 0 : 3.99;
      totalAmount += deliveryFee;

      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, address_id, total_amount, delivery_fee, payment_type, is_paid, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`,
        [userId, addressId, totalAmount, deliveryFee, paymentType, paymentType !== "COD"]
      );
      const orderId = orderResult.insertId;

      for (const item of lineItems) {
        await connection.query(
          `INSERT INTO order_items (order_id, vegetable_id, vegetable_name, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.name, item.qty, item.price, item.subtotal]
        );
        await connection.query(
          "UPDATE vegetables SET stock_qty = GREATEST(stock_qty - ?, 0) WHERE id = ?",
          [item.qty, item.id]
        );
      }

      // Clear the user's cart after order placed
      const [cartRows] = await connection.query("SELECT id FROM carts WHERE user_id = ?", [userId]);
      if (cartRows[0]) {
        await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cartRows[0].id]);
      }

      await connection.commit();
      return { orderId, totalAmount, deliveryFee };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findByUser(userId) {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );
      order.items = items;

      const [address] = await pool.query("SELECT * FROM addresses WHERE id = ?", [order.address_id]);
      order.address = address[0] || null;
    }

    return orders;
  },

  async findAll() {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    return orders;
  },

  async updateStatus(orderId, status) {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  },
};

export default OrderModel;
