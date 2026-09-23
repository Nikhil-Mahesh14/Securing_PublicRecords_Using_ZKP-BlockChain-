import mongoose from "mongoose";

const blockchainTransactionSchema = new mongoose.Schema(
  {
    blockNumber: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true, index: true },
    channel: { type: String, required: true },
    recordId: { type: String, required: true, index: true },
    hash: { type: String, required: true },
    securityMethod: { type: String, required: true },
    verificationStatus: { type: String, enum: ["Pending", "Verified", "Tampered"], default: "Pending" },
    status: { type: String, enum: ["VALID", "INVALID"], default: "VALID" },
    timestamp: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("BlockchainTransaction", blockchainTransactionSchema);

