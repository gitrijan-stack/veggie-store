import express from "express";
import { listReviews, addReview, deleteReview } from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";

const reviewRouter = express.Router();

reviewRouter.get("/:vegetableId", listReviews);
reviewRouter.post("/add", authUser, addReview);
reviewRouter.delete("/:id", authUser, deleteReview);

export default reviewRouter;
