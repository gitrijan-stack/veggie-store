import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import authUser from "../middlewares/authUser.js";

const cartRouter = express.Router();

cartRouter.get("/", authUser, getCart);
cartRouter.post("/add", authUser, addToCart);
cartRouter.post("/update", authUser, updateCart);
cartRouter.post("/remove", authUser, removeFromCart);
cartRouter.post("/clear", authUser, clearCart);

export default cartRouter;
