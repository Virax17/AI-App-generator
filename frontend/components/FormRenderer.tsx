"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { AppConfig, Field } from "../types";
import { getFieldComponent } from "./fields";

type FormRendererProps = {
  config: AppConfig;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  darkMode?: boolean;
};

type ErrorMap = Record<string, string>;

const buildInitialValues = (fields: Field[]) => {
  const initial: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.type === "checkbox") {
      initial[field.name] = false;
    } else {
      initial[field.name] = "";
    }
  }
  return initial;
};

const FormRenderer = ({ config, onSubmit, darkMode = false }: FormRendererProps) => {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialValues(config.fields)
  );
  const [errors, setErrors] = useState<ErrorMap>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fields = useMemo(() => config.fields ?? [], [config.fields]);

  // Rebuild initial values if fields change (playground live-update)
  useMemo(() => {
    setValues(buildInitialValues(fields));
    setErrors({});
    setSubmitError(null);
    setSuccess(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fields.map((f) => f.name))]);

  const validate = () => {
    const nextErrors: ErrorMap = {};
    for (const field of fields) {
      if (field.required) {
        const value = values[field.name];
        if (value === undefined || value === null || value === "") {
          nextErrors[field.name] = `${field.label || field.name} is required`;
        }
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(values);
      setSuccess("Saved successfully! ✓");
      setValues(buildInitialValues(fields));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const card = darkMode
    ? "rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-xl"
    : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
  const heading = darkMode ? "text-lg font-semibold text-slate-100" : "text-lg font-semibold text-slate-900";
  const btn = darkMode
    ? "w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors sm:w-auto"
    : "w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto";

  return (
    <div className={card}>
      <h2 className={heading}>New Submission</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <AnimatePresence mode="popLayout">
          {fields.map((field, idx) => {
            const FieldComponent = getFieldComponent(field.type);
            return (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <FieldComponent
                  field={field}
                  value={values[field.name]}
                  onChange={(value) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.name]: value,
                    }))
                  }
                  error={errors[field.name]}
                  darkMode={darkMode}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {submitError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400"
            >
              {submitError}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={darkMode ? "text-sm text-emerald-400" : "text-sm text-emerald-600"}
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={btn}
        >
          {loading ? "Saving…" : "Submit"}
        </motion.button>
      </form>
    </div>
  );
};

export default FormRenderer;
