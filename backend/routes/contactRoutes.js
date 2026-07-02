import express from "express";
import { submitContact, subscribeNewsletter } from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/submit", submitContact);
contactRouter.post("/newsletter", subscribeNewsletter);

export default contactRouter;
