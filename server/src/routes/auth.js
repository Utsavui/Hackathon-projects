import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await User.findOne({ email: data.email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const password = await bcrypt.hash(data.password, 12);
    const user = await User.create({ ...data, email: data.email.toLowerCase(), password });
    res.status(201).json({
      success: true,
      token: tokenFor(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    res.json({
      success: true,
      token: tokenFor(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) { next(err); }
});

router.get("/me", auth, async (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
