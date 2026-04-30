import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { App } from "../models/App.js";
import { AppData } from "../models/AppData.js";

const router = express.Router();

type ApiSuccess<T> = { success: true; data: T };
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

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const validateRequiredFields = (config: AppConfig, payload: Record<string, unknown>) => {
  const requiredFields = (config.fields ?? []).filter((field) => field.required);
  for (const field of requiredFields) {
    if (!field.name) continue;
    const value = payload[field.name];
    if (value === undefined || value === null || value === "") {
      return field.name;
    }
  }
  return null;
};

router.use(authMiddleware);

router.post("/:appId", async (req: Request, res: Response) => {
  if (!req.user) {
    return forbidden(res, "Unauthorized");
  }

  try {
    const app = await App.findById(req.params.appId);
    if (!app) {
      return notFound(res, "App not found");
    }
    if (app.userId.toString() !== req.user.id) {
      return forbidden(res, "Forbidden");
    }

    const payload = req.body as Record<string, unknown>;
    const config = app.config as AppConfig;
    const missingField = validateRequiredFields(config, payload);
    if (missingField) {
      return badRequest(res, `Missing required field: ${missingField}`);
    }

    const submission = await AppData.create({
      appId: app.id,
      userId: req.user.id,
      data: payload,
    });

    const data: ApiSuccess<{ submission: typeof submission }> = {
      success: true,
      data: { submission },
    };
    return res.status(201).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save data";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

router.get("/:appId", async (req: Request, res: Response) => {
  if (!req.user) {
    return forbidden(res, "Unauthorized");
  }

  const page = parseNumber(req.query.page as string | undefined, 1);
  const limit = parseNumber(req.query.limit as string | undefined, 10);
  const skip = (page - 1) * limit;

  try {
    const app = await App.findById(req.params.appId);
    if (!app) {
      return notFound(res, "App not found");
    }
    if (app.userId.toString() !== req.user.id) {
      return forbidden(res, "Forbidden");
    }

    const [items, total] = await Promise.all([
      AppData.find({ appId: app.id, userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AppData.countDocuments({ appId: app.id, userId: req.user.id }),
    ]);

    const data: ApiSuccess<{
      submissions: typeof items;
      page: number;
      limit: number;
      total: number;
    }> = {
      success: true,
      data: { submissions: items, page, limit, total },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch data";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

router.delete("/:appId/:dataId", async (req: Request, res: Response) => {
  if (!req.user) {
    return forbidden(res, "Unauthorized");
  }

  try {
    const app = await App.findById(req.params.appId);
    if (!app) {
      return notFound(res, "App not found");
    }
    if (app.userId.toString() !== req.user.id) {
      return forbidden(res, "Forbidden");
    }

    const deleted = await AppData.findOneAndDelete({
      _id: req.params.dataId,
      appId: app.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return notFound(res, "Submission not found");
    }

    const data: ApiSuccess<{ message: string }> = {
      success: true,
      data: { message: "Submission deleted" },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete data";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

export default router;
