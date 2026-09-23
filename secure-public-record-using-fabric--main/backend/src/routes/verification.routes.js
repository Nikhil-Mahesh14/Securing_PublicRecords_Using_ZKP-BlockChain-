import { Router } from "express";
import Record from "../models/record.model.js";
import { authenticate } from "../middleware/auth.js";
import { uploadPdf } from "../middleware/upload.js";
import { sha256File } from "../services/hash.service.js";
import { findAnchoredRecord, getRecordHash, updateVerificationStatus } from "../services/blockchain.service.js";

const router = Router();

router.post("/", authenticate, uploadPdf.single("file"), async (req, res, next) => {
  try {
    const { identifier, recordId } = req.body;
    const lookupValue = identifier || recordId;

    if (lookupValue && !req.file) {
      const anchoredRecord = await findAnchoredRecord(lookupValue);
      if (!anchoredRecord) {
        return res.json({
          result: "Tampered",
          searchedValue: lookupValue,
          originalHash: null,
          currentHash: lookupValue,
          securityMethod: "Unknown"
        });
      }

      await Promise.all([
        Record.findOneAndUpdate({ recordId: anchoredRecord.recordId }, { verificationStatus: "Verified" }),
        updateVerificationStatus(anchoredRecord.recordId, "Verified")
      ]);

      return res.json({
        result: "Verified",
        recordId: anchoredRecord.recordId,
        transactionId: anchoredRecord.transactionId,
        timestamp: anchoredRecord.timestamp,
        originalHash: anchoredRecord.hash,
        currentHash: lookupValue,
        securityMethod: anchoredRecord.securityMethod
      });
    }

    if (!recordId || !req.file) {
      return res.status(400).json({ message: "Record ID or SHA-256 hash is required" });
    }

    const chainRecord = await getRecordHash(recordId);
    if (!chainRecord) {
      return res.status(404).json({ message: "No blockchain hash found for this record" });
    }

    const currentHash = await sha256File(req.file.path);
    const verified = currentHash === chainRecord.hash;
    const verificationStatus = verified ? "Verified" : "Tampered";

    await Promise.all([
      Record.findOneAndUpdate({ recordId }, { verificationStatus }),
      updateVerificationStatus(recordId, verificationStatus)
    ]);

    res.json({
      result: verificationStatus,
      transactionId: chainRecord.transactionId,
      timestamp: chainRecord.timestamp,
      originalHash: chainRecord.hash,
      currentHash,
      securityMethod: chainRecord.securityMethod
    });
  } catch (error) {
    next(error);
  }
});

export default router;
