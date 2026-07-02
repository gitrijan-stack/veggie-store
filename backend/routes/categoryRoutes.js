import express from "express";
import { listCategories } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/list", listCategories);

export default categoryRouter;
