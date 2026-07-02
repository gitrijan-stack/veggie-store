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
  async delete(id) {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
  },
};

export default UserModel;
