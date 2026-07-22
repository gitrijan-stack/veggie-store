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
          `UPDATE vegetables
           SET stock_qty = GREATEST(stock_qty - ?, 0),
               in_stock = (GREATEST(stock_qty - ?, 0) > 0)
           WHERE id = ?`,
          [item.qty, item.qty, item.id]
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

  // Creates the order row + order_items up front (status 'Pending', is_paid
  // false) so the shopper's intent is recorded before they leave for
  // Khalti's hosted payment page. Deliberately does NOT touch stock or the
  // cart yet — those only happen once the Khalti lookup API confirms the
  // payment actually went through (see finalizeKhaltiPayment). Otherwise an
  // abandoned/failed Khalti checkout would permanently reserve stock for
  // nothing.
  async createPendingForKhalti({ userId, addressId, items }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let totalAmount = 0;
      const lineItems = [];

      for (const item of items) {
        const [rows] = await connection.query(
          "SELECT id, name, price, stock_qty FROM vegetables WHERE id = ?",
          [item.id]
        );
        const veg = rows[0];
        if (!veg) throw new Error(`Vegetable ${item.id} not found`);
        if (veg.stock_qty < item.qty) throw new Error(`Not enough stock for ${veg.name}`);

        const subtotal = veg.price * item.qty;
        totalAmount += subtotal;
        lineItems.push({ ...veg, qty: item.qty, subtotal });
      }

      const deliveryFee = totalAmount >= 25 ? 0 : 3.99;
      totalAmount += deliveryFee;

      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, address_id, total_amount, delivery_fee, payment_type, is_paid, status)
         VALUES (?, ?, ?, ?, 'ONLINE', FALSE, 'Pending')`,
        [userId, addressId, totalAmount, deliveryFee]
      );
      const orderId = orderResult.insertId;

      for (const item of lineItems) {
        await connection.query(
          `INSERT INTO order_items (order_id, vegetable_id, vegetable_name, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.id, item.name, item.qty, item.price, item.subtotal]
        );
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

  async setKhaltiPidx(orderId, pidx) {
    await pool.query("UPDATE orders SET khalti_pidx = ? WHERE id = ?", [pidx, orderId]);
  },

  async findByPidx(pidx) {
    const [rows] = await pool.query("SELECT * FROM orders WHERE khalti_pidx = ?", [pidx]);
    return rows[0] || null;
  },

  // Called once the Khalti lookup API reports status "Completed". This is
  // the point where stock actually gets decremented and the cart cleared —
  // mirroring what OrderModel.create does for COD/CARD, just deferred until
  // payment is verified. Idempotent: if the order is already marked paid
  // (e.g. the callback page double-fires verify), it's a no-op.
  async finalizeKhaltiPayment(orderId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query("SELECT * FROM orders WHERE id = ? FOR UPDATE", [orderId]);
      const order = orderRows[0];
      if (!order) throw new Error("Order not found");

      if (order.is_paid) {
        await connection.commit();
        return order;
      }

      const [items] = await connection.query(
        "SELECT vegetable_id, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );
      for (const item of items) {
        await connection.query(
          `UPDATE vegetables
           SET stock_qty = GREATEST(stock_qty - ?, 0),
               in_stock = (GREATEST(stock_qty - ?, 0) > 0)
           WHERE id = ?`,
          [item.quantity, item.quantity, item.vegetable_id]
        );
      }

      await connection.query(
        "UPDATE orders SET is_paid = TRUE, status = 'Confirmed' WHERE id = ?",
        [orderId]
      );

      const [cartRows] = await connection.query("SELECT id FROM carts WHERE user_id = ?", [order.user_id]);
      if (cartRows[0]) {
        await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cartRows[0].id]);
      }

      await connection.commit();
      return { ...order, is_paid: true, status: "Confirmed" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Called when the Khalti lookup reports anything other than "Completed"
  // (User canceled, Expired, Pending-that-never-resolves, etc). Stock was
  // never decremented for this order, so there's nothing to release — we
  // just mark it Cancelled so it doesn't sit around as a phantom "Pending"
  // order the seller dashboard would otherwise show as awaiting action.
  async markKhaltiPaymentFailed(orderId) {
    await pool.query(
      "UPDATE orders SET status = 'Cancelled' WHERE id = ? AND is_paid = FALSE",
      [orderId]
    );
  },

  // Excludes status='Pending' — that's only ever a Khalti payment attempt
  // that hasn't been verified yet (see createPendingForKhalti / the
  // khalti/verify endpoint). It becomes 'Confirmed' or 'Cancelled' within
  // moments of the shopper landing back on our callback page, so a lingering
  // 'Pending' row here just means an abandoned/never-finished checkout —
  // not a real order the shopper or seller should see.
  async findByUser(userId) {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? AND status != 'Pending' ORDER BY created_at DESC`,
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
       WHERE o.status != 'Pending'
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    return orders;
  },

  async findById(orderId) {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [orderId]);
    return rows[0] || null;
  },

  // Cancelling (whether the shopper does it or an admin does) returns the
  // ordered quantities to stock. If an admin later moves the order back
  // out of Cancelled into an active status, that stock needs to come back
  // out again — otherwise it would look like double-counted stock that
  // was never actually reserved for anything. Either way, this is a quiet
  // stock adjustment — it deliberately does NOT touch restocked_at, so it
  // never makes an item reappear in the homepage's "Today's Harvest" the
  // way a genuine new batch would.
  async updateStatus(orderId, status) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderRows] = await connection.query("SELECT * FROM orders WHERE id = ? FOR UPDATE", [orderId]);
      const order = orderRows[0];
      if (!order) throw new Error("Order not found");

      const wasCancelled = order.status === "Cancelled";
      const willBeCancelled = status === "Cancelled";

      if (wasCancelled !== willBeCancelled) {
        const [items] = await connection.query(
          "SELECT vegetable_id, quantity FROM order_items WHERE order_id = ?",
          [orderId]
        );
        for (const item of items) {
          if (willBeCancelled) {
            // Cancelling — release the reserved stock back.
            await connection.query(
              "UPDATE vegetables SET stock_qty = stock_qty + ?, in_stock = TRUE WHERE id = ?",
              [item.quantity, item.vegetable_id]
            );
          } else {
            // Un-cancelling — the order is active again, so take the
            // stock back out, same as when it was first placed.
            await connection.query(
              `UPDATE vegetables
               SET stock_qty = GREATEST(stock_qty - ?, 0),
                   in_stock = (GREATEST(stock_qty - ?, 0) > 0)
               WHERE id = ?`,
              [item.quantity, item.quantity, item.vegetable_id]
            );
          }
        }
      }

      await connection.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Kept as an explicit alias for the "shopper cancels their own order"
  // path — cancelling is just a status change to "Cancelled".
  async cancelAndRestock(orderId) {
    return this.updateStatus(orderId, "Cancelled");
  },
};

export default OrderModel;
