import pool from "../config/db.js";

const slugify = (str) =>
  String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const VegetableModel = {
  // Get all vegetables with category info + tags. rating/review_count are
  // always computed live from the reviews table (never the old static
  // seed numbers) so the storefront only ever shows real customer reviews.
  async findAll({ category, search, organicOnly, maxPrice, sortBy } = {}) {
    let query = `
      SELECT v.id, v.name, v.slug, v.emoji, v.description, v.price, v.original_price,
             v.unit, v.stock_qty, v.restocked_at, v.is_organic, v.pesticides_used, v.in_stock, v.image_url,
             v.badge, v.badge_color, v.is_featured, v.created_at,
             COALESCE(AVG(r.rating), 0) AS rating, COUNT(r.id) AS review_count,
             c.name AS category, c.slug AS category_slug
      FROM vegetables v
      JOIN categories c ON v.category_id = c.id
      LEFT JOIN reviews r ON r.vegetable_id = v.id
      WHERE v.is_active = TRUE
    `;
    const params = [];

    if (category && category !== "All") {
      query += " AND c.name = ?";
      params.push(category);
    }
    if (search) {
      query += " AND v.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (organicOnly) {
      query += " AND v.is_organic = TRUE";
    }
    if (maxPrice) {
      query += " AND v.price <= ?";
      params.push(maxPrice);
    }

    query += " GROUP BY v.id";

    switch (sortBy) {
      case "price_asc": query += " ORDER BY v.price ASC"; break;
      case "price_desc": query += " ORDER BY v.price DESC"; break;
      case "rating": query += " ORDER BY rating DESC"; break;
      case "name": query += " ORDER BY v.name ASC"; break;
      default: query += " ORDER BY v.id ASC";
    }

    const [rows] = await pool.query(query, params);

    // attach tags to each vegetable
    for (const veg of rows) {
      const [tags] = await pool.query(
        `SELECT t.name FROM tags t
         JOIN vegetable_tags vt ON vt.tag_id = t.id
         WHERE vt.vegetable_id = ?`,
        [veg.id]
      );
      veg.tags = tags.map((t) => t.name);
    }

    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT v.*,
              COALESCE(AVG(r.rating), 0) AS rating, COUNT(r.id) AS review_count,
              c.name AS category, c.slug AS category_slug
       FROM vegetables v
       JOIN categories c ON v.category_id = c.id
       LEFT JOIN reviews r ON r.vegetable_id = v.id
       WHERE v.slug = ? AND v.is_active = TRUE
       GROUP BY v.id`,
      [slug]
    );
    const veg = rows[0];
    if (!veg) return null;

    const [tags] = await pool.query(
      `SELECT t.name FROM tags t
       JOIN vegetable_tags vt ON vt.tag_id = t.id
       WHERE vt.vegetable_id = ?`,
      [veg.id]
    );
    veg.tags = tags.map((t) => t.name);
    return veg;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM vegetables WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async findRelated(categorySlug, excludeId, limit = 4) {
    const [rows] = await pool.query(
      `SELECT v.id, v.name, v.slug, v.emoji, v.price, v.original_price, v.unit,
              v.is_organic, v.image_url, v.badge, v.badge_color, v.stock_qty, v.in_stock,
              COALESCE(AVG(r.rating), 0) AS rating, COUNT(r.id) AS review_count
       FROM vegetables v
       JOIN categories c ON v.category_id = c.id
       LEFT JOIN reviews r ON r.vegetable_id = v.id
       WHERE c.slug = ? AND v.id != ? AND v.is_active = TRUE
       GROUP BY v.id
       LIMIT ?`,
      [categorySlug, excludeId, limit]
    );
    return rows;
  },

  // Turns a name into a unique, URL-safe slug — e.g. "Roma Tomatoes" and a
  // second "Roma Tomatoes" become "roma-tomatoes" and "roma-tomatoes-2".
  async generateUniqueSlug(name) {
    const base = slugify(name) || "vegetable";
    let slug = base;
    let n = 2;
    while (true) {
      const [rows] = await pool.query("SELECT id FROM vegetables WHERE slug = ?", [slug]);
      if (rows.length === 0) return slug;
      slug = `${base}-${n++}`;
    }
  },

  async create(data) {
    const slug = await this.generateUniqueSlug(data.name);
    const [result] = await pool.query(
      `INSERT INTO vegetables
        (category_id, name, slug, emoji, description, price, original_price, unit,
         stock_qty, is_organic, pesticides_used, image_url, badge, badge_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.categoryId, data.name, slug, data.emoji, data.description,
        data.price, data.originalPrice || null, data.unit, data.stockQty || 100,
        data.isOrganic || false, data.isOrganic ? null : (data.pesticidesUsed || null),
        data.imageUrl, data.badge || null,
        data.badgeColor || "bg-leaf-600",
      ]
    );
    const id = result.insertId;
    if (Array.isArray(data.tags)) {
      await this.setTags(id, data.tags);
    }
    return id;
  },

  // Replace a vegetable's tags, creating any tag names that don't exist yet.
  async setTags(vegetableId, tagNames = []) {
    await pool.query("DELETE FROM vegetable_tags WHERE vegetable_id = ?", [vegetableId]);
    for (const raw of tagNames) {
      const name = String(raw).trim();
      if (!name) continue;

      const [existing] = await pool.query("SELECT id FROM tags WHERE name = ?", [name]);
      let tagId = existing[0]?.id;
      if (!tagId) {
        const [inserted] = await pool.query("INSERT INTO tags (name) VALUES (?)", [name]);
        tagId = inserted.insertId;
      }

      await pool.query(
        "INSERT IGNORE INTO vegetable_tags (vegetable_id, tag_id) VALUES (?, ?)",
        [vegetableId, tagId]
      );
    }
  },

  async update(id, data) {
    const { tags, ...columns } = data;
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(columns)) {
      const column = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      fields.push(`${column} = ?`);
      values.push(val);
    }
    if (fields.length) {
      values.push(id);
      await pool.query(`UPDATE vegetables SET ${fields.join(", ")} WHERE id = ?`, values);
    }
    if (Array.isArray(tags)) {
      await this.setTags(id, tags);
    }
  },

  async delete(id) {
    await pool.query("UPDATE vegetables SET is_active = FALSE WHERE id = ?", [id]);
  },

  // Only one vegetable can be featured on the homepage hero at a time, so
  // clear the flag everywhere else before setting it on the chosen one.
  async setFeatured(id) {
    await pool.query("UPDATE vegetables SET is_featured = FALSE WHERE id != ?", [id]);
    await pool.query("UPDATE vegetables SET is_featured = TRUE WHERE id = ?", [id]);
  },

  async decrementStock(id, qty) {
    // Keep in_stock in sync with the real quantity — an order that
    // depletes the last of an item should flip it to "out of stock"
    // immediately, not leave it looking purchasable until an admin
    // notices and toggles it manually.
    await pool.query(
      `UPDATE vegetables
       SET stock_qty = GREATEST(stock_qty - ?, 0),
           in_stock = (GREATEST(stock_qty - ?, 0) > 0)
       WHERE id = ?`,
      [qty, qty, id]
    );
  },
};

export default VegetableModel;
