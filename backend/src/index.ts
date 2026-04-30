import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import appRoutes from "./routes/apps.js";
import dataRoutes from "./routes/data.js";
import csvRoutes from "./routes/csv.js";

dotenv.config();

const app = express();

const port = Number(process.env.PORT ?? 5000);
const mongoUri = process.env.MONGODB_URI ?? "";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

let databaseReady = false;

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", (_req: Request, res: Response, next: NextFunction) => {
  if (!databaseReady) {
    res.status(503).json({ success: false, message: "Database is temporarily unavailable" });
    return;
  }

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/apps", appRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/csv", csvRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", databaseReady });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Server error" });
});

let server: ReturnType<typeof app.listen> | null = null;

const shutdown = async (reason: string) => {
  console.error(`Shutting down: ${reason}`);
  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(1);
};

const start = async () => {
  server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  if (!mongoUri) {
    console.error("MONGODB_URI is not set. Server will not start.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    databaseReady = true;
    console.log("MongoDB connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("MongoDB connection failed:", message);
  }
};

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  shutdown(`unhandledRejection: ${message}`).catch(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  shutdown(`uncaughtException: ${err.message}`).catch(() => process.exit(1));
});

process.on("SIGINT", () => {
  shutdown("SIGINT").catch(() => process.exit(1));
});

process.on("SIGUSR2", () => {
  shutdown("SIGUSR2").catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch(() => process.exit(1));
});

void start();
