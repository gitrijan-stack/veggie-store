import express from "express";
import {
  listVegetables,
  getVegetable,
  addVegetable,
  updateVegetable,
  deleteVegetable,
} from "../controllers/vegetableController.js";
import authSeller from "../middlewares/authSeller.js";

const vegetableRouter = express.Router();

vegetableRouter.get("/list", listVegetables);
vegetableRouter.get("/:slug", getVegetable);
vegetableRouter.post("/add", authSeller, addVegetable);
vegetableRouter.put("/:id", authSeller, updateVegetable);
vegetableRouter.delete("/:id", authSeller, deleteVegetable);

export default vegetableRouter;
