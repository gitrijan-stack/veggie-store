import express from "express";
import { addAddress, getAddresses, deleteAddress } from "../controllers/addressController.js";
import authUser from "../middlewares/authUser.js";

const addressRouter = express.Router();

addressRouter.post("/add", authUser, addAddress);
addressRouter.get("/list", authUser, getAddresses);
addressRouter.delete("/:id", authUser, deleteAddress);

export default addressRouter;
