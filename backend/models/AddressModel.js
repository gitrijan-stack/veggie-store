import pool from "../config/db.js";

const AddressModel = {
  async create(userId, data) {
    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, full_name, phone, street, city, state, postcode, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, data.fullName, data.phone, data.street, data.city,
        data.state || null, data.postcode || "", data.country || "Nepal",
        data.isDefault || false,
      ]
    );
    return result.insertId;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM addresses WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async delete(id, userId) {
    await pool.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [id, userId]);
  },
};

export default AddressModel;
