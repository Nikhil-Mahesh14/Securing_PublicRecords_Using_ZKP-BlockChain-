import { Router } from "express";
import BlockchainTransaction from "../models/blockchain-transaction.model.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (_req, res, next) => {
  try {
    const blocks = await BlockchainTransaction.find().sort({ blockNumber: -1 }).limit(100).lean();
    res.json({ blocks });
  } catch (error) {
    next(error);
  }
});

export default router;

