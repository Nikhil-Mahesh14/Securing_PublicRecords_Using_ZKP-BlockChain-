import { Router } from "express";
import User from "../models/user.model.js";
import { signToken } from "../utils/token.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Selected role does not match this account" });
    }

    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

