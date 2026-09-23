import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { connectDatabase } from "./config/database.js";
import { seedDemoUsers } from "./config/seed.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import recordRoutes from "./routes/record.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import explorerRoutes from "./routes/explorer.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use("/uploads", express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "secure-public-records-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/explorer", explorerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

await connectDatabase();
await seedDemoUsers();

app.listen(port, () => {
  console.log(`Secure Public Records API listening on port ${port}`);
});

