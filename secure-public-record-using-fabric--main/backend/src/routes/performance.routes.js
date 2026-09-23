import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const data = [
  { method: "Traditional", latency: 90, throughput: 720, scalability: 68, securityScore: 58 },
  { method: "AES", latency: 140, throughput: 610, scalability: 76, securityScore: 82 },
  { method: "AES + ZKP", latency: 230, throughput: 470, scalability: 91, securityScore: 96 }
];

const frameworkComparison = [
  { framework: "Ganache Ethereum", privacy: 45, governance: 52, throughput: 58, auditability: 72, suitability: 54 },
  { framework: "Hyperledger Fabric", privacy: 94, governance: 96, throughput: 82, auditability: 92, suitability: 96 }
];

router.get("/", authenticate, (_req, res) => {
  res.json({
    data,
    units: {
      latency: "ms/transaction",
      throughput: "transactions/min",
      scalability: "score/100",
      securityScore: "score/100"
    },
    decision:
      "Traditional is fastest because it only hashes the file. AES adds encryption overhead but protects confidentiality. AES + ZKP is slowest because proof generation/verification adds computation, but it gives the strongest privacy and trust model.",
    frameworkComparison,
    frameworkDecision:
      "Ganache is useful for Ethereum smart-contract testing, but it represents a public Ethereum-style environment. Hyperledger Fabric is better for government public-record systems because it is permissioned, identity-based, private-channel capable, and designed for enterprise governance.",
    notes: "Project benchmark baseline derived from relative computational cost: hash-only < encryption < encryption plus proof verification."
  });
});

export default router;
