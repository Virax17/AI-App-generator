import { z } from "zod";
import type { AppConfig, Field } from "../types";

// ─── Label inference ─────────────────────────────────────────────────────────
// "userEmailAddress" → "User Email Address"
export function inferLabel(name: string): string {
  if (!name) return "Field";
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

// ─── Allowed field types ──────────────────────────────────────────────────────
const ALLOWED_TYPES = new Set([
  "text",
  "number",
  "email",
  "date",
  "textarea",
  "checkbox",
  "dropdown",
]);

// ─── Raw zod schema (loose – everything optional so we can heal) ──────────────
const RawFieldSchema = z.object({
  name: z.string().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
  required: z.union([z.boolean(), z.string(), z.number()]).optional(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

const RawConfigSchema = z.object({
  appName: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.unknown()).optional(),
});

export type HealResult = {
  config: AppConfig;
  warnings: string[];
};

// ─── Main heal function ───────────────────────────────────────────────────────
export function healConfig(raw: unknown): HealResult {
  const warnings: string[] = [];

  // 1. Parse outer config
  const parsed = RawConfigSchema.safeParse(raw);
  if (!parsed.success) {
    warnings.push("Config structure is malformed. Using default values.");
  }

  const data = parsed.success ? parsed.data : {};

  // 2. appName healing
  let appName = data.appName ?? "";
  if (!appName) {
    appName = "Untitled App";
    warnings.push('Missing "appName" – defaulted to "Untitled App".');
  }

  // 3. fields healing
  const rawFields: unknown[] = Array.isArray(data.fields) ? data.fields : [];
  if (!Array.isArray(data.fields)) {
    warnings.push('Missing or invalid "fields" array – defaulted to empty.');
  }

  const healedFields: Field[] = [];
  let unknownTypeCount = 0;
  let missingLabelCount = 0;
  let coercedRequiredCount = 0;

  rawFields.forEach((rawField, idx) => {
    const fp = RawFieldSchema.safeParse(rawField);
    const f = fp.success ? fp.data : {};

    // name
    const name = typeof f.name === "string" && f.name.trim() ? f.name.trim() : `field_${idx + 1}`;

    // label inference
    let label = typeof f.label === "string" && f.label.trim() ? f.label.trim() : "";
    if (!label) {
      label = inferLabel(name);
      missingLabelCount++;
    }

    // type healing
    let type = typeof f.type === "string" ? f.type.toLowerCase().trim() : "";
    if (!type) {
      type = "text";
      warnings.push(`Field "${name}" was missing a type – defaulted to "text".`);
    } else if (!ALLOWED_TYPES.has(type)) {
      unknownTypeCount++;
      warnings.push(`Field "${name}" has an unknown type "${type}" – will render as unsupported.`);
    }

    // required coercion (handles "true", 1, true, "yes")
    let required = false;
    const rawRequired = f.required;
    if (typeof rawRequired === "boolean") {
      required = rawRequired;
    } else if (typeof rawRequired === "string") {
      required = rawRequired.toLowerCase() === "true" || rawRequired.toLowerCase() === "yes";
      coercedRequiredCount++;
    } else if (typeof rawRequired === "number") {
      required = rawRequired !== 0;
      coercedRequiredCount++;
    }

    // options healing for dropdown
    const options =
      type === "dropdown" && Array.isArray(f.options)
        ? f.options.filter((o): o is string => typeof o === "string")
        : undefined;

    const field: Field = { name, label, type: type as Field["type"], required };
    if (options) field.options = options;
    if (f.placeholder) field.placeholder = f.placeholder;

    healedFields.push(field);
  });

  if (missingLabelCount > 0)
    warnings.push(`${missingLabelCount} field(s) had missing labels – inferred from field name.`);
  if (coercedRequiredCount > 0)
    warnings.push(`${coercedRequiredCount} field(s) had non-boolean "required" values – coerced.`);

  const config: AppConfig = {
    appName,
    description: typeof data.description === "string" ? data.description : undefined,
    fields: healedFields,
  };

  return { config, warnings };
}
