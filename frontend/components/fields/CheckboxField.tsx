import type { Field } from "../../types";

type FieldProps = { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string; darkMode?: boolean };

const CheckboxField = ({ field, value, onChange, error, darkMode }: FieldProps) => (
  <div className="w-full">
    <label className={`flex items-center gap-2.5 text-sm font-medium cursor-pointer ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 rounded ${darkMode ? "border-[#30363d] bg-[#0d1117] accent-violet-500" : "border-slate-300 text-slate-900 focus:ring-slate-500"}`}
      />
      <span>
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
    </label>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);
export default CheckboxField;
