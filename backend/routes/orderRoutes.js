import express from "express";
import {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelMyOrder,
} from "../controllers/orderController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";

const orderRouter = express.Router();

orderRouter.post("/place", authUser, placeOrder);
orderRouter.get("/my-orders", authUser, getUserOrders);
orderRouter.get("/all", authSeller, getAllOrders);
orderRouter.put("/:id/status", authSeller, updateOrderStatus);
orderRouter.put("/:id/cancel", authUser, cancelMyOrder);

export default orderRouter;
