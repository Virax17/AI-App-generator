import express, { type Request, type Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { App } from "../models/App.js";
import { AppData } from "../models/AppData.js";

const router = express.Router();

const allowedFieldTypes = new Set([
  "text",
  "number",
  "date",
  "dropdown",
  "email",
  "textarea",
  "checkbox",
]);

type FieldConfig = {
  name?: string;
  label?: string;
  type?: string;
  required?: boolean;
  options?: string[];
};

type AppConfig = {
  appName?: string;
  description?: string;
  fields?: FieldConfig[];
  auth?: boolean;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; message: string };

type CreateOrUpdateBody = {
  appName?: string;
  description?: string;
  config?: AppConfig | string;
};

const badRequest = (res: Response, message: string) =>
  res.status(400).json({ success: false, message } satisfies ApiError);

const forbidden = (res: Response, message: string) =>
  res.status(403).json({ success: false, message } satisfies ApiError);

const notFound = (res: Response, message: string) =>
  res.status(404).json({ success: false, message } satisfies ApiError);

const parseConfig = (config: AppConfig | string | undefined) => {
  if (!config) {
    return { error: "Config is required" } as const;
  }

  if (typeof config === "string") {
    try {
      const parsed = JSON.parse(config) as AppConfig;
      return { value: parsed } as const;
    } catch {
      return { error: "Config must be valid JSON" } as const;
    }
  }

  return { value: config } as const;
};

const validateConfig = (config: AppConfig) => {
  if (typeof config !== "object" || Array.isArray(config) || config === null) {
    return { error: "Config must be a JSON object" } as const;
  }
  if (!config.appName || !config.fields || !Array.isArray(config.fields)) {
    return { error: "Config must include appName and fields array" } as const;
  }

  const warnings: string[] = [];
  const validFields: FieldConfig[] = [];

  for (const field of config.fields) {
    if (!field?.name || !field?.type) {
      warnings.push("Skipped field missing name or type");
      continue;
    }
    if (!allowedFieldTypes.has(field.type)) {
      warnings.push(`Skipped unknown field type: ${field.type}`);
      continue;
    }
    validFields.push(field);
  }

  return {
    value: {
      ...config,
      fields: validFields,
    },
    warnings,
  } as const;
};

router.use(authMiddleware);

router.post(
  "/",
  async (req: Request<unknown, unknown, CreateOrUpdateBody>, res: Response) => {
    if (!req.user) {
      return forbidden(res, "Unauthorized");
    }

    const parsed = parseConfig(req.body.config);
    if ("error" in parsed) {
      return badRequest(res, parsed.error);
    }

    const validated = validateConfig(parsed.value);
    if ("error" in validated) {
      return badRequest(res, validated.error);
    }

    const appName = req.body.appName ?? validated.value.appName;
    const description = req.body.description ?? validated.value.description;

    try {
      const app = await App.create({
        userId: req.user.id,
        appName,
        description,
        config: validated.value,
      });

      const data: ApiSuccess<{ app: typeof app; warnings: string[] }> = {
        success: true,
        data: { app, warnings: validated.warnings },
      };
      return res.status(201).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create app";
      return res.status(500).json({ success: false, message } satisfies ApiError);
    }
  }
);

router.get("/", async (req: Request, res: Response) => {
  if (!req.user) {
    return forbidden(res, "Unauthorized");
  }

  try {
    const apps = await App.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const data: ApiSuccess<{ apps: typeof apps }> = {
      success: true,
      data: { apps },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch apps";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

router.get("/:appId", async (req: Request, res: Response) => {
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

    const data: ApiSuccess<{ app: typeof app }> = {
      success: true,
      data: { app },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch app";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

router.put(
  "/:appId",
  async (req: Request<{ appId: string }, unknown, CreateOrUpdateBody>, res: Response) => {
    if (!req.user) {
      return forbidden(res, "Unauthorized");
    }

    const parsed = parseConfig(req.body.config);
    if ("error" in parsed) {
      return badRequest(res, parsed.error);
    }

    const validated = validateConfig(parsed.value);
    if ("error" in validated) {
      return badRequest(res, validated.error);
    }

    const appName = req.body.appName ?? validated.value.appName;
    const description = req.body.description ?? validated.value.description;

    try {
      const app = await App.findById(req.params.appId);
      if (!app) {
        return notFound(res, "App not found");
      }
      if (app.userId.toString() !== req.user.id) {
        return forbidden(res, "Forbidden");
      }

      app.appName = appName;
      app.description = description;
      app.config = validated.value;
      await app.save();

      const data: ApiSuccess<{ app: typeof app; warnings: string[] }> = {
        success: true,
        data: { app, warnings: validated.warnings },
      };
      return res.status(200).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update app";
      return res.status(500).json({ success: false, message } satisfies ApiError);
    }
  }
);

router.delete("/:appId", async (req: Request, res: Response) => {
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

    await AppData.deleteMany({ appId: app.id, userId: req.user.id });
    await app.deleteOne();

    const data: ApiSuccess<{ message: string }> = {
      success: true,
      data: { message: "App deleted" },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete app";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

export default router;
