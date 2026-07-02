import ReviewModel from "../models/ReviewModel.js";
import VegetableModel from "../models/VegetableModel.js";

// List reviews for a vegetable — GET /api/review/:vegetableId
export const listReviews = async (req, res) => {
  try {
    const { vegetableId } = req.params;
    const reviews = await ReviewModel.findForVegetable(vegetableId);
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Add or update the logged-in user's review — POST /api/review/add
// (authUser middleware guarantees req.userId is a real, logged-in user)
export const addReview = async (req, res) => {
  try {
    const { vegetableId, rating, comment } = req.body;
    const userId = req.userId;

    const ratingNum = Number(rating);
    if (!vegetableId || !ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.json({ success: false, message: "A vegetable and a rating from 1–5 are required" });
    }

    const veg = await VegetableModel.findById(vegetableId);
    if (!veg) {
      return res.json({ success: false, message: "Vegetable not found" });
    }

    await ReviewModel.upsert({ vegetableId, userId, rating: ratingNum, comment });
    const reviews = await ReviewModel.findForVegetable(vegetableId);

    return res.json({ success: true, message: "Review saved", reviews });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Remove the logged-in user's own review — DELETE /api/review/:id
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await ReviewModel.delete(id, req.userId);
    return res.json({ success: true, message: "Review removed" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
