import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import OrderModel from "../models/OrderModel.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

// Register — POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await UserModel.create({ name, email, passwordHash });

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({ success: true, user: { id: userId, name, email } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login — POST /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Check auth — GET /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Logout — GET /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions());
    return res.status(200).json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: list all customers — GET /api/user/list
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: delete a customer — DELETE /api/user/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Only allow removal once every order this user has placed is either
    // Delivered or Cancelled — never while one is still in progress.
    const hasActiveOrders = await OrderModel.hasActiveOrders(id);
    if (hasActiveOrders) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove this user — they have an order that hasn't been delivered or cancelled yet.",
      });
    }

    await UserModel.delete(id);
    return res.status(200).json({ success: true, message: "User removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
