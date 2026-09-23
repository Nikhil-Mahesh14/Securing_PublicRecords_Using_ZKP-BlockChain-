import { Router } from "express";
import { nanoid } from "nanoid";
import Record from "../models/record.model.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadPdf } from "../middleware/upload.js";
import { sha256File } from "../services/hash.service.js";
import { submitRecordHash } from "../services/blockchain.service.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("Admin", "Government Officer"),
  uploadPdf.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Record file is required" });
      }

      const hash = await sha256File(req.file.path);
      const duplicate = await Record.findOne({ hash }).lean();
      if (duplicate) {
        return res.status(409).json({
          message: "Duplicate record detected. This file is already uploaded, even if it was renamed or copied.",
          duplicate: {
            recordId: duplicate.recordId,
            citizenName: duplicate.citizenName,
            recordType: duplicate.recordType,
            transactionId: duplicate.blockchainTransactionId,
            hash: duplicate.hash
          }
        });
      }

      const recordId = `REC-${nanoid(12).toUpperCase()}`;
      const chainTx = await submitRecordHash({
        recordId,
        hash,
        securityMethod: req.body.securityMethod
      });

      const record = await Record.create({
        recordId,
        citizenName: req.body.citizenName,
        recordType: req.body.recordType,
        recordNumber: req.body.recordNumber,
        department: req.body.department || undefined,
        issueDate: req.body.issueDate || undefined,
        expiryDate: req.body.expiryDate || undefined,
        description: req.body.description,
        fileName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        hash,
        securityMethod: req.body.securityMethod,
        blockchainFramework: req.body.blockchainFramework || "Hyperledger Fabric",
        verificationStatus: "Pending",
        blockchainTransactionId: chainTx.transactionId,
        blockchainTimestamp: chainTx.timestamp,
        uploadedBy: req.user._id
      });

      res.status(201).json({ record, blockchain: chainTx });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", authenticate, async (req, res, next) => {
  try {
    const {
      search = "",
      recordType,
      department,
      securityMethod,
      verificationStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 25
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { recordId: new RegExp(search, "i") },
        { citizenName: new RegExp(search, "i") },
        { recordNumber: new RegExp(search, "i") },
        { department: new RegExp(search, "i") }
      ];
    }
    if (recordType) query.recordType = recordType;
    if (department) query.department = department;
    if (securityMethod) query.securityMethod = securityMethod;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [records, total] = await Promise.all([
      Record.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Record.countDocuments(query)
    ]);

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
});

export default router;
