import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import vegetableRouter from "./routes/vegetableRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import contactRouter from "./routes/contactRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

await connectDB();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/vegetable", vegetableRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/contact", contactRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => {
  res.send("🥬 Veggie Store API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
