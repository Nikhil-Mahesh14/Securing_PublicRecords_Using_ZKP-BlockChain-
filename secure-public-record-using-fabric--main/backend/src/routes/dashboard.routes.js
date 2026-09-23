import { Router } from "express";
import Record from "../models/record.model.js";
import BlockchainTransaction from "../models/blockchain-transaction.model.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (_req, res, next) => {
  try {
    const [totalPublicRecords, verifiedRecords, pendingRecords, blockchainTransactions] = await Promise.all([
      Record.countDocuments(),
      Record.countDocuments({ verificationStatus: "Verified" }),
      Record.countDocuments({ verificationStatus: "Pending" }),
      BlockchainTransaction.countDocuments()
    ]);

    res.json({
      stats: { totalPublicRecords, verifiedRecords, pendingRecords, blockchainTransactions },
      overview: [
        "Tamper-evident public record registration",
        "Role-based government workflows",
        "Hash anchoring on Hyperledger Fabric",
        "Verifier-facing integrity checks"
      ],
      workflow: ["Upload PDF", "Generate SHA-256 hash", "Store metadata", "Anchor hash on blockchain", "Verify by re-upload"],
      technologies: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Hyperledger Fabric", "Docker"]
    });
  } catch (error) {
    next(error);
  }
});

export default router;

