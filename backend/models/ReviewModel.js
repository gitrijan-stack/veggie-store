import pool from "../config/db.js";

const ReviewModel = {
  // All reviews for one vegetable, newest first, with the reviewer's name.
  async findForVegetable(vegetableId) {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.user_id, u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.vegetable_id = ?
       ORDER BY r.created_at DESC`,
      [vegetableId]
    );
    return rows;
  },

  // Does this user already have a review on this vegetable? (one review per
  // user per product — reviews table has a UNIQUE (vegetable_id, user_id)).
  async findOne(vegetableId, userId) {
    const [rows] = await pool.query(
      "SELECT id FROM reviews WHERE vegetable_id = ? AND user_id = ?",
      [vegetableId, userId]
    );
    return rows[0] || null;
  },

  // Create a new review, or update the rating/comment if this user already
  // reviewed this vegetable (keeps the one-review-per-user rule honest
  // instead of erroring out on a second submission).
  async upsert({ vegetableId, userId, rating, comment }) {
    const existing = await this.findOne(vegetableId, userId);
    if (existing) {
      await pool.query(
        "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
        [rating, comment || null, existing.id]
      );
      return existing.id;
    }
    const [result] = await pool.query(
      "INSERT INTO reviews (vegetable_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
      [vegetableId, userId, rating, comment || null]
    );
    return result.insertId;
  },

  async delete(id, userId) {
    await pool.query("DELETE FROM reviews WHERE id = ? AND user_id = ?", [id, userId]);
  },
};

export default ReviewModel;
