import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    citizenName: { type: String, required: true, trim: true },
    recordType: {
      type: String,
      enum: [
        "Birth Certificate",
        "Income Certificate",
        "Educational Certificate",
        "Land Record",
        "Property Document",
        "Caste Certificate"
      ],
      required: true
    },
    recordNumber: { type: String, required: true, trim: true, index: true },
    department: { type: String, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    description: { type: String, trim: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    hash: { type: String, required: true, unique: true, index: true },
    securityMethod: { type: String, enum: ["Traditional", "AES", "AES + ZKP"], required: true },
    blockchainFramework: { type: String, enum: ["Ganache Ethereum", "Hyperledger Fabric"], default: "Hyperledger Fabric" },
    verificationStatus: { type: String, enum: ["Pending", "Verified", "Tampered"], default: "Pending" },
    blockchainTransactionId: { type: String, required: true },
    blockchainTimestamp: { type: Date, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Record", recordSchema);
