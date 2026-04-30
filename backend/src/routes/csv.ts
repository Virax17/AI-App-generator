import express, { type Request, type Response } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { authMiddleware } from "../middleware/auth.js";
import { App } from "../models/App.js";
import { AppData } from "../models/AppData.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

type ApiError = { success: false; message: string };

type FieldConfig = {
  name?: string;
  required?: boolean;
};

type AppConfig = {
  fields?: FieldConfig[];
};

const badRequest = (res: Response, message: string) =>
  res.status(400).json({ success: false, message } satisfies ApiError);

const forbidden = (res: Response, message: string) =>
  res.status(403).json({ success: false, message } satisfies ApiError);

const notFound = (res: Response, message: string) =>
  res.status(404).json({ success: false, message } satisfies ApiError);

const getRequiredFields = (config: AppConfig) =>
  (config.fields ?? []).filter((field) => field.required && field.name).map((f) => f.name!);

router.post("/:appId", authMiddleware, (req: Request, res: Response) => {
  upload.single("file")(req, res, async (err) => {
    if (!req.user) {
      return forbidden(res, "Unauthorized");
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return badRequest(res, "File too large. Max size is 5MB.");
      }
      return badRequest(res, err.message);
    }

    if (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return badRequest(res, message);
    }

    if (!req.file) {
      return badRequest(res, "CSV file is required");
    }

    try {
      const app = await App.findById(req.params.appId);
      if (!app) {
        return notFound(res, "App not found");
      }
      if (app.userId.toString() !== req.user.id) {
        return forbidden(res, "Forbidden");
      }

      const config = app.config as AppConfig;
      const expectedFields = new Set(
        (config.fields ?? []).map((field) => field.name).filter(Boolean) as string[]
      );

      if (expectedFields.size === 0) {
        return badRequest(res, "App config has no fields");
      }

      let records: Record<string, string>[] = [];
      try {
        records = parse(req.file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }) as Record<string, string>[];
      } catch {
        return badRequest(res, "Malformed CSV");
      }

      if (records.length === 0) {
        return badRequest(res, "CSV is empty");
      }

      const csvColumns = Object.keys(records[0] ?? {});
      const mappedColumns = csvColumns.filter((col) => expectedFields.has(col));

      if (mappedColumns.length === 0) {
        return badRequest(res, "CSV has no matching columns");
      }

      const requiredFields = getRequiredFields(config);
      const missingRequiredColumns = requiredFields.filter(
        (field) => !mappedColumns.includes(field)
      );
      if (missingRequiredColumns.length > 0) {
        return badRequest(
          res,
          `Missing required columns: ${missingRequiredColumns.join(", ")}`
        );
      }

      const errors: string[] = [];
      let skipped = 0;

      const toInsert = records.map((row, index) => {
        const mapped: Record<string, unknown> = {};
        for (const col of mappedColumns) {
          mapped[col] = row[col];
        }

        const missingField = requiredFields.find(
          (field) => mapped[field] === undefined || mapped[field] === null || mapped[field] === ""
        );

        if (missingField) {
          skipped += 1;
          errors.push(`Row ${index + 1}: missing required field ${missingField}`);
          return null;
        }

        return {
          appId: app.id,
          userId: req.user.id,
          data: mapped,
        };
      });

      const validRows = toInsert.filter(Boolean) as Array<{
        appId: string;
        userId: string;
        data: Record<string, unknown>;
      }>;

      if (validRows.length > 0) {
        await AppData.insertMany(validRows);
      }

      return res.status(200).json({
        success: true,
        imported: validRows.length,
        skipped,
        errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "CSV import failed";
      return res.status(500).json({ success: false, message } satisfies ApiError);
    }
  });
});

export default router;
