import fs from "fs";
import path from "path";
import multer from "multer";
import { nanoid } from "nanoid";

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${nanoid(8)}-${safeName}`);
  }
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

export const uploadPdf = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, JPEG, and PNG files are allowed"));
    }
    cb(null, true);
  }
});
