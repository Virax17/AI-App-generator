import type { Field } from "../../types";

type FieldProps = { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string; darkMode?: boolean };

const UnknownField = ({ field, darkMode }: FieldProps) => (
  <div className={`w-full rounded-lg border px-3 py-2 text-sm ${
    darkMode
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700"
  }`}>
    ⚠ Unknown field type: <code className="font-mono font-semibold">{field.type}</code> — rendering as unsupported
  </div>
);
export default UnknownField;
