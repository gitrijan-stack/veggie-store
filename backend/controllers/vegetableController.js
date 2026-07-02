import VegetableModel from "../models/VegetableModel.js";

// List all vegetables with filters — GET /api/vegetable/list
export const listVegetables = async (req, res) => {
  try {
    const { category, search, organicOnly, maxPrice, sortBy } = req.query;

    const vegetables = await VegetableModel.findAll({
      category,
      search,
      organicOnly: organicOnly === "true",
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy,
    });

    return res.json({ success: true, vegetables });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get single vegetable by slug — GET /api/vegetable/:slug
export const getVegetable = async (req, res) => {
  try {
    const { slug } = req.params;
    const veg = await VegetableModel.findBySlug(slug);

    if (!veg) {
      return res.status(404).json({ success: false, message: "Vegetable not found" });
    }

    const related = await VegetableModel.findRelated(veg.category_slug, veg.id, 4);

    return res.json({ success: true, vegetable: veg, related });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Add new vegetable (seller only) — POST /api/vegetable/add
export const addVegetable = async (req, res) => {
  try {
    const {
      categoryId, name, emoji, description, price,
      originalPrice, unit, stockQty, isOrganic, pesticidesUsed, imageUrl, badge, badgeColor, tags,
    } = req.body;

    if (!categoryId || !name || !price || !unit) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const id = await VegetableModel.create({
      categoryId, name, emoji, description, price,
      originalPrice, unit, stockQty, isOrganic, pesticidesUsed, imageUrl, badge, badgeColor, tags,
    });

    return res.json({ success: true, message: "Vegetable added", id });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Update vegetable (seller only) — PUT /api/vegetable/:id
export const updateVegetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, ...rest } = req.body;

    // Only one vegetable can be the homepage hero at a time, so route
    // isFeatured: true through setFeatured (which clears everyone else)
    // instead of a plain column update.
    if (isFeatured === true) {
      await VegetableModel.setFeatured(id);
    } else if (isFeatured === false) {
      rest.isFeatured = false;
    }

    // Editing the stock quantity from the dashboard keeps in_stock in sync
    // with the real number, instead of relying on someone remembering to
    // flip the separate "In stock / Out of stock" toggle. And when the
    // quantity actually goes up (a new batch arrived, not just an
    // incidental re-save of the same number), stamp restockedAt so it
    // shows up in the homepage's "Today's Harvest".
    if (rest.stockQty !== undefined && rest.stockQty !== null) {
      const newQty = Number(rest.stockQty);
      rest.inStock = newQty > 0;

      const existing = await VegetableModel.findById(id);
      const oldQty = existing ? Number(existing.stock_qty) : null;
      if (oldQty === null || newQty > oldQty) {
        rest.restockedAt = new Date();
      }
    }

    if (Object.keys(rest).length) {
      await VegetableModel.update(id, rest);
    }

    return res.json({ success: true, message: "Vegetable updated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Delete (soft) vegetable (seller only) — DELETE /api/vegetable/:id
export const deleteVegetable = async (req, res) => {
  try {
    const { id } = req.params;
    await VegetableModel.delete(id);
    return res.json({ success: true, message: "Vegetable removed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
