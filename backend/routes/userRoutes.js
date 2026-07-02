import express from "express";
import { register, login, logout, isAuth, getAllUsers, deleteUser } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", logout);
userRouter.get("/is-auth", authUser, isAuth);

// Admin (seller) only
userRouter.get("/list", authSeller, getAllUsers);
userRouter.delete("/:id", authSeller, deleteUser);

export default userRouter;
