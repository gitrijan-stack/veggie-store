import pool from "../config/db.js";

// Get all categories with veggie counts — GET /api/category/list
export const listCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.slug, c.emoji,
             COUNT(v.id) AS count
      FROM categories c
      LEFT JOIN vegetables v ON v.category_id = c.id AND v.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    return res.json({ success: true, categories: rows });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
