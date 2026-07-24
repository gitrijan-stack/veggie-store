import pool from "../config/db.js";

const UserModel = {
  async create({ name, email, passwordHash }) {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // Admin: list all users (no password hash)
  async findAll() {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  // Admin: delete a user
  // Orders reference addresses with ON DELETE RESTRICT, while both orders
  // and addresses cascade-delete from users. If we let MySQL's own cascade
  // handle everything in one DELETE FROM users, it can try to cascade-drop
  // an address while an order row still points at it (cascade order isn't
  // guaranteed), which trips the RESTRICT and fails with a foreign key
  // error. Deleting the user's orders explicitly first — inside a
  // transaction — guarantees nothing is left referencing their addresses
  // by the time the user row (and its addresses/cart/etc.) cascade away.
  async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query("DELETE FROM orders WHERE user_id = ?", [id]);
      await connection.query("DELETE FROM users WHERE id = ?", [id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

export default UserModel;
